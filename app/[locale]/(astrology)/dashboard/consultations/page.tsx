import { Metadata } from "next";
import Link from "next/link";
import { Calendar, Clock, Video, MessageCircle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "My Consultations | Jyotishya Dashboard",
};

export default function MyConsultationsPage(): React.ReactElement {
  // TODO: Fetch user's consultations from database
  const consultations: Array<{
    id: string;
    astrologerName: string;
    specialty: string;
    date: string;
    time: string;
    duration: string;
    status: "upcoming" | "completed" | "cancelled";
    type: "video" | "chat";
  }> = [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Consultations</h1>
          <p className="mt-1 text-slate-400">
            Track your past and upcoming astrology sessions
          </p>
        </div>
        <Link
          href="/consultations"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Book New Consultation
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Consultations List */}
      {consultations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <div className="mb-4 rounded-full bg-orange-500/10 p-4">
            <MessageCircle className="h-8 w-8 text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            No consultations yet
          </h2>
          <p className="text-slate-400 mb-6 max-w-sm">
            Book your first consultation with a verified astrologer to get
            personalized guidance.
          </p>
          <Link
            href="/consultations"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
          >
            Browse Astrologers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Upcoming Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Upcoming</h2>
            <div className="space-y-3">
              {consultations
                .filter((c) => c.status === "upcoming")
                .map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20">
                        {consultation.type === "video" ? (
                          <Video className="h-5 w-5 text-orange-400" />
                        ) : (
                          <MessageCircle className="h-5 w-5 text-orange-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {consultation.astrologerName}
                        </p>
                        <p className="text-sm text-slate-400">
                          {consultation.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {consultation.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {consultation.time} ({consultation.duration})
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Past Section */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Past</h2>
            <div className="space-y-3">
              {consultations
                .filter((c) => c.status === "completed")
                .map((consultation) => (
                  <div
                    key={consultation.id}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 opacity-70"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700/50">
                        {consultation.type === "video" ? (
                          <Video className="h-5 w-5 text-slate-400" />
                        ) : (
                          <MessageCircle className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {consultation.astrologerName}
                        </p>
                        <p className="text-sm text-slate-400">
                          {consultation.specialty}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-slate-400">
                      {consultation.date}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
