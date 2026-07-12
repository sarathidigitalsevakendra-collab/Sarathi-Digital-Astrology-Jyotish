import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BirthChartGeneratorV3 from "@components/astrology/birth-chart-generator-v3";

export const metadata = {
  title: "Birth Chart | Jyotishya",
  description: "Generate your Vedic birth chart (Kundli) with planetary positions",
};

export default async function BirthChartPageV3() {
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
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold text-white">Your Birth Chart (Kundli)</h1>
        <p className="text-slate-300">
          Generate your Vedic astrology birth chart with detailed planetary positions
        </p>
      </div>

      {/* Birth Chart Generator Component */}
      <BirthChartGeneratorV3 />

      {/* Educational Content - Below the Fold */}
      <div className="mt-16 space-y-6">
        {/* About Your Birth Chart */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-white">
            <span>📚</span>
            About Your Birth Chart
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-orange-300">
                  <span className="text-xl">🌟</span>
                  What is a Birth Chart?
                </h4>
                <p className="text-sm text-slate-300">
                  A birth chart (Kundli) is a cosmic photograph of the sky at your birth moment. It
                  captures the positions of all 9 planets (Navagraha), 12 zodiac signs (Rashis), and
                  12 houses (Bhavas) - revealing your personality, strengths, and life path.
                </p>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-purple-300">
                  <span className="text-xl">🌙</span>
                  Your Rising Sign (Ascendant)
                </h4>
                <p className="text-sm text-slate-300">
                  Your ascendant (Lagna) is the zodiac sign rising on the eastern horizon at your
                  birth. It determines your physical appearance, personality, and approach to life -
                  making accurate birth time essential.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-300">
                  <span className="text-xl">📊</span>
                  Divisional Charts (Vargas)
                </h4>
                <p className="mb-2 text-sm text-slate-300">
                  Vedic astrology uses divisional charts to zoom into specific life areas:
                </p>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>• D1 (Rasi): Overall life journey</li>
                  <li>• D9 (Navamsa): Marriage & spiritual strength</li>
                  <li>• D10 (Dasamsa): Career & reputation</li>
                </ul>
              </div>

              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-red-300">
                  <span className="text-xl">⏰</span>
                  Why Birth Time Matters
                </h4>
                <p className="text-sm text-slate-300">
                  Your ascendant changes every ~2 hours. Even 4-5 minutes can shift house
                  placements. Check your birth certificate for the most accurate time.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* The 9 Planets (Navagraha) */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-2xl font-semibold text-white">
            <span>🪐</span>
            The 9 Planets (Navagraha)
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { emoji: "☀️", name: "Sun (Surya)", meaning: "Soul, father, authority, vitality" },
              { emoji: "🌙", name: "Moon (Chandra)", meaning: "Mind, mother, emotions, peace" },
              {
                emoji: "🔥",
                name: "Mars (Mangal)",
                meaning: "Energy, courage, siblings, property",
              },
              {
                emoji: "💬",
                name: "Mercury (Budh)",
                meaning: "Intelligence, speech, communication",
              },
              {
                emoji: "🎓",
                name: "Jupiter (Guru)",
                meaning: "Wisdom, children, fortune, spirituality",
              },
              { emoji: "💝", name: "Venus (Shukra)", meaning: "Love, marriage, luxury, arts" },
              {
                emoji: "⏱️",
                name: "Saturn (Shani)",
                meaning: "Karma, discipline, delays, longevity",
              },
              {
                emoji: "🌑",
                name: "Rahu (North Node)",
                meaning: "Material desires, foreign lands, technology",
              },
              {
                emoji: "🌑",
                name: "Ketu (South Node)",
                meaning: "Spirituality, detachment, past karma",
              },
            ].map((planet, idx) => (
              <div key={idx} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="mb-1 flex items-center gap-2 font-semibold text-white">
                  <span>{planet.emoji}</span>
                  {planet.name}
                </p>
                <p className="text-xs text-slate-300">{planet.meaning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy & Data Security */}
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-6 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-xl font-semibold text-green-300">
            <span className="text-2xl">🔒</span>
            Your Privacy & Data Security
          </h3>
          <ul className="space-y-2 text-sm text-green-200">
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>Your birth details are cached securely for 24 hours to optimize API usage</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>No personal data is shared with third parties</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>
                You can download your chart anytime and delete your account whenever you wish
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400">✓</span>
              <span>
                All calculations use authentic Vedic astrology algorithms (Lahiri Ayanamsa)
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 pt-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Left - Brand */}
          <div>
            <h4 className="mb-2 text-xl font-bold text-white">Jyotishya</h4>
            <p className="text-sm text-slate-400">
              Authentic Vedic astrology powered by modern technology
            </p>
          </div>

          {/* Right - Links & Newsletter */}
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-semibold text-white">Quick Links</h4>
              <ul className="space-y-1 text-sm text-slate-400">
                <li>
                  <a href="/dashboard" className="hover:text-orange-400 transition">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="/dashboard/my-kundlis" className="hover:text-orange-400 transition">
                    My Kundlis
                  </a>
                </li>
                <li>
                  <a href="/help" className="hover:text-orange-400 transition">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 font-semibold text-white">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-orange-400 focus:outline-none"
                />
                <button className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white transition hover:shadow-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
          <p>© 2025 Jyotishya. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
