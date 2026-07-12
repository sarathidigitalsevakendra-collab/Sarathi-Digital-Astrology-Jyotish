export interface Order {
  id: string;
  status: "created" | "processing" | "shipped" | "delivered";
  items: Array<{ sku: string; quantity: number }>;
}

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-1021",
    status: "shipped",
    items: [{ sku: "GEM-NEELAM-01", quantity: 1 }],
  },
];

export class OrderService {
  listByUser(_userId: string) {
    return MOCK_ORDERS;
  }
}
