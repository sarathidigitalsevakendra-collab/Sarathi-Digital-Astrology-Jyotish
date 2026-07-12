import PdfContainer from "./PdfContainer";
import PdfPage from "./PdfPage";
import { ReportHeader } from "./ReportHeader";
import { ReportFooter } from "./ReportFooter";
import { formatDMS } from "@/lib/astrology/formatting";
import NorthIndianChart from "@/components/charts/NorthIndianChart";
import { NakshatraDetails } from "@/lib/astrology/calculations/NakshatraInfo";
import { DignityLevel, FunctionalNature } from "@/lib/astrology/calculations/Dignity";
import { Yoga, YogaSummary } from "@/types/astrology/birthChart.types";
import { Remedy } from "@/lib/astrology/calculations/Remedies";

interface DashaPeriod {
  planet: string;
  start_date: string;
  end_date: string;
}

// ... existing interfaces

export interface KundliReportData {
  user: { name: string };
  // ... basicDetails ...
  basicDetails: {
    date: string;
    time: string;
    location: string;
    dayOfWeek: string;
  };
  planetaryPositions: Array<{
    name: string;
    sign: string;
    longitude: number;
    nakshatra: string;
    pada: number | string;
    house?: number;
    isRetro?: boolean;
    fullDegree?: number;
    // New Fields
    dignity?: DignityLevel;
    nature?: FunctionalNature;
    strength?: number;
  }>;
  nakshatraInfo?: NakshatraDetails;
  remedies?: Remedy[]; // New Field
  panchang: {
    tithi: string;
    vara: string;
    nakshatra: string;
    yoga: string;
  };
  // ... charts, yogas, dasha, interpretation ...
  charts: {
    D1: {
      ascendant: number;
      planets: Array<{
        name: string;
        house: number;
        sign: string;
        degree: number;
        isRetro: boolean;
      }>;
    } | null;
    D9?: {
      ascendant: number;
      planets: Array<{
        name: string;
        house: number;
        sign: string;
        degree: number;
        isRetro: boolean;
      }>;
    };
    D10?: {
      ascendant: number;
      planets: Array<{
        name: string;
        house: number;
        sign: string;
        degree: number;
        isRetro: boolean;
      }>;
    };
  };
  yogas?: {
    list: Yoga[];
    summary: YogaSummary | null;
  };
  dasha?: {
    current: string;
    periods: DashaPeriod[];
  };
  interpretation?: {
    narrative: string;
    strengths: string[];
  };
}

interface KundliReportProps {
  data: KundliReportData;
}

/**
 * The standard "Free" Kundli Report.
 * Renders into the hidden PDF container.
 */
