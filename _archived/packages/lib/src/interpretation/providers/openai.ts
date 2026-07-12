import { buildDailyHoroscopePrompt } from "../prompt";
import { InterpretationInput, InterpretationOutput, InterpretationProvider } from "../types";

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

export class OpenAIInterpretationProvider implements InterpretationProvider {
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

  private async createChatCompletion(prompt: string): Promise<OpenAIChatCompletion> {
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
}
