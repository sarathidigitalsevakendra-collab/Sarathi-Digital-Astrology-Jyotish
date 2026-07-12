"use client";

import Image from "next/image";
import { Button } from "@digital-astrology/ui";

export default function MobileAppSection(): React.ReactElement {
  return (
    <section className="px-6 lg:px-16" id="install-app">
      <div className="grid items-center gap-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-[#1a1036] via-[#25174c] to-[#301d5e] px-8 py-12 shadow-astro lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-semibold text-white">Install Jyotishya App</h2>
          <p className="mt-3 text-sm text-slate-200">
            Get instant access to your daily horoscope, personalized dosha remedies, and astrologer
            consultations directly from your home screen. Works offline and saves data.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Button size="sm" onClick={() => window.alert('Tap "Share" then "Add to Home Screen" to install!')}>
              Install App
            </Button>
            <Button size="sm" variant="secondary" asChild>
              <a href="/manifest.json" target="_blank">View Manifest</a>
            </Button>
          </div>
        </div>
        <div className="relative mx-auto h-72 w-40">
          <Image
            src="/icons/icon-512x512.png"
            alt="Jyotishya PWA Icon"
            fill
            className="rounded-[32px] border-4 border-white/20 object-cover shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
