import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { createRazorpayOrder } from "@/lib/payments/razorpay";
import { retryRazorpayOrderCreation, paymentCircuitBreaker } from "@/lib/payments/retry";
import * as Sentry from "@sentry/nextjs";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";
// Explicitly run in Node.js runtime (required for Sentry and Node.js APIs)
export const runtime = "nodejs";

interface RequestBody {
  astrologerId: string;
  scheduledAt: string;
  duration: number;
}

function isValidRequestBody(body: unknown): body is RequestBody {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.astrologerId === "string" &&
    typeof candidate.scheduledAt === "string" &&
    typeof candidate.duration === "number" &&
    candidate.duration > 0
  );
}

async function validateUser(
  email?: string,
  phone?: string,
): Promise<{
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
} | null> {
  return await prisma.user.findFirst({
    where: {
      OR: [{ email: email || undefined }, { phone: phone || undefined }],
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });
}

async function getAstrologer(astrologerId: string): Promise<{
  id: string;
  name: string;
  hourlyRate: number;
  available: boolean;
} | null> {
  return await prisma.astrologer.findUnique({
    where: { id: astrologerId },
    select: {
      id: true,
      name: true,
      hourlyRate: true,
      available: true,
    },
  });
}

function calculateAmount(hourlyRate: number, duration: number): number {
  return Math.ceil((hourlyRate / 60) * duration);
}

/**
 * POST /api/consultations/create-order
 * Create a consultation booking with Razorpay payment order
 *
 * Request body:
 * - astrologerId: string (required)
 * - scheduledAt: string (ISO datetime, required)
 * - duration: number (minutes, required)
 */
// eslint-disable-next-line complexity, max-lines-per-function
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in first." }, { status: 401 });
    }

    // Find user in database
    const dbUser = await validateUser(user.email, user.phone);

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    // Parse and validate request body
    const body: unknown = await request.json();

    if (!isValidRequestBody(body)) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          required: {
            astrologerId: "string",
            scheduledAt: "ISO datetime string",
            duration: "positive number (minutes)",
          },
        },
        { status: 400 },
      );
    }

    const { astrologerId, scheduledAt, duration } = body;

    // Validate datetime format
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduledAt format. Must be a valid ISO datetime." },
        { status: 400 },
      );
    }

    // Check if scheduled time is in the future
    if (scheduledDate <= new Date()) {
      return NextResponse.json({ error: "Scheduled time must be in the future." }, { status: 400 });
    }

    // Fetch astrologer details
    const astrologer = await getAstrologer(astrologerId);

    if (!astrologer) {
      return NextResponse.json({ error: "Astrologer not found." }, { status: 404 });
    }

    if (!astrologer.available) {
      return NextResponse.json(
        { error: "This astrologer is currently unavailable." },
        { status: 400 },
      );
    }

    // Calculate amount based on hourly rate and duration
    const amountInRupees = calculateAmount(astrologer.hourlyRate, duration);

    // Check circuit breaker before attempting payment
    if (paymentCircuitBreaker.isCircuitOpen()) {
      const message = "Payment gateway temporarily unavailable. Please try again in a few minutes.";

      Sentry.captureMessage(message, {
        level: "warning",
        tags: {
          operation: "create_order_blocked",
          circuit_breaker: "open",
        },
        extra: {
          userId: dbUser.id,
          astrologerId,
          circuitBreakerStats: paymentCircuitBreaker.getStats(),
        },
      });

      return NextResponse.json(
        {
          error: message,
          retryAfter: 60, // Suggest retry after 60 seconds
        },
        { status: 503 }, // Service Unavailable
      );
    }

    // Create Razorpay order with automatic retry on failure
    let razorpayOrder;
    try {
      razorpayOrder = await retryRazorpayOrderCreation(() =>
        createRazorpayOrder({
          amount: amountInRupees,
          currency: "INR",
          receipt: `consultation_${Date.now()}`,
          notes: {
            userId: dbUser.id,
            astrologerId: astrologer.id,
            astrologerName: astrologer.name,
            scheduledAt: scheduledDate.toISOString(),
            duration: duration.toString(),
          },
        }),
      );

      // Record successful payment order creation
      paymentCircuitBreaker.recordSuccess();

      Sentry.addBreadcrumb({
        category: "payment",
        message: "Razorpay order created successfully",
        level: "info",
        data: {
          orderId: razorpayOrder.id,
          amount: amountInRupees,
          userId: dbUser.id,
        },
      });
    } catch (retryError) {
      // Record payment failure for circuit breaker
      paymentCircuitBreaker.recordFailure();

      Sentry.captureException(retryError, {
        tags: {
          operation: "create_razorpay_order_failed",
        },
        extra: {
          userId: dbUser.id,
          astrologerId,
          amount: amountInRupees,
          circuitBreakerStats: paymentCircuitBreaker.getStats(),
        },
      });

      throw retryError; // Re-throw to be caught by outer try-catch
    }

    // Create consultation record in database with PENDING payment status
    const consultation = await prisma.consultation.create({
      data: {
        userId: dbUser.id,
        astrologerId: astrologer.id,
        scheduledAt: scheduledDate,
        duration,
        amount: amountInRupees,
        paymentStatus: "PENDING",
        paymentId: razorpayOrder.id,
        status: "SCHEDULED",
      },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            specialization: true,
            languages: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Consultation order created successfully",
        consultation: {
          id: consultation.id,
          scheduledAt: consultation.scheduledAt,
          duration: consultation.duration,
          amount: consultation.amount,
          astrologer: consultation.astrologer,
        },
        razorpayOrder: {
          orderId: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("Consultation order creation error:", error);

    return NextResponse.json(
      {
        error: "Failed to create consultation order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
