"use client";

import { MatchmakingResult } from "@/lib/astrology/calculations/Matchmaking";
import PdfContainer from "./PdfContainer";
import PdfPage from "./PdfPage";
import { ReportHeader } from "./ReportHeader";
import { ReportFooter } from "./ReportFooter";

interface MatchmakingReportProps {
  data: {
    result: MatchmakingResult;
    boy: { name: string; dateTime: string; location: string };
    girl: { name: string; dateTime: string; location: string };
  };
}

export default function MatchmakingReport({ data }: MatchmakingReportProps) {
  const { result, boy, girl } = data;
  const { totalScore, maxScore, verdict, kutas, mangalDosha, details } = result;

  return (
    <PdfContainer id="matchmaking-report-root">
      <PdfPage pageNumber={1} title="Compatibility Report">
         
         {/* Title Section */}
         <ReportHeader 
            title="Kundli Milan" 
            subtitle="Vedic Compatibility Analysis"
            icon="💑"
         />
         
         <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 text-xl font-medium text-slate-600">
               <span className="text-blue-600 font-bold">{boy.name}</span>
               <span className="text-slate-400">&</span>
               <span className="text-pink-600 font-bold">{girl.name}</span>
            </div>
         </div>

         {/* Side-by-Side Details */}
         <div className="grid grid-cols-2 gap-8 mb-10">
             {/* Boy */}
             <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h3 className="font-bold text-blue-800 mb-4 uppercase text-sm border-b border-blue-200 pb-2">Boy's Profile</h3>
                <div className="space-y-2 text-sm text-slate-700">
                   <div className="grid grid-cols-[80px_1fr]">
                      <span className="text-slate-500">Birth Date:</span>
                      <span className="font-medium">
                         {new Date(boy.dateTime).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                   </div>
                   <div className="grid grid-cols-[80px_1fr]">
                      <span className="text-slate-500">Birth Time:</span>
                      <span className="font-medium">
                         {new Date(boy.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <div className="grid grid-cols-[80px_1fr]">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium">{boy.location}</span>
                   </div>
                   <div className="grid grid-cols-[80px_1fr] mt-2 pt-2 border-t border-blue-200/50">
                      <span className="text-slate-500">Rashi:</span>
                      <span className="font-medium">{details?.boyRashi}</span>
                   </div>
                   <div className="grid grid-cols-[80px_1fr]">
                      <span className="text-slate-500">Nakshatra:</span>
                      <span className="font-medium">{details?.boyNakshatra}</span>
                   </div>
                </div>
             </div>

             {/* Girl */}
             <div className="bg-pink-50 p-6 rounded-xl border border-pink-100">
                <h3 className="font-bold text-pink-800 mb-4 uppercase text-sm border-b border-pink-200 pb-2">Girl's Profile</h3>
                <div className="space-y-2 text-sm text-slate-700">
                   <div className="grid grid-cols-[80px_1fr]">
                      <span className="text-slate-500">Birth Date:</span>
                      <span className="font-medium">
                         {new Date(girl.dateTime).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                   </div>
                   <div className="grid grid-cols-[80px_1fr]">
                      <span className="text-slate-500">Birth Time:</span>
                      <span className="font-medium">
                         {new Date(girl.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                   </div>
                   <div className="grid grid-cols-[80px_1fr]">
                      <span className="text-slate-500">Location:</span>
                      <span className="font-medium">{girl.location}</span>
                   </div>
                   <div className="grid grid-cols-[80px_1fr] mt-2 pt-2 border-t border-pink-200/50">
                      <span className="text-slate-500">Rashi:</span>
                      <span className="font-medium">{details?.girlRashi}</span>
                   </div>
                   <div className="grid grid-cols-[80px_1fr]">
                      <span className="text-slate-500">Nakshatra:</span>
                      <span className="font-medium">{details?.girlNakshatra}</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Score Verdict */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 mb-8 text-center">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-2">Final Compatibility Score</h3>
              <div className="flex items-end justify-center gap-2 mb-4">
                 <span className="text-6xl font-bold text-slate-800">{totalScore}</span>
                 <span className="text-2xl text-slate-400 mb-2">/ {maxScore}</span>
              </div>
              
              <div className={`inline-block px-6 py-2 rounded-full font-bold text-white mb-4 ${
                 verdict === 'Excellent' ? 'bg-emerald-500' :
                 verdict === 'Good' ? 'bg-green-500' :
                 verdict === 'Average' ? 'bg-yellow-500' : 'bg-red-500'
              }`}>
                 Verdict: {verdict}
              </div>
              
              <p className="text-slate-600 text-sm max-w-lg mx-auto">
                 {result.mangalDosha.match === "Safe" 
                    ? "Mangal Dosha check is satisfactory."
                    : "Mangal Dosha issues detected. Proceed with caution."}
              </p>
          </div>

          <ReportFooter />
       </PdfPage>

       <PdfPage pageNumber={2} title="Ashta Kuta Breakdown">
           <div className="bg-white">
              <h3 className="text-xl font-bold text-slate-800 mb-6 border-l-4 border-purple-500 pl-4">
                 Detailed Analysis
              </h3>

              <table className="w-full text-sm rounded-lg overflow-hidden border border-slate-200 table-fixed">
                 <thead className="bg-slate-100 text-slate-700">
                    <tr>
                       <th className="p-4 text-left font-bold w-1/4">Attribute (Kuta)</th>
                       <th className="p-4 text-left font-bold w-1/2">Description</th>
                       <th className="p-4 text-right font-bold w-[12.5%]">Obtained</th>
                       <th className="p-4 text-right font-bold w-[12.5%]">Total</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {kutas.map((k, i) => (
                       <tr key={i} className="even:bg-slate-50">
                          <td className="p-4 font-semibold text-slate-800">{k.name}</td>
                          <td className="p-4 text-slate-600">{k.description}</td>
                          <td className={`p-4 text-right font-bold ${
                             k.score === k.total ? 'text-green-600' : k.score === 0 ? 'text-red-600' : 'text-slate-700'
                          }`}>
                             {k.score}
                          </td>
                          <td className="p-4 text-right text-slate-400">{k.total}</td>
                       </tr>
                    ))}
                 </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-200">
                   <tr>
                      <td colSpan={2} className="p-4 text-right">Grand Total</td>
                      <td className="p-4 text-right text-lg text-slate-900">{totalScore}</td>
                      <td className="p-4 text-right text-lg text-slate-500">{maxScore}</td>
                   </tr>
                </tfoot>
             </table>
             
             <div className="mt-8 p-6 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-bold text-orange-800 mb-2">Mangal Dosha Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                       <p className="text-slate-500 text-xs uppercase">Boy</p>
                       <p className="font-medium text-slate-800">
                          {mangalDosha.boy.hasDosha ? (mangalDosha.boy.isCancelled ? "Dosha Cancelled" : "Dosha Present") : "Safe"}
                       </p>
                    </div>
                    <div>
                       <p className="text-slate-500 text-xs uppercase">Girl</p>
                       <p className="font-medium text-slate-800">
                          {mangalDosha.girl.hasDosha ? (mangalDosha.girl.isCancelled ? "Dosha Cancelled" : "Dosha Present") : "Safe"}
                       </p>
                    </div>
                </div>
             </div>
          </div>
      </PdfPage>
    </PdfContainer>
  );
}
