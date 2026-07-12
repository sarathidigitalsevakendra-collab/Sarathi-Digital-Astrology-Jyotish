import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CareerReportClient from "./CareerReportClient";

export const metadata = {
  title: "Career & Finance Report | Jyotishya",
  description: "AI-powered Vedic astrology career and finance prediction report based on your birth chart.",
};

export default async function CareerReportPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/career-report");
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-10 lg:px-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">💼</span>
          <h1 className="text-4xl font-bold text-white">Career & Finance Report</h1>
        </div>
        <p className="text-slate-400 ml-14">
          A comprehensive 10-section Vedic astrology analysis of your career path, wealth potential,
          current Dasha phase, and 12-month professional outlook.
        </p>

        {/* What's Inside */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { icon: "🏢", label: "Career Field Match" },
            { icon: "💰", label: "Wealth & Dhana Yogas" },
            { icon: "⚡", label: "Business vs Service" },
            { icon: "📅", label: "12-Month Outlook" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-slate-300 text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <CareerReportClient userId={user.id} userEmail={user.email ?? ""} />

      {/* Disclaimer */}
      <div className="mt-12 rounded-xl border border-slate-700 bg-slate-800/30 p-4 text-xs text-slate-500">
        <strong className="text-slate-400">Disclaimer:</strong> This report is based on classical Vedic astrology
        principles and is intended for guidance only. Career decisions should incorporate professional advice,
        personal research, and due diligence.
      </div>
    </div>
  );
}
