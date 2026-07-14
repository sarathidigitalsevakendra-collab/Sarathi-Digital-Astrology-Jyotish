import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LuckyReportClient from "./LuckyReportClient";

export const metadata = {
  title: "Lucky Number Report | Jyotishya",
  description: "Discover your life path number, lucky colors, lucky day, and personal numerology gemstone.",
};

export default async function LuckyReportPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/lucky-report");
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10 lg:px-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🔢</span>
          <h1 className="text-4xl font-bold text-white">Lucky Number Report</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Personalised numerology based on Pythagorean & Cheiro systems.
          Know your life path number, lucky colors, lucky days, compatible numbers, and daily mantra.
        </p>

        {/* At-a-glance chips */}
        <div className="mt-5 flex flex-wrap gap-2">
          {["🔢 Life Path Number", "🎂 Birth Number", "🎨 Lucky Colors", "📅 Lucky Days",
            "💍 Gemstone", "💪 Strengths & Challenges", "💰 Finance Tendency", "🙏 Mantra"].map(f => (
            <span key={f} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
              {f}
            </span>
          ))}
        </div>
      </div>

      <LuckyReportClient />

      {/* Disclaimer */}
      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Numerology is a classical system of self-discovery.
        Numbers are computed using the standard Pythagorean/Cheiro mapping. Use for guidance and inspiration.
      </div>
    </div>
  );
}
