import React from "react";
import { HoroscopeData } from "@/types/astrology/horoscope.types";

interface DailyHoroscopePanelProps {
  kundliId: string;
  data: HoroscopeData;
  className?: string;
}

export const DailyHoroscopePanel: React.FC<DailyHoroscopePanelProps> = ({
  data,
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Horoscope</h3>

      <div className="space-y-2">
        <p className="text-gray-700">Sign: {data.sunSign}</p>

        {data.text ? (
          <p className="text-gray-700 leading-relaxed">{data.text}</p>
        ) : (
          <p className="text-gray-500 italic">
            Personalized horoscope coming soon. This space is reserved for your daily reading.
          </p>
        )}
      </div>
    </div>
  );
};
