import { useMemo } from "react";
import type { BirthChartResponse } from "@/types/astrology/birthChart.types";
import { BirthChartInterpretationOutput } from "@/lib/interpretation/birth-chart-types";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";

interface UseChartInterpretationParams {
  chartData: BirthChartResponse | null;
  onError: (error: string) => void;
}

const interpretationSchema = z.object({
  narrative: z.string(),
  strengths: z.array(z.string()),
  challenges: z.array(z.string()),
  remedies: z.array(z.string()),
});

export function useChartInterpretation({ chartData, onError }: UseChartInterpretationParams) {
  const { object, submit, isLoading, error } = useObject({
    api: "/api/horoscope/birth-chart/interpretation",
    schema: interpretationSchema,
    onError: (err: Error) => {
      onError(err.message || "Stream error");
    },
  });

  const generateInterpretation = (focus: string = "general") => {
    if (!chartData) return;
    submit({
      birthChart: chartData,
      focus,
      tone: "uplifting",
      locale: "en"
    });
  };

  const interpretation: BirthChartInterpretationOutput | null = useMemo(() => {
    if (!object && !isLoading && !error) return null;
    if (!object) return null; // Or return partial representation while loading?

    return {
      provider: "ai-stream",
      generatedAt: new Date().toISOString(),
      locale: "en",
      narrative: object.narrative || "",
      strengths: (object.strengths || []).filter((s): s is string => !!s),
      challenges: (object.challenges || []).filter((s): s is string => !!s),
      remedies: (object.remedies || []).filter((s): s is string => !!s),
    };
  }, [object, isLoading, error]);

  return {
    interpreting: isLoading,
    interpretation,
    generateInterpretation
  };
}
