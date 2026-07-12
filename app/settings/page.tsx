import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import SettingsForm from "@/components/settings/settings-form";

export default async function SettingsPage() {
  // Server-side authentication check
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/signin?callbackUrl=/settings");
  }

  // Fetch user data from database
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: user.email || undefined }, { phone: user.phone || undefined }],
    },
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      image: true,
      locale: true,
      birthDate: true,
      birthTime: true,
      birthPlace: true,
      birthLatitude: true,
      birthLongitude: true,
      birthTimezone: true,
      preferredSystem: true,
      sunSign: true,
      moonSign: true,
      risingSign: true,
      onboardingCompleted: true,
    },
  });

  if (!dbUser) {
    // If user doesn't exist in DB, redirect to onboarding
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-12 lg:px-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="mt-2 text-slate-300">Manage your account and preferences</p>
      </div>

      {/* Settings Form */}
      <SettingsForm user={dbUser} supabaseUser={user} />
    </div>
  );
}
