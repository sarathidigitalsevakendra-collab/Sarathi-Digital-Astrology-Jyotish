"use client";

import Image from "next/image";
import { Button } from "@digital-astrology/ui";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ConsultationCTA(): React.ReactElement {
  const t = useTranslations("consultation");

  return (
    <section className="px-6 lg:px-16">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-900/60 via-purple-800/50 to-rose-900/60 p-6 md:p-10 shadow-astro backdrop-blur">
        <Image
          src="https://images.unsplash.com/photo-1574068468668-a05a11f871da?auto=format&fit=crop&w=1200&q=80"
          alt="Astrologer consultation"
          fill
          className="pointer-events-none -z-10 object-cover opacity-20 md:opacity-30 hidden md:block"
        />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-white">{t("title")}</h2>
            <p className="mt-3 text-sm md:text-base text-slate-200">{t("description")}</p>
            <ul className="mt-6 grid gap-x-6 gap-y-3 text-base text-slate-100 md:grid-cols-2">
              <li className="flex items-center gap-2"><span className="text-green-400 font-bold text-lg">✅</span> KP, Nadi, Prashna, Tarot specialists</li>
              <li className="flex items-center gap-2"><span className="text-green-400 font-bold text-lg">✅</span> Support in हिंदी, English, தமிழ், తెలుగు</li>
              <li className="flex items-center gap-2"><span className="text-green-400 font-bold text-lg">✅</span> Audio/Video call recordings available</li>
              <li className="flex items-center gap-2"><span className="text-green-400 font-bold text-lg">✅</span> Secure Jyotishya wallet & UPI</li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-4">
               <Button asChild className="h-12 w-full sm:w-auto hover:scale-105 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-200 text-base">
                 <Link href="/consultations">{t("explore")}</Link>
               </Button>
               <Button variant="secondary" asChild className="h-12 w-full sm:w-auto hover:bg-white/10 hover:border-white/40 hover:scale-105 transition-all duration-200 text-base border-white/20 bg-transparent border">
                 <Link href="/consultations?intent=book">{t("book")}</Link>
               </Button>
            </div>
            <p className="text-xs text-center sm:text-left text-slate-300 pl-1">Starting at <span className="text-white font-medium">₹99/min</span></p>
          </div>
        </div>
      </div>
    </section>
  );
}
