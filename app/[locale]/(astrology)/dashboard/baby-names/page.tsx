import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BabyNamesClient from "./BabyNamesClient";

export const metadata = {
  title: "Baby Name Suggestions | Jyotishya",
  description: "Classical Vedic baby name suggestions based on the Moon nakshatra at birth with numerology compatibility.",
};

export default async function BabyNamesPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/baby-names");

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">👶</span>
          <h1 className="text-4xl font-bold text-white">Baby Name Suggestions</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Classical Vedic tradition: name your baby using the auspicious syllables (aksharas) of their Moon nakshatra.
          Optionally filter by gender and numerology compatibility with a parent's life path.
        </p>
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🌙", label: "Moon Nakshatra", sub: "All 27 nakshatras" },
            { icon: "✨", label: "4 Pada Syllables", sub: "Auspicious aksharas" },
            { icon: "👧👦", label: "Gender Filter", sub: "Boy / Girl / Any" },
            { icon: "🔗", label: "Parent Compat.", sub: "Life path scoring" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-white text-xs font-semibold">{c.label}</p>
              <p className="text-slate-500 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <BabyNamesClient />

      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Tip:</strong> Open the Kundli Generator, enter the baby's birth details, and look for the Moon's sidereal longitude
        (e.g., "Moon 145.3°") on the planets table. Enter that number here.
      </div>
    </div>
  );
}
