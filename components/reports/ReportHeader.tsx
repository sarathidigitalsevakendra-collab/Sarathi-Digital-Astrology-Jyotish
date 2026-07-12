
import React from 'react';

interface ReportHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ title, subtitle, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center mb-8 border-b-2 border-orange-100 pb-6 w-full">
      <div className="flex items-center gap-3 mb-2">
         {icon && <span className="text-4xl">{icon}</span>}
         <h1 className="text-3xl font-bold text-slate-800 uppercase tracking-widest font-serif">{title}</h1>
      </div>
      
      {subtitle && <p className="text-slate-500 font-medium uppercase tracking-wide text-xs">{subtitle}</p>}
      
      <div className="mt-4 flex items-center justify-center gap-2">
         <div className="h-0.5 w-12 bg-orange-400"></div>
         <span className="text-orange-600 font-bold text-xs uppercase">Jyotishya Digital</span>
         <div className="h-0.5 w-12 bg-orange-400"></div>
      </div>
    </div>
  );
};
