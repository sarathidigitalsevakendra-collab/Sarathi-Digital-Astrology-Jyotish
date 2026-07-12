import { InterpretationProvider } from "./types";
import { MockInterpretationProvider } from "./providers/mock";
import { OpenAIInterpretationProvider } from "./providers/openai";

type InterpretationProviderKey = "mock" | "openai";

let cachedProvider: InterpretationProvider | null = null;

export async function getInterpretationProvider(): Promise<InterpretationProvider> {
  if (cachedProvider) {
    return cachedProvider;
  }

  cachedProvider = createProvider();
  return cachedProvider;
}

function createProvider(): InterpretationProvider {
  const providerKey = (process.env.INTERPRETATION_PROVIDER ?? "mock") as InterpretationProviderKey;

  if (providerKey === "openai") {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("[interpretation] Missing OPENAI_API_KEY, falling back to mock provider.");
      return new MockInterpretationProvider();
    }

    return new OpenAIInterpretationProvider({
      apiKey,
      baseUrl: process.env.OPENAI_BASE_URL,
      model: process.env.OPENAI_MODEL,
      timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS ?? 10000),
    });
  }

  return new MockInterpretationProvider();
}
