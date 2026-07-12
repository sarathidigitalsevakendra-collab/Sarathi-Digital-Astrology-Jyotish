"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const SUPPORTED_LOCALES = ["en", "hi", "ta"] as const;

type Locale = (typeof SUPPORTED_LOCALES)[number];

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  copy: (typeof translations)[Locale];
};

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

const STORAGE_KEY = "jyotishya-locale";

const translations = {
  en: {
    nav: {
      links: {
        home: "Home",
        consult: "Consult",
        dashboard: "Dashboard",
        match: "Matchmaking",
        transits: "Transits",
        reports: "Reports",
        shop: "Marketplace",
        store: "Store"
      },
      actions: { signIn: "Sign In", book: "Book Muhurat" },
    },
    hero: {
      alert: "Shubh Muhurat alerts daily",
      title: "Decode your destiny with trusted Bharatiya astrology",
      description:
        "Personalised guidance for career, marriage, health and wealth from verified astrologers in Hindi & English.",
      primaryCta: "Generate Free Kundli",
      secondaryCta: "Consult Now",
      badge1: { title: "Acharya Anjali online", subtitle: "Free first 3 mins" },
      badge2: { title: "Festival Panchang 2024", subtitle: "Ekadashi • Chaturthi • Ekam" },
    },
    consultation: {
      title: "Live astrologers, 24x7 guidance",
      description:
        "Connect instantly via chat, voice or video. Verified experts with ratings, language preference, and specialisation filters.",
      explore: "Explore Experts",
      book: "Book Muhurat",
    },
  },
  hi: {
    nav: {
      links: {
        home: "होम",
        consult: "परामर्श",
        dashboard: "डैशबोर्ड",
        match: "कुंडली मिलान",
        transits: "गोचर",
        reports: "रिपोर्ट्स",
        shop: "मार्केटप्लेस",
        store: "स्टोर"
      },
      actions: { signIn: "साइन इन", book: "मुहूर्त बुक करें" },
    },
    hero: {
      alert: "दैनिक शुभ मुहूर्त अलर्ट",
      title: "विश्वसनीय भारतीय ज्योतिष के साथ अपनी नियति समझें",
      description:
        "कैरियर, विवाह, स्वास्थ्य और धन के लिए व्यक्तिगत मार्गदर्शन। प्रमाणित ज्योतिषी हिंदी व अंग्रेज़ी में उपलब्ध।",
      primaryCta: "फ्री कुंडली बनाएं",
      secondaryCta: "अभी सलाह लें",
      badge1: { title: "आचार्या अंजलि ऑनलाइन", subtitle: "पहले 3 मिनट मुफ्त" },
      badge2: { title: "त्योहार पंचांग 2024", subtitle: "एकादशी • चतुर्थी • एकम" },
    },
    consultation: {
      title: "लाइव ज्योतिषी, 24x7 मार्गदर्शन",
      description:
        "चैट, वॉइस या वीडियो से तुरंत जुड़ें। रेटिंग और भाषा पसंद के साथ सत्यापित विशेषज्ञ।",
      explore: "विशेषज्ञ देखें",
      book: "मुहूर्त बुक करें",
    },
  },
  ta: {
    nav: {
      links: {
        home: "முகப்பு",
        consult: "ஆலோசனை",
        dashboard: "டாஷ்போர்டு",
        match: "பொருத்தம்",
        transits: "கோச்சாரம்",
        reports: "அறிக்கைகள்",
        shop: "மார்க்கெட்ப்ளேஸ்",
        store: "ஸ்டோர்",
      },
      actions: { signIn: "உள்நுழை", book: "முஹூர்த்தம் புக்" },
    },
    hero: {
      alert: "தினமும் சுப முகூர்த்த அறிவிப்புகள்",
      title: "நம்பகமான பாரதிய ஜ்யோதிஷத்துடன் உங்கள் விதியை அறியுங்கள்",
      description:
        "தொழில், திருமணம், ஆரோக்கியம், செல்வம் ஆகிய அனைத்திற்கும் அனுபவமுள்ள ஜோதிடர்களிடமிருந்து தமிழ் & ஆங்கிலத்தில் வழிகாட்டுதல்.",
      primaryCta: "இலவச குண்டலி உருவாக்கு",
      secondaryCta: "இப்போது ஆலோசிக்க",
      badge1: { title: "ஆசாரியா அஞ்சலி ஆன்லைன்", subtitle: "முதல் 3 நிமிடங்கள் இலவசம்" },
      badge2: { title: "திருவிழா பஞ்சாங்கம் 2024", subtitle: "ஏகாதசி • சதுர்த்தி • ஏகம்" },
    },
    consultation: {
      title: "நேரடி ஜோதிடர்கள், 24x7 உதவி",
      description:
        "உடனடி உரையாடல், குரல் அல்லது வீடியோ இணைப்பு. மதிப்பீடு செய்யப்பட்ட நிபுணர்கள் பல மொழிகளில் கிடைக்கின்றனர்.",
      explore: "நிபுணர்களை பார்வையிடு",
      book: "முஹூர்த்தம் புக்",
    },
  },
} as const;

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function IntlProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) {
      setLocale(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, setLocale, copy: translations[locale] }),
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocaleContext must be used within IntlProvider");
  }
  return context;
}
