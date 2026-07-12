"use client";

import { useState, useEffect } from "react";
import { Button } from "@digital-astrology/ui";
import { AlertTriangle } from "lucide-react";
import * as Sentry from "@sentry/nextjs";

// API Response types
interface CreateOrderResponse {
  success: boolean;
  message: string;
  consultation: {
    id: string;
    scheduledAt: string;
    duration: number;
    amount: number;
    astrologer: {
      id: string;
      name: string;
      imageUrl: string;
      specialization: string[];
      languages: string[];
    };
  };
  razorpayOrder: {
    orderId: string;
    amount: number;
    currency: string;
  };
}

interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface BookingModalProps {
  astrologer: {
    id: string;
    name: string;
    hourlyRate: number;
    imageUrl: string;
    specialization: string[];
    languages: string[];
  };
  onClose: () => void;
  onSuccess: (consultationId: string) => void;
}

export default function BookingModal({ astrologer, onClose, onSuccess }: BookingModalProps) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Log modal open event to Sentry for tracking
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: "consultation",
      message: "Booking modal opened",
      level: "info",
      data: {
        astrologerId: astrologer.id,
        astrologerName: astrologer.name,
        hourlyRate: astrologer.hourlyRate,
      },
    });
  }, [astrologer.id, astrologer.name, astrologer.hourlyRate]);

  // Calculate amount based on duration
  const calculateAmount = () => {
    return Math.ceil((astrologer.hourlyRate / 60) * duration);
  };

  const handleBookConsultation = async () => {
    setLoading(true);
    setError("");

    try {
      // Validate inputs
      if (!scheduledDate || !scheduledTime) {
        setError("Please select date and time");
        setLoading(false);
        return;
      }

      // Combine date and time into ISO string
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();

      // Step 1: Create order
      const createResponse = await fetch("/api/consultations/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astrologerId: astrologer.id,
          scheduledAt,
          duration,
        }),
      });

      if (!createResponse.ok) {
        const errorData = (await createResponse.json()) as { error?: string };
        throw new Error(errorData.error || "Failed to create order");
      }

      const { consultation, razorpayOrder } = (await createResponse.json()) as CreateOrderResponse;

      // Step 2: Open Razorpay checkout
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      if (!razorpayKeyId) {
        throw new Error("Razorpay configuration error. Please contact support.");
      }

      const options = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.orderId,
        name: "Jyotishya",
        description: `Consultation with ${astrologer.name}`,
        image: "/logo.png",
        handler: (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Use void async IIFE to handle async operations in handler
          void (async () => {
            try {
              // Step 3: Verify payment
              const verifyResponse = await fetch("/api/consultations/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              });

              const result = (await verifyResponse.json()) as VerifyPaymentResponse;

              if (result.success) {
                // Payment successful!
                onSuccess(consultation.id);
              } else {
                setError("Payment verification failed. Please contact support.");
                Sentry.captureMessage("Payment verification failed", {
                  level: "error",
                  tags: { operation: "verify_payment" },
                  extra: { consultationId: consultation.id, error: result.error },
                });
              }
            } catch (error: unknown) {
              setError("Payment verification failed. Please contact support.");
              Sentry.captureException(error, {
                tags: { operation: "verify_payment" },
                extra: { consultationId: consultation.id },
              });
            } finally {
              setLoading(false);
            }
          })();
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled");
          },
        },
        theme: {
          color: "#f97316", // Orange color from your theme
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to create booking");
      Sentry.captureException(error, {
        tags: { operation: "create_consultation_order" },
        extra: { astrologerId: astrologer.id, duration, scheduledDate, scheduledTime },
      });
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Get minimum time (if today is selected)
  const getMinTime = () => {
    if (scheduledDate === getMinDate()) {
      const now = new Date();
      return now.toTimeString().slice(0, 5);
    }
    return "00:00";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-cosmic-blue border border-white/10 rounded-2xl shadow-astro max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Book Consultation</h2>
          <p className="text-slate-300 mt-1">with {astrologer.name}</p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Date</label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={getMinDate()}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Select Time</label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              min={getMinTime()}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Duration</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>

          {/* Amount */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Amount to pay</span>
              <span className="text-2xl font-bold text-white">₹{calculateAmount()}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Rate: ₹{astrologer.hourlyRate}/hour</p>
          </div>

          {/* Disclaimer - Entertainment Only */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-200 mb-2">Important Disclaimer</h4>
                <p className="text-xs text-yellow-100/80 leading-relaxed mb-3">
                  Astrology consultations are provided for{" "}
                  <strong>entertainment and self-reflection purposes only</strong>. They are NOT a
                  substitute for professional medical, legal, financial, or psychological advice.
                  Always consult qualified professionals for important life decisions.
                </p>
                <label className="flex items-start gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={disclaimerAccepted}
                    onChange={(e) => {
                      const accepted = e.target.checked;
                      setDisclaimerAccepted(accepted);

                      // Log disclaimer acceptance/rejection to Sentry
                      Sentry.addBreadcrumb({
                        category: "consultation",
                        message: accepted ? "Disclaimer accepted" : "Disclaimer rejected",
                        level: "info",
                        data: {
                          astrologerId: astrologer.id,
                          disclaimerAccepted: accepted,
                        },
                      });
                    }}
                    className="mt-1 w-4 h-4 rounded border-yellow-500/50 bg-white/5 text-yellow-500 focus:ring-2 focus:ring-yellow-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-yellow-100 group-hover:text-yellow-50 transition-colors">
                    I understand and agree that this consultation is for entertainment purposes only
                    and does not replace professional advice.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleBookConsultation}
              disabled={loading || !disclaimerAccepted}
              className="flex-1"
              title={!disclaimerAccepted ? "Please accept the disclaimer to proceed" : ""}
            >
              {loading ? "Processing..." : "Proceed to Pay"}
            </Button>
          </div>

          {/* Helper text if disclaimer not accepted */}
          {!disclaimerAccepted && (
            <p className="text-xs text-center text-slate-400 mt-2">
              Please accept the disclaimer above to proceed with payment
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
