import { NextRequest, NextResponse } from "next/server";
import { getInterpretationProvider } from "@/lib/interpretation/factory";
import { BirthChartInterpretationInput } from "@/lib/interpretation/birth-chart-types";
import { logger } from "@/lib/monitoring/logger";
import { BirthChartInterpretationProvider } from "@/lib/interpretation/birth-chart-types";

export const maxDuration = 60; // Allow 60 seconds for AI generation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { birthChart, focus = "general", tone = "uplifting", locale = "en" } = body;

    if (!birthChart || !birthChart.data) {
      return NextResponse.json(
        { error: "Invalid birth chart data provided" },
        { status: 400 }
      );
    }

    const provider = await getInterpretationProvider();
    
    // Type guard or cast to ensure provider supports birth chart interpretation
    const chartProvider = provider as unknown as BirthChartInterpretationProvider;
    
    if (typeof chartProvider.generateBirthChartInterpretation !== 'function') {
      return NextResponse.json(
          // Fallback if provider doesn't support chart interpretation
          { 
              narrative: "AI interpretation is currently unavailable for this provider.",
              strengths: [],
              challenges: [],
              remedies: []
          }
      );
    }
    
    const input: BirthChartInterpretationInput = {
      birthChart,
      focus,
      tone,
      locale
    };

    // Check if we can stream (specifically for OpenAI provider which supports it)
    if (provider.constructor.name === "OpenAIInterpretationProvider") {
        try {
            const result = await chartProvider.streamBirthChartInterpretation(input);
            return result.toTextStreamResponse();
        } catch (error) {
            logger.error("Streaming failed, falling back to blocking", error);
            // Fallthrough to blocking
        }
    }

    const result = await chartProvider.generateBirthChartInterpretation(input);

    return NextResponse.json(result);

  } catch (error) {
    logger.error("Birth Chart Interpretation API Error", error);
    return NextResponse.json(
      { error: "Failed to generate interpretation", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
