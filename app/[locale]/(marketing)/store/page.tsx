import { Metadata } from "next";
import Link from "next/link";
import {
  Sparkles,
  FileText,
  Video,
  Crown,
  Star,
  ArrowRight,
  MessageCircle,
  Calendar,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Store | Jyotishya - Astrological Services & Digital Products",
  description:
    "Browse premium astrological services, detailed reports, consultation packages, and subscription plans.",
};

const PRODUCTS = [
  {
    id: "detailed-kundli-report",
    name: "Detailed Kundli Report",
    description:
      "Comprehensive 25+ page PDF with planetary positions, Dasha predictions, Yogas, and remedies.",
    price: 499,
    originalPrice: 999,
    icon: FileText,
    category: "Reports",
    badge: "Best Seller",
    features: ["Birth Chart Analysis", "Dasha Timeline", "Yogas & Doshas", "Personalized Remedies"],
  },
  {
    id: "matchmaking-report",
    name: "Kundli Matchmaking Report",
    description:
      "Complete compatibility analysis with Ashtakoot Milan, Manglik Dosha check, and marriage timing.",
    price: 699,
    originalPrice: 1299,
    icon: Star,
    category: "Reports",
    features: ["Guna Milan Score", "Manglik Analysis", "Best Muhurat", "Compatibility Insights"],
  },
  {
    id: "career-consultation",
    name: "Career Consultation",
    description:
      "30-minute video session with a verified astrologer focusing on career, job changes, and business.",
    price: 999,
    originalPrice: 1499,
    icon: Video,
    category: "Consultations",
    badge: "Popular",
    features: ["30 Min Video Call", "Career Timing", "Job/Business Advice", "Follow-up Notes"],
  },
  {
    id: "yearly-transit-report",
    name: "Yearly Transit Report",
    description:
      "Personalized forecast for the next 12 months covering career, health, relationships, and finances.",
    price: 799,
    originalPrice: 1499,
    icon: Calendar,
    category: "Reports",
    features: ["Monthly Predictions", "Transit Analysis", "Key Dates", "Remedies"],
  },
  {
    id: "quick-query",
    name: "Quick Query (Chat)",
    description:
      "Get answers to specific questions via chat. Ideal for quick guidance on immediate concerns.",
    price: 199,
    originalPrice: 399,
    icon: MessageCircle,
    category: "Consultations",
    features: ["Text-based", "1 Question", "24hr Response", "Expert Answer"],
  },
  {
    id: "premium-subscription",
    name: "Jyotishya Premium",
    description:
      "Unlimited access to all reports, priority consultations, and exclusive monthly horoscopes.",
    price: 2999,
    originalPrice: 4999,
    icon: Crown,
    category: "Subscriptions",
    badge: "Best Value",
    features: ["Unlimited Reports", "Priority Booking", "Monthly Horoscope", "Ad-free Experience"],
    isSubscription: true,
    period: "year",
  },
];

const CATEGORIES = ["All", "Reports", "Consultations", "Subscriptions"];

export default function StorePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-slate-50 px-6 pb-24 pt-16 lg:px-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-gradient-to-r from-orange-500/10 to-pink-500/10 px-4 py-2 text-sm text-orange-400">
            <Zap className="h-4 w-4" />
            Special Launch Offers
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Astrological Services & Products
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Unlock cosmic insights with our premium reports, expert consultations,
            and exclusive subscription plans.
          </p>
        </header>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === "All"
                  ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm p-6 transition-all hover:border-orange-500/30 hover:shadow-md"
            >
              {/* Badge */}
              {product.badge && (
                <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                  {product.badge}
                </div>
              )}

              {/* Icon & Category */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                  <product.icon className="h-6 w-6 text-orange-400" />
                </div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {product.category}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {product.name}
              </h3>
              <p className="text-sm text-slate-600 mb-4 flex-grow">
                {product.description}
              </p>

              {/* Features */}
              <ul className="space-y-2 mb-6">
                {product.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-slate-600"
                  >
                    <Sparkles className="h-3 w-3 text-orange-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-slate-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                <span className="text-sm text-slate-500 line-through">
                  ₹{product.originalPrice.toLocaleString("en-IN")}
                </span>
                {product.isSubscription && (
                  <span className="text-xs text-slate-500">/{product.period}</span>
                )}
              </div>

              {/* CTA */}
              <Link
                href={`/store/${product.id}`}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {product.isSubscription ? "Subscribe Now" : "Buy Now"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-2xl">🔒</span>
            <span className="text-sm">Secure Payments</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-2xl">⚡</span>
            <span className="text-sm">Instant Delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-2xl">✅</span>
            <span className="text-sm">Verified Astrologers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-400 text-2xl">💬</span>
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>
      </div>
    </main>
  );
}
