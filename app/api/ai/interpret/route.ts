import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { requireAuth } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/route-handler";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/monitoring/logger";
import {
  buildEnrichedChartContext,
  serializeContextForPrompt,
  type ChartPlanet,
} from "@/lib/interpretation/chart-context-builder";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

interface InterpretRequestBody {
  chartData: Record<string, unknown>;
  prompt?: string;
  birthDate?: string;
  birthTime?: string;
  birthTimeKnown?: boolean;
}

function isValidRequestBody(body: unknown): body is InterpretRequestBody {
  if (typeof body !== "object" || body === null) return false;
  const candidate = body as Record<string, unknown>;
  return (
    typeof candidate.chartData === "object" &&
    candidate.chartData !== null &&
    (candidate.prompt === undefined || typeof candidate.prompt === "string") &&
    (candidate.birthDate === undefined || typeof candidate.birthDate === "string") &&
    (candidate.birthTime === undefined || typeof candidate.birthTime === "string") &&
    (candidate.birthTimeKnown === undefined || typeof candidate.birthTimeKnown === "boolean")
  );
}

// eslint-disable-next-line max-lines-per-function
export async function POST(req: NextRequest): Promise<Response> {
  try {
    // 1. Auth: require logged-in user
    const user = await requireAuth();

    // 2. Rate limit: 30 requests per minute per user
    const rateLimitResponse = await rateLimit(req, {
      limit: 30,
      window: 60 * 1000,
      identifier: () => `ai:${user.id}`,
    });
    if (rateLimitResponse) return rateLimitResponse;

    // 3. Parse and validate input
    const body: unknown = await req.json();
    if (!isValidRequestBody(body)) {
      return NextResponse.json(
        { error: "Invalid request body", required: ["chartData"], optional: ["prompt", "birthDate", "birthTime"] },
        { status: 400 },
      );
    }

    const { chartData, prompt, birthDate, birthTime, birthTimeKnown } = body;

    logger.info("AI interpret request", {
      userId: user.id,
      hasChartData: !!chartData,
      promptLength: prompt?.length,
      hasBirthDate: !!birthDate,
    });

    // Build enriched astrological context from the chart data
    let enrichedContextMarkdown = "";
    try {
      const rawChart = chartData as { ascendant?: number; planets?: ChartPlanet[] };
      if (rawChart.ascendant !== undefined && Array.isArray(rawChart.planets)) {
        const enrichedCtx = buildEnrichedChartContext({
          ascendant: rawChart.ascendant,
          planets: rawChart.planets,
          birthDate,
          birthTime,
          birthTimeKnown: birthTimeKnown ?? true,
        });
        enrichedContextMarkdown = serializeContextForPrompt(enrichedCtx);
        logger.info("Enriched chart context built", {
          yogasFound: enrichedCtx.yogas.length,
          hasDasha: !!enrichedCtx.dasha,
          doshaLevel: enrichedCtx.doshas.overallDosha,
          sadeSatiActive: enrichedCtx.sadeSati.isActive,
          transitsFound: enrichedCtx.topTransits.length,
        });
      }
    } catch (ctxErr: unknown) {
      logger.warn("Failed to build enriched context, falling back to raw data", { error: String(ctxErr) });
    }

    // 4. Construct the System Prompt (enhanced with enriched context instructions)
    const systemPrompt = `
You are an expert Vedic Astrologer (Jyotish Acharya) with deep knowledge of Parashara Hora Sastra.
Your role is to analyze the provided birth chart data and offer profound, empathetic, and actionable insights.

### CRITICAL GUIDELINES:
1.  **Data-Driven**: Base your entire analysis STRICTLY on the provided computed chart data. You are given pre-computed house lordships, functional benefic/malefic status, Dasha periods, detected Yogas, Dosha analysis, Sade Sati status, and active transits. Use these DIRECTLY — do not re-derive or contradict them.
2.  **Specificity**: You MUST reference specific house lordships and Dasha periods in your analysis. Example: "Your 10th lord Saturn is debilitated in Aries (House 6), which may cause career setbacks through health or workplace conflicts. During your current Rahu Mahadasha (ending 2028), this effect is amplified." NEVER give generic advice like "career will improve".
3.  **Tone**: Empowering, identifying strengths and growth areas. Avoid fatalistic or fear-mongering language (e.g., do not predict death or unavoidable tragedy).
4.  **Structure**: Use clear Markdown headings.
5.  **Audience**: The user is likely a layperson. Explain technical terms (like "Ascendant" or "Dasha") simply when you first use them.
6.  **Dasha Context**: If Dasha data is provided, you MUST explain what the current Mahadasha planet signifies for this specific ascendant and how the Antardasha modifies it.
7.  **Yoga References**: If Yogas are detected, explain their practical impact on the native's life based on the houses involved.
8.  **Transit Awareness**: If transit data is provided, mention how current transits are influencing the native's chart RIGHT NOW.

### Analysis Framework:
-   **Ascendant (Lagna)**: Core personality, physical vitality, and life direction. Reference the ascendant lord's placement.
-   **Moon Sign (Rashi)**: Emotional nature and mind. Reference Moon's house and dignity.
-   **Key Planetary Influences**: Focus on planets marked as "Yoga Karaka" or "Functional Benefic" (strengths) and those that are "Debilitated" or in Dusthana houses 6/8/12 (challenges).
-   **Current Dasha Period**: What life themes are active based on the Mahadasha/Antardasha lords and the houses they rule.
-   **Active Doshas**: If Kaal Sarp or Manglik doshas are present, explain their practical impact and severity.
-   **Sade Sati**: If active, explain the current phase and its implications for the Moon sign.
`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // 5. Check for API Key - Fallback to Mock if missing
    if (!apiKey) {
       logger.warn("No GOOGLE_GENERATIVE_AI_API_KEY found — serving mock response");
       
       const mockText = `
# ✨ Vedic Astrology Insights (Demo Mode)

**Overview**: 
This is a **simulated reading** because the AI service is currently running in demo mode. In production, this would be a deeply personalized analysis based on your specific birth chart data (Planets: ${(chartData as { planets?: unknown[] })?.planets?.length || 0}, Ascendant: ${(chartData as { ascendant?: number })?.ascendant || 0}°).

### 🔮 Your Planetary Signatures
- **Ascendant (Lagna)**: Represents your physical vitality and path in life.
- **Moon Sign (Rashi)**: Governance of your mind and emotions. 

### 🛡️ Strength & Dignity
The system analyzes *Shadbala* (planetary strength) and *Avasthas* (dignity) to identify your strongest allies in the chart.

> "The stars impel, they do not compel."

*Please provide a valid Google Gemini API Key to unlock full personalized interpretations.*
       `;

       const encoder = new TextEncoder();
       const stream = new ReadableStream({
         async start(controller) {
           const chunks = mockText.split(/(?=[#\n])/);
           for (const chunk of chunks) {
             controller.enqueue(encoder.encode(chunk));
             await new Promise((resolve) => setTimeout(resolve, 100));
           }
           controller.close();
         },
       });

       return new Response(stream, {
         headers: { 
            "Content-Type": "text/plain; charset=utf-8",
            "X-Vedic-Mock": "true" 
         },
       });
    }

    // 6. Stream the response (Real Mode - Gemini 1.5 Flash)
    logger.info("AI interpret — real mode", { userId: user.id });
    
    const google = createGoogleGenerativeAI({
        apiKey,
    });

    // Build user message with enriched context (or fall back to raw JSON)
    const chartSection = enrichedContextMarkdown
      ? `Here is the pre-computed astrological analysis of the birth chart:

${enrichedContextMarkdown}`
      : `Here is the birth chart data:
\`\`\`json
${JSON.stringify(chartData, null, 2)}
\`\`\``;

    const result = streamText({
      model: google("gemini-flash-latest"), 
      system: systemPrompt,
      temperature: 0,
      messages: [
        {
          role: "user",
          content: `${chartSection}

User Question/Focus: ${prompt || "Please provide a general overview of my birth chart, focusing on my core personality and major strengths."}`,
        },
      ],
      onError: (error) => {
        logger.error("Gemini streaming error", error);
      },
      onFinish: (event) => {
        logger.info("Gemini streaming finished", {
          userId: user.id,
          usage: event.usage,
          finishReason: event.finishReason,
        });
      }
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.code, message: error.message },
        { status: error.statusCode },
      );
    }
    logger.error("AI interpretation error", error);
    return new Response(JSON.stringify({ error: "Failed to generate interpretation" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
