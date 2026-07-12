"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Card, Button } from "@digital-astrology/ui";

const ASTROLOGERS = [
  {
    id: "astro-aarti",
    name: "Acharya Aarti Sharma",
    rating: 4.9,
    experience: "12 yrs",
    price: "₹39/min",
    skills: ["Vedic", "Marriage", "Career"],
    languages: ["Hindi", "English"],
    status: "Available",
    avatar:
      "https://images.unsplash.com/photo-1580894906472-6ad3946e8866?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "guru-raj",
    name: "Guru Rajesh Mishra",
    rating: 4.8,
    experience: "18 yrs",
    price: "₹55/min",
    skills: ["KP", "Prashna", "Business"],
    languages: ["Hindi", "Gujarati"],
    status: "Busy",
    avatar:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=400&q=80",
  },
];

type Filter = "all" | "available";

export default function AstrologerDirectory(): React.ReactElement {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "available") {
      return ASTROLOGERS.filter((astro) => astro.status === "Available");
    }
    return ASTROLOGERS;
  }, [filter]);

  return (
    <section className="mt-12 space-y-6">
      <div className="flex gap-4">
        <Button
          variant={filter === "all" ? "primary" : "secondary"}
          onClick={() => setFilter("all")}
        >
          All Experts
        </Button>
        <Button
          variant={filter === "available" ? "primary" : "secondary"}
          onClick={() => setFilter("available")}
        >
          Available Now
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {filtered.map((astro) => (
          <Card key={astro.id} title={astro.name} subtitle={`${astro.experience} • ${astro.price}`}>
            <div className="flex items-start gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10">
                <Image src={astro.avatar} alt={astro.name} fill className="object-cover" />
              </div>
              <div className="space-y-2 text-xs text-orange-200">
                <div className="flex flex-wrap gap-3">
                  <span>⭐ {astro.rating}</span>
                  <span>Status: {astro.status}</span>
                </div>
                <p className="text-[13px] text-slate-200">
                  Specialities: {astro.skills.join(", ")}
                </p>
                <p className="text-[13px] text-slate-300">
                  Languages: {astro.languages.join(", ")}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button size="sm">Chat Now</Button>
              <Button size="sm" variant="secondary">
                Book Call
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
