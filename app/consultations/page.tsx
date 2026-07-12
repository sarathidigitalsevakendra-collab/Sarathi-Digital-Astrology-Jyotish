import { Metadata } from "next";
import Script from "next/script";
import AstrologerList from "@components/consultation/astrologer-list";

export const metadata: Metadata = {
  title: "Consult Trusted Astrologers | Jyotishya",
};

export default function ConsultationsPage(): React.ReactElement {
  return (
    <>
      {/* Load Razorpay Checkout Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <main className="px-6 pb-24 pt-16 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white">Consult Trusted Astrologers</h1>
            <p className="mt-4 text-lg text-slate-300">
              Connect with verified experts across Vedic, KP, Tarot, Numerology, Vastu, and more
            </p>
          </header>

          {/* Astrologers List with Booking */}
          <AstrologerList />

          {/* Info Section */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-semibold text-white mb-4">How it works</h2>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <span className="text-orange-500 font-bold">1.</span>
                <span>Choose an astrologer based on specialty, language, and availability</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 font-bold">2.</span>
                <span>Select your preferred date, time, and consultation duration</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 font-bold">3.</span>
                <span>Complete secure payment through Razorpay (UPI, Cards, Net Banking)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-500 font-bold">4.</span>
                <span>Receive confirmation and meeting link via email</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
