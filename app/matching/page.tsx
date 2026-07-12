import { Metadata } from "next";
import MatchingPanel from "@/components/astrology/matching/MatchingPanel";

export const metadata: Metadata = {
  title: "Kundli Matching | Jyotishya",
  description: "Calculate marriage compatibility using Ashtakoot Milan - the traditional Vedic astrology 8-factor matching system.",
};

export default function MatchingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white sm:text-4xl">
            Kundli Matching
          </h1>
          <p className="text-slate-400">
            Check marriage compatibility with Ashtakoot Milan
          </p>
        </div>

        {/* Matching Panel */}
        <MatchingPanel />

        {/* How It Works Section */}
        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">How Ashtakoot Works</h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-white/5 p-4">
              <h3 className="mb-2 font-medium text-purple-300">What is it?</h3>
              <p className="text-sm text-slate-400">
                Ashtakoot Milan is a traditional Vedic method of checking marriage compatibility
                by analyzing 8 different aspects (koots) based on the Moon's nakshatra position
                of both individuals.
              </p>
            </div>

            <div className="rounded-lg bg-white/5 p-4">
              <h3 className="mb-2 font-medium text-purple-300">How to use?</h3>
              <p className="text-sm text-slate-400">
                Enter the sidereal Moon longitude (0-360°) for both bride and groom.
                You can find this in any birth chart calculation or use our Birth Chart
                Generator to calculate it.
              </p>
            </div>
          </div>

          {/* Scoring Guide */}
          <div className="mt-6">
            <h3 className="mb-3 font-medium text-purple-300">Scoring Guide</h3>
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-green-500/10 p-3 text-center border border-green-500/20">
                <p className="text-xl font-bold text-green-400">25+</p>
                <p className="text-xs text-slate-400">Excellent Match</p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-3 text-center border border-emerald-500/20">
                <p className="text-xl font-bold text-emerald-400">18-24</p>
                <p className="text-xs text-slate-400">Good Match</p>
              </div>
              <div className="rounded-lg bg-yellow-500/10 p-3 text-center border border-yellow-500/20">
                <p className="text-xl font-bold text-yellow-400">12-17</p>
                <p className="text-xs text-slate-400">Average Match</p>
              </div>
              <div className="rounded-lg bg-orange-500/10 p-3 text-center border border-orange-500/20">
                <p className="text-xl font-bold text-orange-400">&lt;12</p>
                <p className="text-xs text-slate-400">Below Average</p>
              </div>
            </div>
          </div>

          {/* 8 Koots */}
          <div className="mt-6">
            <h3 className="mb-3 font-medium text-purple-300">The 8 Koots</h3>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {[
                { icon: "🔱", name: "Varna", pts: 1, desc: "Spiritual compatibility" },
                { icon: "💫", name: "Vashya", pts: 2, desc: "Mutual attraction" },
                { icon: "⭐", name: "Tara", pts: 3, desc: "Health & longevity" },
                { icon: "🐾", name: "Yoni", pts: 4, desc: "Physical compatibility" },
                { icon: "🤝", name: "Graha Maitri", pts: 5, desc: "Mental harmony" },
                { icon: "👥", name: "Gana", pts: 6, desc: "Temperament" },
                { icon: "❤️", name: "Bhakoot", pts: 7, desc: "Family harmony" },
                { icon: "🩺", name: "Nadi", pts: 8, desc: "Progeny health" },
              ].map((koot) => (
                <div key={koot.name} className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                  <span className="text-lg">{koot.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{koot.name}</p>
                    <p className="text-xs text-slate-500 truncate">{koot.desc}</p>
                  </div>
                  <span className="text-xs font-bold text-purple-400">{koot.pts}pt</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
