"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { MessageCircle, FileText, FileBadge, Briefcase, Printer, Clock, Car, Landmark, CreditCard, GraduationCap, Plane, Shield, Store, UserCheck, Wallet } from "lucide-react";

export default function ServicesGrid(): React.ReactElement {
  const t = useTranslations("sarathi.services");
  const phone = "918369704457";

  const services = [
    {
      id: "aadhaar",
      icon: <FileText className="w-8 h-8 text-orange-400" />,
      slug: "aadhaar-services",
      img: "/csc-posters/ucl-aadhaar.jpg",
      alt: "Aadhaar Services at Sarathi Kendra"
    },
    {
      id: "pan",
      icon: <CreditCard className="w-8 h-8 text-blue-400" />,
      slug: "pan-card-services",
      img: "/csc-posters/csc-services-2.jpg",
      alt: "PAN Card Services"
    },
    {
      id: "voter",
      icon: <UserCheck className="w-8 h-8 text-emerald-500" />,
      slug: "voter-id-police-verification",
      img: "/csc-posters/csc-services-7.jpg",
      alt: "Voter ID and Police Verification"
    },
    {
      id: "certificates",
      icon: <FileBadge className="w-8 h-8 text-pink-400" />,
      slug: "caste-income-domicile",
      img: "/csc-posters/csc-services-1.jpg",
      alt: "Government Certificates"
    },
    {
      id: "govcards",
      icon: <Landmark className="w-8 h-8 text-yellow-500" />,
      slug: "eshram-ayushman-card",
      img: "/csc-posters/ayushman.png",
      alt: "E-Shram and Ayushman Card"
    },
    {
      id: "banking",
      icon: <Wallet className="w-8 h-8 text-indigo-400" />,
      slug: "banking-money-transfer",
      img: "/csc-posters/banking.jpg",
      alt: "Banking and Money Transfer"
    },
    {
      id: "travel",
      icon: <Plane className="w-8 h-8 text-sky-400" />,
      slug: "travel-ticket-booking",
      img: "/csc-posters/csc-safar.jpg",
      alt: "Train Flight Bus Ticket Booking"
    },
    {
      id: "business",
      icon: <Briefcase className="w-8 h-8 text-cyan-400" />,
      slug: "gst-tax-filing",
      img: "/csc-posters/csc-services-4.jpg",
      alt: "GST Registration and Tax Filing"
    },
    {
      id: "licenses",
      icon: <Store className="w-8 h-8 text-orange-500" />,
      slug: "shop-act-food-license",
      img: "/csc-posters/csc-services-5.jpg",
      alt: "Food License and Shop Act"
    },
    {
      id: "passport",
      icon: <Car className="w-8 h-8 text-emerald-400" />,
      slug: "passport-rto-services",
      img: "/csc-posters/passport-pan.jpg",
      alt: "Passport and RTO Services"
    },
    {
      id: "insurance",
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      slug: "insurance-services",
      img: "/csc-posters/insurance.jpg",
      alt: "Insurance Services"
    },
    {
      id: "education",
      icon: <GraduationCap className="w-8 h-8 text-red-400" />,
      slug: "education-jobs-scholarship",
      img: "/csc-posters/skill-india.jpg",
      alt: "Education and Job Forms"
    },
    {
      id: "printing",
      icon: <Printer className="w-8 h-8 text-blue-400" />,
      slug: "printing-stationery",
      img: "/csc-posters/csc-services-3.jpg",
      alt: "Printing and Stationery"
    }
  ];

  return (
    <section className="px-6 py-12 lg:px-16 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 text-blue-900">{t("title")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => {
          const serviceTitle = t(`${service.id}.title`);
          const whatsappMsg = t.has(`${service.id}.whatsappText`) 
            ? t(`${service.id}.whatsappText`) 
            : `Hello, I want to inquire about ${serviceTitle}`;
          const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMsg)}`;
          const btnText = t.has(`${service.id}.btnText`) ? t(`${service.id}.btnText`) : t("whatsapp");
          
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-slate-200 shadow-sm hover:shadow-md rounded-2xl p-6 transition-all flex flex-col overflow-hidden"
            >
              <div className="relative w-full aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] mb-6 rounded-xl overflow-hidden bg-white border border-slate-100 p-2 sm:p-3">
                <Image 
                  src={service.img} 
                  alt={service.alt}
                  fill
                  className="object-contain hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              
              <div className="flex items-start gap-3 mb-3">
                <div className="shrink-0 mt-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-900 leading-tight">{serviceTitle}</h3>
              </div>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">{t(`${service.id}.desc`)}</p>
              
              <div className="space-y-3 mb-6 flex-grow text-sm text-slate-700">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {t("docs")}
                  </span>
                  <span className="text-slate-600 ml-6 leading-snug">{t(`${service.id}.docsDesc`)}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col gap-1">
                  <span className="font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {t("time")}
                  </span>
                  <span className="text-slate-600 ml-6 leading-snug">{t(`${service.id}.timeDesc`)}</span>
                </div>
              </div>

              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full mt-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-xl font-medium transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {btnText}
              </a>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
