import "@/lib/fonts/index.css";
import "../globals.css";
import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { LocalBusinessSchema } from "@/components/seo/local-business-schema";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { QueryProvider } from "@components/providers/query-provider";
import AuthListenerProvider from "@components/providers/auth-listener-provider";
import "@/lib/env"; // Validate environment variables at startup
import { ToastProvider } from "@components/ui/toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  title: "Sarathi Digital Seva Kendra | Government & Digital Services",
  description: "Visit Sarathi Digital Seva Kendra for Aadhaar, PAN, Voter ID, Certificates, Train Tickets, and GST Registration.",
  keywords: ["sarathi", "digital seva kendra", "aadhaar", "pan card", "tickets"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sarathi Digital Seva Kendra",
  },
  alternates: {
    canonical: "https://www.jyotirvidya.app",
  },
};

export const viewport = {
  themeColor: "#FF6B00",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${inter.variable} ${notoSansDevanagari.variable} font-sans`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <QueryProvider>
            <AuthListenerProvider>
              <ToastProvider>
                <LocalBusinessSchema />
                {children}
              </ToastProvider>
            </AuthListenerProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
