import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import VastuClient from "./VastuClient";

export const metadata = {
  title: "Vastu Advisory | Jyotishya",
  description: "Full Vastu Shastra advisory for your home or office — 8-direction zone analysis, room placement guide, colour recommendations, and personalised remedies.",
};

export default async function VastuPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/vastu");

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🏡</span>
          <h1 className="text-4xl font-bold text-white">Vastu Advisory</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Analyse your home or office using classical Vastu Shastra — 8-directional zone mapping,
          ideal room placements, auspicious colours, and personalised remedies.
        </p>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🧭", label: "8-Zone Analysis",    sub: "All directions" },
            { icon: "🏠", label: "Room Placement",      sub: "13 room types" },
            { icon: "🎨", label: "Colour Guide",        sub: "Per zone" },
            { icon: "💊", label: "Remedies",            sub: "Crystals, plants, yantras" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-white text-xs font-semibold">{c.label}</p>
              <p className="text-slate-500 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <VastuClient />

      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Disclaimer:</strong> This Vastu analysis is based on classical Vastu Shastra principles and is provided for educational purposes.
        For structural modifications or major remedies, always consult a qualified Vastu practitioner who can conduct an on-site visit.
      </div>
    </div>
  );
}
