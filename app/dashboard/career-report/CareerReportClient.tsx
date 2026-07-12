"use client";

import { useMemo, useState } from "react";
import { useBirthChart } from "@/hooks/astrology/useBirthChart";
import BirthChartForm from "@/components/astrology/birth-chart/BirthChartForm";
import AIInterpretationPanel from "@/components/astrology/AIInterpretationPanel";
import { BirthChartSkeleton } from "@/components/ui/skeleton";
import { calculateFunctionalNature } from "@/lib/astrology/calculations/Dignity";
import { RASHI_LORDS } from "@/lib/astrology/calculations/VedicMath";
import { formatDistanceToNow } from "date-fns";

// ─── Career Prompt ─────────────────────────────────────────────────────────────

function buildCareerPrompt(chartName: string): string {
  return `You are an expert Vedic astrologer. Analyse the birth chart for ${chartName} and produce a comprehensive Career & Finance Report. Format your response with clear markdown headings.

## 1. Career Snapshot
Identify the 10th house lord, its sign, house placement, and strength. What primary career field does this indicate? (e.g., technology, law, finance, arts, healthcare, government)

## 2. Natural Talents & Professional Strengths
Based on the Ascendant lord, 1st house planets, and strong planets, list 4–5 key innate strengths that will drive professional success.

## 3. Ideal Career Fields
List the top 3 most suitable career sectors with brief justification based on the planetary chart.

## 4. Business vs. Service — Which Suits Better?
Analyse the 7th house (business/partnerships) vs 6th house (service/employment). Should this person be in business, service, or consulting?

## 5. Current Career Phase (Dasha Analysis)
Using the planetary positions provided, indicate what career phase the person is likely in. Is this an expansion phase, consolidation, transition, or challenge period?

## 6. Wealth & Finance Potential
Analyse the 2nd house (accumulated wealth) and 11th house (income/gains). Are there Dhana yogas (wealth combinations)? What is the overall financial trajectory?

## 7. Career Challenges to Watch
Identify 2–3 planetary combinations that may create career obstacles. Offer brief classical remedies for each.

## 8. Peak Career Windows
Based on planetary strength and house rulers, which age ranges or year types are likely peak career periods?

## 9. Key Recommendations
Provide 5 specific, actionable recommendations for maximising career and financial success.

## 10. One-Year Outlook
Describe likely career and financial developments over the next 12 months based on transiting planets and Dasha periods.

Keep the analysis classical, insightful, and actionable. Minimum 500 words.`;
}

// ─── Quick Snapshot (from chart data, no AI needed) ──────────────────────────

const SIGN_NAMES = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];

const CAREER_TRAITS: Record<string, { field: string; keyword: string; emoji: string }> = {
  Sun:     { field: "Government / Leadership / Politics", keyword: "Authority", emoji: "☀️" },
  Moon:    { field: "Healthcare / Public / FMCG", keyword: "Nurturing", emoji: "🌙" },
  Mars:    { field: "Engineering / Military / Surgery", keyword: "Action", emoji: "🔥" },
  Mercury: { field: "IT / Accounting / Communication", keyword: "Intellect", emoji: "💬" },
  Jupiter: { field: "Education / Law / Finance", keyword: "Wisdom", emoji: "🎓" },
  Venus:   { field: "Fashion / Arts / Hospitality", keyword: "Creativity", emoji: "💝" },
  Saturn:  { field: "Real Estate / Labour / Research", keyword: "Discipline", emoji: "⏱️" },
  Rahu:    { field: "Technology / Foreign / Media", keyword: "Innovation", emoji: "🌐" },
  Ketu:    { field: "Spirituality / Research / IT", keyword: "Detachment", emoji: "🔮" },
};

interface SnapshotProps {
  planets: { name: string; fullDegree: number; house?: number; isRetro?: boolean }[];
  ascendant: number;
  chartName: string;
}

