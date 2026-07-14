import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SadeSatiClient from "./SadeSatiClient";

export const metadata = {
  title: "Sade Sati & Shani Report | Jyotishya",
  description: "Check if you are currently in Sade Sati — Saturn's 7.5-year transit over your natal Moon. Get phase analysis, life area effects, and classical remedies.",
};

export default async function SadeSatiPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/sade-sati");

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🪐</span>
          <h1 className="text-4xl font-bold text-white">Sade Sati Report</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Saturn's 7.5-year transit over your natal Moon — one of the most transformative
          periods in Vedic astrology. Know your current phase, intensity, and the right remedies.
        </p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🌗", label: "3 Phases", sub: "Rising · Peak · Setting" },
            { icon: "🎯", label: "Intensity", sub: "High / Medium / Low / None" },
            { icon: "💊", label: "Remedies", sub: "Mantra, fast, donation" },
            { icon: "📅", label: "Timeline", sub: "Previous & next dates" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-white text-xs font-semibold">{c.label}</p>
              <p className="text-slate-500 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <SadeSatiClient />
      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Calculation uses mean Saturn transit speed (~2.46 years/sign) from a verified reference point (Jan 2020 — Saturn in Capricorn). Verify with birth chart for precision.
      </div>
    </div>
  );
}
