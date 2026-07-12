import { z } from "zod";
import { apiClient } from "@lib/utils/api-client";

const productSchema = z.object({
  sku: z.string(),
  name: z.string(),
  category: z.string(),
  certification: z.string().optional(),
  price: z.number(),
  currency: z.string(),
  image: z.string().url(),
  stock: z.string(),
});

export type Product = z.infer<typeof productSchema>;

export async function getProducts() {
  const response = await apiClient("/api/commerce/products");
  const json = await response.json();
  return z.array(productSchema).parse(json);
}

export async function getFeaturedProducts(count = 3) {
  const products = await getProducts();
  return products.slice(0, count);
}
