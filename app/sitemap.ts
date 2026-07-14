import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.jyotirvidya.app';
  const locales = ['en', 'hi', 'mr'];
  
  const services = [
    'aadhaar-pan-voter',
    'caste-income-domicile',
    'irctc-train-tickets',
    'gst-msme-udyam',
    'printing-stationery'
  ];

  const rashis = [
    'aries', 'taurus', 'gemini', 'cancer', 
    'leo', 'virgo', 'libra', 'scorpio', 
    'sagittarius', 'capricorn', 'aquarius', 'pisces'
  ];

  const blogs = [
    'aadhaar-card-bhayandar-hindi',
    'irctc-tatkal-ticket-booking-bhayandar',
    'free-kundli-online-hindi'
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Homepages
  locales.forEach(locale => {
    sitemapEntries.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    });
    
    // Astrology landing page
    sitemapEntries.push({
      url: `${baseUrl}/${locale}/astrology`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    // Services pages
    services.forEach(service => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/services/${service}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    });

    // Blogs
    blogs.forEach(blog => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/blog/${blog}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    });

    // Horoscopes
    rashis.forEach(rashi => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}/horoscope/daily/${rashi}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.6,
      });
    });
  });

  return sitemapEntries;
}
