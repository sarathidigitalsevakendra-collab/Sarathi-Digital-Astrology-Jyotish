import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@digital-astrology/ui";

export const metadata: Metadata = {
  title: "Consultation Details | Jyotishya",
};

interface ConsultationDetailsPageProps {
  params: {
    id: string;
  };
}

export default async function ConsultationDetailsPage({ params }: ConsultationDetailsPageProps) {
  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return (
      <main className="px-6 pb-24 pt-16 lg:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
          <p className="text-slate-300 mb-6">Please sign in to view consultation details.</p>
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </main>
    );
  }

  // Find user in database
  const dbUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: user.email || undefined }, { phone: user.phone || undefined }],
    },
  });

  if (!dbUser) {
    notFound();
  }

  // Fetch consultation details
  const consultation = await prisma.consultation.findFirst({
    where: {
      id: params.id,
      userId: dbUser.id,
    },
    include: {
      astrologer: {
        select: {
          id: true,
          name: true,
          imageUrl: true,
          specialization: true,
          languages: true,
          rating: true,
          experience: true,
        },
      },
    },
  });

  if (!consultation) {
    notFound();
  }

  // Format date and time
  const consultationDate = new Date(consultation.scheduledAt);
  const formattedDate = consultationDate.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = consultationDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Status color mapping
  const statusColors = {
    SCHEDULED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    IN_PROGRESS: "bg-green-500/10 text-green-400 border-green-500/20",
    COMPLETED: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
    NO_SHOW: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };

  const paymentStatusColors = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    PAID: "bg-green-500/10 text-green-400 border-green-500/20",
    FAILED: "bg-red-500/10 text-red-400 border-red-500/20",
    REFUNDED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };

  return (
    <main className="px-6 pb-24 pt-16 lg:px-16">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/consultations"
            className="text-slate-400 hover:text-white mb-4 inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Consultations
          </Link>
          <h1 className="text-3xl font-bold text-white mt-4">Consultation Details</h1>
        </div>

        {/* Success Banner for Paid */}
        {consultation.paymentStatus === "PAID" && consultation.status === "SCHEDULED" && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">✅</div>
              <div>
                <h2 className="text-xl font-semibold text-white">Booking Confirmed!</h2>
                <p className="text-slate-300 mt-1">
                  Your payment has been received. A confirmation email has been sent with meeting
                  details.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
          {/* Astrologer Info */}
          <div className="flex items-start gap-4 pb-6 border-b border-white/10">
            <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-white/10 flex-shrink-0">
              <Image
                src={consultation.astrologer.imageUrl}
                alt={consultation.astrologer.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-grow">
              <h2 className="text-2xl font-semibold text-white">{consultation.astrologer.name}</h2>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-300">
                <span>⭐ {consultation.astrologer.rating.toFixed(1)}</span>
                <span>•</span>
                <span>{consultation.astrologer.experience} years experience</span>
              </div>
              <div className="mt-2 text-sm text-slate-400">
                <p>Specialties: {consultation.astrologer.specialization.join(", ")}</p>
                <p>Languages: {consultation.astrologer.languages.join(", ")}</p>
              </div>
            </div>
          </div>

          {/* Consultation Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Date & Time</h3>
              <p className="text-white font-medium">{formattedDate}</p>
              <p className="text-slate-300">{formattedTime}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Duration</h3>
              <p className="text-white font-medium">{consultation.duration} minutes</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Amount Paid</h3>
              <p className="text-white font-medium text-2xl">₹{consultation.amount}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">Consultation ID</h3>
              <p className="text-slate-300 font-mono text-sm">{consultation.id}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10">
            <div
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${statusColors[consultation.status]}`}
            >
              Status: {consultation.status.replace("_", " ")}
            </div>
            <div
              className={`px-4 py-2 rounded-lg border text-sm font-medium ${paymentStatusColors[consultation.paymentStatus]}`}
            >
              Payment: {consultation.paymentStatus}
            </div>
          </div>

          {/* Payment ID */}
          {consultation.paymentId && (
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Payment Order ID</h3>
              <p className="text-slate-300 font-mono text-sm">{consultation.paymentId}</p>
            </div>
          )}

          {/* Notes */}
          {consultation.notes && (
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Notes</h3>
              <p className="text-slate-300">{consultation.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {consultation.status === "SCHEDULED" && consultation.paymentStatus === "PAID" && (
            <>
              <Button variant="secondary" disabled>
                Join Meeting (Link will be sent via email)
              </Button>
              <Button variant="secondary" disabled>
                Cancel Booking
              </Button>
            </>
          )}
          {consultation.status === "COMPLETED" && (
            <Button variant="secondary" disabled>
              Leave Review (Coming Soon)
            </Button>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
          <p className="font-medium text-white mb-2">Need help?</p>
          <p>
            For any issues with your consultation, please contact support with your Consultation ID.
          </p>
        </div>
      </div>
    </main>
  );
}
