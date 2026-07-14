"use client";

import { useState } from "react";
import { exportAIReportAsPdf } from "@/lib/pdf";
import type {
  VastuReport,
  FacingDirection,
  RoomType,
  ZoneQuality,
} from "@/lib/astrology/calculations/Vastu";

// ─── Config ───────────────────────────────────────────────────────────────────

const DIRECTIONS: { dir: FacingDirection; label: string; angle: string }[] = [
  { dir: "N",  label: "N",  angle: "0deg" },
  { dir: "NE", label: "NE", angle: "45deg" },
  { dir: "E",  label: "E",  angle: "90deg" },
  { dir: "SE", label: "SE", angle: "135deg" },
  { dir: "S",  label: "S",  angle: "180deg" },
  { dir: "SW", label: "SW", angle: "225deg" },
  { dir: "W",  label: "W",  angle: "270deg" },
  { dir: "NW", label: "NW", angle: "315deg" },
];

const QUALITY_CONFIG: Record<ZoneQuality, { bg: string; border: string; text: string; dot: string; badge: string }> = {
  Excellent:     { bg: "bg-emerald-500/15", border: "border-emerald-500/30", text: "text-emerald-300", dot: "bg-emerald-400", badge: "bg-emerald-500/20" },
  Good:          { bg: "bg-green-500/15",   border: "border-green-500/30",   text: "text-green-300",   dot: "bg-green-400",   badge: "bg-green-500/20" },
  Average:       { bg: "bg-yellow-500/15",  border: "border-yellow-500/30",  text: "text-yellow-300",  dot: "bg-yellow-400",  badge: "bg-yellow-500/20" },
  Inauspicious:  { bg: "bg-red-500/15",     border: "border-red-500/30",     text: "text-red-300",     dot: "bg-red-400",     badge: "bg-red-500/20" },
};

const ROOM_OPTIONS: { value: RoomType; label: string; emoji: string }[] = [
  { value: "MasterBedroom", label: "Master Bedroom",  emoji: "🛏️" },
  { value: "KidsBedroom",   label: "Kids' Bedroom",   emoji: "🧸" },
  { value: "GuestBedroom",  label: "Guest Bedroom",   emoji: "🛋️" },
  { value: "LivingRoom",    label: "Living Room",      emoji: "🛎️" },
  { value: "DiningRoom",    label: "Dining Room",      emoji: "🍽️" },
  { value: "Kitchen",       label: "Kitchen",          emoji: "🍳" },
  { value: "Bathroom",      label: "Bathroom",         emoji: "🚿" },
  { value: "Toilet",        label: "Toilet",           emoji: "🚽" },
  { value: "Pooja",         label: "Pooja Room",       emoji: "🪔" },
  { value: "Study",         label: "Study",            emoji: "📚" },
  { value: "Office",        label: "Home Office",      emoji: "💼" },
  { value: "StoreRoom",     label: "Store Room",       emoji: "📦" },
  { value: "Garage",        label: "Garage",           emoji: "🚗" },
];

const ZODIACS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];

// ─── Score Ring ───────────────────────────────────────────────────────────────

function ScoreRing({ score, quality }: { score: number; quality: string }) {
  const colour = score >= 80 ? "#10b981" : score >= 60 ? "#22c55e" : score >= 40 ? "#eab308" : "#ef4444";
  const r = 36, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <svg width="90" height="90" className="-rotate-90">
        <circle cx="45" cy="45" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle cx="45" cy="45" r={r} fill="none" stroke={colour} strokeWidth="7"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="-mt-16 flex flex-col items-center">
        <span className="text-2xl font-black text-white">{score}</span>
        <span className="text-xs text-slate-400">/100</span>
      </div>
      <span className="mt-10 text-xs font-semibold" style={{ color: colour }}>{quality}</span>
    </div>
  );
}

// ─── Compass UI ───────────────────────────────────────────────────────────────

