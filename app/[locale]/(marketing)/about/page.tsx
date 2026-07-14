import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Neelkanth Stationery & Jyotishya Astrology",
  description: "Visit Neelkanth Stationery & Sarathi Digital Seva Kendra in Bhayandar East, Thane. We offer physical digital services and premium Jyotishya astrology solutions.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-16 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">
          About Us
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Bridging the physical and digital world. We provide essential digital seva services locally in Bhayandar, while offering cosmic guidance globally through Jyotishya.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-sm hover:shadow-md hover:border-orange-500/50 transition-all">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-2xl mb-6">
            🏬
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Physical Shop</h2>
          <p className="text-slate-700">
            <strong>Neelkanth Stationery & Sarathi Digital Seva Kendra</strong>
          </p>
          <ul className="space-y-2 text-slate-600">
            <li>📍 Shop No.14, Rashmi Laxmi, Navghar Road</li>
            <li>🏙️ Bhayandar East, Thane 401105</li>
            <li>📞 +91 83697 04457</li>
            <li>🕒 Mon–Sat: 9:00 AM – 10:00 PM</li>
          </ul>
          <div className="pt-4 border-t border-slate-100 mt-4">
            <h3 className="font-semibold text-slate-900 mb-2">Our Services:</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
              <li>Aadhaar, PAN, Voter ID services</li>
              <li>Government certificates</li>
              <li>IRCTC ticket booking</li>
              <li>GST and MSME filing</li>
              <li>Printing & stationery</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 space-y-4 shadow-sm hover:shadow-md hover:border-purple-500/50 transition-all">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6">
            ✨
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Digital Astrology</h2>
          <p className="text-slate-700">
            <strong>Jyotishya - Your Cosmic Companion</strong>
          </p>
          <p className="text-slate-600">
            A premium Vedic astrology application built to provide you with the most accurate astronomical calculations and ancient astrological wisdom.
          </p>
          <div className="pt-4 border-t border-slate-100 mt-4">
            <h3 className="font-semibold text-slate-900 mb-2">Features:</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 text-sm">
              <li>Precise Kundli Generation</li>
              <li>Daily Panchang & Muhurat</li>
              <li>Kundli Matching (Ashtakoot)</li>
              <li>Remedies & Gemstone Suggestions</li>
              <li>AI Astrologer Consultation</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-8 text-center space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Visit Our Store</h2>
        <div className="w-full h-64 md:h-96 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15065.748057279188!2d72.8464619!3d19.2997184!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b04d0b178499%3A0xc6a88b584065600c!2sNavghar%20Rd%2C%20Bhayandar%2C%20Bhayandar%20East%2C%20Mira%20Bhayandar%2C%20Maharashtra%20401105!5e0!3m2!1sen!2sin!4v1715438814777!5m2!1sen!2sin" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={true} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Maps Location of Neelkanth Stationery"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
