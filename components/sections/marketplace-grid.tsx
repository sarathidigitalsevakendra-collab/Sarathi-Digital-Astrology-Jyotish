"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Card, Button } from "@digital-astrology/ui";
import { getProducts } from "@lib/api/products";

export default function MarketplaceGrid(): React.ReactElement {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: getProducts,
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse border-white/5 bg-white/5">
            <div className="mb-4 h-36 rounded-2xl bg-white/10" />
            <div className="h-4 w-1/2 rounded bg-white/10" />
            <div className="mt-3 h-3 w-3/4 rounded bg-white/10" />
          </Card>
        ))}
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {items.map((item) => (
        <Card
          key={item.sku}
          className="border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-white/0"
          title={item.name}
          subtitle={`${item.certification ?? item.category} • ₹${item.price.toLocaleString("en-IN")}`}
        >
          <div className="relative mb-4 h-36 overflow-hidden rounded-2xl border border-white/10">
            <Image src={item.image} alt={item.name} fill className="object-cover" />
          </div>
          <div className="flex items-center justify-between text-xs text-orange-200">
            <span>SKU: {item.sku}</span>
            <span>{item.stock}</span>
          </div>
          <Button className="mt-4" size="sm">
            Add to Cart
          </Button>
        </Card>
      ))}
    </div>
  );
}
