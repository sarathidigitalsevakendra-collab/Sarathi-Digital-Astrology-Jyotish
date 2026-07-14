import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BirthChartGeneratorV2 from "@/components/astrology/birth-chart/BirthChartGeneratorV2";
import { Accordion } from "@/components/ui/AccordionSimple";

export const metadata = {
  title: "Birth Chart | Jyotishya",
  description: "Generate your Vedic birth chart (Kundli) with planetary positions",
};

export default async function BirthChartPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/birth-chart");
  }

  return (
    <div className="mx-auto min-h-screen max-w-7xl px-6 py-12 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">🌟 Your Birth Chart (Kundli)</h1>
        <p className="text-slate-300">
          Generate your Vedic astrology birth chart with detailed planetary positions
        </p>
      </div>

      {/* Birth Chart Generator Component */}
      <BirthChartGeneratorV2 userId={user.id} userEmail={user.email || ""} />

      {/* Info Section - Enhanced for Beginners (Collapsible) */}
      <div className="mt-12 space-y-4">
        <Accordion title="About Your Birth Chart" icon="📚">
          <div className="grid gap-6 md:grid-cols-2 pt-2">
            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-orange-300">
                <span className="text-xl">🌟</span>
                What is a Birth Chart?
              </h4>
              <p className="mb-3 text-sm text-slate-300">
                A birth chart (Kundli in Hindi, Janam Patrika in Sanskrit) is like a cosmic
                photograph of the sky at the exact moment and place you were born.
              </p>
              <p className="text-sm text-slate-300">
                It captures the positions of all 9 planets (Navagraha), 12 zodiac signs (Rashis),
                and 12 houses (Bhavas). This unique cosmic map reveals your personality, strengths,
                challenges, and life path according to Vedic astrology principles.
              </p>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-purple-500/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-purple-300">
                <span className="text-xl">🌙</span>
                Your Rising Sign (Ascendant)
              </h4>
              <p className="mb-3 text-sm text-slate-300">
                Your ascendant (Lagna) is the zodiac sign that was rising on the eastern horizon at
                the moment of your birth.
              </p>
              <p className="text-sm text-slate-300">
                This is considered the most important part of your chart in Vedic astrology! It
                determines your physical appearance, personality, and how you approach life.
              </p>
            </div>

            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-300">
                <span className="text-xl">📊</span>
                Divisional Charts (Vargas)
              </h4>
              <p className="mb-2 text-sm text-slate-300">
                Vedic astrology uses divisional charts to zoom into specific areas of life:
              </p>
              <ul className="space-y-1 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>D1 (Rasi Chart):</strong> Main chart - general life journey</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>D9 (Navamsa):</strong> Marriage, spiritual strength</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span><strong>D10 (Dasamsa):</strong> Career path, profession</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-red-300">
                <span className="text-xl">⏰</span>
                Why Birth Time Matters
              </h4>
              <p className="mb-3 text-sm text-slate-300">
                <strong>Accuracy is everything!</strong> Your ascendant changes every 2 hours. Even 4-5 minutes can shift house placements.
              </p>
              <p className="text-sm text-slate-300">
                💡 Always check your birth certificate for the most accurate time.
              </p>
            </div>
          </div>
        </Accordion>

        <Accordion title="The 9 Planets (Navagraha)" icon="🪐">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {[
              { icon: "☀️", name: "Sun (Surya)", desc: "Soul, father, authority, vitality" },
              { icon: "🌙", name: "Moon (Chandra)", desc: "Mind, mother, emotions, peace" },
              { icon: "🔥", name: "Mars (Mangal)", desc: "Energy, courage, siblings, sports" },
              { icon: "💬", name: "Mercury (Budh)", desc: "Intelligence, speech, business" },
              { icon: "🎓", name: "Jupiter (Guru)", desc: "Wisdom, children, fortune" },
              { icon: "💝", name: "Venus (Shukra)", desc: "Love, marriage, luxury, arts" },
              { icon: "⏱️", name: "Saturn (Shani)", desc: "Karma, discipline, longevity" },
              { icon: "🌑", name: "Rahu (North Node)", desc: "Desires, foreign lands, tech" },
              { icon: "🌑", name: "Ketu (South Node)", desc: "Spirituality, detachment, karma" },
            ].map((planet, i) => (
              <div key={i} className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="mb-1 font-semibold text-white">{planet.icon} {planet.name}</p>
                <p className="text-xs text-slate-300">{planet.desc}</p>
              </div>
            ))}
          </div>
        </Accordion>

         {/* Privacy & Technical Info */}
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-green-300">
            <span className="text-xl">🔒</span>
            Your Privacy & Data Security
          </h3>
          <div className="space-y-2 text-sm text-green-200">
            <p>✓ Birth details cached for 24 hours only</p>
            <p>✓ No personal data shared</p>
            <p>✓ Authentic Lahiri Ayanamsa calculations</p>
          </div>
        </div>
      </div>
    </div>
  );
}
