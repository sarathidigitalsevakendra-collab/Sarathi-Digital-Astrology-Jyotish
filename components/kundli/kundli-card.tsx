"use client";

import { useState } from "react";
import Link from "next/link";
import { generateShareLink, copyToClipboard } from "@/lib/utils/chart-download";
import { trackChartDeleted, trackChartShared } from "@/lib/analytics/events";

interface Kundli {
  id: string;
  name: string;
  birthDate: Date;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
  chartData: Record<string, unknown>;
  isPublic: boolean;
  isFavorite: boolean; 
  createdAt: Date;
  updatedAt: Date;
}

interface KundliCardProps {
  kundli: Kundli;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function KundliCard({ kundli, onDelete, onRename, onToggleFavorite }: KundliCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(kundli.name);

  const chartData = kundli.chartData;
  const dataObj = chartData?.data as Record<string, unknown> | undefined;
  const outputArray = chartData?.output as
    | Array<Record<string, Record<string, unknown>>>
    | undefined;
  const hasAscendant =
    (dataObj?.ascendant as number | undefined) ||
    (outputArray?.[0]?.["0"]?.ascendant as number | undefined);

  const handleDelete = async () => {
    if (
      !confirm(`Are you sure you want to delete "${kundli.name}"? This action cannot be undone.`)
    ) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/user/kundli?id=${kundli.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete chart");
      }

      // Track analytics
      trackChartDeleted({ chartId: kundli.id });

      onDelete(kundli.id);
    } catch (error: unknown) {
      console.error("Failed to delete chart:", error);
      alert("Failed to delete chart. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      // Generate share link using birth data
      const shareLink = generateShareLink({
        dateTime: new Date(kundli.birthDate).toISOString().split(".")[0] ?? "",
        latitude: kundli.latitude,
        longitude: kundli.longitude,
        timezone: parseFloat(kundli.timezone),
        location: kundli.birthPlace,
      });

      await copyToClipboard(shareLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);

      // Track analytics
      trackChartShared({ method: "link" });
    } catch (error: unknown) {
      console.error("Failed to copy link:", error);
      alert("Failed to copy share link. Please try again.");
    }
  };

  const saveRename = () => {
    if (editName.trim() && editName !== kundli.name) {
        onRename(kundli.id, editName);
    }
    setIsEditing(false);
  };

  return (
    <div className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10">
      
      {/* Favorite Button (Absolute Top Right) */}
      <button 
        onClick={() => onToggleFavorite(kundli.id)}
        className="absolute top-4 right-4 text-slate-400 hover:text-pink-500 transition"
        title={kundli.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
      >
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={kundli.isFavorite ? "currentColor" : "none"} 
            stroke="currentColor" 
            className={`w-6 h-6 ${kundli.isFavorite ? "text-pink-500" : ""}`}
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Kundli Header */}
      <div className="mb-4 flex items-start justify-between pr-8">
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 mb-1">
                <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-black/20 border border-white/20 rounded px-2 py-1 text-white text-sm w-full"
                    autoFocus
                    onBlur={saveRename}
                    onKeyDown={(e) => e.key === 'Enter' && saveRename()}
                />
            </div>
          ) : (
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-white truncate max-w-[180px]" title={kundli.name}>
                    {kundli.name}
                </h3>
                <button 
                    onClick={() => setIsEditing(true)}
                    className="text-slate-500 hover:text-white transition opacity-0 group-hover:opacity-100"
                    title="Rename"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                    </svg>
                </button>
            </div>
          )}
          
          <p className="text-sm text-slate-400">
            {new Date(kundli.birthDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Birth Details */}
      <div className="mb-4 space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{kundli.birthTime}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="truncate">{kundli.birthPlace}</span>
        </div>
      </div>

      {/* Chart Summary */}
      {hasAscendant && (
        <div className="mb-4 rounded-lg border border-orange-500/20 bg-orange-500/10 p-3 text-xs">
          <span className="font-medium text-orange-300">Ascendant:</span>{" "}
          <span className="text-white">{Math.floor(hasAscendant)}°</span>
        </div>
      )}

      {/* Primary Action */}
      <Link
        href={`/dashboard/saved-charts/${kundli.id}`}
        className="mb-3 block rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-4 py-2 text-center text-sm font-medium text-white transition hover:opacity-90"
      >
        View Full Chart
      </Link>

      {/* Secondary Actions */}
      <div className="flex gap-2">
        <button
          onClick={handleShare}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10"
          title="Share Chart"
        >
          {copiedLink ? (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Share
            </>
          )}
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
          title="Delete Chart"
        >
          {deleting ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Created Date */}
      <p className="mt-3 text-xs text-slate-500">
        Created{" "}
        {new Date(kundli.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>
  );
}
