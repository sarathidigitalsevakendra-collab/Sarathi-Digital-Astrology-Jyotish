import { NextResponse } from "next/server";

export async function GET() {
  const products = [
    {
      sku: "MALA-001",
      name: "Original Rudraksha Mala",
      category: "Japamala",
      certification: "Certified by Kashi Pith",
      price: 151,
      currency: "INR",
      image: "https://images.unsplash.com/photo-1623945191398-35687d976073?q=80&w=600&auto=format&fit=crop",
      stock: "In Stock"
    },
    {
      sku: "GEM-005",
      name: "Natural Yellow Sapphire",
      category: "Gemstone",
      certification: "GIA Certified",
      price: 15000,
      currency: "INR",
      image: "https://images.unsplash.com/photo-1607522370275-f14bc3a5d288?q=80&w=600&auto=format&fit=crop",
      stock: "In Stock"
    },
    {
      sku: "YANTRA-002",
      name: "Shree Yantra",
      category: "Yantra",
      certification: "Energized in Mahalakshmi Temple",
      price: 2100,
      currency: "INR",
      image: "https://images.unsplash.com/photo-1577083288073-40892c0860a4?q=80&w=600&auto=format&fit=crop",
      stock: "Low Stock"
    },
    {
      sku: "PUJA-010",
      name: "Complete Puja Kit",
      category: "Puja Kit",
      certification: "100% Organic Ingredients",
      price: 501,
      currency: "INR",
      image: "https://images.unsplash.com/photo-1542823671-886d5e7d41f7?q=80&w=600&auto=format&fit=crop",
      stock: "In Stock"
    }
  ];

  return NextResponse.json(products);
}
