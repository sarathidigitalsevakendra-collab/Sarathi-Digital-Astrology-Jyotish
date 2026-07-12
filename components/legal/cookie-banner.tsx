"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import Link from "next/link";

// Type definitions for third-party analytics
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, string>) => void;
    va?: (event: string, name: string, params: Record<string, boolean | string>) => void;
  }
}

const COOKIE_CONSENT_KEY = "jyotishya-cookie-consent";
const CONSENT_VERSION = "1.0"; // Increment when cookie policy changes

interface CookieConsent {
  accepted: boolean;
  version: string;
  timestamp: string;
}

export function CookieBanner() {
  const [show, setShow] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);

    if (storedConsent) {
      try {
        const consent: CookieConsent = JSON.parse(storedConsent);

        // Show banner again if consent version has changed
        if (consent.version !== CONSENT_VERSION) {
          setShow(true);
          setTimeout(() => setIsVisible(true), 100); // Trigger animation
        } else if (consent.accepted) {
          // User has accepted - enable analytics
          enableAnalytics();
        }
      } catch {
        // Invalid consent data - show banner
        setShow(true);
        setTimeout(() => setIsVisible(true), 100);
      }
    } else {
      // No consent stored - show banner
      setShow(true);
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const acceptCookies = () => {
    const consent: CookieConsent = {
      accepted: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));

    // Enable analytics
    enableAnalytics();

    // Hide banner with animation
    setIsVisible(false);
    setTimeout(() => setShow(false), 300);
  };

  const rejectCookies = () => {
    const consent: CookieConsent = {
      accepted: false,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));

    // Disable analytics
    disableAnalytics();

    // Hide banner with animation
    setIsVisible(false);
    setTimeout(() => setShow(false), 300);
  };

  const enableAnalytics = () => {
    // Enable Vercel Analytics
    if (typeof window !== "undefined" && window.va) {
      window.va("event", "cookie_consent", { accepted: true });
    }

    // Enable Google Analytics (if configured)
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied", // We don't use ads
      });
    }
  };

  const disableAnalytics = () => {
    // Disable Google Analytics
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    }
  };

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent banner"
    >
      <div className="bg-gray-900 dark:bg-gray-950 border-t border-gray-700 shadow-2xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Message */}
            <div className="flex-1 text-sm text-gray-100 dark:text-gray-200">
              <p className="mb-2">
                <strong>We value your privacy</strong>
              </p>
              <p className="text-gray-300 dark:text-gray-400">
                We use essential cookies to make our site work. With your consent, we may also use
                non-essential cookies to improve user experience and analyze website traffic. By
                clicking "Accept", you agree to our website's cookie use as described in our{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-white transition-colors"
                  onClick={() => {
                    // Track privacy policy click
                    if (typeof window !== "undefined" && window.va) {
                      window.va("event", "privacy_policy_click", { source: "cookie_banner" });
                    }
                  }}
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={rejectCookies}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
                aria-label="Reject cookies"
              >
                Reject
              </button>
              <button
                onClick={acceptCookies}
                className="flex-1 sm:flex-none px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 rounded-lg shadow-lg transition-all"
                aria-label="Accept cookies"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dismiss button (optional) */}
      <button
        onClick={rejectCookies}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white transition-colors"
        aria-label="Close cookie banner"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

// Export helper to check if user has consented
export function hasConsentedToCookies(): boolean {
  if (typeof window === "undefined") return false;

  const storedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
  if (!storedConsent) return false;

  try {
    const consent: CookieConsent = JSON.parse(storedConsent);
    return consent.accepted && consent.version === CONSENT_VERSION;
  } catch {
    return false;
  }
}

// Export helper to reset consent (for testing or user preference changes)
export function resetCookieConsent(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.location.reload();
  }
}
