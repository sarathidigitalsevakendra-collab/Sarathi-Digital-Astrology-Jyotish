"use client";

import { useTranslations } from "next-intl";
import { Button } from "@digital-astrology/ui";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AstrologyBanner(): React.ReactElement {
  const t = useTranslations("sarathi.astrologyBanner");

  return (
    <section className="px-6 py-6 lg:px-16 max-w-4xl mx-auto mb-8">
      <div className="relative rounded-2xl overflow-hidden bg-orange-50/50 border border-orange-100 p-6 md:p-8 text-center flex flex-col items-center">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 p-4 opacity-30">
          <Sparkles className="w-12 h-12 text-orange-200" />
        </div>
        
        <h2 className="text-2xl font-semibold text-orange-900 mb-3 z-10">{t("title")}</h2>
        <p className="text-base text-orange-900/70 max-w-xl mb-6 z-10">
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
