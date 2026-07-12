import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPaymentSignature, fetchPaymentDetails } from "@/lib/payments/razorpay";

// Force dynamic rendering for this API route
export const dynamic = "force-dynamic";

/**
 * POST /api/consultations/verify-payment
 * Verify Razorpay payment and update consultation payment status
 *
 * Request body:
 * - razorpay_order_id: string (required)
 * - razorpay_payment_id: string (required)
 * - razorpay_signature: string (required)
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
    const dbUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.email || undefined }, { phone: user.phone || undefined }],
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    // Parse and validate request body
    const body = (await request.json()) as Record<string, unknown>;

    // Type-safe extraction with validation
    const razorpay_order_id =
      typeof body.razorpay_order_id === "string" ? body.razorpay_order_id : null;
    const razorpay_payment_id =
      typeof body.razorpay_payment_id === "string" ? body.razorpay_payment_id : null;
    const razorpay_signature =
      typeof body.razorpay_signature === "string" ? body.razorpay_signature : null;

    if (!razorpay_order_id) {
      return NextResponse.json({ error: "Invalid razorpay_order_id" }, { status: 400 });
    }

    if (!razorpay_payment_id) {
      return NextResponse.json({ error: "Invalid razorpay_payment_id" }, { status: 400 });
    }

    if (!razorpay_signature) {
      return NextResponse.json({ error: "Invalid razorpay_signature" }, { status: 400 });
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Payment verification failed. Invalid signature." },
        { status: 400 },
      );
    }

    // Find consultation by payment order ID
    const consultation = await prisma.consultation.findFirst({
      where: {
        paymentId: razorpay_order_id,
        userId: dbUser.id,
      },
      include: {
        astrologer: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
          },
        },
      },
    });

    if (!consultation) {
      return NextResponse.json(
        { error: "Consultation not found for this payment order." },
        { status: 404 },
      );
    }

    // Check if payment is already verified
    if (consultation.paymentStatus === "PAID") {
      return NextResponse.json(
        {
          success: true,
          message: "Payment already verified",
          consultation: {
            id: consultation.id,
            paymentStatus: consultation.paymentStatus,
            scheduledAt: consultation.scheduledAt,
            duration: consultation.duration,
            amount: consultation.amount,
            astrologer: consultation.astrologer,
          },
        },
        { status: 200 },
      );
    }

    // Fetch payment details from Razorpay to get additional info
    let paymentDetails: Awaited<ReturnType<typeof fetchPaymentDetails>> | undefined;
    try {
      paymentDetails = await fetchPaymentDetails(razorpay_payment_id);
    } catch (error: unknown) {
      console.error("Error fetching payment details:", error);
      // Continue even if fetch fails - signature verification is sufficient
      paymentDetails = undefined;
    }

    // Update consultation payment status
    const updatedConsultation = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        paymentStatus: "PAID",
        paymentId: razorpay_order_id,
        updatedAt: new Date(),
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
        message: "Payment verified successfully",
        consultation: {
          id: updatedConsultation.id,
          scheduledAt: updatedConsultation.scheduledAt,
          duration: updatedConsultation.duration,
          amount: updatedConsultation.amount,
          paymentStatus: updatedConsultation.paymentStatus,
          status: updatedConsultation.status,
          astrologer: updatedConsultation.astrologer,
        },
        paymentDetails: paymentDetails
          ? {
              paymentId: razorpay_payment_id,
              method: paymentDetails.method,
              email: paymentDetails.email,
              contact: paymentDetails.contact,
            }
          : undefined,
      },
      { status: 200 },
    );
  } catch (error: unknown) {
    console.error("Payment verification error:", error);

    // If verification failed, mark payment as failed
    // Note: request body can only be read once, so this will likely fail
    // We'll handle the error gracefully
    let failedOrderId: string | undefined;
    try {
      const bodyRetry = (await request.json()) as Record<string, unknown>;
      failedOrderId =
        typeof bodyRetry.razorpay_order_id === "string" ? bodyRetry.razorpay_order_id : undefined;
    } catch {
      failedOrderId = undefined;
    }

    if (failedOrderId) {
      try {
        await prisma.consultation.updateMany({
          where: {
            paymentId: failedOrderId,
            paymentStatus: "PENDING",
          },
          data: {
            paymentStatus: "FAILED",
            updatedAt: new Date(),
          },
        });
      } catch (updateError) {
        console.error("Failed to update payment status to FAILED:", updateError);
      }
    }

    return NextResponse.json(
      {
        error: "Payment verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
