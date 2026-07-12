import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import YogaClient from "./YogaClient";

export const metadata = {
  title: "Yoga Detection | Jyotishya",
  description: "Detect Raja Yoga, Dhana Yoga, Pancha Mahapurusha Yoga, Gaja Kesari Yoga, and Neecha Bhanga Yoga from your birth chart planet positions.",
};

export default async function YogaDetectionPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/yoga-detection");

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">✨</span>
          <h1 className="text-4xl font-bold text-white">Yoga Detection</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Discover powerful planetary combinations (Yogas) in your Kundali — Raja, Dhana,
          Pancha Mahapurusha, Gaja Kesari, and Neecha Bhanga Yogas.
        </p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "👑", label: "Raja Yoga",       sub: "Power & authority" },
            { icon: "💰", label: "Dhana Yoga",       sub: "Wealth & gains" },
            { icon: "🌟", label: "Mahapurusha",      sub: "5 great-person yogas" },
            { icon: "🐘", label: "Gaja Kesari",      sub: "Fame & prosperity" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-white text-xs font-semibold">{c.label}</p>
              <p className="text-slate-500 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <YogaClient />
      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Tip:</strong> Use planet longitudes from the Kundali Generator. This analysis uses Whole Sign houses — the standard for Parashari yoga detection.
      </div>
    </div>
  );
}
