import {
  AstrologyProvider,
  DailyHoroscopeRequest,
  DailyHoroscopeResult,
  PanchangRequest,
  PanchangResult,
  SunSign,
} from "../types";

interface JyotishApiConfig {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEZONE = process.env.JYOTISH_DEFAULT_TIMEZONE ?? "Asia/Kolkata";
const DEFAULT_LATITUDE = Number(process.env.JYOTISH_DEFAULT_LATITUDE ?? "28.6139");
const DEFAULT_LONGITUDE = Number(process.env.JYOTISH_DEFAULT_LONGITUDE ?? "77.2090");
const DEFAULT_ALTITUDE = Number(process.env.JYOTISH_DEFAULT_ALTITUDE ?? "0");

export class JyotishApiProvider implements AstrologyProvider {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(config: JyotishApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 8000;
  }

  async getDailyHoroscope(input: DailyHoroscopeRequest): Promise<DailyHoroscopeResult> {
    const timezone = input.timezone ?? DEFAULT_TIMEZONE;
    const payload = createBasePayload({
      date: input.date,
      locale: input.locale,
      timezone,
    });
    payload["sun_sign"] = input.sunSign;
    payload["sunSign"] = input.sunSign;
    if (input.system) {
      payload["system"] = input.system;
    }

    const response = await this.request("/planets", payload);
    const normalized = normalizeDaily(response, input.sunSign, timezone);

    return {
      source: "freeastrologyapi",
      metadata: normalized.metadata,
      summary: normalized.summary,
    };
  }

  async getPanchang(input: PanchangRequest): Promise<PanchangResult> {
    const timezone = input.timezone ?? DEFAULT_TIMEZONE;
    const payload = createBasePayload({
      date: input.date,
      locale: input.locale,
      timezone,
    });

    const response = await this.request("/complete-panchang", payload);
    const normalized = normalizePanchang(response, timezone);

    return {
      source: "freeastrologyapi",
      metadata: normalized.metadata,
      details: normalized.details,
    };
  }

  private async request(path: string, body: Record<string, unknown>) {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": this.apiKey,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const text = await response.text();

        // Log detailed error to server console
        console.error("[JyotishApiProvider] Upstream API error", {
          url,
          path,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          responseBody: text,
          requestBody: body,
        });

        // Create enriched error with all details
        const errorMessage = `FreeAstrology API error (${response.status} ${response.statusText}): ${text}`;
        const error = new Error(errorMessage);

        // Attach metadata to error object for upstream handlers
        Object.assign(error, {
          status: response.status,
          statusText: response.statusText,
          responseBody: text,
          url,
          path,
        });

        throw error;
      }

