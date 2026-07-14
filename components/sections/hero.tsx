"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@digital-astrology/ui";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Hero(): React.ReactElement {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden px-6 pt-24 lg:px-16">
      <Image
        className="pointer-events-none absolute right-[-12rem] top-[-6rem] hidden opacity-30 blur-0 lg:block"
        src="https://images.unsplash.com/photo-1604014230599-4b3d5d2d9a7d?auto=format&fit=crop&w=1200&q=80"
        alt="Indian astrologer reading a birth chart"
        width={720}
        height={720}
        priority
      />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-950/30 px-4 py-2 text-base font-medium uppercase tracking-[0.3em] text-orange-200">
          <span>🔔</span> {t("alert")}
        </div>
        <h1 className="mt-6 bg-gradient-to-r from-orange-300 via-pink-300 to-purple-300 bg-clip-text text-4xl font-extrabold text-transparent sm:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-sm text-slate-400 font-medium">Join 2M+ seekers trusted by Bharat</p>
        <p className="mt-6 max-w-2xl text-lg text-slate-300">{t("description")}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild className="hover:scale-105 transition-transform duration-200 min-h-[44px]">
            <Link href="/dashboard">{t("primaryCta")}</Link>
          </Button>
          <Button asChild variant="secondary" className="hover:scale-105 transition-transform duration-200 min-h-[44px]">
            <Link href="/consultations">{t("secondaryCta")}</Link>
          </Button>
        </div>
        <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-300">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors duration-300 cursor-default">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500/40 to-pink-500/40 flex items-center justify-center text-xl">🕉️</div>
            <div>
              <p className="text-sm font-semibold text-white">{t("badge1.title")}</p>
              <p className="text-xs text-slate-400">{t("badge1.subtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition-colors duration-300 cursor-default">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500/40 to-blue-500/40 flex items-center justify-center text-xl">✨</div>
            <div>
              <p className="text-sm font-semibold text-white">{t("badge2.title")}</p>
              <p className="text-xs text-slate-400">{t("badge2.subtitle")}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
