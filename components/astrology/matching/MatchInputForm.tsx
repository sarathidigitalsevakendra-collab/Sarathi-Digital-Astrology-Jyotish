"use client";

import { useState } from "react";
import DateTimePicker from "../datetime-picker";
import LocationPicker from "../location-picker";

export interface MatchProfile {
  name: string;
  dateTime: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: number;
}

interface MatchInputFormProps {
  loading: boolean;
  onSubmit: (boy: MatchProfile, girl: MatchProfile) => void;
}

const DEFAULT_PROFILE: MatchProfile = {
  name: "",
  dateTime: "",
  location: "",
  latitude: 0,
  longitude: 0,
  timezone: 5.5,
};

export default function MatchInputForm({ loading, onSubmit }: MatchInputFormProps) {
  const [boy, setBoy] = useState<MatchProfile>({ ...DEFAULT_PROFILE, name: "Boy" });
  const [girl, setGirl] = useState<MatchProfile>({ ...DEFAULT_PROFILE, name: "Girl" });
  const [activeTab, setActiveTab] = useState<"boy" | "girl">("boy");

  const isValid = 
    boy.dateTime && boy.latitude && boy.longitude &&
    girl.dateTime && girl.latitude && girl.longitude;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !loading) {
      onSubmit(boy, girl);
    }
  };

  const renderProfileInput = (profile: MatchProfile, setProfile: (p: MatchProfile) => void, label: string) => (
    <div className="space-y-6">
       <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">{label} Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 transition focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            placeholder={`Enter ${label} Name`}
          />
       </div>
       
       <DateTimePicker
         value={profile.dateTime}
         onChange={(iso) => setProfile({ ...profile, dateTime: iso })}
         showHelp={false}
       />
       
       <LocationPicker
         value={{
            city: profile.location,
            latitude: profile.latitude,
            longitude: profile.longitude,
            timezone: profile.timezone
         }}
         onChange={(loc) => setProfile({
            ...profile,
            location: loc.city,
            latitude: loc.latitude,
            longitude: loc.longitude,
            timezone: loc.timezone
         })}
       />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Mobile Tabs */}
      <div className="flex rounded-lg bg-white/5 p-1 sm:hidden">
        <button
          type="button"
          onClick={() => setActiveTab("boy")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            activeTab === "boy" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          ♂ Boy
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("girl")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            activeTab === "girl" ? "bg-pink-600 text-white shadow" : "text-slate-400 hover:text-white"
          }`}
        >
          ♀ Girl
        </button>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {/* Boy Section */}
        <div className={`space-y-4 ${activeTab === "boy" ? "block" : "hidden sm:block"}`}>
           <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">♂</span>
              <h3 className="text-lg font-semibold text-white">Boy's Details</h3>
           </div>
           {renderProfileInput(boy, setBoy, "Boy")}
        </div>

        {/* Girl Section */}
        <div className={`space-y-4 ${activeTab === "girl" ? "block" : "hidden sm:block"}`}>
           <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/20 text-pink-400">♀</span>
              <h3 className="text-lg font-semibold text-white">Girl's Details</h3>
           </div>
           {renderProfileInput(girl, setGirl, "Girl")}
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-pink-600 py-4 font-bold text-white shadow-lg shadow-purple-500/25 transition hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
             <span className="flex items-center justify-center gap-2">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                Calculating Match...
             </span>
          ) : (
             "Check Compatibility"
          )}
        </button>
      </div>
    </form>
  );
}
