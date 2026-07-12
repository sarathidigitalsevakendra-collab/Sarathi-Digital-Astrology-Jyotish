import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashaReadingClient from "./DashaReadingClient";

export const metadata = {
  title: "Dasha Reading | Jyotishya",
  description: "Calculate your current Vimshottari Mahadasha and Antardasha periods — know which planetary energy governs your life right now.",
};

export default async function DashaReadingPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/dasha-reading");

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🌌</span>
          <h1 className="text-4xl font-bold text-white">Dasha Reading</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Vimshottari Dasha — the 120-year planetary period system. Know your current Mahadasha
          and Antardasha: which planets govern your life, and when each period shifts.
        </p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🔭", label: "9 Planets", sub: "Full 120-year cycle" },
            { icon: "📅", label: "Antardasha", sub: "Sub-period breakdowns" },
            { icon: "⚡", label: "Current Period", sub: "Highlighted live" },
            { icon: "🌌", label: "Birth Nakshatra", sub: "Dasha starting point" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-white text-xs font-semibold">{c.label}</p>
              <p className="text-slate-500 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <DashaReadingClient />
      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Accuracy:</strong> Providing the exact Moon longitude from your Kundali gives the most accurate Dasha start date. Without it, an approximation based on birth date is used.
      </div>
    </div>
  );
}
