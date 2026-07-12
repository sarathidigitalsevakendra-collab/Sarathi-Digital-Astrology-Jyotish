/**
 * Razorpay TypeScript Type Definitions
 *
 * Complete type-safe interfaces for Razorpay API responses.
 * Documentation: https://razorpay.com/docs/api/
 *
 * @module lib/payments/razorpay-types
 */

/**
 * Razorpay payment response
 * https://razorpay.com/docs/api/payments/#payment-entity
 */
export interface RazorpayPayment {
  id: string;
  entity: "payment";
  amount: number; // Amount in paise (1 rupee = 100 paise)
  currency: string; // Usually "INR"
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
  order_id: string | null;
  invoice_id: string | null;
  international: boolean;
  method: "card" | "netbanking" | "wallet" | "emi" | "upi" | "cardless_emi" | "paylater";
  amount_refunded: number; // Amount refunded in paise
  refund_status: "null" | "partial" | "full";
  captured: boolean;
  description: string | null;
  card_id: string | null;
  bank: string | null;
  wallet: string | null;
  vpa: string | null; // UPI Virtual Payment Address
  email: string;
  contact: string; // Phone number
  customer_id: string | null;
  token_id: string | null;
  notes: Record<string, string>;
  fee: number | null; // Razorpay fee in paise
  tax: number | null; // Tax on fee in paise
  error_code: string | null;
  error_description: string | null;
  error_source: string | null;
  error_step: string | null;
  error_reason: string | null;
  acquirer_data: {
    auth_code?: string;
    rrn?: string; // Retrieval Reference Number
    upi_transaction_id?: string;
  };
  created_at: number; // Unix timestamp in seconds
}

/**
 * Razorpay refund response
 * https://razorpay.com/docs/api/refunds/#refund-entity
 */
export interface RazorpayRefund {
  id: string;
  entity: "refund";
  amount: number; // Refund amount in paise
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt: string | null;
  acquirer_data: {
    arn: string | null; // Acquirer Reference Number
  };
  created_at: number; // Unix timestamp in seconds
  batch_id: string | null;
  status: "pending" | "processed" | "failed";
  speed_requested: "normal" | "optimum";
  speed_processed: "normal" | "instant";
  error_code: string | null;
  error_description: string | null;
}

/**
 * Razorpay order response
 * https://razorpay.com/docs/api/orders/#order-entity
 */
export interface RazorpayOrder {
  id: string;
  entity: "order";
  amount: number; // Amount in paise
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  offer_id: string | null;
  status: "created" | "attempted" | "paid";
  attempts: number;
  notes: Record<string, string>;
  created_at: number; // Unix timestamp in seconds
}

/**
 * Razorpay error response
 * https://razorpay.com/docs/api/#errors
 */
export interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Type guard to check if response is an error
 */
export function isRazorpayError(response: unknown): response is RazorpayError {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as RazorpayError).error === "object"
  );
}

/**
 * Payment method types for form validation
 */
export type PaymentMethod = RazorpayPayment["method"];

/**
 * Payment status types for UI state management
 */
export type PaymentStatus = RazorpayPayment["status"];

/**
 * Refund status types
 */
export type RefundStatus = RazorpayRefund["status"];

/**
 * Helper function to convert paise to rupees
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Helper function to convert rupees to paise
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Helper function to format amount for display
 */
export function formatIndianCurrency(paise: number): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Payment metadata for tracking
 */
export interface PaymentMetadata {
  userId: string;
  consultationId?: string;
  orderId?: string;
  source: "web" | "mobile" | "api";
  version: string;
}

/**
 * Webhook event types
 * https://razorpay.com/docs/webhooks/#events
 */
export type RazorpayWebhookEvent =
  | "payment.authorized"
  | "payment.captured"
  | "payment.failed"
  | "refund.created"
  | "refund.processed"
  | "order.paid";

/**
 * Webhook payload
 */
export interface RazorpayWebhookPayload {
  entity: "event";
  account_id: string;
  event: RazorpayWebhookEvent;
  contains: Array<"payment" | "refund" | "order">;
  payload: {
    payment?: {
      entity: RazorpayPayment;
    };
    refund?: {
      entity: RazorpayRefund;
    };
    order?: {
      entity: RazorpayOrder;
    };
  };
  created_at: number;
}
