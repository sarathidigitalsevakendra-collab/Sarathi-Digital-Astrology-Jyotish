"use client";

import { useTranslations } from "next-intl";
import { Button } from "@digital-astrology/ui";
import { motion } from "framer-motion";
import { MapPin, MessageCircle, CheckCircle } from "lucide-react";
import Image from "next/image";

export default function SarathiHero(): React.ReactElement {
  const t = useTranslations("sarathi.hero");
  const phone = "919372148452";
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(t("whatsappText"))}`;
  const mapsUrl = "https://maps.google.com/?q=Sarathi+Digital+Seva+Kendra+Bhayandar+East";

  return (
    <section className="relative overflow-hidden px-6 pt-24 lg:px-16 pb-12 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-12"
        >
          <h1 className="text-blue-900 text-4xl font-extrabold sm:text-5xl lg:text-6xl leading-tight">
            {t("title")}
          </h1>
          <p className="mt-6 text-xl text-slate-600 font-medium">
            {t("subtitle")}
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-base text-slate-700">
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> {t("bullet1")}</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> {t("bullet2")}</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /> {t("bullet3")}</span>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <Button className="hover:scale-105 transition-transform duration-200 min-h-[48px] bg-[#25D366] hover:bg-[#128C7E] text-white flex items-center gap-2 shadow-sm px-6">
                <MessageCircle className="w-5 h-5" />
                {t("ctaPrimary")}
              </Button>
            </a>
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" className="hover:scale-105 transition-transform duration-200 min-h-[48px] bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-slate-50 text-slate-800 shadow-sm flex items-center gap-2 px-6">
                <MapPin className="w-5 h-5 text-blue-600" />
                {t("ctaSecondary")}
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full aspect-[2.4/1] rounded-3xl overflow-hidden shadow-xl border border-white"
        >
          <Image 
            src="/shop/csc-generic-banner.png" 
            alt="CSC Digital India Services Banner"
            fill
            priority
            className="object-contain bg-white"
          />
        </motion.div>
      </div>
    </section>
  );
}
