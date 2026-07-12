import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing test users first (optional - for development)
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { in: ["demo@jyotishya.com", "admin@jyotishya.com", "test@example.com"] } },
        { phone: { in: ["+919876543210", "+919876543211"] } },
      ],
    },
  });

  // Create sample users
  const user1 = await prisma.user.create({
    data: {
      email: "demo@jyotishya.com",
      phone: "+919876543210",
      name: "Demo User",
      locale: "en",
      role: UserRole.USER,
      emailVerified: new Date(),
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@jyotishya.com",
      phone: "+919876543211",
      name: "Admin User",
      locale: "en",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  // Test user for OTP signup testing
  const testUser = await prisma.user.create({
    data: {
      email: "test@example.com",
      name: "Test User",
      locale: "en",
      role: UserRole.USER,
      emailVerified: null, // Not verified yet, will be verified via OTP
    },
  });

  console.log("✅ Created users:", { user1: user1.id, admin: admin.id, testUser: testUser.id });

  // Create sample astrologers
  const astrologers = await Promise.all([
    prisma.astrologer.upsert({
      where: { id: "astrologer-1" },
      update: {},
      create: {
        id: "astrologer-1",
        name: "Pandit Rajesh Sharma",
        specialization: ["Vedic Astrology", "Kundli Matching", "Career Guidance"],
        languages: ["Hindi", "English"],
        experience: 15,
        rating: 4.8,
        totalReviews: 234,
        hourlyRate: 500,
        imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        bio: "Experienced Vedic astrologer specializing in Kundli matching and career guidance. 15+ years of experience helping people find clarity in their lives.",
        verified: true,
        available: true,
      },
    }),
    prisma.astrologer.upsert({
      where: { id: "astrologer-2" },
      update: {},
      create: {
        id: "astrologer-2",
        name: "Dr. Priya Menon",
        specialization: ["KP Astrology", "Numerology", "Gemstone Consultation"],
        languages: ["English", "Tamil", "Hindi"],
        experience: 10,
        rating: 4.9,
        totalReviews: 189,
        hourlyRate: 750,
        imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
        bio: "KP astrology expert with a PhD in Vedic Sciences. Specializes in precise predictions and gemstone recommendations.",
        verified: true,
        available: true,
      },
    }),
    prisma.astrologer.upsert({
      where: { id: "astrologer-3" },
      update: {},
      create: {
        id: "astrologer-3",
        name: "Guruji Amit Patel",
        specialization: ["Relationship Counseling", "Marriage Compatibility", "Family Issues"],
        languages: ["Gujarati", "Hindi", "English"],
        experience: 20,
        rating: 4.7,
        totalReviews: 567,
        hourlyRate: 600,
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        bio: "Renowned relationship counselor helping couples and families for over 20 years. Expert in marriage compatibility analysis.",
        verified: true,
        available: true,
      },
    }),
  ]);

  console.log(
    "✅ Created astrologers:",
    astrologers.map((a) => a.id),
  );

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: "rudraksha-mala-5-mukhi" },
      update: {},
      create: {
        name: "5 Mukhi Rudraksha Mala",
        slug: "rudraksha-mala-5-mukhi",
        description:
          "Authentic 5 Mukhi Rudraksha mala with 108 beads. Blessed by Pandit Rajesh Sharma. Brings peace, clarity, and spiritual growth.",
        price: 2499,
        category: "Rudraksha",
        imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343f?w=800",
        images: [],
        inStock: true,
        stockCount: 25,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "yantra-shree" },
      update: {},
      create: {
        name: "Shree Yantra (Brass)",
        slug: "yantra-shree",
        description:
          "Premium quality brass Shree Yantra for prosperity and abundance. Energized with mantras. Size: 3x3 inches.",
        price: 899,
        category: "Yantra",
        imageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
        images: [],
        inStock: true,
        stockCount: 50,
        featured: true,
      },
    }),
    prisma.product.upsert({
      where: { slug: "gemstone-ruby-natural" },
      update: {},
      create: {
        name: "Natural Ruby Gemstone (3 Carat)",
        slug: "gemstone-ruby-natural",
        description:
          "Lab-certified natural ruby gemstone for strengthening the Sun in your horoscope. Comes with authenticity certificate.",
        price: 15999,
        category: "Gemstones",
        imageUrl: "https://images.unsplash.com/photo-1611228422550-f4289d546238?w=800",
        images: [],
        inStock: true,
        stockCount: 8,
        featured: false,
      },
    }),
    prisma.product.upsert({
      where: { slug: "puja-kit-ganesh" },
      update: {},
      create: {
        name: "Ganesh Puja Kit",
        slug: "puja-kit-ganesh",
        description:
          "Complete puja kit for Ganesh worship. Includes idol, incense, diya, flowers, and puja samagri.",
        price: 599,
        category: "Puja Items",
        imageUrl: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
        images: [],
        inStock: true,
        stockCount: 100,
        featured: false,
      },
    }),
  ]);

  console.log(
    "✅ Created products:",
    products.map((p) => p.slug),
  );

  // Create sample kundli for demo user
  const kundli = await prisma.kundli.create({
    data: {
      userId: user1.id,
      name: "Demo User",
      birthDate: new Date("1990-01-15T10:30:00Z"),
      birthTime: "10:30",
      birthPlace: "New Delhi, India",
      latitude: 28.6139,
      longitude: 77.209,
      timezone: "Asia/Kolkata",
      chartData: {
        planets: [
          { name: "Sun", sign: "Capricorn", house: 1, degree: 25.5 },
          { name: "Moon", sign: "Taurus", house: 5, degree: 12.3 },
          { name: "Mars", sign: "Aries", house: 4, degree: 8.7 },
        ],
        houses: Array.from({ length: 12 }, (_, i) => ({
          number: i + 1,
          sign: [
            "Capricorn",
            "Aquarius",
            "Pisces",
            "Aries",
            "Taurus",
            "Gemini",
            "Cancer",
            "Leo",
            "Virgo",
            "Libra",
            "Scorpio",
            "Sagittarius",
          ][i],
        })),
      },
      isPublic: false,
    },
  });

  console.log("✅ Created kundli:", kundli.id);

  console.log("🎉 Database seeded successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
