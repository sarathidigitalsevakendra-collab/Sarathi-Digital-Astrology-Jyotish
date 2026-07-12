import { MockHoroscopeClient, type HoroscopeEntry } from "../../services/horoscope";
import { MockPanchangClient } from "../../services/panchang";
import {
  AstrologyProvider,
  DailyHoroscopeRequest,
  DailyHoroscopeResult,
  PanchangRequest,
  PanchangResult,
} from "../types";

const horoscopeClient = new MockHoroscopeClient();
const panchangClient = new MockPanchangClient();

const REMOTE_HOROSCOPE_TTL_MS = 60_000;
const remoteHoroscopeCache = new Map<
  string,
  { fetchedAt: number; value: { entry: HoroscopeEntry | null; raw: unknown; source?: string } }
>();

export class OpenSourceAstrologyProvider implements AstrologyProvider {
  async getDailyHoroscope(input: DailyHoroscopeRequest): Promise<DailyHoroscopeResult> {
    const { sunSign, date, timezone, locale, system } = input;
    const key = this.toTitleCase(sunSign);

    const remote = await this.getRemoteHoroscopeEntry(sunSign, locale, system);
    let metadataSource = remote?.source ?? "open_source_engine";

    let entry = remote?.entry;

    if (!entry) {
      console.warn("[astrology] Remote horoscope unavailable, using mock data.");
      const fallback = await horoscopeClient.getDaily(system ?? "vedic");
      entry = fallback[key];
    } else {
      metadataSource = process.env.ASTRO_CORE_URL ? "astro_core" : "open_source_engine";
    }

    return {
      source: "open_source",
      metadata: {
        provider: metadataSource,
        generatedAt: new Date().toISOString(),
        timezone,
        raw: remote?.raw ?? entry,
      },
      summary: {
        date: date ?? new Date().toISOString(),
        sunSign,
        guidance: entry?.summary ?? `No guidance available for ${key}`,
        mood: entry?.mood,
        luckyNumber: entry?.luckyNumber,
        luckyColor: entry?.luckyColor,
      },
    };
  }

  async getPanchang(input: PanchangRequest): Promise<PanchangResult> {
    const { date, locale, timezone } = input;
    const remote = await this.getRemotePanchang(locale);
    const today = remote ?? (await panchangClient.getToday(locale));
    const providerSource = remote ? "astro_core" : "open_source_engine";

    return {
      source: "open_source",
      metadata: {
        provider: providerSource,
        generatedAt: new Date().toISOString(),
        timezone,
        raw: today,
      },
      details: {
        date: date ?? today.date,
        tithi: today.tithi,
        nakshatra: today.nakshatra,
        yoga: today.yoga,
        karana: today.karana,
        sunrise: today.sunrise,
        sunset: today.sunset,
      },
    };
  }

  private async getRemotePanchang(locale: string) {
    const baseUrl = process.env.ASTRO_CORE_URL?.replace(/\/$/, "");
    if (!baseUrl) {
      return null;
    }

    try {
      const response = await fetch(`${baseUrl}/panchang/today?locale=${locale}`);
      if (!response.ok) {
        console.warn("[astrology] ASTRO_CORE_URL panchang responded with status", response.status);
        return null;
      }

      return response.json();
    } catch (error) {
      console.warn("[astrology] ASTRO_CORE_URL panchang fetch failed", error);
      return null;
    }
  }

  private async getRemoteHoroscopeEntry(
    sign: string,
    locale: string,
    system?: "vedic" | "western",
  ): Promise<{
    entry: HoroscopeEntry | null;
    raw: unknown;
    source?: string;
  } | null> {
    const baseUrl = process.env.ASTRO_CORE_URL?.replace(/\/$/, "");
    if (!baseUrl) {
      return null;
    }

    const candidateLocales = Array.from(new Set([locale, "en"]));

    for (const remoteLocale of candidateLocales) {
      const cacheKey = `${sign}:${system ?? "vedic"}:${remoteLocale}`;
      const cached = remoteHoroscopeCache.get(cacheKey);
      if (cached && Date.now() - cached.fetchedAt <= REMOTE_HOROSCOPE_TTL_MS) {
        if (cached.value.entry) {
          return cached.value;
        }
        // cached but empty, try next locale
        continue;
      }

      const result = await this.fetchRemoteHoroscope(baseUrl, sign, remoteLocale, cacheKey, system);
      if (result?.entry) {
        return result;
      }
    }

    return null;
  }

  private async fetchRemoteHoroscope(
    baseUrl: string,
    sign: string,
    locale: string,
    cacheKey: string,
    system?: "vedic" | "western",
  ) {
    try {
      const params = new URLSearchParams({
        sunSign: sign,
        locale,
      });
      if (system) {
        params.set("system", system);
      }
      const response = await fetch(`${baseUrl}/horoscope/daily?${params.toString()}`);
      if (!response.ok) {
        console.warn("[astrology] ASTRO_CORE_URL horoscope responded with status", response.status);
        return this.cacheAndReturn(cacheKey, { entry: null, raw: null, source: undefined });
      }

      const payload = await response.json();
      const summary = payload?.horoscope;
      if (!summary || typeof summary !== "object") {
        console.warn("[astrology] ASTRO_CORE_URL horoscope payload missing summary for", sign);
        return this.cacheAndReturn(cacheKey, {
          entry: null,
          raw: payload,
          source: payload?.source,
        });
      }

      const entry: HoroscopeEntry = {
        summary: String(summary.summary ?? summary.guidance ?? ""),
        mood: summary.mood ?? "Balanced",
        luckyNumber: summary.luckyNumber ?? "--",
        luckyColor: summary.luckyColor ?? "--",
      };

      return this.cacheAndReturn(cacheKey, {
        entry,
        raw: payload,
        source: payload?.source,
      });
    } catch (error) {
      console.warn("[astrology] ASTRO_CORE_URL horoscope fetch failed", error);
      return this.cacheAndReturn(cacheKey, { entry: null, raw: null, source: undefined });
    }
  }

  private cacheAndReturn(
    key: string,
    value: { entry: HoroscopeEntry | null; raw: unknown; source?: string },
  ) {
    remoteHoroscopeCache.set(key, { value, fetchedAt: Date.now() });
    return value;
  }

  private toTitleCase(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
}
