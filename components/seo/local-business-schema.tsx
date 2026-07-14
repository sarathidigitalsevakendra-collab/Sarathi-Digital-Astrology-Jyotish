export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Sarathi Digital Seva Kendra",
    "alternateName": "Neelkanth Stationery",
    "image": "https://www.jyotirvidya.app/api/og/aadhaar-pan-voter",
    "description": "Premium Digital Seva Kendra in Bhayandar East offering Aadhaar, PAN, Voter ID, Certificates, IRCTC Tickets, GST Registration, and printing services.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Shop No.14, Rashmi Laxmi, Navghar Road",
      "addressLocality": "Bhayandar East, Thane",
      "addressRegion": "Maharashtra",
      "postalCode": "401105",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 19.3097,
      "longitude": 72.8497
    },
    "url": "https://www.jyotirvidya.app",
    "telephone": "+919372148452",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "22:00"
      }
    ],
    "priceRange": "₹₹",
    "paymentAccepted": ["Cash", "UPI"],
    "currenciesAccepted": "INR",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.7",
      "reviewCount": "54"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Digital Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Aadhaar / PAN / Voter ID Services"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Caste, Income & Domicile Certificates"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "IRCTC Train & Tatkal Tickets"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "GST Registration & MSME Udyam"
          }
        }
      ]
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
