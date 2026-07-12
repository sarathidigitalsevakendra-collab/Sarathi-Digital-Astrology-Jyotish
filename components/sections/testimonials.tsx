import Image from "next/image";
import { Card } from "@digital-astrology/ui";

const TESTIMONIALS = [
  {
    name: "Suman Verma",
    city: "Lucknow",
    quote:
      "The Kundli insights and muhurat alerts helped us plan our daughter’s wedding flawlessly. Jyotishya feels like our family pandit online!",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Akash Mehra",
    city: "Bengaluru",
    quote:
      "Daily rashifal in Hindi and the loyalty rewards on gemstone purchases are unmatched. Consultations are seamless even late night.",
    avatar:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Priya Iyer",
    city: "Chennai",
    quote:
      "Loved the Tamil remedies suggested by the astrologer. The experience felt respectful of traditions yet super modern.",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  },
];

export default function TestimonialsSection(): React.ReactElement {
  return (
    <section className="px-6 lg:px-16">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Trust of Bharat</p>
        <h2 className="mt-4 gradient-title">Voices from our seekers</h2>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {TESTIMONIALS.map((item, index) => (
          <div 
            key={item.name}
            className="h-full transition-transform duration-300 hover:scale-[1.02]"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <Card 
              className="group relative h-full border-white/5 bg-white/5 transition-all duration-300 hover:bg-white/[0.07] hover:shadow-[0_8px_30px_rgba(249,115,22,0.1)] hover:border-orange-500/20"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-orange-200/40 transition-transform duration-300 group-hover:scale-110 group-hover:border-orange-400">
                  <Image src={item.avatar} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white group-hover:text-orange-200 transition-colors">{item.name}</p>
                  <p className="text-xs text-orange-200/70 group-hover:text-orange-200">{item.city}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-200 group-hover:text-white transition-colors">“{item.quote}”</p>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
}
