import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import TransitPageContent from "@/components/astrology/transits/TransitPageContent";

export const metadata = {
  title: "Transit Predictions (Gochar) | Jyotishya",
  description: "View real-time planetary transits and their effects on your natal chart",
};

export default async function TransitsPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/transits");
  }

  return (
    <PageContainer size="xl">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">🪐 Transit Predictions (Gochar)</h1>
        <p className="text-lg text-slate-300">
          Discover how current planetary movements influence your life based on your personal birth chart.
        </p>
      </div>

      {/* Transit Content Manager */}
      <TransitPageContent />
      
      {/* Educational Footer */}
      <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
        <h3 className="mb-4 text-xl font-semibold text-white">📚 Understanding Transits</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <h4 className="font-medium text-orange-300">What are Transits?</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Transits (Gochar) refer to the ongoing movement of planets in the sky. As they move,
              they interact with the planets in your birth chart, triggering events and influencing your mood.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-emerald-300">Major vs Minor</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Slow-moving planets like Saturn, Jupiter, Rahu, and Ketu create long-lasting "Major" effects (months to years). 
              Fast movers like Moon and Mercury create short-term "Minor" moods (hours to days).
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-blue-300">Reference System</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              We use the Sidereal Zodiac (Lahiri Ayanamsa) for accurate Vedic calculations, matching
              traditional Indian astrology standards.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
