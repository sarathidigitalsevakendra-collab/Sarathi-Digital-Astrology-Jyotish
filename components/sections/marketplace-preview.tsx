"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Button } from "@digital-astrology/ui";
import Link from "next/link";
import { getFeaturedProducts } from "@lib/api/products";

export default function MarketplacePreview(): React.ReactElement {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => getFeaturedProducts(3),
  });

  const products = useMemo(() => data ?? [], [data]);

  return (
    <section className="px-6 lg:px-16" id="marketplace-preview">
      {/* Header with Tabs */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <h2 className="gradient-title">Sacred Storefront</h2>
              <span className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-500/20 tracking-wide uppercase">New Arrivals</span>
           </div>
           <p className="text-sm font-medium text-orange-200 mb-1">Certified by partner temples & Gurukuls</p>
           <p className="text-sm text-slate-400 max-w-xl">
             Energised gemstones, yantras, books, and puja essentials curated by experts for your spiritual journey.
           </p>
        </div>
        
        {/* Desktop Tabs */}
        <div className="hidden lg:flex gap-2">
           {["All", "Gemstones", "Yantras", "Books", "Puja Kits"].map((tab) => (
              <button 
                 key={tab}
                 className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${tab === "All" ? "bg-white text-slate-900" : "bg-white/5 text-slate-400 hover:text-white"}`}
              >
                  {tab}
              </button>
           ))}
        </div>
      </div>

      {/* Product Grid / Carousel */}
      <div className="flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-visible scrollbar-hide snap-x">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="min-w-[200px] md:min-w-0 animate-pulse border-white/5 bg-white/5">
              <div className="mb-4 h-40 rounded-xl bg-white/10" />
              <div className="h-4 w-1/2 rounded bg-white/10" />
              <div className="mt-2 h-3 w-1/3 rounded bg-white/10" />
            </Card>
          ))}
        {!isLoading &&
          products.map((product) => (
            <div
              key={product.sku}
              className="group relative min-w-[200px] md:min-w-0 snap-center bg-white/5 border border-white/5 rounded-2xl p-3 hover:bg-white/10 transition-colors"
            >
              <div className="relative mb-3 h-40 w-full overflow-hidden rounded-xl bg-slate-900">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                   <button className="w-full py-1.5 bg-white text-slate-900 text-xs font-bold rounded-lg shadow-lg">Quick Add</button>
                </div>
              </div>
              
              <div className="px-1">
                 <p className="text-xs text-orange-300 font-medium mb-1">{product.category}</p>
                 <h3 className="text-sm font-semibold text-white truncate mb-1" title={product.name}>{product.name}</h3>
                 <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-200">₹{product.price.toLocaleString("en-IN")}</p>
                    <span className="text-[10px] text-green-400 bg-green-900/20 px-1.5 py-0.5 rounded border border-green-500/20">
                       {product.stock.includes("Stock") ? "In Stock" : product.stock}
                    </span>
                 </div>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-2 flex justify-center md:mt-8">
         <Button asChild className="bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 transition-all w-full md:w-auto">
           <Link href="/shop">Explore All Products</Link>
         </Button>
      </div>
    </section>
  );
}