      return response.json();
    } catch (error) {
      // Handle timeout and network errors
      if (error instanceof Error && error.name === "AbortError") {
        console.error("[JyotishApiProvider] Request timeout", {
          url,
          path,
          timeoutMs: this.timeoutMs,
          requestBody: body,
        });

        const timeoutError = new Error(`FreeAstrology API timeout after ${this.timeoutMs}ms`);
        Object.assign(timeoutError, {
          status: 504,
          statusText: "Gateway Timeout",
          url,
          path,
        });
        throw timeoutError;
      }

      // Re-throw if already processed
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

function createBasePayload({
  date,
  locale,
  timezone,
}: {
  date?: string;
  locale: string;
  timezone: string;
}): Record<string, unknown> {
  const zonedDate = resolveZonedDate(date);
  const components = getZonedDateTimeParts(zonedDate, timezone);
  const offset = getTimezoneOffsetHours(timezone, zonedDate);

  return {
    year: components.year,
    month: components.month,
    date: components.day,
    hours: components.hour,
    minutes: components.minute,
    seconds: components.second,
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    altitude: DEFAULT_ALTITUDE,
    timezone: offset,
    language: locale,
    ayanamsa: "lahiri",
    ayanamsha: "lahiri",
    config: {
      observation_point: "topocentric",
      ayanamsha: "lahiri",
    },
  } as Record<string, unknown>;
}

function normalizeDaily(payload: unknown, sunSign: SunSign, timezone?: string) {
  const envelope = extractEnvelope(payload);
  const generatedAt = toDate(envelope.generatedAt ?? envelope.timestamp);
  const summaryDate = toDate(envelope.date ?? envelope.timestamp);

  const planets = extractSequence(envelope.planets);
  const planetPositions = extractSequence(envelope.planet_positions ?? envelope.planetPositions);

  const snapshot: Record<string, unknown> = {};
  if (planets.length > 0) {
    snapshot.planets = planets;
  }
  if (planetPositions.length > 0) {
    snapshot.planetPositions = planetPositions;
  }

  return {
    metadata: {
      provider: "freeastrologyapi",
      generatedAt: (generatedAt ?? new Date()).toISOString(),
      timezone,
      raw: payload,
    },
    summary: {
      date: (summaryDate ?? new Date()).toISOString(),
      sunSign,
      guidance: buildGuidance(envelope, sunSign),
      mood: stringOrUndefined(envelope.mood),
      luckyNumber: stringOrUndefined(envelope.lucky_number ?? envelope.luckyNumber),
      luckyColor: stringOrUndefined(envelope.lucky_color ?? envelope.luckyColor),
      snapshot: Object.keys(snapshot).length > 0 ? snapshot : undefined,
    },
  };
}

function normalizePanchang(payload: unknown, timezone?: string) {
  const envelope = extractEnvelope(payload);
  const generatedAt = toDate(envelope.generatedAt ?? envelope.timestamp);
  const detailsDate = toDate(envelope.date ?? envelope.day);

  return {
    metadata: {
      provider: "freeastrologyapi",
      generatedAt: (generatedAt ?? new Date()).toISOString(),
      timezone,
      raw: payload,
    },
    details: {
      date: (detailsDate ?? new Date()).toISOString(),
      tithi: stringOrFallback(
        envelope.tithi ?? envelope.tithi_name ?? envelope.tithiName,
        "Unknown",
      ),
      nakshatra: stringOrFallback(
        envelope.nakshatra ?? envelope.nakshatra_name ?? envelope.nakshatraName,
        "Unknown",
      ),
      yoga: stringOrFallback(envelope.yoga ?? envelope.yoga_name ?? envelope.yogaName, "Unknown"),
      karana: stringOrFallback(
        envelope.karana ?? envelope.karana_name ?? envelope.karanaName,
        "Unknown",
      ),
      sunrise: stringOrFallback(envelope.sunrise ?? envelope.sunrise_time, ""),
      sunset: stringOrFallback(envelope.sunset ?? envelope.sunset_time, ""),
    },
  };
}

function extractEnvelope(payload: unknown): Record<string, unknown> {
  if (payload && typeof payload === "object") {
    const casted = payload as Record<string, unknown>;
    if (Array.isArray(casted.data)) {
      const [first] = casted.data;
      if (first && typeof first === "object") {
        return first as Record<string, unknown>;
      }
    }
    if (casted.data && typeof casted.data === "object") {
      return casted.data as Record<string, unknown>;
    }
    return casted;
  }
  return {};
}

function buildGuidance(envelope: Record<string, unknown>, sunSign: SunSign) {
  const components = [
    `Planetary snapshot for ${sunSign.charAt(0).toUpperCase() + sunSign.slice(1)}.`,
  ];

  const moonSign = envelope.moon_sign ?? envelope.moonSign;
  if (moonSign) {
    components.push(`Moon transits ${String(moonSign)}.`);
  }

  const tithi = envelope.tithi ?? envelope.tithi_name ?? envelope.tithiName;
  if (tithi) {
    components.push(`Tithi: ${String(tithi)}.`);
  }

  const yoga = envelope.yoga ?? envelope.yoga_name ?? envelope.yogaName;
  if (yoga) {
    components.push(`Yoga: ${String(yoga)}.`);
  }

  const planets = extractSequence(
    envelope.planets ?? envelope.planet_positions ?? envelope.planetPositions,
  );
  if (planets.length > 0) {
    const firstPlanet = planets[0];
    if (firstPlanet && typeof firstPlanet === "object") {
      const planetRecord = firstPlanet as Record<string, unknown>;
      const name = planetRecord.name ?? planetRecord.planet;
      const signName = planetRecord.sign ?? planetRecord.rashi;
      if (name && signName) {
        components.push(`${String(name)} currently resides in ${String(signName)}.`);
      }
    }
  }

  components.push("Detailed guidance requires LLM interpretation.");
  return components.join(" ");
}

function extractSequence(value: unknown): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

function stringOrUndefined(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }
  return String(value);
}

function stringOrFallback(value: unknown, fallback: string): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return String(value);
}

function toDate(value: unknown): Date | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number") {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }

  if (typeof value === "string") {
    const normalized = value.endsWith("Z") || value.includes("+") ? value : `${value}Z`;
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

function resolveZonedDate(date?: string) {
  if (!date) {
    return new Date();
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }

  return parsed;
}

function getZonedDateTimeParts(date: Date, timeZone: string) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const resolve = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);

    return {
      year: resolve("year"),
      month: resolve("month"),
      day: resolve("day"),
      hour: resolve("hour"),
      minute: resolve("minute"),
      second: resolve("second"),
    };
  } catch {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
      hour: date.getUTCHours(),
      minute: date.getUTCMinutes(),
      second: date.getUTCSeconds(),
    };
  }
}

function getTimezoneOffsetHours(timeZone: string, date: Date): number {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "shortOffset",
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const offsetValue = parts.find((part) => part.type === "timeZoneName")?.value;
    if (offsetValue) {
      const match = offsetValue.match(/GMT([+-])(\d{2})(?::?(\d{2}))?/);
      if (match) {
        const sign = match[1] === "-" ? -1 : 1;
        const hours = Number(match[2] ?? "0");
        const minutes = Number(match[3] ?? "0");
        return sign * (hours + minutes / 60);
      }
    }
  } catch {
    // ignore and fall back
  }

  return -date.getTimezoneOffset() / 60;
}
