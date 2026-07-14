import { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: { locale: string; slug: string };
};

const BLOG_DATA: Record<string, { title: string; desc: string; date: string; content: React.ReactNode }> = {
  'aadhaar-card-bhayandar-hindi': {
    title: 'भायंदर में आधार कार्ड कैसे बनाएं? (How to get Aadhaar in Bhayandar)',
    desc: 'भायंदर ईस्ट में नया आधार कार्ड बनवाने या अपडेट करने की पूरी जानकारी।',
    date: 'July 15, 2024',
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4 text-orange-400">आधार कार्ड अपडेट के लिए जरूरी दस्तावेज</h2>
        <p className="mb-4">यदि आप भायंदर ईस्ट में रहते हैं और अपना आधार कार्ड अपडेट या नया बनवाना चाहते हैं, तो <strong>सारथी डिजिटल सेवा केंद्र</strong> (नवघर रोड) आपके लिए सबसे अच्छा विकल्प है।</p>
        
        <h3 className="text-xl font-semibold mb-3">नाम या पता बदलने के लिए क्या चाहिए?</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>पुराना आधार कार्ड (यदि अपडेट करा रहे हैं)</li>
          <li>पते का प्रमाण (राशन कार्ड, बिजली बिल, या बैंक पासबुक)</li>
          <li>पहचान पत्र (पैन कार्ड, वोटर आईडी, या पासपोर्ट)</li>
        </ul>

        <p className="mb-4">अपडेट की प्रक्रिया में 2-3 दिन लगते हैं। हमारे केंद्र पर आकर आप बिना लाइन में लगे काम करवा सकते हैं।</p>
        <p>अधिक जानकारी के लिए <a href="/hi/services/aadhaar-pan-voter" className="text-pink-400 hover:underline">यहाँ क्लिक करें</a>।</p>
      </>
    )
  },
  'irctc-tatkal-ticket-booking-bhayandar': {
    title: 'IRCTC Tatkal Ticket Booking Agent in Bhayandar',
    desc: 'Looking for a reliable IRCTC agent for Tatkal tickets in Bhayandar East? Find out how to book fast.',
    date: 'July 16, 2024',
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4 text-orange-400">Guaranteed Tatkal Booking Service</h2>
        <p className="mb-4">Booking a Tatkal ticket on IRCTC can be frustrating due to high traffic. At <strong>Sarathi Digital Seva Kendra</strong> in Bhayandar East, we offer professional ticket booking services.</p>
        
        <h3 className="text-xl font-semibold mb-3">Tatkal Timings to Remember</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li><strong>AC Classes (2A, 3A, CC, 3E):</strong> Booking starts at 10:00 AM.</li>
          <li><strong>Non-AC Classes (SL, FC, 2S):</strong> Booking starts at 11:00 AM.</li>
        </ul>

        <p className="mb-4">Bring your passenger details (Aadhaar or any Govt ID) at least 15 minutes before the opening time to our Navghar Road shop.</p>
        <p>Visit our <a href="/en/services/irctc-train-tickets" className="text-pink-400 hover:underline">Train Tickets page</a> to inquire via WhatsApp.</p>
      </>
    )
  },
  'free-kundli-online-hindi': {
    title: 'फ्री कुंडली ऑनलाइन कैसे बनाएं? (Free Kundli Online in Hindi)',
    desc: 'अपनी सटीक जन्म कुंडली मुफ्त में ऑनलाइन बनाएं और अपना भविष्य जानें।',
    date: 'July 17, 2024',
    content: (
      <>
        <h2 className="text-2xl font-bold mb-4 text-orange-400">ऑनलाइन कुंडली निर्माण</h2>
        <p className="mb-4">ज्योतिष में विश्वास रखने वालों के लिए कुंडली एक महत्वपूर्ण दस्तावेज है। <strong>सारथी डिजिटल सेवा केंद्र</strong> का ज्योतिष पोर्टल आपको अपनी विस्तृत कुंडली मुफ्त में जनरेट करने की सुविधा देता है।</p>
        
        <h3 className="text-xl font-semibold mb-3">कुंडली के लाभ:</h3>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>विवाह के लिए गुण मिलान (Kundli Matching)</li>
          <li>करियर और धन योग की जानकारी</li>
          <li>मांगलिक दोष और उसका निवारण</li>
        </ul>

        <p className="mb-4">हमारे पोर्टल पर आपको बस अपनी जन्म तिथि, समय और स्थान दर्ज करना है।</p>
        <p>अभी अपनी <a href="/hi/astrology" className="text-pink-400 hover:underline">फ्री कुंडली जनरेट करें</a>।</p>
      </>
    )
  }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = BLOG_DATA[params.slug];
  if (!blog) return { title: 'Blog Not Found' };

  return {
    title: `${blog.title} | Sarathi Digital`,
    description: blog.desc,
    openGraph: {
      title: blog.title,
      description: blog.desc,
      images: [
        {
          url: `https://www.jyotirvidya.app/api/og/aadhaar-pan-voter`, // Fallback generic OG
          width: 1200,
          height: 630,
        },
      ],
    }
  };
}

export default function BlogPost({ params: { locale, slug } }: Props) {
  setRequestLocale(locale);
  const blog = BLOG_DATA[slug];

  if (!blog) {
    notFound();
  }

  return (
    <main className="px-6 py-12 lg:px-16 max-w-4xl mx-auto min-h-[60vh]">
      <article className="bg-white border border-slate-200 shadow-sm rounded-3xl p-8 md:p-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-blue-900 mb-4 leading-tight">
            {blog.title}
          </h1>
          <time className="text-slate-500 block">{blog.date}</time>
        </header>
        <div className="prose prose-slate prose-lg max-w-none text-slate-700">
          {blog.content}
        </div>
      </article>
    </main>
  );
}
