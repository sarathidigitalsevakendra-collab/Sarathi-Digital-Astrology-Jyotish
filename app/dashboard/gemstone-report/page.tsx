import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GemstoneReportClient from "./GemstoneReportClient";

export const metadata = {
  title: "Gemstone Report | Jyotishya",
  description: "Get personalised gemstone recommendations based on your Vedic birth chart.",
};

export default async function GemstoneReportPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/gemstone-report");
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-10 lg:px-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">💎</span>
          <h1 className="text-4xl font-bold text-white">Gemstone Recommendation</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Classical Jyotish gemstone therapy based on your personal birth chart.
          Know which stones strengthen you, which to try during Dasha periods, and which to avoid.
        </p>

        {/* How it works */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
          {[
            { icon: "🌟", step: "1", title: "Enter Birth Details", desc: "We calculate your full chart" },
            { icon: "🔭", step: "2", title: "Chart Analysis", desc: "We identify weak benefics & malefics" },
            { icon: "💍", step: "3", title: "Personalised Report", desc: "Get your gemstones with wearing guide" },
          ].map((s) => (
            <div key={s.step} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-2xl mb-1">{s.icon}</div>
              <p className="font-semibold text-white text-xs mb-1">Step {s.step}: {s.title}</p>
              <p className="text-slate-400 text-xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <GemstoneReportClient userId={user.id} userEmail={user.email ?? ""} />

      {/* Disclaimer */}
      <div className="mt-12 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Disclaimer:</strong> Gemstone therapy is complementary to medical treatment, not a replacement.
        Always purchase certified, untreated stones from reputable dealers. Minimum recommended weight: 3–5 carats.
        Trial for 3 days before committing to daily wear.
      </div>
    </div>
  );
}
