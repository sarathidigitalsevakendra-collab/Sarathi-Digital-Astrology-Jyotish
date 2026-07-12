export interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  validUntil: string;
}

const MOCK_OFFERS: Offer[] = [
  {
    id: "OFFER-FESTIVE",
    title: "Navratri Special",
    description: "Flat 20% off on Devi puja kits",
    discountPercent: 20,
    validUntil: "2024-10-10",
  },
];

export class OffersService {
  listActive(currentDate = new Date()) {
    return MOCK_OFFERS.filter((offer) => new Date(offer.validUntil) >= currentDate);
  }
}
