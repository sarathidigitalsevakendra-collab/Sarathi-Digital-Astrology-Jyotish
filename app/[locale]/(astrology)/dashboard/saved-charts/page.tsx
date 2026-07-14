import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import KundlisGrid from "@components/kundli/kundlis-grid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Charts | Digital Astrology",
  description: "View and manage your saved birth charts",
};

export default async function SavedChartsPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/dashboard/saved-charts");
  }

  // Fetch user's kundlis from database
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: user.email || undefined }, { phone: user.phone || undefined }],
    },
    include: {
      kundlis: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!dbUser) {
    redirect("/onboarding");
  }

  // Transform kundlis to match the expected type
  const kundlis = dbUser.kundlis.map((k) => ({
    ...k,
    chartData: (k.chartData || {}) as Record<string, unknown>,
  }));

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-6 py-12 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Saved Charts</h1>
        <p className="mt-2 text-slate-300">View and manage your saved birth charts</p>
      </div>

      {/* Create New Kundli Button */}
      <div className="mb-8">
        <Link
          href="/dashboard/birth-chart"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Kundli
        </Link>
      </div>

      {/* Kundlis List */}
      {kundlis.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
            <svg
              className="h-8 w-8 text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-white">No Charts Yet</h3>
          <p className="mb-6 text-slate-400">
            Create your first birth chart to get personalized astrological insights
          </p>
          <Link
            href="/dashboard/birth-chart"
            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-6 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <KundlisGrid initialKundlis={kundlis} />
      )}
    </div>
  );
}
