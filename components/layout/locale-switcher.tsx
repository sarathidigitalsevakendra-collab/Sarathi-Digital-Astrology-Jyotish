"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { useLocaleContext } from "@components/providers/intl-provider";

const OPTIONS = [
  { code: "en", label: "EN", icon: "🌐" },
  { code: "hi", label: "हिं", icon: "🇮🇳" },
  { code: "ta", label: "தமிழ்", icon: "🇮🇳" },
] as const;

export default function LocaleSwitcher(): React.ReactElement {
  const { locale, setLocale } = useLocaleContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = OPTIONS.find((opt) => opt.code === locale) || OPTIONS[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  const handleSelect = (code: "en" | "hi" | "ta") => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10 hover:text-white"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="text-base">{currentOption.icon}</span>
        <span className="font-medium">{currentOption.label}</span>
        <svg
          className={clsx("h-4 w-4 transition-transform", isOpen && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-white/10 bg-[#0a0f1e]/95 backdrop-blur-xl shadow-xl">
          <div className="p-1">
            {OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => handleSelect(option.code)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition",
                  locale === option.code
                    ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                    : "text-slate-200 hover:bg-white/10 hover:text-white",
                )}
              >
                <span className="text-base">{option.icon}</span>
                <span className="font-medium">{option.label}</span>
                {locale === option.code && (
                  <svg className="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
