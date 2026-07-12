/**
 * Converts decimal degrees to Degree-Minute-Second string (e.g., 125.5 -> 125° 30')
 */
export function formatDMS(degrees: number): string {
  const d = Math.floor(degrees);
  const minFloat = (degrees - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60);

  return `${d}° ${m.toString().padStart(2, '0')}' ${s.toString().padStart(2, '0')}"`;
}

/**
 * Converts longitude (0-360) to Sign + Degree format (e.g., 0 -> Aries 0° 00')
 */
export function formatSignDegree(longitude: number): string {
  const signs = [
    "Aries", "Taurus", "Gemini", "Cancer", 
    "Leo", "Virgo", "Libra", "Scorpio", 
    "Sagittarius", "Capricorn", "Aquarius", "Pisces"
  ];
  const signIndex = Math.floor(longitude / 30) % 12;
  const signDegree = longitude % 30;
  
  return `${signs[signIndex]} ${formatDMS(signDegree)}`;
}
