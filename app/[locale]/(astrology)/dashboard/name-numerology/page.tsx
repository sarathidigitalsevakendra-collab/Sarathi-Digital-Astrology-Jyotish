import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import NameNumerologyClient from "./NameNumerologyClient";

export const metadata = {
  title: "Name Numerology Report | Jyotishya",
  description: "Analyse your name with Pythagorean numerology — Destiny, Soul Urge, Personality numbers and compatibility.",
};

export default async function NameNumerologyPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/name-numerology");
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">📝</span>
          <h1 className="text-4xl font-bold text-white">Name Numerology Report</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Classical Pythagorean numerology reveals the hidden energy in your name —
          your Destiny, inner Soul Urge, outer Personality, and how your name aligns with your life path.
        </p>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🔢", label: "Destiny Number", sub: "All letters" },
            { icon: "💜", label: "Soul Urge",      sub: "Vowels only" },
            { icon: "🔵", label: "Personality",    sub: "Consonants" },
            { icon: "🔗", label: "Compatibility",  sub: "Name vs Life Path" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
              <div className="text-2xl mb-1">{c.icon}</div>
              <p className="text-white text-xs font-semibold">{c.label}</p>
              <p className="text-slate-500 text-xs">{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <NameNumerologyClient />

      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Uses the standard Pythagorean letter-value mapping (A=1, B=2 … Z=8/9).
        Only English alphabets are counted. Numbers are reduced to single digits (1–9).
      </div>
    </div>
  );
}
