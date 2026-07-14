import { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { MessageCircle, FileText, Clock, MapPin, CheckCircle2, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Props = {
  params: { locale: string; slug: string };
};

const SERVICES_DATA: Record<string, { en: string; hi: string; docs: string; time: string; keywords: string[]; img: string; description: string; beforeVisit: string[] }> = {
  'aadhaar-pan-voter': {
    en: 'Aadhaar / PAN / Voter ID Services',
    hi: 'आधार / पैन / वोटर आईडी',
    docs: 'Old ID proof, Photo, Address proof',
    time: '2-3 Days',
    keywords: ['Aadhaar card Bhayandar', 'PAN card Bhayandar East', 'Voter ID update Thane'],
    img: '/csc-posters/ucl-aadhaar.jpg',
    description: 'Visit our Bhayandar East shop for Aadhaar updates, new PAN card applications, and voter ID registration or corrections. We provide fast, reliable assistance for all your primary identity documents.',
    beforeVisit: [
      'Ensure your mobile number is linked to your existing Aadhaar for OTP verification.',
      'Bring original documents for scanning if required.',
      'For name or address changes, bring a valid supporting document (like a light bill or rent agreement).'
    ]
  },
  'caste-income-domicile': {
    en: 'Caste, Income & Domicile Certificates',
    hi: 'जाति / आय प्रमाण पत्र',
    docs: 'Ration Card, Old Certificate, Photo, Aadhar',
    time: '7-15 Days',
    keywords: ['Caste certificate Bhayandar', 'Income certificate agent', 'Domicile certificate Maharashtra'],
    img: '/csc-posters/csc-services.jpg',
    description: 'Get your Maharashtra State Caste, Income, and Domicile certificates processed without hassle. We handle the online application and documentation for you locally in Bhayandar.',
    beforeVisit: [
      'Bring all family members\' old certificates if applying for a caste certificate.',
      'For income certificates, bring recent salary slips or ITR.',
      'A valid ration card or light bill is strictly required for address proof.'
    ]
  },
  'irctc-train-tickets': {
    en: 'IRCTC Train & Tatkal Tickets',
    hi: 'ट्रेन और तत्काल टिकट',
    docs: 'Passenger Details, ID Proof',
    time: 'Instant / Tatkal timings',
    keywords: ['IRCTC agent Thane', 'Tatkal ticket booking Bhayandar', 'Train tickets Mira Road'],
    img: '/csc-posters/csc-safar.jpg',
    description: 'Book confirmed train tickets and Tatkal tickets with ease. We are an authorized booking point in Bhayandar East offering fast IRCTC reservation services.',
    beforeVisit: [
      'Provide exact passenger names and ages as per their ID proof.',
      'For Tatkal booking, please visit or message us one day in advance.',
      'Keep your journey dates and preferred train numbers ready.'
    ]
  },
  'gst-msme-udyam': {
    en: 'GST Registration & MSME Udyam',
    hi: 'जीएसटी पंजीकरण',
    docs: 'PAN, Aadhaar, Bank Details, Business Proof',
    time: '3-5 Days',
    keywords: ['GST registration Bhayandar', 'MSME Udyam Aadhar', 'Business registration Thane'],
    img: '/csc-posters/csc-digipay.jpg',
    description: 'Start your local business the right way. We assist with new GST registrations, MSME Udyam certificates, and Shop Act licenses for businesses in Thane and Mumbai.',
    beforeVisit: [
      'Bring a clear copy of your shop\'s rent agreement or light bill.',
      'Your Aadhaar MUST be linked to your mobile number.',
      'Keep a canceled cheque or bank statement ready for GST registration.'
    ]
  },
  'printing-stationery': {
    en: 'Printing, Photocopy & Stationery',
    hi: 'प्रिंटिंग और स्टेशनरी',
    docs: 'Bring files on Pen Drive or WhatsApp',
    time: 'Instant',
    keywords: ['Printing shop Bhayandar East', 'Color printout', 'Stationery shop Navghar Road'],
    img: '/csc-posters/csc-services-2.jpg',
    description: 'High-quality printing, color copies, scanning, and lamination services. We also stock essential office and school stationery right here on Navghar Road.',
    beforeVisit: [
      'You can WhatsApp us your documents ahead of time to save waiting.',
      'We support all standard formats: PDF, JPG, Word.',
      'Bulk printing and spiral binding are available.'
    ]
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = SERVICES_DATA[params.slug];
  if (!service) return { title: 'Service Not Found' };

  const baseUrl = "https://www.jyotirvidya.app";

  return {
    title: `${service.en} in Bhayandar East | Sarathi Digital Seva Kendra`,
    description: `Get ${service.en} (${service.hi}) quickly at Sarathi Digital Seva Kendra, Bhayandar East. Processing time: ${service.time}. Required: ${service.docs}.`,
    keywords: service.keywords,
    openGraph: {
      title: `${service.en} | Sarathi Digital Seva Kendra`,
      description: `Fast and reliable ${service.en} in Bhayandar East. Call +91 93721 48452.`,
      url: `${baseUrl}/${params.locale}/services/${params.slug}`,
      siteName: "Sarathi Digital Seva Kendra",
      images: [
        {
          url: `${baseUrl}${service.img}`,
          width: 1200,
          height: 630,
        },
      ],
      locale: "hi_IN",
      type: "website",
    },
    alternates: {
      canonical: `${baseUrl}/${params.locale}/services/${params.slug}`,
    }
  };
}

export default async function ServicePage({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  
  const service = SERVICES_DATA[slug];
  if (!service) {
    notFound();
  }

  const phone = "919372148452";
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`Hello Sarathi Digital Seva Kendra, I need help with ${service.en}`)}`;

  return (
    <main className="bg-slate-50 min-h-screen pb-24">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 lg:px-16">
        <div className="max-w-5xl mx-auto flex items-center">
          <Link href={`/${locale}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Homepage
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 lg:px-16 pt-12">
        <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
          {/* Left Column: Image */}
          <div className="w-full max-w-sm mx-auto md:mx-0 rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white aspect-[3/4] relative p-2">
            <Image 
              src={service.img} 
              alt={service.en}
              fill
              className="object-contain"
              priority
            />
          </div>

          {/* Right Column: Title & Info */}
          <div className="flex flex-col h-full justify-center">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3 leading-tight">
                {service.en}
              </h1>
              <h2 className="text-xl text-slate-500 font-medium font-devanagari">
                {service.hi}
              </h2>
            </div>
            
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              {service.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href={whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-6 rounded-xl font-medium transition-colors shadow-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Message on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Docs Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 text-blue-900 font-bold text-xl mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              Required Documents
            </div>
            <p className="text-slate-600 text-lg">{service.docs}</p>
          </div>

          {/* Time Card */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
            <div className="flex items-center gap-3 text-orange-600 font-bold text-xl mb-4">
              <div className="p-3 bg-orange-50 rounded-xl">
                <Clock className="w-6 h-6 text-orange-500" />
              </div>
              Processing Time
            </div>
            <p className="text-slate-600 text-lg">{service.time}</p>
          </div>
        </div>

        {/* Before You Visit */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mb-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Before you visit</h3>
          <ul className="space-y-4">
            {service.beforeVisit.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-slate-700 text-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visit Shop Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Visit Sarathi Digital Seva Kendra</h3>
            <div className="flex flex-col items-center justify-center gap-3 text-slate-300 text-lg">
              <span className="flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-400" /> Shop No.14, Rashmi Laxmi, Navghar Road, Bhayandar East</span>
              <span>Open Monday to Saturday • 9:00 AM - 10:00 PM</span>
            </div>
          </div>
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        </div>

      </div>
    </main>
  );
}
