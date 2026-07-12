export interface Product {
  sku: string;
  name: string;
  category: string;
  price: number;
  currency: string;
}

const MOCK_PRODUCTS: Product[] = [
  {
    sku: "GEM-NEELAM-01",
    name: "Premium Neelam",
    category: "Gemstone",
    price: 34999,
    currency: "INR",
  },
];

export class ProductService {
  listAll() {
    return MOCK_PRODUCTS;
  }
}
