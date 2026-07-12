
import { BirthChartInterpretationOutput } from "@/lib/interpretation/birth-chart-types";

interface InterpretationModalProps {
  interpretation: BirthChartInterpretationOutput | null;
  loading: boolean;
  onClose: () => void;
  onGenerate: () => void;
  isOpen: boolean;
}

export default function InterpretationModal({
  interpretation,
  loading,
  onClose,
  onGenerate,
  isOpen
}: InterpretationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-slate-900/95 border-b border-white/10 backdrop-blur">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            ✨ AI Chart Interpretation
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors uppercase text-xs font-bold tracking-wider"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-6">
          {!interpretation && !loading && (
            <div className="text-center py-10">
              <div className="text-5xl mb-4">🔮</div>
              <h4 className="text-lg font-medium text-white mb-2">Unlock Your Cosmic Blueprint</h4>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Get a personalized analysis of your birth chart using advanced AI. 
                Discover your core strengths, karmic lessons, and practical remedies.
              </p>
              <button
                onClick={onGenerate}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl text-white font-semibold shadow-lg shadow-purple-600/25 hover:shadow-xl transition-all"
              >
                Reveal Insights
              </button>
            </div>
          )}

          {loading && !interpretation && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-indigo-200 animate-pulse">Connecting to cosmic intelligence...</p>
            </div>
          )}

          {interpretation && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {loading && (
                 <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 animate-pulse mb-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                    Thinking...
                 </div>
              )}

              {/* Narrative */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Overview</h4>
                <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                  {interpretation.narrative}
                </p>
              </div>

              {/* Strengths */}
              {interpretation.strengths && interpretation.strengths.length > 0 && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>💪</span> Key Strengths
                  </h4>
                  <ul className="space-y-2">
                    {interpretation.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-2 text-green-100 text-sm">
                        <span className="mt-1 text-green-500">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Challenges */}
              {interpretation.challenges && interpretation.challenges.length > 0 && (
                <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>⚠️</span> Karmic Lessons
                  </h4>
                  <ul className="space-y-2">
                    {interpretation.challenges.map((chal, i) => (
                      <li key={i} className="flex items-start gap-2 text-orange-100 text-sm">
                        <span className="mt-1 text-orange-500">•</span>
                        <span>{chal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Remedies */}
              {interpretation.remedies && interpretation.remedies.length > 0 && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-5">
                  <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span>🕉️</span> Vedic Remedies
                  </h4>
                  <ul className="space-y-2">
                    {interpretation.remedies.map((rem, i) => (
                      <li key={i} className="flex items-start gap-2 text-purple-100 text-sm">
                        <span className="mt-1 text-purple-500">•</span>
                        <span>{rem}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="pt-4 text-center">
                 <p className="text-xs text-slate-500">
                    Generated by AI based on Vedic principles. For major life decisions, please consult a professional astrologer.
                 </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
