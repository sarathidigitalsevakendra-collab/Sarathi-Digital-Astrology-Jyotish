import MainNav from "@/components/layout/main-nav";
import Footer from "@/components/layout/footer";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { FestivalBanner } from "@/components/marketing/festival-banner";
import WhatsAppButton from "@/components/layout/whatsapp-button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen relative overflow-x-hidden">
      <FestivalBanner />
      <MainNav />
      {children}
      <Footer />
      <CookieBanner />
      <WhatsAppButton />
    </div>
  );
}
