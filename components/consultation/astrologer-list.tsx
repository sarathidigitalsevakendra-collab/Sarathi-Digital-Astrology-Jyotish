"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Button, Card } from "@digital-astrology/ui";
import BookingModal from "./booking-modal";
import { AstrologerCardSkeleton } from "@/components/ui/skeleton";

interface Astrologer {
  id: string;
  name: string;
  specialization: string[];
  languages: string[];
  experience: number;
  rating: number;
  totalReviews: number;
  hourlyRate: number;
  imageUrl: string;
  bio: string;
  verified: boolean;
  available: boolean;
}

interface AstrologerListProps {
  initialAstrologers?: Astrologer[];
}

export default function AstrologerList({ initialAstrologers = [] }: AstrologerListProps) {
  const [astrologers, setAstrologers] = useState<Astrologer[]>(initialAstrologers);
  const [loading, setLoading] = useState(!initialAstrologers.length);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "available">("all");
  const [selectedAstrologer, setSelectedAstrologer] = useState<Astrologer | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [successConsultationId, setSuccessConsultationId] = useState<string | null>(null);

  useEffect(() => {
    // Only fetch if we don't have initial data
    if (!initialAstrologers.length) {
      const abortController = new AbortController();
      fetchAstrologers(abortController.signal);

      // Cleanup: abort fetch on unmount
      return () => {
        abortController.abort();
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const fetchAstrologers = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors

      const response = await fetch("/api/astrologers", {
        signal, // Pass abort signal to fetch
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch astrologers: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setAstrologers(data.astrologers || []);
      setError(""); // Clear error on success
    } catch (err) {
      // Don't set error if request was aborted (component unmounted)
      if (err instanceof Error && err.name === "AbortError") {
        console.error("Fetch aborted - component unmounted");
        return;
      }

      console.error("Error fetching astrologers:", err);

      // Provide more specific error messages
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Cannot connect to server. Please ensure the development server is running.");
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load astrologers. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredAstrologers =
    filter === "available" ? astrologers.filter((a) => a.available) : astrologers;

  const handleBookingSuccess = (consultationId: string) => {
    setSelectedAstrologer(null);
    setSuccessConsultationId(consultationId);
    setBookingSuccess(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton filters */}
        <div className="flex gap-4 mb-6">
          <div className="h-10 w-32 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-10 w-36 rounded-lg bg-white/10 animate-pulse" />
        </div>
        {/* Skeleton grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <AstrologerCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">{error}</p>
        <Button onClick={() => fetchAstrologers()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (astrologers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔮</div>
        <h3 className="text-xl font-semibold text-white mb-2">No Astrologers Available</h3>
        <p className="text-slate-300">Check back soon for expert consultations.</p>
      </div>
    );
  }

  return (
    <>
      {/* Success Message */}
      {bookingSuccess && (
        <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-xl font-semibold text-white mb-2">Booking Confirmed!</h3>
          <p className="text-slate-300 mb-4">
            Your consultation has been successfully booked and payment confirmed.
          </p>
          {successConsultationId && (
            <Button
              onClick={() => (window.location.href = `/consultations/${successConsultationId}`)}
            >
              View Details
            </Button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={filter === "all" ? "primary" : "secondary"}
          onClick={() => setFilter("all")}
        >
          All Experts ({astrologers.length})
        </Button>
        <Button
          variant={filter === "available" ? "primary" : "secondary"}
          onClick={() => setFilter("available")}
        >
          Available Now ({astrologers.filter((a) => a.available).length})
        </Button>
      </div>

      {/* Astrologers Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredAstrologers.map((astrologer) => (
          <Card
            key={astrologer.id}
            title={`${astrologer.name}${astrologer.verified ? " ✓" : ""}`}
            subtitle={`${astrologer.experience} years • ₹${astrologer.hourlyRate}/hour`}
          >
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10 flex-shrink-0">
                <Image
                  src={astrologer.imageUrl}
                  alt={astrologer.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-2 text-xs text-orange-200 flex-grow">
                <div className="flex flex-wrap gap-3">
                  <span>⭐ {astrologer.rating.toFixed(1)}</span>
                  <span className="flex items-center">
                    {astrologer.available ? (
                       <span className="inline-flex items-center gap-1 rounded bg-green-500/10 px-2 py-0.5 text-xs text-green-400 border border-green-500/20">
                         ⏱️ 8 min wait
                       </span>
                    ) : (
                       <span className="text-red-400 ml-1">Busy</span>
                    )}
                  </span>
                  {astrologer.totalReviews > 0 && <span>{astrologer.totalReviews} reviews</span>}
                </div>
                <p className="text-[13px] text-slate-200">
                  Specialties: {astrologer.specialization.slice(0, 3).join(", ")}
                  {astrologer.specialization.length > 3 &&
                    ` +${astrologer.specialization.length - 3} more`}
                </p>
                <p className="text-[13px] text-slate-300">
                  Languages: {astrologer.languages.join(", ")}
                </p>
              </div>
            </div>

            {/* Bio preview */}
            {astrologer.bio && (
              <p className="mt-3 text-sm text-slate-300 line-clamp-2">{astrologer.bio}</p>
            )}

            {/* Actions */}
            <div className="mt-4 flex gap-3">
              <Button
                size="sm"
                onClick={() => setSelectedAstrologer(astrologer)}
                disabled={!astrologer.available}
              >
                Book Consultation
              </Button>
              <Button size="sm" variant="secondary" disabled>
                Chat (Coming Soon)
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredAstrologers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-300">No astrologers match your filter.</p>
        </div>
      )}

      {/* Booking Modal */}
      {selectedAstrologer && (
        <BookingModal
          astrologer={selectedAstrologer}
          onClose={() => setSelectedAstrologer(null)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </>
  );
}
