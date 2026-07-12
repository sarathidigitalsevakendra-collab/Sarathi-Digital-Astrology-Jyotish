/**
 * TypeScript declarations for Razorpay Checkout
 * Documentation: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
 */

interface RazorpayOptions {
  /**
   * Razorpay API Key ID (public key)
   */
  key: string;

  /**
   * Amount in currency subunits (paise for INR)
   * Example: 50000 paise = ₹500
   */
  amount: number;

  /**
   * Currency code (ISO 4217)
   * Default: 'INR'
   */
  currency: string;

  /**
   * Name of your business/app
   */
  name: string;

  /**
   * Description of the purchase
   */
  description?: string;

  /**
   * URL to your logo (displayed in checkout)
   */
  image?: string;

  /**
   * Razorpay order ID (from server-side order creation)
   */
  order_id: string;

  /**
   * Callback function called when payment is successful
   */
  handler: (response: RazorpaySuccessResponse) => void;

  /**
   * Prefill customer information
   */
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };

  /**
   * Customer notes (key-value pairs)
   */
  notes?: Record<string, string>;

  /**
   * Theme customization
   */
  theme?: {
    color?: string;
    backdrop_color?: string;
  };

  /**
   * Modal behavior configuration
   */
  modal?: {
    /**
     * Called when checkout is dismissed
     */
    ondismiss?: () => void;

    /**
     * Set to false to prevent user from closing the checkout
     */
    escape?: boolean;

    /**
     * Animation enabled/disabled
     */
    animation?: boolean;

    /**
     * Confirm before closing checkout
     */
    confirm_close?: boolean;
  };

  /**
   * Enable recurring payments
   */
  recurring?: boolean;

  /**
   * Callback URL (alternative to handler)
   */
  callback_url?: string;

  /**
   * Redirect to this URL on payment failure
   */
  redirect?: boolean;

  /**
   * Remember customer for future payments
   */
  remember_customer?: boolean;

  /**
   * Timeout for checkout in seconds
   */
  timeout?: number;

  /**
   * Enable retry on payment failure
   */
  retry?: {
    enabled: boolean;
    max_count?: number;
  };
}

interface RazorpaySuccessResponse {
  /**
   * Razorpay payment ID
   */
  razorpay_payment_id: string;

  /**
   * Razorpay order ID
   */
  razorpay_order_id: string;

  /**
   * HMAC signature for verification
   */
  razorpay_signature: string;
}

interface RazorpayInstance {
  /**
   * Opens the Razorpay checkout modal
   */
  open(): void;

  /**
   * Event listener for payment events
   */
  on(event: string, handler: (response: any) => void): void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

declare global {
  interface Window {
    /**
     * Razorpay Checkout constructor
     * Available after loading https://checkout.razorpay.com/v1/checkout.js
     */
    Razorpay: RazorpayConstructor;
  }
}

export {};
