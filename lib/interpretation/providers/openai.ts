import { buildDailyHoroscopePrompt } from "../prompt";
import { InterpretationInput, InterpretationOutput, InterpretationProvider } from "../types";
import { BirthChartInterpretationInput, BirthChartInterpretationOutput, BirthChartInterpretationProvider } from "../birth-chart-types";
import { buildBirthChartPrompt } from "../birth-chart-prompt";
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { z } from "zod";

interface OpenAIConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

interface OpenAIChatCompletion {
  id: string;
  created: number;
  model: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  choices: Array<{
    message: {
      role: string;
      content?: string;
    };
  }>;
}

export class OpenAIInterpretationProvider implements InterpretationProvider, BirthChartInterpretationProvider {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(config: OpenAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
    this.model = config.model ?? "gpt-4o-mini";
    this.timeoutMs = config.timeoutMs ?? 10000;
  }

  async generateDailyNarrative(input: InterpretationInput): Promise<InterpretationOutput> {
    const prompt = this.buildPrompt(input);

    const response = await this.createChatCompletion(prompt);
    const choice = response.choices.at(0);
    const narrative = choice?.message.content?.trim() ?? "Unable to generate narrative.";

    return {
      provider: "openai",
      generatedAt: new Date(response.created * 1000).toISOString(),
      locale: input.locale,
      narrative,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      raw: response,
    };
  }

  private async createChatCompletion(prompt: string, jsonMode = false): Promise<OpenAIChatCompletion> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          temperature: 0.7,
          response_format: jsonMode ? { type: "json_object" } : undefined,
          messages: [
            {
              role: "system",
              content:
                "You are a senior Vedic astrologer creating concise daily guidance. Blend practical advice with spiritual nuance. Never fabricate planetary data; rely only on facts provided.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${text}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildPrompt(input: InterpretationInput): string {
    return buildDailyHoroscopePrompt(input);
  }

  async generateBirthChartInterpretation(input: BirthChartInterpretationInput): Promise<BirthChartInterpretationOutput> {
    const prompt = buildBirthChartPrompt(input);
    const response = await this.createChatCompletion(prompt, true); // true for JSON mode
    
    // Parse JSON response
    const content = response.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON interpretation", e);
      parsed = {
        narrative: content,
        strengths: [],
        challenges: [],
        remedies: []
      };
    }

    return {
      provider: "openai",
      generatedAt: new Date(response.created * 1000).toISOString(),
      locale: input.locale,
      narrative: parsed.narrative || "Analysis generated.",
      strengths: parsed.strengths || [],
      challenges: parsed.challenges || [],
      remedies: parsed.remedies || [],
      raw: response
    };
  }

  async streamBirthChartInterpretation(input: BirthChartInterpretationInput): Promise<any> {
    const openai = createOpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl !== "https://api.openai.com/v1" ? this.baseUrl : undefined,
    });

    const prompt = buildBirthChartPrompt(input);

    return streamObject({
      model: openai(this.model),
      schema: z.object({
        narrative: z.string(),
        strengths: z.array(z.string()),
        challenges: z.array(z.string()),
        remedies: z.array(z.string()),
      }),
      prompt,
    });
  }
}
