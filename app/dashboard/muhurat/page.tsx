import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MuhuratClient from "./MuhuratClient";

export const metadata = {
  title: "Muhurat Calculator | Jyotishya",
  description: "Find auspicious dates for Marriage, Griha Pravesh, Business Opening, Naming Ceremony, and Travel using classical Panchang rules.",
};

export default async function MuhuratPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/muhurat");

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">📅</span>
          <h1 className="text-4xl font-bold text-white">Muhurat Calculator</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Find auspicious dates for major life events using classical Vedic Panchang rules —
          Tithi, Vara, Nakshatra, and Yoga analysis with Rahu Kalam avoidance windows.
        </p>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: "💍", label: "Marriage" },
            { icon: "🏠", label: "Griha Pravesh" },
            { icon: "🏢", label: "Business" },
            { icon: "👶", label: "Naming" },
            { icon: "✈️", label: "Travel" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-white text-xs font-semibold">{c.label}</p>
            </div>
          ))}
        </div>
      </div>

      <MuhuratClient />

      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Calculations use mean planetary longitudes with Lahiri ayanamsha, accurate to ±1 day for muhurat selection.
        Always confirm important ceremonies with a qualified Jyotishi — local sunrise time, geographical latitude, and personal Janma Nakshatra also matter.
      </div>
    </div>
  );
}
