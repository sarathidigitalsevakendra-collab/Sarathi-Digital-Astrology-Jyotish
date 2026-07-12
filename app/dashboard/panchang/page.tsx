import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PanchangDashboard from "./PanchangDashboard";

export const metadata = {
  title: "Daily Panchang | Jyotishya",
  description: "View today's Tithi, Nakshatra, Yoga, Karana, and auspicious timings",
};

export default async function PanchangPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/panchang");
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 py-12 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-white">🗓️ Daily Panchang</h1>
        <p className="text-slate-300">
          Today's Tithi, Nakshatra, Yoga & Karana with auspicious timings
        </p>
      </div>

      {/* Main Content */}
      <PanchangDashboard />
    </div>
  );
}
