
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export const metadata = {
  title: "Reports Center | Jyotishya",
  description: "Download professional astrology reports",
};

export default async function ReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/reports");
  }

  return (
    <PageContainer size="xl">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">📄 Reports Center</h1>
        <p className="text-lg text-slate-300">
          Generate and download detailed insights about your life path, relationships, and future trends.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Birth Chart Report */}
        <ReportCard
          title="Janma Kundli"
          description="A complete analysis of your birth chart, planetary positions, and personality traits."
          href="/dashboard/birth-chart"
          icon="🕉️"
          color="orange"
          buttonText="Generate Kundli"
        />

        {/* Transits Report */}
        <ReportCard
          title="Transit Predictions"
          description="Understand how current planetary movements (Gochar) affect your life right now."
          href="/dashboard/transits"
          icon="🪐"
          color="blue"
          buttonText="Check Transits"
        />

        {/* Matchmaking Report */}
        <ReportCard
          title="Compatibility Match"
          description="Detailed Gun-Milan analysis for marriage and relationships."
          href="/matching"
          icon="❤️"
          color="pink"
          buttonText="Check Compatibility"
        />
      </div>

      <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
         <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl">💡</span>
            <h3 className="text-xl font-semibold text-white">Why Download Reports?</h3>
         </div>
         <p className="text-slate-400 leading-relaxed mb-4">
            Our premium PDF reports are designed to be printed or shared with your family astrologer. 
            They include calculation details that professionals need for deeper analysis.
         </p>
         <p className="text-sm text-slate-500">
            * All reports are generated instantly and available for free during the beta period.
         </p>
      </div>
    </PageContainer>
  );
}

function ReportCard({
  title,
  description,
  href,
  icon,
  color,
  buttonText,
}: {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: "orange" | "blue" | "pink";
  buttonText: string;
}) {
  const gradients = {
    orange: "from-orange-500 to-amber-500",
    blue: "from-blue-500 to-indigo-500",
    pink: "from-pink-500 to-rose-500",
  };

  const bgs = {
    orange: "bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40",
    blue: "bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40",
    pink: "bg-pink-500/10 border-pink-500/20 hover:border-pink-500/40",
  };

  return (
    <div className={`flex flex-col rounded-2xl border p-6 transition-all hover:bg-white/5 ${bgs[color]}`}>
      <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br text-3xl shadow-lg ${gradients[color]}`}>
        {icon}
      </div>
      
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="mb-8 text-sm leading-relaxed text-slate-300 flex-grow">
        {description}
      </p>

      <Link 
         href={href}
         className={`mt-auto inline-flex items-center justify-center rounded-lg px-4 py-3 text-sm font-semibold text-white transition-transform active:scale-[0.98] bg-gradient-to-r ${gradients[color]}`}
      >
         {buttonText} →
      </Link>
    </div>
  );
}
