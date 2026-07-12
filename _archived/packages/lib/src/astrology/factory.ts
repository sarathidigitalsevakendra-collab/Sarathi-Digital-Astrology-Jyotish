import { AstrologyProvider } from "./types";
import { OpenSourceAstrologyProvider } from "./providers/open-source";
import { JyotishApiProvider } from "./providers/jyotish-api";

type ProviderKey = "open_source" | "jyotish_api";

let cachedProvider: AstrologyProvider | null = null;

export async function getAstrologyProvider(): Promise<AstrologyProvider> {
  if (cachedProvider) {
    return cachedProvider;
  }

  cachedProvider = createProvider();
  return cachedProvider;
}

function createProvider(): AstrologyProvider {
  const providerKey = (process.env.ASTROLOGY_PROVIDER ?? "open_source") as ProviderKey;

  if (providerKey === "jyotish_api") {
    const baseUrl = process.env.JYOTISH_API_URL;
    const apiKey = process.env.JYOTISH_API_KEY;

    if (!baseUrl || !apiKey) {
      console.warn(
        "[astrology] Missing Jyotish API credentials, falling back to open-source provider.",
      );
      return new OpenSourceAstrologyProvider();
    }

    return new JyotishApiProvider({
      baseUrl,
      apiKey,
      timeoutMs: Number(process.env.JYOTISH_API_TIMEOUT_MS ?? 8000),
    });
  }

  return new OpenSourceAstrologyProvider();
}
