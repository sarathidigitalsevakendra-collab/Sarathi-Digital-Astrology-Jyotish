"use client";

import { useState, useEffect } from "react";

interface DateTimePickerProps {
  value: string; // ISO datetime string
  onChange: (isoDatetime: string) => void;
  showHelp?: boolean;
}

export default function DateTimePicker({ value, onChange, showHelp = true }: DateTimePickerProps) {
  // Parse ISO datetime into date and time strings for inputs
  const parseISOToInputs = (iso: string): { date: string; time: string } => {
    if (!iso) return { date: "", time: "" };

    try {
      const dt = new Date(iso);
      if (isNaN(dt.getTime())) return { date: "", time: "" };

      // Format as YYYY-MM-DD for date input
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      const date = `${year}-${month}-${day}`;

      // Format as HH:MM for time input
      const hours = String(dt.getHours()).padStart(2, "0");
      const minutes = String(dt.getMinutes()).padStart(2, "0");
      const time = `${hours}:${minutes}`;

      return { date, time };
    } catch {
      return { date: "", time: "" };
    }
  };

  const { date: initialDate, time: initialTime } = parseISOToInputs(value);
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [errors, setErrors] = useState<{ date?: string; time?: string }>({});

  // Validation
  const validateInputs = (dateValue: string, timeValue: string): boolean => {
    const newErrors: { date?: string; time?: string } = {};

    if (dateValue) {
      const selectedDate = new Date(dateValue);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      if (selectedDate > today) {
        newErrors.date = "Birth date cannot be in the future";
      }
    }

    if (timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      if (
        hours === undefined ||
        minutes === undefined ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
      ) {
        newErrors.time = "Invalid time format";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setDate(newDate);

    // Only update parent if both date and time are valid
    if (newDate && time && validateInputs(newDate, time)) {
      const isoString = new Date(`${newDate}T${time}:00`).toISOString();
      onChange(isoString);
    }
  };

  // Handle time change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);

    // Only update parent if both date and time are valid
    if (date && newTime && validateInputs(date, newTime)) {
      const isoString = new Date(`${date}T${newTime}:00`).toISOString();
      onChange(isoString);
    }
  };

  // Sync with external value changes (e.g., quick-select buttons)
  useEffect(() => {
    if (value) {
      const parsed = parseISOToInputs(value);
      if (parsed.date !== date || parsed.time !== time) {
        setDate(parsed.date);
        setTime(parsed.time);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // Only re-run when value prop changes

  // Get today's date for max attribute
  const today = new Date().toISOString().split("T")[0];

  // Check if form is valid
  const isValid = date && time && Object.keys(errors).length === 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <label className="flex items-center gap-2 text-sm font-medium text-purple-200">
        <span className="text-lg">📅</span>
        Birth Date & Time
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Date Input */}
        <div>
          <label htmlFor="birth-date" className="mb-2 block text-sm text-slate-300">
            Date of Birth <span className="text-red-400">*</span>
          </label>
          <input
            id="birth-date"
            type="date"
            value={date}
            onChange={handleDateChange}
            max={today}
            className={`w-full rounded-lg border px-4 py-3 text-white focus:outline-none focus:ring-2 [color-scheme:dark] ${
              errors.date
                ? "border-red-500 bg-red-500/10 focus:ring-red-500"
                : "border-white/20 bg-white/10 focus:border-orange-400 focus:ring-orange-400"
            }`}
            required
          />
          {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date}</p>}
          {showHelp && !errors.date && (
            <p className="mt-1 text-xs text-slate-400">Format: DD/MM/YYYY</p>
          )}
        </div>

        {/* Time Input */}
        <div>
          <label htmlFor="birth-time" className="mb-2 block text-sm text-slate-300">
            Time of Birth (24-hour) <span className="text-red-400">*</span>
          </label>
          <input
            id="birth-time"
            type="time"
            value={time}
            onChange={handleTimeChange}
            className={`w-full rounded-lg border px-4 py-3 text-white focus:outline-none focus:ring-2 [color-scheme:dark] ${
              errors.time
                ? "border-red-500 bg-red-500/10 focus:ring-red-500"
                : "border-white/20 bg-white/10 focus:border-orange-400 focus:ring-orange-400"
            }`}
            required
          />
          {errors.time && <p className="mt-1 text-xs text-red-400">{errors.time}</p>}
          {showHelp && !errors.time && (
            <p className="mt-1 text-xs text-slate-400">Format: HH:MM (e.g., 14:30 for 2:30 PM)</p>
          )}
        </div>
      </div>

      {/* Preview */}
      {isValid && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
          <p className="text-xs text-green-300">✓ Selected Date & Time:</p>
          <p className="mt-1 font-semibold text-white">
            {new Date(`${date}T${time}:00`).toLocaleString("en-US", {
              dateStyle: "full",
              timeStyle: "short",
              hour12: true,
            })}
          </p>
        </div>
      )}

      {/* Tips */}
      {showHelp && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
          <p className="mb-2 text-xs font-semibold text-blue-200">📌 Important Tips:</p>
          <ul className="space-y-1 text-xs text-blue-300">
            <li>
              • Check your <strong>birth certificate</strong> for exact time
            </li>
            <li>• Even 2-3 minutes difference can change your chart</li>
            <li>
              • Use 24-hour format: <strong>14:30</strong> = 2:30 PM, <strong>02:30</strong> = 2:30
              AM
            </li>
            <li>
              • If you don&apos;t know exact time, use <strong>12:00</strong> (noon) as estimate
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