export default function KundliReport({ data }: KundliReportProps) {
  const { user, basicDetails, planetaryPositions, panchang } = data;

  return (
    <PdfContainer id="kundli-report-root">
      {/* Page 1: Cover & Birth Details */}
      <PdfPage pageNumber={1} title="Birth Horoscope">
        <div className="flex h-full flex-col items-center justify-start text-center">
           
           <ReportHeader title="Janma Kundli" subtitle={`For ${user?.name || "Devotee"}`} icon="🕉️" />
           
            <div className="w-full max-w-md bg-slate-50 border border-slate-200 p-8 rounded-lg shadow-sm text-left mt-6 mb-8">
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-slate-500">Date of Birth:</div>
                  <div className="font-medium text-slate-900">{basicDetails.date}</div>
                  
                  <div className="text-slate-500">Time of Birth:</div>
                  <div className="font-medium text-slate-900">{basicDetails.time}</div>
                  
                  <div className="text-slate-500">Place of Birth:</div>
                  <div className="font-medium text-slate-900">{basicDetails.location}</div>
                  
                  <div className="text-slate-500">Day:</div>
                  <div className="font-medium text-slate-900">{basicDetails.dayOfWeek}</div>
               </div>
            </div>

             {/* Visual Chart - Removed from Page 1 to save space -> moved to Page 3 */}
           
           <ReportFooter />
        </div>
      </PdfPage>

      {/* Page 2: Planetary Positions */}
      <PdfPage pageNumber={2} title="Planetary Details">
         <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-orange-500 pl-3">
               Planetary Positions (Nirayana)
            </h3>
            
             <table className="w-full text-sm text-slate-700 border-collapse">
                <thead>
                   <tr className="bg-orange-50 text-orange-900 border-b border-orange-200">
                      <th className="p-3 text-left font-semibold">Planet</th>
                      <th className="p-3 text-left font-semibold">Rashi</th>
                      <th className="p-3 text-right font-semibold">Degree</th>
                      <th className="p-3 text-left font-semibold">Nakshatra</th>
                      <th className="p-3 text-center font-semibold">Dignity</th>
                      <th className="p-3 text-center font-semibold">Nature</th>
                      <th className="p-3 text-center font-semibold">Strength</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {planetaryPositions.map((planet) => (
                      <tr key={planet.name} className="even:bg-slate-50/50">
                         <td className="p-3 font-medium">
                            {planet.name} {planet.isRetro && <span className="text-[10px] text-red-500 font-bold">(R)</span>}
                         </td>
                         <td className="p-3">{planet.sign}</td>
                         <td className="p-3 text-right font-mono text-xs">{formatDMS(planet.longitude)}</td>
                         <td className="p-3 text-xs">{planet.nakshatra}</td>
                         <td className="p-3 text-center text-xs font-medium">
                            <span className={`px-2 py-0.5 rounded-full ${
                               planet.dignity === 'Exalted' || planet.dignity === 'Moolatrikona' ? 'bg-green-100 text-green-800' :
                               planet.dignity === 'Debilitated' ? 'bg-red-100 text-red-800' : 
                               planet.dignity === 'Own Sign' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                               {planet.dignity || "-"}
                            </span>
                         </td>
                         <td className="p-3 text-center text-xs">
                             <span className={`${
                                planet.nature === 'Functional Benefic' || planet.nature === 'Yoga Karaka' ? 'text-green-600 font-bold' :
                                planet.nature === 'Functional Malefic' ? 'text-red-500' : 'text-slate-500'
                             }`}>
                                {planet.nature === 'Yoga Karaka' ? '⭐ Y.K.' : 
                                 planet.nature === 'Functional Benefic' ? 'Benefic' :
                                 planet.nature === 'Functional Malefic' ? 'Malefic' : 'Neutral'}
                             </span>
                         </td>
                         <td className="p-3 text-center">
                            {planet.strength ? (
                               <div className="flex items-center justify-center gap-1" title={`${planet.strength}/100`}>
                                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                     <div 
                                        className={`h-full rounded-full ${
                                            planet.strength > 75 ? 'bg-green-500' : 
                                            planet.strength < 30 ? 'bg-red-500' : 'bg-yellow-500'
                                        }`} 
                                        style={{ width: `${planet.strength}%` }}
                                     />
                                  </div>
                               </div>
                            ) : "-"}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
             
             {/* Nakshatra Deep Dive Box */}
             {data.nakshatraInfo && (
                <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-6">
                   <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl">🌙</span>
                      <h4 className="font-bold text-indigo-900 uppercase tracking-widest text-sm">Janma Nakshatra Secrets</h4>
                   </div>
                   <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                         <div className="text-xs text-indigo-400 uppercase font-semibold mb-1">Nakshatra</div>
                         <div className="text-lg font-bold text-indigo-800">{data.nakshatraInfo.name}</div>
                      </div>
                      <div>
                         <div className="text-xs text-indigo-400 uppercase font-semibold mb-1">Meaning</div>
                         <div className="text-sm font-medium text-indigo-900">{data.nakshatraInfo.meaning}</div>
                      </div>
                      <div>
                         <div className="text-xs text-indigo-400 uppercase font-semibold mb-1">Deity</div>
                         <div className="text-sm font-medium text-indigo-900">{data.nakshatraInfo.deity}</div>
                      </div>
                      <div>
                         <div className="text-xs text-indigo-400 uppercase font-semibold mb-1">Quality</div>
                         <div className="text-sm font-medium text-indigo-900">{data.nakshatraInfo.quality}</div>
                      </div>
                   </div>
                   <div className="mt-4 pt-4 border-t border-indigo-100 text-sm italic text-indigo-700">
                      "Symbolized by <strong>{data.nakshatraInfo.symbol}</strong>, ruled by <strong>{data.nakshatraInfo.ruler}</strong>."
                   </div>
                </div>
             )}
            
            <div className="mt-8 grid grid-cols-2 gap-8">
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Avakahada Chakra</h4>
                  <div className="space-y-2 text-xs text-slate-600">
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Paya (Foot)</span> <span className="font-medium">Gold</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Varna</span> <span className="font-medium">Kshatriya</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Yoni</span> <span className="font-medium">Gaja</span>
                     </div>
                     <div className="flex justify-between pb-1">
                        <span>Gana</span> <span className="font-medium">Deva</span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                   <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Panchang</h4>
                   <div className="space-y-2 text-xs text-slate-600">
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Tithi</span> <span className="font-medium">{panchang.tithi}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Vara</span> <span className="font-medium">{panchang.vara}</span>
                     </div>
                     <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Nakshatra</span> <span className="font-medium">{panchang.nakshatra}</span>
                     </div>
                     <div className="flex justify-between pb-1">
                        <span>Yoga</span> <span className="font-medium">{panchang.yoga}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </PdfPage>
       
       {/* Page 3: Visual Charts & Remedies */}
       <PdfPage pageNumber={3} title="Analysis & Remedies">
            <div className="flex h-full flex-col">
                {/* Visual Chart moved to Page 3 for better layout if Dasha is long */}
                 {data.charts.D1 && (
                   <div className="flex flex-col items-center justify-center mb-8">
                      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Lagna Chart (D1)</h3>
                      <div className="w-96 h-96 p-4 bg-orange-50/30 rounded-xl border border-orange-100 flex items-center justify-center">
                         <NorthIndianChart 
                            planets={data.charts.D1.planets}
                            ascendantSign={Math.floor(data.charts.D1.ascendant / 30) + 1}
                         />
                      </div>
                   </div>
                )}
                
                {/* Divisional Charts D9 & D10 */}
                {(data.charts.D9 || data.charts.D10) && (
                   <div className="mb-8">
                      <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-blue-500 pl-3">
                         Divisional Charts
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {data.charts.D9 && (
                            <div className="flex flex-col items-center">
                               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Navamsa (D9)</h4>
                               <div className="w-full aspect-square max-w-[300px] p-2 bg-blue-50/30 rounded-lg border border-blue-100 flex items-center justify-center">
                                  <NorthIndianChart 
                                     planets={data.charts.D9.planets}
                                     ascendantSign={Math.floor(data.charts.D9.ascendant / 30) + 1}
                                  />
                               </div>
                            </div>
                         )}
                         {data.charts.D10 && (
                            <div className="flex flex-col items-center">
                               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Dasamsa (D10)</h4>
                               <div className="w-full aspect-square max-w-[300px] p-2 bg-purple-50/30 rounded-lg border border-purple-100 flex items-center justify-center">
                                  <NorthIndianChart 
                                     planets={data.charts.D10.planets}
                                     ascendantSign={Math.floor(data.charts.D10.ascendant / 30) + 1}
                                  />
                               </div>
                            </div>
                         )}
                      </div>
                   </div>
                )}
                
                {data.remedies && data.remedies.length > 0 && (
                   <div className="mt-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-6 border-l-4 border-purple-500 pl-3">
                         Curated Remedial Measures
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {data.remedies.slice(0, 6).map((rem, i) => ( // Show top 6 to fit
                            <div key={i} className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                               <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-bold uppercase text-purple-600 bg-white px-2 py-0.5 rounded border border-purple-200">
                                     {rem.type}
                                  </span>
                                  <span className="font-semibold text-slate-700 text-sm">{rem.planet}</span>
                               </div>
                               <p className="text-sm font-medium text-slate-900 mb-1">{rem.description}</p>
                               <p className="text-xs text-slate-500 italic">{rem.reason}</p>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
            </div>
       </PdfPage>
    </PdfContainer>
  );
}
