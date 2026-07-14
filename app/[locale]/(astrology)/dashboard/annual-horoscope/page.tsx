import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AnnualHoroscopeClient from "./AnnualHoroscopeClient";

export const metadata = {
  title: "Annual Horoscope | Jyotishya",
  description: "Year-ahead transit forecast based on Saturn, Jupiter, and Rahu — month-by-month themes, quarterly focus areas, year score, and lucky data for your Moon sign.",
};

export default async function AnnualHoroscopePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/annual-horoscope");

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🌠</span>
          <h1 className="text-4xl font-bold text-white">Annual Horoscope</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Year-ahead forecast based on Saturn, Jupiter, and Rahu transits over your natal Moon.
          Month-by-month themes, quarterly focus areas, and lucky data.
        </p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🪐", label: "Slow Transits",  sub: "Saturn, Jupiter, Rahu" },
            { icon: "📅", label: "12 Months",       sub: "Monthly themes" },
            { icon: "📊", label: "4 Quarters",      sub: "Focus & tone" },
            { icon: "⭐", label: "Year Score",       sub: "Auspiciousness 0–100" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-white text-xs font-semibold">{c.label}</p>
              <p className="text-slate-500 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>
      <AnnualHoroscopeClient />
      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Predictions use mean planetary motion from verified reference epochs. For day-level precision provide your birth chart longitudes via the Kundali Generator.
      </div>
    </div>
  );
}
