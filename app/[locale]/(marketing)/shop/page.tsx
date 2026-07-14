import { Metadata } from "next";

import { MapPin, Phone, MessageCircle, Clock, Star, FileText, FileBadge, Train, FileSpreadsheet, Printer } from "lucide-react";

export const metadata: Metadata = {
  title: "Neelkanth Stationery & Sarathi Digital Seva Kendra | Bhayandar East",
  description: "Your trusted local center for Aadhaar, PAN, Govt Certificates, IRCTC tickets, GST filing, and Printing Services in Bhayandar East.",
};

const SERVICES = [
  { icon: FileText, title: "Aadhaar / PAN / Voter ID", desc: "New applications, corrections, and printouts." },
  { icon: FileBadge, title: "Govt Certificates", desc: "Income, Domicile, Caste, and other official documents." },
  { icon: Train, title: "IRCTC Ticketing", desc: "Authorized agent for train bookings." },
  { icon: FileSpreadsheet, title: "GST & MSME", desc: "Registration and regular filing services." },
  { icon: Printer, title: "Printing & Stationery", desc: "High-quality printouts, xerox, and office supplies." },
];

export default function ShopPage(): React.ReactElement {
  const whatsappText = encodeURIComponent("Hello Neelkanth Stationery & Sarathi Digital Seva Kendra, I would like to inquire about your services.");

  return (
    <main className="px-6 pb-24 pt-12 lg:px-16 min-h-screen">
      <div className="mx-auto max-w-5xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row gap-8 items-start justify-between bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-12 backdrop-blur-md">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-orange-400" />
              <span>4.7 Google Rating</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
              Neelkanth Stationery <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500">
                & Sarathi Digital Seva Kendra
              </span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 max-w-xl">
              Your trusted local partner in Bhayandar East for all government services, digital filings, and printing needs.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a 
                href="tel:+919372148452"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white transition hover:bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.3)]"
              >
                <Phone className="w-5 h-5" />
                Call +91 93721 48452
              </a>
              <a 
                href={`https://wa.me/919372148452?text=${whatsappText}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 font-semibold text-white transition hover:bg-[#22bf5b] shadow-[0_0_15px_rgba(37,211,102,0.3)]"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Enquiry
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-80 bg-[#0B1021]/80 rounded-2xl p-6 border border-white/10 shrink-0">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              Operating Hours
            </h3>
            <div className="space-y-3 text-slate-300">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <span>Mon - Sat</span>
                <span className="font-medium text-white">9:00 AM - 10:00 PM</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Sunday</span>
                <span>Closed</span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/5">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-400" />
                Location
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Shop No.14, Rashmi Laxmi,<br />
                Navghar Road, Bhayandar East,<br />
                Thane 401105
              </p>
            </div>
          </div>
        </header>

        {/* Services Grid */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Our Primary Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service, idx) => {
              const Icon = service.icon;
              return (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{service.title}</h3>
                  <p className="text-slate-400 text-sm">{service.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="p-8 pb-0">
            <h2 className="text-2xl font-bold text-white mb-6">Find us on Google Maps</h2>
          </div>
          <div className="w-full h-[400px] mt-6">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15065.71966555198!2d72.852233!3d19.309062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b02d6c174bf9%3A0x6b107e3a34a17df7!2sBhayandar%20East%2C%20Mira%20Bhayandar%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="grayscale-[0.5] contrast-[1.1] opacity-90 mix-blend-screen"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}
