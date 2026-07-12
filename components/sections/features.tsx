import { Card } from "@digital-astrology/ui";

const FEATURES = [
  {
    title: "Authentic Jyotish",
    description: "Powered by Vedic panchang, NASA ephemeris and experienced Acharyas across India.",
    icon: "🪔",
    gradient: "from-orange-500/10 via-amber-500/5 to-orange-500/0",
    shadow: "hover:shadow-orange-500/20",
  },
  {
    title: "Regional Languages",
    description:
      "Horoscope, Kundli, and remedies available in Hindi & English with support for more Bharatiya languages coming soon.",
    icon: "🗣️",
    gradient: "from-blue-500/10 via-cyan-500/5 to-blue-500/0",
    shadow: "hover:shadow-blue-500/20",
  },
  {
    title: "Secure Consultations",
    description:
      "End-to-end encrypted chat, voice, video and wallet with instant UPI settlements & loyalty coins.",
    icon: "🔐",
    gradient: "from-purple-500/10 via-violet-500/5 to-purple-500/0",
    shadow: "hover:shadow-purple-500/20",
  },
  {
    title: "Temple-Energised Store",
    description:
      "Certified gemstones, yantras, and puja kits energised by partner temples and Gurukuls.",
    icon: "🕉️",
    gradient: "from-emerald-500/10 via-green-500/5 to-emerald-500/0",
    shadow: "hover:shadow-emerald-500/20",
  },
];

export default function FeaturesSection(): React.ReactElement {
  return (
    <section className="px-6 lg:px-16">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Why Jyotishya</p>
        <h2 className="mt-4 gradient-title">Crafted for the spiritual seeker in India</h2>
        <p className="mt-3 text-sm text-slate-300">
          Blend of ancient jyotish wisdom, modern astronomy, and trusted gurus to support every life
          decision.
        </p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card
            key={feature.title}
            className={`relative overflow-hidden border-white/5 bg-gradient-to-br transition-all duration-200 ease-out hover:scale-105 hover:border-white/10 hover:shadow-xl ${feature.gradient} ${feature.shadow}`}
          >
            <div className="absolute right-6 top-6 text-4xl opacity-70 transition-transform duration-300 hover:scale-110" title={feature.title}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
