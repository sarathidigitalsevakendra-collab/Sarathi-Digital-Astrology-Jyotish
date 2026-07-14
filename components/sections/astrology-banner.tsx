"use client";

import { useTranslations } from "next-intl";
import { Button } from "@digital-astrology/ui";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AstrologyBanner(): React.ReactElement {
  const t = useTranslations("sarathi.astrologyBanner");

  return (
    <section className="px-6 py-6 lg:px-16 max-w-4xl mx-auto mb-8">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 shadow-md p-6 md:p-10 text-center flex flex-col items-center">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-50">
          <Sparkles className="w-16 h-16 text-orange-300" />
        </div>
        
        <h2 className="text-3xl font-bold text-orange-950 mb-4 z-10">{t("title")}</h2>
        <p className="text-lg text-orange-900 font-medium max-w-xl mb-8 z-10">
          {t("subtitle")}
        </p>
        
        <Link href="/astrology">
            <Button className="hover:scale-105 transition-transform duration-200 min-h-[44px] bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm">
              {t("cta")}
          </Button>
        </Link>
      </div>
    </section>
  );
}
