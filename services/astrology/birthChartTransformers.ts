/**
 * Birth Chart Data Transformers
 * Functions to transform API responses into UI-friendly models
 */

import type { BirthChartResponse, Planet } from "@/types/astrology/birthChart.types";
import { getSignName } from "./birthChartService";

/**
 * Transform raw API response to structured chart data
 * Maps the nested API structure to a flatter, more usable format
 */
export function transformChartData(
  rawData: BirthChartResponse | Record<string, unknown>,
): BirthChartResponse {
  const data = rawData.data as Record<string, unknown>;

  // Handle Internal Engine Response (Divisional Charts)
  // Format: { charts: { D9: { ascendant: {...}, planets: {...} } } }
  const rawObj = rawData as Record<string, any>;
  if (rawObj.charts) {
    const chartsMap = rawObj.charts;
    // Build a composite response or just pick the first available chart if needed
    // Typically this is called for a single chart fetch (e.g. D9)
    const chartKeys = Object.keys(chartsMap);
    if (chartKeys.length > 0) {
    const chartCode = chartKeys[0] as string; 
      const chartData = (chartsMap as Record<string, any>)[chartCode];

      if (chartData && chartData.planets) {
        const ascendant = chartData.ascendant?.longitude || chartData.ascendant?.vargaLongitude || 0;
        // Use declared rashi or calculate from longitude
        const ascRashi = (chartData.ascendant?.rashi as number) || Math.floor(ascendant / 30) + 1;

        // Transform planets using our flexible helper, passing ascendant rashi for house calc
        const planetsArray = transformPlanets(chartData.planets, ascRashi);

        return {
          data: {
             statusCode: 200,
             ascendant: ascendant,
             planets: planetsArray
          }
        };
      }
    }
  }

  // Handle FreeAstrologyAPI Format (D1)
  if (data?.output && Array.isArray(data.output)) {
    const planetData = data.output[1] as Record<string, Record<string, unknown>>;
    const ascendantData = (data.output[0] as Record<string, Record<string, unknown>>)?.["0"];

    const planetsArray = transformPlanets(planetData);

    return {
      ...rawData,
      data: {
        ...data,
        ascendant: (ascendantData?.fullDegree as number) || 0,
        planets: planetsArray,
      },
    } as BirthChartResponse;
  }

  return rawData as BirthChartResponse;
}

/**
 * Transform planet data from API format to UI model
 */
function transformPlanets(
  planetData: Record<string, Record<string, unknown>>, 
  ascendantRashi?: number
): Planet[] {
  const planetNames = [
    "Sun",
    "Moon",
    "Mars",
    "Mercury",
    "Jupiter",
    "Venus",
    "Saturn",
    "Rahu",
    "Ketu",
  ];

  const planetsArray: Planet[] = [];

  planetNames.forEach((name) => {
    if (planetData[name]) {
      const p = planetData[name];
      
      const rashi = (p.current_sign as number) || (p.rashi as number) || 1;
      
      // Calculate house if ascendant is provided, otherwise fallback to existing props
      let house = (p.house_number as number) || (p.house as number);
      if (!house && ascendantRashi) {
         house = ((rashi - ascendantRashi + 12) % 12) + 1;
      }

      planetsArray.push({
        name,
        fullDegree: (p.fullDegree as number) || (p.vargaLongitude as number) || 0,
        normDegree: (p.normDegree as number) || ((p.vargaLongitude as number) % 30) || 0,
        // Normalize isRetro to boolean (handles "true", true, 1, etc.)
        isRetro: p.isRetro === true || p.isRetro === "true" || p.isRetro === 1,
        sign: (p.signName as string) || getSignName(rashi),
        house: house || 1, // Fallback to 1 if calculation fails
      });
    }
  });

  return planetsArray;
}
