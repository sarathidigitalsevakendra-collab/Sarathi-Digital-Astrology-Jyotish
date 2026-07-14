import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BusinessNameClient from "./BusinessNameClient";

export const metadata = {
  title: "Business Name Numerology | Jyotishya",
  description: "Check which of your proposed business names has the highest numerological compatibility with your life path.",
};

export default async function BusinessNamePage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/auth/signin?callbackUrl=/dashboard/business-name");

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10 lg:px-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">🏢</span>
          <h1 className="text-4xl font-bold text-white">Business Name Numerology</h1>
        </div>
        <p className="text-slate-400 ml-14">
          Find which of your proposed business names resonates best with your personal life path number.
          Enter up to 5 options — we'll rank them by numerological compatibility.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {["🔢 Destiny Number for each name", "🤝 Compatibility with owner", "📊 0-100 compatibility score", "⭐ Top pick highlighted"].map(f => (
            <span key={f} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">{f}</span>
          ))}
        </div>
      </div>
      <BusinessNameClient />
      <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Note:</strong> Only the English letters in each name count. Spaces, &amp;, and special characters are ignored.
        Numerology should be one factor among many in naming your business.
      </div>
    </div>
  );
}
