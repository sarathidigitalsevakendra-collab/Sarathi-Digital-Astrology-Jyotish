-- Migration: add_razorpay_payment_id_to_consultation
-- Adds razorpayPaymentId field to the consultations table so the webhook
-- refund handler can correctly match Razorpay refunds to consultations.

ALTER TABLE "consultations"
  ADD COLUMN IF NOT EXISTS "razorpayPaymentId" TEXT;

CREATE INDEX IF NOT EXISTS "consultations_razorpayPaymentId_idx"
  ON "consultations" ("razorpayPaymentId");

COMMENT ON COLUMN "consultations"."razorpayPaymentId"
  IS 'Razorpay payment ID (pay_xxx), stored after successful payment capture. Used to match refund webhooks to consultations.';
