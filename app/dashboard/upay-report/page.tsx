import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import UpayClient from "./UpayClient";

export const metadata = {
  title: "Upay & Remedy Report | Jyotishya",
  description: "Personalised Jyotish remedies — mantras, fastings, gemstones, donations, yantras, colours, and lifestyle practices based on your Dasha, Moon sign, and active doshas.",
};

export default async function UpayPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/upay-report");

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🕉️</span>
          <h1 className="text-4xl font-bold text-white">Upay & Remedy Report</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Personalised Vedic remedies across 10 categories — based on your current Dasha,
          Moon sign, Lagna, and active doshas.
        </p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-2">
          {["🕉️ Mantra", "🌙 Fasting", "💎 Gemstone", "🤲 Donation", "🔯 Yantra", "🎨 Colour", "🌿 Plant", "⛩️ Temple", "🍛 Food", "🧘 Lifestyle"].map(c => (
            <div key={c} className="rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-center">
              <p className="text-white text-xs font-medium">{c}</p>
            </div>
          ))}
        </div>
      </div>
      <UpayClient />
      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Remedies are based on classical Jyotish principles. For gemstone recommendations, always consult a qualified Jyotishi to verify suitability for your full chart before wearing.
      </div>
    </div>
  );
}
