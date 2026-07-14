"use client";

import { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

const OPTIONS = [
  { code: "en", label: "EN", icon: "🌐" },
  { code: "hi", label: "हिं", icon: "🇮🇳" },
  { code: "mr", label: "मर", icon: "🇮🇳" },
] as const;

export default function LocaleSwitcher(): React.ReactElement {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
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

  const handleSelect = (code: string) => {
    setIsOpen(false);
    if (!pathname) return;
    const segments = pathname.split('/');
    if (segments.length > 1) {
      segments[1] = code;
    }
    router.push(segments.join('/'));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100 hover:text-blue-900"
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
        <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-xl z-50">
          <div className="p-1">
            {OPTIONS.map((option) => (
              <button
                key={option.code}
                type="button"
                onClick={() => handleSelect(option.code)}
                className={clsx(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition",
                  locale === option.code
                    ? "bg-blue-50 text-blue-900 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-blue-900",
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
