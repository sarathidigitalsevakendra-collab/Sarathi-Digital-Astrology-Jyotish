/**
 * Type definitions for Birth Chart feature
 */

export interface BirthData {
  dateTime: string;
  latitude: number;
  longitude: number;
  timezone: number;
  location: string;
  chartName?: string;
}

export interface Planet {
  name: string;
  fullDegree: number;
  normDegree: number;
  speed?: number;
  isRetro: string | boolean;
  sign?: string;
  signLord?: string;
  nakshatra?: string;
  nakshatraLord?: string;
  house?: number;
  dignity?: string;
  strength?: number;
  nature?: string;
}

export interface BirthChartResponse {
  data: {
    statusCode?: number;
    input?: unknown;
    output?: unknown[];
    ascendant?: number;
    planets?: Planet[];
    houses?: unknown[];
  };
  from_cache?: boolean;
  cached_at?: string;
}

export interface ChartSVGResponse {
  data: {
    svg_code: string;
    chart_name: string;
  };
  from_cache?: boolean;
}

export type TabType = "form" | "chart" | "divisional" | "ai-insights";

export interface DivisionalChart {
  code: string;
  name: string;
  icon: string;
  desc: string;
  beginner: boolean;
}

export interface PlanetMeaning {
  icon: string;
  meaning: string;
  area: string;
}

export interface SignMeaning {
  element: string;
  nature: string;
  color: string;
}

export interface HouseMeaning {
  name: string;
  meaning: string;
  lifeArea: string;
}

export interface BirthChartState {
  birthData: BirthData;
  chartData: BirthChartResponse | null;
  divisionalData?: { [key: string]: BirthChartResponse };
  svgData: { [key: string]: ChartSVGResponse };
  loading: boolean;
  error: string | null;
  selectedDivisional: string;
  downloadingPNG: boolean;
  downloadingPDF: boolean;
  copiedLink: boolean;
  savingChart: boolean;
  savedChartId: string | null;
}

export interface BirthChartActions {
  generateChart: () => Promise<void>;
  downloadPNG: () => Promise<void>;
  downloadPDF: () => Promise<void>;
  saveChart: () => Promise<void>;
  copyShareLink: () => Promise<void>;
  selectDivisional: (code: string) => void;
}

export interface DownloadOptions {
  filename: string;
  chartName: string;
  birthDate?: string;
  birthPlace: string;
}

// ============================================================================
// YOGAS (Planetary Combinations) Types
// ============================================================================

export interface Yoga {
  name: string;
  type: "raja" | "dhana" | "mahapurusha" | "prosperity" | "other";
  planets: string[];
  description: string;
  effect: string;
  strength: "very strong" | "strong" | "moderate" | "weak";
}

export interface YogaSummary {
  total_yogas: number;
  by_strength: {
    "very strong": number;
    strong: number;
    moderate: number;
    weak: number;
  };
  has_mahapurusha: boolean;
  has_raja_yoga: boolean;
  has_dhana_yoga: boolean;
}

export interface YogasResponse {
  ascendant_rashi: number;
  planets: Record<string, {
    longitude: number;
    rashi: number;
    house: number;
    is_exalted: boolean;
    is_debilitated: boolean;
  }>;
  yogas: Yoga[];
  categories: Record<string, Yoga[]>;
  summary: YogaSummary;
  backend: string;
  birth_data?: {
    birth_date: string;
    ascendant_longitude: number;
  };
}

// ============================================================================
// DIVISIONAL CHARTS Types
// ============================================================================

export interface DivisionalPosition {
  chart: string;
  rashi: number;
  sign: string;
  lord: string;
  degree?: number;
  navamsa_number?: number;
  dasamsa_number?: number;
  hora?: string;
}

export interface DivisionalChartInfo {
  name: string;
  purpose: string;
  positions: Record<string, DivisionalPosition>;
  ascendant_sign: string;
}

export interface DivisionalChartsResponse {
  charts: Record<string, DivisionalChartInfo>;
  available_charts: string[];
  primary_charts: string[];
  backend: string;
  birth_data?: {
    birth_date: string;
    ascendant_longitude: number;
  };
}
export interface Antardasha {
  planet: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  is_current: boolean;
}

export interface Mahadasha {
  planet: string;
  start_date: string;
  end_date: string;
  duration_years: number;
  is_current: boolean;
  antardashas: Antardasha[];
}

export interface DashaResult {
  birthNakshatra: string;
  nakshatraLord: string;
  moonLongitude: number;
  currentMahadasha: string;
  currentAntardasha: string;
  mahadashas: Mahadasha[];
  ayanamsha: string;
  ayanamshaValue: number;
  source: string;
}
