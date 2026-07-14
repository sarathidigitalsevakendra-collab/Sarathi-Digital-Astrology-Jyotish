/**
 * Planetary Positions Calculator
 * 
 * Uses 'astronomia' (implementation of Meeus algorithms) for high-precision
 * planetary positions (VSOP87 theory).
 */

// @ts-ignore
import { julian } from 'astronomia';
// @ts-ignore
import { planetposition } from 'astronomia';
// @ts-ignore
import { moonposition } from 'astronomia';

// Load VSOP87 calculation data
// @ts-ignore
import earth from 'astronomia/data/vsop87Bearth';
// @ts-ignore
import mars from 'astronomia/data/vsop87Bmars';
// @ts-ignore
import mercury from 'astronomia/data/vsop87Bmercury';
// @ts-ignore
import jupiter from 'astronomia/data/vsop87Bjupiter';
// @ts-ignore
import venus from 'astronomia/data/vsop87Bvenus';
// @ts-ignore
import saturn from 'astronomia/data/vsop87Bsaturn';

import { 
  getAyanamsha, 
  toDeg, 
  normalizeDegree 
} from './VedicMath';


export interface PlanetCoordinates {
  name: string;
  longitude: number;
  latitude: number;
  distance: number;
  speed?: number;
}

const planets = {
  Mercury: mercury,
  Venus: venus,
  Earth: earth,
  Mars: mars,
  Jupiter: jupiter,
  Saturn: saturn,
};

/**
 * Calculate Ascendant (Lagna) for a given date, time, and location
 */
export function calculateAscendant(date: Date, latitude: number, longitude: number): number {
  const jd = julian.CalendarGregorianToJD(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  ) + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;

  // Calculate Mean Sidereal Time at Greenwich (in degrees)
  // GMST = 280.46061837 + 360.98564736629 * (JD - 2451545.0) ...
  const T = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000;
  
  // Normalize to 0-360
  gmst = (gmst % 360 + 360) % 360;

  // Local Sidereal Time = GMST + Longitude (East is positive)
  // Note: some conventions use West positive for specific formulas, but generally LST = GST + Lon (East)
  const lst = (gmst + longitude) % 360;
  const lstRad = lst * Math.PI / 180;
  
  const latRad = latitude * Math.PI / 180;
  
  // Obliquity of Ecliptic
  // Mean obliquity
  const eps = (23 + 26/60 + 21.448/3600) - (46.8150/3600)*T - (0.00059/3600)*T*T + (0.001813/3600)*T*T*T;
  const epsRad = eps * Math.PI / 180;

  // Ascendant formula (Kotir) based on RAMC
  // Ascendant is the intersection of Ecliptic and Horizon (East)
  // tan(Asc) = -cos(RAMC) / (sin(RAMC) * cos(eps) + tan(lat) * sin(eps))
  // RAMC = LST
  
  const numer = -Math.cos(lstRad);
  const denom = Math.sin(lstRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad);
  
  const ascRad = Math.atan2(numer, denom);
  let ascDeg = ascRad * 180 / Math.PI;
  
  ascDeg = (ascDeg % 360 + 360) % 360;
  
  // Subtract Ayanamsha for Sidereal Ascendant
  const ayanamsha = getAyanamsha(date.getFullYear());
  return normalizeDegree(ascDeg - ayanamsha);
}

/**
 * Calculate planetary positions for a given date and time
 * Returns sidereal (nirayana) longitudes using Lahiri Ayanamsha
 */
export function calculatePlanetaryPositions(date: Date, _latitude: number, _longitude: number): PlanetCoordinates[] {
  // Calculate Julian Day
  const jd = julian.CalendarGregorianToJD(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate()
  ) + (date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600) / 24;

  // Calculate Ayanamsha (Lahiri)
  const ayanamsha = getAyanamsha(date.getFullYear());
  
  const results: PlanetCoordinates[] = [];

  // Calculate Earth position (needed for geocentric)
  // vsop87 usually returns heliocentric dynamical ecliptic coords of date
  const earthPlanet = new planetposition.Planet(earth);
  const earthPos = earthPlanet.position(jd);

  // 1. Sun (Geocentric)
  // Earth's heliocentric + 180 = Geocentric Sun
  // We need to convert Heliocentric (Earth) -> Geocentric (Sun)
  // L_sun = L_earth + 180
  // B_sun = -B_earth
  // R_sun = R_earth
  const sunLon = normalizeDegree(toDeg(earthPos.lon) + 180);
  const sunLat = -toDeg(earthPos.lat);
  
  results.push({
    name: "Sun",
    longitude: normalizeDegree(sunLon - ayanamsha),
    latitude: sunLat,
    distance: earthPos.range
  });

  // 2. Planets
  for (const [name, data] of Object.entries(planets)) {
    if (name === 'Earth') continue;

    const planetObj = new planetposition.Planet(data);
    const helio = planetObj.position(jd);
    
    // Geocentric conversion
    // Using rectangular coordinates
    const r = helio.range;
    const l = helio.lon; // radians
    const b = helio.lat; // radians

    const re = earthPos.range;
    const le = earthPos.lon;
    const be = earthPos.lat;

    // Heliocentric rectangular (Planet)
    const x = r * Math.cos(b) * Math.cos(l);
    const y = r * Math.cos(b) * Math.sin(l);
    const z = r * Math.sin(b);

    // Heliocentric rectangular (Earth)
    const xe = re * Math.cos(be) * Math.cos(le);
    const ye = re * Math.cos(be) * Math.sin(le);
    const ze = re * Math.sin(be);

    // Geocentric rectangular (Planet from Earth)
    const X = x - xe;
    const Y = y - ye;
    const Z = z - ze;

    const geoLonRad = Math.atan2(Y, X);
    const geoLatRad = Math.atan2(Z, Math.sqrt(X*X + Y*Y));
    const geoDist = Math.sqrt(X*X + Y*Y + Z*Z);

    const geoLon = normalizeDegree(toDeg(geoLonRad));
    const geoLat = toDeg(geoLatRad);

    results.push({
      name,
      longitude: normalizeDegree(geoLon - ayanamsha),
      latitude: geoLat,
      distance: geoDist
    });
  }

  // 3. Moon
  const moonPos = moonposition.position(jd); 
  
  results.push({
    name: "Moon",
    longitude: normalizeDegree(toDeg(moonPos.lon) - ayanamsha),
    latitude: toDeg(moonPos.lat),
    distance: moonPos.range
  });

  // 4. Nodes (Rahu/Ketu)
  // Using Mean Node approximation
  const T = (jd - 2451545.0) / 36525;
  const rahuMean = normalizeDegree(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
  const ketuMean = normalizeDegree(rahuMean + 180);

  results.push({
    name: "Rahu",
    longitude: normalizeDegree(rahuMean - ayanamsha),
    latitude: 0,
    distance: 0
  });

  results.push({
    name: "Ketu",
    longitude: normalizeDegree(ketuMean - ayanamsha),
    latitude: 0,
    distance: 0
  });

  return results;
}
