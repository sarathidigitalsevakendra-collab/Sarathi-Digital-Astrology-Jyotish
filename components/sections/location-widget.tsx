"use client";

import { MapPin } from "lucide-react";
import Image from "next/image";

export default function LocationWidget(): React.ReactElement {
  return (
    <section className="px-6 py-12 lg:px-16 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 items-center bg-white border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8">
        <div>
          <h2 className="text-3xl font-bold text-blue-900 mb-4">Visit Our Kendra</h2>
          <p className="text-slate-600 text-lg mb-4">
            Shop No.14, Rashmi Laxmi, Navghar Road,<br />
            Bhayandar East, Thane 401105
          </p>
          <div className="mb-8">
            <a 
              href="https://maps.google.com/?q=Sarathi+Digital+Seva+Kendra+Bhayandar+East" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Open in Google Maps
            </a>
          </div>
          <div className="space-y-2 text-slate-700">
            <p><strong className="text-blue-900">Hours:</strong> Mon–Sat 9:00 AM – 10:00 PM</p>
            <p><strong className="text-blue-900">Phone:</strong> +91 93721 48452</p>
          </div>
        </div>
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
          <Image 
            src="/shop/csc-generic-banner.png" 
            alt="CSC Digital India Services" 
            fill
            className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end">
            <p className="text-white font-medium p-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Navghar Road, Bhayandar East
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
