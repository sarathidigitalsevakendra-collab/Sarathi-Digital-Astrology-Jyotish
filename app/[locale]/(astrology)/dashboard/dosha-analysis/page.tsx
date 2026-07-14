import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DoshaClient from "./DoshaClient";

export const metadata = {
  title: "Dosha Analysis | Jyotishya",
  description: "Comprehensive Kaal Sarp Dosha and Manglik Dosha analysis — 12 Kaal Sarp types, severity levels, cancellation conditions, and classical remedies.",
};

export default async function DoshaAnalysisPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/dosha-analysis");

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🔱</span>
          <h1 className="text-4xl font-bold text-white">Dosha Analysis</h1>
        </div>
        <p className="text-slate-400 ml-14">
          In-depth Kaal Sarp Dosha (12 types) and Manglik Dosha analysis with severity grading,
          cancellation detection, and personalised remedies.
        </p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🐍", label: "Kaal Sarp", sub: "12 types, partial/full" },
            { icon: "♂️", label: "Manglik", sub: "Lagna + Moon check" },
            { icon: "✅", label: "Cancellations", sub: "Auto-detected" },
            { icon: "💊", label: "Remedies", sub: "Puja, mantra, gemstone" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-white text-xs font-semibold">{c.label}</p>
              <p className="text-slate-500 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <DoshaClient />
      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Tip:</strong> Copy planet degree values from your Kundali Generator output. All values should be in 0–360° format with Lahiri ayanamsha applied.
      </div>
    </div>
  );
}
