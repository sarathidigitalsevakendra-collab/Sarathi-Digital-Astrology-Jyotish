import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Shield, Clock, MessageCircle } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // In production, fetch product data from database
  return {
    title: `${id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())} | Jyotishya Store`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  
  // In production, fetch product from database
  // For now, show a placeholder page
  const productName = id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <main className="min-h-screen bg-cosmic-blue px-6 pb-24 pt-16 lg:px-16">
      <div className="mx-auto max-w-4xl">
        {/* Back Link */}
        <Link
          href="/store"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>

        {/* Product Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 md:p-12">
          <div className="grid gap-8 md:grid-cols-2">
            {/* Left: Product Info */}
            <div>
              <span className="inline-block mb-4 rounded-full bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-400 uppercase tracking-wider">
                Premium Product
              </span>
              <h1 className="text-3xl font-bold text-white mb-4">{productName}</h1>
              <p className="text-slate-300 mb-6">
                Get detailed astrological insights and personalized guidance based on
                your birth chart. Our expert astrologers provide accurate and
                meaningful interpretations.
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-300">
                  <Shield className="h-5 w-5 text-orange-400" />
                  100% Satisfaction Guarantee
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Clock className="h-5 w-5 text-orange-400" />
                  Delivered within 24 hours
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <MessageCircle className="h-5 w-5 text-orange-400" />
                  Free follow-up support
                </li>
              </ul>
            </div>

            {/* Right: Purchase Card */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-white">₹499</span>
                <span className="text-lg text-slate-500 line-through">₹999</span>
                <span className="ml-2 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-400">
                  50% OFF
                </span>
              </div>

              <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 py-4 text-lg font-medium text-white transition-opacity hover:opacity-90 mb-4">
                <ShoppingCart className="h-5 w-5" />
                Buy Now
              </button>

              <p className="text-center text-sm text-slate-400">
                Secure payment via Razorpay
              </p>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-semibold text-white mb-3">
                  What's included:
                </h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✓ Detailed PDF Report</li>
                  <li>✓ Personalized Interpretations</li>
                  <li>✓ Remedies & Suggestions</li>
                  <li>✓ Email Delivery</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-medium text-white mb-2">
                How long does delivery take?
              </h3>
              <p className="text-sm text-slate-400">
                Most reports are delivered within 24 hours. Consultations are scheduled
                based on availability.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-medium text-white mb-2">
                What information do you need?
              </h3>
              <p className="text-sm text-slate-400">
                We'll need your birth date, time, and place to generate accurate
                astrological insights.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 className="font-medium text-white mb-2">
                Is my information secure?
              </h3>
              <p className="text-sm text-slate-400">
                Yes, we use industry-standard encryption and never share your personal
                data with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
