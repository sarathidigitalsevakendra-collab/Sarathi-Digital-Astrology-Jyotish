import SarathiHero from "@components/sections/sarathi-hero";
import ServicesGrid from "@components/sections/services-grid";
import DigitalServicesGrid from "@components/sections/digital-services";
import AstrologyBanner from "@components/sections/astrology-banner";
import LocationWidget from "@components/sections/location-widget";
import { setRequestLocale } from 'next-intl/server';

export default function HomePage({ params: { locale } }: { params: { locale: string } }): React.ReactElement {
  setRequestLocale(locale);
  return (
    <main className="flex flex-col gap-16 pb-24">
      <SarathiHero />
      <ServicesGrid />
      <DigitalServicesGrid />
      <AstrologyBanner />
      <LocationWidget />
    </main>
  );
}
