"use client";

import { useState } from "react";
import { Button } from "@digital-astrology/ui";
import { useRouter } from "next/navigation";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";

export function UpgradeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useSupabaseAuth();

  if (!isOpen) return null;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (plan: string, amount: number) => {
    if (!user) {
      alert("Please sign in first.");
      router.push("/auth/signin");
      return;
    }
    
    setLoadingPlan(plan);
    try {
      const res = await loadRazorpay();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you offline?");
        return;
      }

      // Create Order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, amount }),
      });
      
      const order = await orderRes.json();
      
      if (order.error) {
        alert(order.error);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_xxxx",
        amount: order.amount,
        currency: order.currency,
        name: "Jyotishya Astrology",
        description: `Upgrade to ${plan} Plan`,
        order_id: order.id,
        handler: async (response: any) => {
          // Verify Payment
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan
            }),
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            alert("Payment Successful! Plan Upgraded.");
            onClose();
            window.location.reload(); // Hard reload to update plan globally
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#f97316", // orange-500
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0f1e] p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white text-xl">&times;</button>
        <h2 className="text-2xl font-bold text-white mb-2">Upgrade Your Plan</h2>
        <p className="text-slate-300 text-sm mb-6">Unlock advanced features like PDF downloads and AI chat.</p>

        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
            <div>
               <h3 className="text-lg font-bold text-orange-400">Basic Plan</h3>
               <p className="text-xs text-slate-400 mt-1">Advanced Kundli + Daily Horoscope</p>
               <p className="text-xl font-bold text-white mt-2">₹99</p>
            </div>
            <Button 
               className="mt-4 w-full"
               onClick={() => handleUpgrade("BASIC", 99)}
               disabled={loadingPlan !== null}
            >
               {loadingPlan === "BASIC" ? "Processing..." : "Select Basic"}
            </Button>
          </div>

          <div className="rounded-xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-pink-500/10 p-4 flex flex-col justify-between">
            <div>
               <div className="inline-block px-2 py-1 bg-orange-500 text-xs font-bold text-white rounded mb-1">RECOMMENDED</div>
               <h3 className="text-lg font-bold text-pink-400">Premium Plan</h3>
               <p className="text-xs text-slate-400 mt-1">Everything in Basic + PDF Export + Unlimited AI Chat</p>
               <p className="text-xl font-bold text-white mt-2">₹499</p>
            </div>
            <Button 
               className="mt-4 w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
               onClick={() => handleUpgrade("PREMIUM", 499)}
               disabled={loadingPlan !== null}
            >
               {loadingPlan === "PREMIUM" ? "Processing..." : "Select Premium"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
