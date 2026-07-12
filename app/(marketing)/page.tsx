import Hero from "@components/sections/hero";
import DailyHoroscopeGrid from "@components/horoscope/daily-grid";
import ConsultationCTA from "@components/consultation/cta";
import MarketplacePreview from "@components/sections/marketplace-preview";
import PanchangHighlights from "@components/sections/panchang-highlights";
import TrustBar from "@components/sections/trust-bar";
import FeaturesSection from "@components/sections/features";
import TestimonialsSection from "@components/sections/testimonials";
import MobileAppSection from "@components/sections/mobile-app";

export default function HomePage(): React.ReactElement {
  return (
    <main className="flex flex-col gap-24 pb-24">
      <Hero />
      <TrustBar />
      <DailyHoroscopeGrid />
      <FeaturesSection />
      <ConsultationCTA />
      <MarketplacePreview />
      <PanchangHighlights />
      <TestimonialsSection />
      <MobileAppSection />
    </main>
  );
}
