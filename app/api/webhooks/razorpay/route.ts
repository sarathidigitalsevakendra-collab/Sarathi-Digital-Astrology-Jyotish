import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import * as Sentry from "@sentry/nextjs";

// Force dynamic rendering to avoid DATABASE_URL requirement at build time
export const dynamic = "force-dynamic";
// Explicitly run in Node.js runtime (required for Sentry and Node.js APIs)
export const runtime = "nodejs";

/**
 * POST /api/webhooks/razorpay
 * Handle Razorpay webhook events for payment status updates
 *
 * This endpoint receives webhook notifications from Razorpay for events like:
 * - payment.captured (payment successful)
 * - payment.failed (payment failed)
 * - refund.created (refund initiated)
 * - refund.processed (refund completed)
 *
 * Important: This endpoint does NOT require authentication as it's called by Razorpay servers.
 * Security is handled via webhook signature verification.
 *
 * Setup in Razorpay Dashboard:
 * 1. Go to Settings > Webhooks
 * 2. Add webhook URL: https://yourdomain.com/api/webhooks/razorpay
 * 3. Select events: payment.captured, payment.failed, refund.created, refund.processed
 * 4. Use RAZORPAY_KEY_SECRET as webhook secret
 */
// eslint-disable-next-line complexity, max-lines-per-function
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Get raw body for signature verification
    const rawBody = await request.text();

    // Get signature from headers
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      Sentry.captureMessage("Razorpay webhook missing signature", {
        level: "error",
        tags: {
          operation: "webhook_validation",
          error_type: "missing_signature",
        },
        extra: {
          headers: Object.fromEntries(request.headers.entries()),
        },
      });
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      Sentry.captureMessage("Razorpay webhook invalid signature - possible security threat", {
        level: "error",
        tags: {
          operation: "webhook_validation",
          error_type: "invalid_signature",
          security: "signature_mismatch",
        },
        extra: {
          signatureLength: signature.length,
          bodyLength: rawBody.length,
        },
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse webhook payload
    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;
    const refundEntity = payload.payload?.refund?.entity;

    // Log webhook receipt with payment metadata
    Sentry.addBreadcrumb({
      category: "webhook",
      message: `Razorpay webhook received: ${event}`,
      level: "info",
      data: {
        event,
        orderId: paymentEntity?.order_id || refundEntity?.payment_id || "unknown",
        paymentId: paymentEntity?.id || "unknown",
        amount: paymentEntity?.amount ? paymentEntity.amount / 100 : undefined,
        status: paymentEntity?.status || refundEntity?.status || "unknown",
      },
    });

    // Handle different webhook events
    switch (event) {
      case "payment.captured":
        await handlePaymentCaptured(paymentEntity);
        break;

      case "payment.failed":
        await handlePaymentFailed(paymentEntity);
        break;

      case "refund.created":
      case "refund.processed":
        await handleRefund(refundEntity);
        break;

      default:
        Sentry.captureMessage(`Unhandled Razorpay webhook event: ${event}`, {
          level: "warning",
          tags: {
            operation: "webhook_processing",
            event_type: event,
          },
          extra: {
            payload,
          },
        });
    }

    return NextResponse.json({ success: true, message: "Webhook processed" }, { status: 200 });
  } catch (error: unknown) {
    Sentry.captureException(error, {
      tags: {
        operation: "webhook_processing_failed",
      },
      extra: {
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      {
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * Handle payment.captured event
 * Updates consultation payment status to PAID
 *
 * @param paymentEntity - Razorpay payment entity (dynamic payload structure)
 * Note: Using 'any' type because Razorpay webhook payloads have dynamic structure
 * that varies by event type and is not fully type-safe from their SDK
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentCaptured(paymentEntity: any): Promise<void> {
  if (!paymentEntity || !paymentEntity.order_id) {
    Sentry.captureMessage("Invalid payment entity in payment.captured webhook", {
      level: "error",
      tags: {
        operation: "payment_captured",
        error_type: "invalid_entity",
      },
      extra: {
        paymentEntity,
      },
    });
    return;
  }

  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;
  const amount = paymentEntity.amount ? paymentEntity.amount / 100 : 0;

  try {
    // Find consultation by Razorpay order ID
    const consultation = await prisma.consultation.findFirst({
      where: {
        paymentId: orderId,
      },
    });

    if (!consultation) {
      Sentry.captureMessage("Consultation not found for payment.captured webhook", {
        level: "error",
        tags: {
          operation: "payment_captured",
          error_type: "consultation_not_found",
        },
        extra: {
          orderId,
          paymentId,
          amount,
        },
      });
      return;
    }

    // Update payment status to PAID and store Razorpay payment ID
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId: paymentId,
        updatedAt: new Date(),
      },
    });

    Sentry.addBreadcrumb({
      category: "payment",
      message: "Payment captured successfully",
      level: "info",
      data: {
        consultationId: consultation.id,
        paymentId,
        orderId,
        amount,
        userId: consultation.userId,
      },
    });
  } catch (error: unknown) {
    Sentry.captureException(error, {
      tags: {
        operation: "payment_captured_failed",
      },
      extra: {
        orderId,
        paymentId,
        amount,
      },
    });
    throw error;
  }
}

/**
 * Handle payment.failed event
 * Updates consultation payment status to FAILED
 *
 * @param paymentEntity - Razorpay payment entity (dynamic payload structure)
 * Note: Using 'any' type because Razorpay webhook payloads have dynamic structure
 * that varies by event type and is not fully type-safe from their SDK
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentFailed(paymentEntity: any): Promise<void> {
  if (!paymentEntity || !paymentEntity.order_id) {
    Sentry.captureMessage("Invalid payment entity in payment.failed webhook", {
      level: "error",
      tags: {
        operation: "payment_failed",
        error_type: "invalid_entity",
      },
      extra: {
        paymentEntity,
      },
    });
    return;
  }

  const orderId = paymentEntity.order_id;
  const paymentId = paymentEntity.id;
  const errorReason = paymentEntity.error_reason || "Unknown error";
  const amount = paymentEntity.amount ? paymentEntity.amount / 100 : 0;

  try {
    // Find consultation by Razorpay order ID
    const consultation = await prisma.consultation.findFirst({
      where: {
        paymentId: orderId,
      },
    });

    if (!consultation) {
      Sentry.captureMessage("Consultation not found for payment.failed webhook", {
        level: "error",
        tags: {
          operation: "payment_failed",
          error_type: "consultation_not_found",
        },
        extra: {
          orderId,
          paymentId,
          amount,
          errorReason,
        },
      });
      return;
    }

    // Update payment status to FAILED
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        paymentStatus: "FAILED",
        updatedAt: new Date(),
      },
    });

    Sentry.captureException(new Error(`Payment failed: ${errorReason}`), {
      tags: {
        operation: "payment_failed",
        payment_status: "failed",
      },
      extra: {
        consultationId: consultation.id,
        paymentId,
        orderId,
        amount,
        errorReason,
        userId: consultation.userId,
      },
    });
  } catch (error: unknown) {
    Sentry.captureException(error, {
      tags: {
        operation: "payment_failed_handler_error",
      },
      extra: {
        orderId,
        paymentId,
        amount,
        errorReason,
      },
    });
    throw error;
  }
}

/**
 * Handle refund.created and refund.processed events
 * Updates consultation payment status to REFUNDED
 *
 * @param refundEntity - Razorpay refund entity (dynamic payload structure)
 * Note: Using 'any' type because Razorpay webhook payloads have dynamic structure
 * that varies by event type and is not fully type-safe from their SDK
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleRefund(refundEntity: any): Promise<void> {
  if (!refundEntity || !refundEntity.payment_id) {
    Sentry.captureMessage("Invalid refund entity in refund webhook", {
      level: "error",
      tags: {
        operation: "refund_processing",
        error_type: "invalid_entity",
      },
      extra: {
        refundEntity,
      },
    });
    return;
  }

  const paymentId = refundEntity.payment_id;
  const refundId = refundEntity.id;
  const refundAmount = refundEntity.amount ? refundEntity.amount / 100 : 0;
  const refundStatus = refundEntity.status;

  try {
    // Find consultation by Razorpay payment ID
    const consultation = await prisma.consultation.findFirst({
      where: {
        razorpayPaymentId: paymentId,
      },
    });

    if (!consultation) {
      Sentry.captureMessage("Consultation not found for refund webhook", {
        level: "error",
        tags: {
          operation: "refund_processing",
          error_type: "consultation_not_found",
        },
        extra: {
          paymentId,
          refundId,
          refundAmount,
          refundStatus,
        },
      });
      return;
    }

    // Update payment status to REFUNDED
    await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        paymentStatus: "REFUNDED",
        updatedAt: new Date(),
      },
    });

    Sentry.addBreadcrumb({
      category: "payment",
      message: "Refund processed successfully",
      level: "info",
      data: {
        consultationId: consultation.id,
        paymentId,
        refundId,
        refundAmount,
        refundStatus,
        userId: consultation.userId,
      },
    });
  } catch (error: unknown) {
    Sentry.captureException(error, {
      tags: {
        operation: "refund_processing_failed",
      },
      extra: {
        paymentId,
        refundId,
        refundAmount,
        refundStatus,
      },
    });
    throw error;
  }
}
