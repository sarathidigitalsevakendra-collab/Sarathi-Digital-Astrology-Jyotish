"use client";

import { houseMeanings } from "@/constants/astrology/meanings";

export default function HousesGuide(): React.ReactElement {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
        <span className="text-2xl">🏠</span>
        The 12 Houses
      </h3>

      <p className="mb-5 text-sm text-slate-400">
        Each house governs a different area of your life
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(houseMeanings).map(([houseNum, house]) => (
          <div
            key={houseNum}
            className="group rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
            title={house.meaning}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-purple-300">{house.lifeArea}</p>
                <p className="mt-1 text-sm font-semibold text-white">{house.name}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{house.meaning}</p>
              </div>

              <span className="ml-2 text-xl opacity-40 transition-opacity group-hover:opacity-100">
                {parseInt(houseNum) === 1
                  ? "👤"
                  : parseInt(houseNum) === 7
                    ? "💑"
                    : parseInt(houseNum) === 10
                      ? "💼"
                      : "🏠"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
