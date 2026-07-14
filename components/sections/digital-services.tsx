"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Globe, MapPin, Smartphone, Mail, Rocket, Wrench, Building } from "lucide-react";

export default function DigitalServicesGrid(): React.ReactElement {
  const t = useTranslations("sarathi.digitalServices");
  const phone = "919372148452";

  const services = [
    {
      id: "webDev",
      icon: <Globe className="w-10 h-10 text-blue-500" />,
    },
    {
      id: "googleBiz",
      icon: <MapPin className="w-10 h-10 text-red-500" />,
    },
    {
      id: "socialMedia",
      icon: <Smartphone className="w-10 h-10 text-green-500" />,
    },
    {
      id: "domainHosting",
      icon: <Mail className="w-10 h-10 text-indigo-500" />,
    },
    {
      id: "seo",
      icon: <Rocket className="w-10 h-10 text-orange-500" />,
    },
    {
      id: "maintenance",
      icon: <Wrench className="w-10 h-10 text-slate-600" />,
    },
    {
      id: "bizSetup",
      icon: <Building className="w-10 h-10 text-teal-600" />,
    }
  ];

  return (
    <section className="px-6 py-16 lg:px-16 w-full bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">{t("title")}</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Empower your local business with our professional online setup, marketing, and web development services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const serviceTitle = t(`${service.id}.title`);
            
            // Check if whatsappText exists in the translation file
            let whatsappMsg = `Hello, I want to inquire about ${serviceTitle}`;
            try {
              if (t.has(`${service.id}.whatsappText`)) {
                whatsappMsg = t(`${service.id}.whatsappText`);
              }
            } catch (_e) {
              // fallback
            }

            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMsg)}`;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-slate-200 shadow-sm hover:shadow-lg rounded-2xl p-8 transition-all flex flex-col h-full group"
              >
                <div className="bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {service.icon}
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-3">{serviceTitle}</h3>
                
                <p className="text-slate-600 mb-6 flex-grow leading-relaxed">
                  {t(`${service.id}.desc`)}
                </p>
                
                <a 
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto block text-center w-full bg-slate-800 hover:bg-slate-900 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                >
                  {t("whatsapp")}
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