function CompassSelector({
  selected,
  onSelect,
}: { selected: FacingDirection; onSelect: (d: FacingDirection) => void }) {
  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Center label */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs text-slate-500 text-center leading-tight">Main<br/>Door<br/>Faces</span>
      </div>
      {DIRECTIONS.map(({ dir, label, angle }) => {
        const rad = (parseFloat(angle) - 90) * (Math.PI / 180);
        const r = 76;
        const x = 96 + r * Math.cos(rad);
        const y = 96 + r * Math.sin(rad);
        const isSelected = selected === dir;
        return (
          <button
            key={dir}
            onClick={() => onSelect(dir)}
            style={{ left: x - 18, top: y - 18, position: "absolute" }}
            className={`w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all border ${
              isSelected
                ? "bg-amber-500 border-amber-400 text-black scale-110 shadow-lg shadow-amber-500/40"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Room Placement Builder ───────────────────────────────────────────────────

function RoomPlacementForm({
  placements,
  onChange,
}: {
  placements: Partial<Record<FacingDirection, RoomType[]>>;
  onChange: (p: Partial<Record<FacingDirection, RoomType[]>>) => void;
}) {
  const [selectedDir, setSelectedDir] = useState<FacingDirection>("N");
  const currentRooms = placements[selectedDir] ?? [];

  const toggleRoom = (room: RoomType) => {
    const next = currentRooms.includes(room)
      ? currentRooms.filter(r => r !== room)
      : [...currentRooms, room];
    onChange({ ...placements, [selectedDir]: next });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Select a zone, then tick which rooms you have placed there. Leave zones empty if none applies.
        (Optional — skip for a general facing-direction analysis.)
      </p>

      <div className="flex flex-wrap gap-2">
        {DIRECTIONS.map(d => (
          <button
            key={d.dir}
            onClick={() => setSelectedDir(d.dir)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              selectedDir === d.dir
                ? "bg-purple-500 border-purple-400 text-white"
                : "bg-slate-800 border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {d.dir} zone {(placements[d.dir]?.length ?? 0) > 0 && (
              <span className="ml-1 text-purple-300">({placements[d.dir]?.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Rooms in {selectedDir} zone</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ROOM_OPTIONS.map(ro => (
            <label key={ro.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-sm ${
              currentRooms.includes(ro.value)
                ? "bg-purple-500/20 border-purple-500/40 text-white"
                : "bg-slate-800/50 border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}>
              <input
                type="checkbox"
                className="hidden"
                checked={currentRooms.includes(ro.value)}
                onChange={() => toggleRoom(ro.value)}
              />
              <span>{ro.emoji}</span>
              <span>{ro.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Report Display ───────────────────────────────────────────────────────────

function ZoneCard({ analysis }: { analysis: VastuReport["zoneAnalyses"][0] }) {
  const [open, setOpen] = useState(false);
  const q = QUALITY_CONFIG[analysis.quality];

  return (
    <div className={`rounded-2xl border transition-all ${q.border} ${q.bg}`}>
      <button onClick={() => setOpen(v => !v)} className="w-full text-left p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-white w-10">{analysis.direction}</span>
            <div>
              <p className="text-white font-semibold text-sm">{analysis.zone.element} {analysis.zone.elementEmoji}</p>
              <p className="text-slate-400 text-xs">{analysis.zone.deity}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {analysis.userRooms.length > 0 && (
              <span className="text-xs text-slate-400">{analysis.userRooms.length} room(s)</span>
            )}
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${q.badge} ${q.border} ${q.text}`}>
              {analysis.quality}
            </span>
            <span className="text-slate-400">{open ? "▲" : "▼"}</span>
          </div>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
          <p className="text-sm text-slate-300">{analysis.zone.significance}</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-slate-500 mb-1">Ideal Colours</p>
              <div className="flex flex-wrap gap-1">
                {analysis.zone.idealColours.map(c => (
                  <span key={c} className="text-xs px-2 py-0.5 bg-white/10 rounded text-slate-300">{c}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Avoid Colours</p>
              <div className="flex flex-wrap gap-1">
                {analysis.zone.avoidColours.map(c => (
                  <span key={c} className="text-xs px-2 py-0.5 bg-red-500/10 rounded text-red-300">{c}</span>
                ))}
              </div>
            </div>
          </div>

          {analysis.issues.length > 0 && (
            <div>
              <p className="text-xs text-red-400 font-semibold mb-1">⚠️ Issues</p>
              {analysis.issues.map((i, idx) => <p key={idx} className="text-xs text-red-200">• {i}</p>)}
            </div>
          )}

          {analysis.recommendations.length > 0 && (
            <div>
              <p className="text-xs text-emerald-400 font-semibold mb-1">✅ Recommendations</p>
              {analysis.recommendations.map((r, idx) => <p key={idx} className="text-xs text-slate-200">• {r}</p>)}
            </div>
          )}

          <div>
            <p className="text-xs text-amber-400 font-semibold mb-1">💎 Strengthen With</p>
            <p className="text-xs text-slate-300">{analysis.zone.strengthenWith.join(" · ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportDisplay({ report, onDownload, downloading }: {
  report: VastuReport;
  onDownload: () => void;
  downloading: boolean;
}) {
  const [activeTab, setActiveTab] = useState<"zones" | "rooms" | "remedies">("zones");
  const entCfg = QUALITY_CONFIG[report.entranceQuality.quality];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-900/20 to-orange-900/10 p-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ScoreRing score={report.overallScore} quality={report.overallVerdict.split("!")[0] ?? "Good"} />
          <div className="flex-1">
            <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">🧭 {report.facingDirection}-Facing House</p>
            <h2 className="text-xl font-bold text-white mb-2">{report.overallVerdict}</h2>
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold mb-3 ${entCfg.bg} ${entCfg.border} ${entCfg.text}`}>
              <span className={`w-2 h-2 rounded-full ${entCfg.dot}`} />
              Entrance: {report.entranceQuality.quality}
            </div>
            <p className="text-slate-300 text-sm">{report.entranceQuality.note}</p>
          </div>
          <button
            onClick={onDownload}
            disabled={downloading}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {downloading ? <><span className="animate-spin">⏳</span></> : "📥"} PDF
          </button>
        </div>

        {/* Priority remedies */}
        {report.topPriorityRemedies.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <p className="text-xs text-amber-400 font-semibold mb-2">🔧 Top Priority Actions</p>
            <ul className="space-y-1">
              {report.topPriorityRemedies.map((r, i) => (
                <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                  <span className="text-amber-400 shrink-0">{i + 1}.</span> {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Personal info */}
      {report.personalElement && (
        <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-4 text-sm">
          <p className="text-purple-400 font-semibold mb-1">✨ Personal Element: {report.personalElement}</p>
          <p className="text-slate-300">
            Energise your <strong>{report.personalBestZone}</strong> zone with <strong>{report.personalColour}</strong> décor to align your birth element with your home.
          </p>
        </div>
      )}

      {/* Facing advice */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-5">
        <h3 className="font-semibold text-white mb-3">📋 {report.facingDirection}-Facing House Guidelines</h3>
        <ul className="space-y-1.5">
          {report.facingAdvice.map((a, i) => (
            <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
              <span className="text-amber-400 shrink-0 mt-0.5">•</span> {a}
            </li>
          ))}
        </ul>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-1">
        {(["zones", "rooms", "remedies"] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors capitalize ${
              activeTab === t ? "text-white border-b-2 border-amber-400" : "text-slate-400 hover:text-white"
            }`}
          >
            {t === "zones" ? "🧭 Zone Analysis" : t === "rooms" ? "🏠 Room Guide" : "💊 Remedies"}
          </button>
        ))}
      </div>

      {activeTab === "zones" && (
        <div className="space-y-3">
          {report.zoneAnalyses.map(z => <ZoneCard key={z.direction} analysis={z} />)}
        </div>
      )}

      {activeTab === "rooms" && (
        <div className="space-y-3">
          {report.roomRecommendations.map(rec => {
            const q = rec.currentQuality ? QUALITY_CONFIG[rec.currentQuality] : null;
            return (
              <div key={rec.room} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-white">{rec.roomLabel}</p>
                  {rec.currentDirection && q && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${q.badge} ${q.border} ${q.text}`}>
                      {rec.currentDirection} — {rec.currentQuality}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-1">
                  Ideal zones: <span className="text-amber-300 font-semibold">{rec.idealDirections.join(", ")}</span>
                </p>
                <p className="text-sm text-slate-300">{rec.tip}</p>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "remedies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.zoneAnalyses
            .filter(z => z.zone.remedy.length > 0)
            .map(z => (
              <div key={z.direction} className="rounded-2xl border border-slate-700 bg-slate-800/30 p-4">
                <p className="font-semibold text-white mb-2 flex items-center gap-2">
                  <span className="text-amber-400">{z.direction}</span>
                  <span className="text-slate-400 text-sm">— {z.zone.element} {z.zone.elementEmoji}</span>
                </p>
                <ul className="space-y-1">
                  {z.zone.remedy.map((r, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-purple-400 mt-0.5">•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── Input Form ───────────────────────────────────────────────────────────────

function InputForm({ onSubmit, loading }: {
  onSubmit: (facing: FacingDirection, placements: Partial<Record<FacingDirection, RoomType[]>>, zodiac?: string) => void;
  loading: boolean;
}) {
  const [facing, setFacing] = useState<FacingDirection>("N");
  const [placements, setPlacements] = useState<Partial<Record<FacingDirection, RoomType[]>>>({});
  const [zodiac, setZodiac] = useState("");
  const [showRooms, setShowRooms] = useState(false);

  return (
    <div className="space-y-8">
      {/* Step 1 - Direction */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
        <h2 className="font-bold text-white mb-1">Step 1 — House Facing Direction</h2>
        <p className="text-slate-400 text-sm mb-5">Which direction does your main entrance / front of the house face?</p>
        <CompassSelector selected={facing} onSelect={setFacing} />
        <p className="text-center text-sm text-amber-300 mt-4 font-semibold">Selected: {facing}-Facing</p>
      </div>

      {/* Step 2 - Room placements (optional) */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-white">Step 2 — Room Placements (Optional)</h2>
            <p className="text-slate-400 text-xs mt-0.5">Adds personalised zone-by-zone scoring</p>
          </div>
          <button
            onClick={() => setShowRooms(v => !v)}
            className="text-xs px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-all"
          >
            {showRooms ? "Hide" : "Add rooms"}
          </button>
        </div>
        {showRooms && <RoomPlacementForm placements={placements} onChange={setPlacements} />}
      </div>

      {/* Step 3 - Zodiac (optional) */}
      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
        <h2 className="font-bold text-white mb-1">Step 3 — Your Zodiac Sign (Optional)</h2>
        <p className="text-slate-400 text-sm mb-3">Personalises colour and zone recommendations.</p>
        <select
          value={zodiac}
          onChange={e => setZodiac(e.target.value)}
          className="w-full rounded-xl bg-slate-800 border border-white/10 text-white px-4 py-3 text-sm focus:border-blue-500/50 focus:outline-none"
        >
          <option value="">Select zodiac sign (optional)</option>
          {ZODIACS.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      <button
        onClick={() => onSubmit(facing, placements, zodiac || undefined)}
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-base"
      >
        {loading ? "Analysing your home…" : "🏠 Generate Vastu Report"}
      </button>
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function VastuClient() {
  const [report, setReport] = useState<VastuReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const handleSubmit = async (
    facing: FacingDirection,
    placements: Partial<Record<FacingDirection, RoomType[]>>,
    zodiac?: string,
  ) => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/astrology/vastu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facingDirection: facing, roomPlacements: placements, zodiacSign: zodiac }),
      });
      if (!res.ok) throw new Error("Failed");
      setReport(await res.json() as VastuReport);
    } catch {
      setError("Failed to generate Vastu report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!report) return;
    setDownloading(true);
    try {
      const zoneLines = report.zoneAnalyses.flatMap(z => [
        ``,
        `### ${z.direction} Zone — ${z.zone.element} ${z.zone.elementEmoji} (${z.quality})`,
        `Deity: ${z.zone.deity}`,
        `Governs: ${z.zone.governs.join(", ")}`,
        `Ideal colours: ${z.zone.idealColours.join(", ")}`,
        ...(z.issues.map(i => `⚠️ ${i}`)),
        ...(z.recommendations.map(r => `✓ ${r}`)),
        `Remedy: ${z.zone.remedy.join(" | ")}`,
      ]);

      const content = [
        `# Vastu Advisory Report — ${report.facingDirection}-Facing House`,
        `**Overall Score:** ${report.overallScore}/100`,
        `**Entrance Quality:** ${report.entranceQuality.quality} — ${report.entranceQuality.note}`,
        ``,
        `## Summary`,
        report.overallVerdict,
        ``,
        `## Facing Direction Guidelines`,
        ...report.facingAdvice.map(a => `• ${a}`),
        ``,
        report.topPriorityRemedies.length > 0 ? `## Top Priority Remedies` : "",
        ...report.topPriorityRemedies.map((r, i) => `${i + 1}. ${r}`),
        ``,
        `## Zone Analysis`,
        ...zoneLines,
        ``,
        `## Room Guide`,
        ...report.roomRecommendations.map(r =>
          `**${r.roomLabel}**: Ideal in ${r.idealDirections.join("/")}. ${r.tip}`
        ),
        ``,
        report.personalElement ? `## Personal Element\nZodiac element: ${report.personalElement}. Energise your ${report.personalBestZone} zone with ${report.personalColour} décor.` : "",
      ].filter(Boolean).join("\n");

      await exportAIReportAsPdf({
        chartName: `${report.facingDirection}-Facing Vastu`,
        content,
        fileName: `Vastu_${report.facingDirection}_Facing.pdf`,
        title: "Vastu Shastra Advisory Report",
      });
    } catch {
      setError("PDF download failed.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">{error}</div>}
      {!report ? (
        <InputForm onSubmit={handleSubmit} loading={loading} />
      ) : (
        <>
          <button onClick={() => setReport(null)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            ← Analyse a different property
          </button>
          <ReportDisplay report={report} onDownload={handleDownload} downloading={downloading} />
        </>
      )}
    </div>
  );
}