function CareerSnapshot({ planets, ascendant, chartName }: SnapshotProps) {
  const ascSign = Math.floor(ascendant / 30) + 1;
  const ascLord = RASHI_LORDS[ascSign] ?? "Sun";

  // 10th house lord
  const tenthHouseSign = ((ascSign - 1 + 9) % 12) + 1; // 10th from asc
  const tenthLord = RASHI_LORDS[tenthHouseSign] ?? "Saturn";
  const tenthLordPlanet = planets.find(p => p.name === tenthLord);
  const tenthLordHouse = tenthLordPlanet
    ? Math.floor(((tenthLordPlanet.fullDegree / 30) - (ascendant / 30) + 12) % 12) + 1
    : null;

  const careerInfo = CAREER_TRAITS[tenthLord] ?? CAREER_TRAITS["Saturn"];

  // Strong planets (benefics by nature)
  const strongPlanets = planets
    .filter(p => {
      const nature = calculateFunctionalNature(p.name, ascSign);
      return nature === "Functional Benefic" || nature === "Yoga Karaka";
    })
    .slice(0, 3)
    .map(p => p.name);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 10th Lord */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <p className="text-xs text-amber-400 uppercase tracking-widest mb-1">10th House Lord</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{CAREER_TRAITS[tenthLord]?.emoji ?? "🪐"}</span>
          <h3 className="text-xl font-bold text-white">{tenthLord}</h3>
        </div>
        <p className="text-sm text-slate-300">{careerInfo?.field ?? "Career analysis pending"}</p>
        {tenthLordHouse && (
          <p className="text-xs text-slate-500 mt-2">
            Placed in House {tenthLordHouse} — {tenthLordHouse === 10 ? "Own house (very strong)" : `${tenthLordHouse}th house`}
          </p>
        )}
      </div>

      {/* Ascendant */}
      <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
        <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Ascendant</p>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🌅</span>
          <h3 className="text-xl font-bold text-white">{SIGN_NAMES[ascSign - 1]}</h3>
        </div>
        <p className="text-sm text-slate-300">
          Lord: {ascLord} — {CAREER_TRAITS[ascLord]?.keyword ?? "Leadership"}
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Core personality drives: {CAREER_TRAITS[ascLord]?.field ?? "—"}
        </p>
      </div>

      {/* Key Benefics */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <p className="text-xs text-emerald-400 uppercase tracking-widest mb-1">Your Career Allies</p>
        <p className="text-xs text-slate-500 mb-2">Functional benefics for {chartName}</p>
        {strongPlanets.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {strongPlanets.map(p => (
              <span key={p} className="text-sm px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-1">
                {CAREER_TRAITS[p]?.emoji} {p}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">Determined by ascendant analysis</p>
        )}
        <p className="text-xs text-slate-500 mt-2">Strengthen these planets for career growth</p>
      </div>
    </div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export default function CareerReportClient({ userId: _userId, userEmail: _userEmail }: { userId: string; userEmail: string }) {
  const { state, showHelp, setBirthData, setError, generateBirthChart, setAiInsights, aiInsights, clearAiInsights } = useBirthChart();

  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const careerPrompt = useMemo(
    () => buildCareerPrompt(state.birthData?.chartName || "the native"),
    [state.birthData?.chartName],
  );

  const handleSetIsLoading = (val: boolean) => {
    setAiInsights((prev: any) => ({
      completion: prev?.completion ?? "",
      isLoading: val,
      error: prev?.error ?? null,
      generatedAt: !val && (prev?.completion ?? "") ? new Date() : prev?.generatedAt,
    }));
    if (!val && aiInsights?.completion) setGeneratedAt(new Date());
  };

  if (!state.chartData) {
    if (state.loading) return <BirthChartSkeleton />;
    return (
      <BirthChartForm
        birthData={state.birthData}
        setBirthData={setBirthData}
        loading={state.loading}
        error={state.error}
        showHelp={showHelp}
        onGenerate={generateBirthChart}
        onDismissError={() => setError(null)}
      />
    );
  }

  const planets = state.chartData?.data?.planets ?? [];
  const ascendant = state.chartData?.data?.ascendant ?? 0;
  const chartName = state.birthData?.chartName || "User";
  const birthDetails = state.birthData ? {
    date: new Date(state.birthData.dateTime).toLocaleDateString("en-IN"),
    time: new Date(state.birthData.dateTime).toLocaleTimeString("en-IN"),
    location: state.birthData.location,
  } : undefined;

  return (
    <div className="space-y-8">
      {/* Quick Snapshot — no AI needed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            📊 Career Snapshot
            <span className="text-xs font-normal text-slate-400">from your chart</span>
          </h2>
          {generatedAt && (
            <span className="text-xs text-slate-500">
              Report generated {formatDistanceToNow(generatedAt, { addSuffix: true })}
            </span>
          )}
        </div>
        <CareerSnapshot planets={planets as SnapshotProps["planets"]} ascendant={ascendant} chartName={chartName} />
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* AI Deep Analysis */}
      <AIInterpretationPanel
        chartData={state.chartData!.data}
        chartName={chartName}
        birthDetails={birthDetails}
        birthDate={state.birthData?.dateTime ? new Date(state.birthData.dateTime).toISOString().split("T")[0] : undefined}
        birthTime={state.birthData?.dateTime ? new Date(state.birthData.dateTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false }) : undefined}
        completion={aiInsights?.completion ?? ""}
        setCompletion={(val) =>
          setAiInsights((prev: any) => ({ ...prev, completion: val, isLoading: prev?.isLoading ?? false, error: prev?.error ?? null }))
        }
        isLoading={aiInsights?.isLoading ?? false}
        setIsLoading={handleSetIsLoading}
        error={aiInsights?.error ?? null}
        setError={(val) =>
          setAiInsights((prev: any) => ({ ...prev, error: val }))
        }
        onClear={clearAiInsights}
        variant="report"
        title="Career & Finance Deep Analysis"
        subtitle={
          <div className="flex flex-col gap-1">
            <span>10-section AI report covering profession, wealth, Dasha phase & 12-month outlook.</span>
            {generatedAt && (
              <span className="text-xs text-slate-400">
                Last generated: {generatedAt.toLocaleTimeString()} {generatedAt.toLocaleDateString()}
              </span>
            )}
          </div>
        }
        customPrompt={careerPrompt}
      />
    </div>
  );
}
