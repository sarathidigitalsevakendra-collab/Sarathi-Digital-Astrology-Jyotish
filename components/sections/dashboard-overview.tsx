import { Card, Button } from "@digital-astrology/ui";

const KUNDLI = {
  name: "Rupesh Kumar",
  rashi: "Vrishabha",
  nakshatra: "Rohini",
  lastUpdated: "12 May 2024",
};

const ORDERS = [
  { id: "ORD-1021", item: "Emerald Gemstone", status: "Shipped" },
  { id: "ORD-1018", item: "Ganesha Yantra", status: "Delivered" },
];

const CONSULTATIONS = [
  { id: "CONS-301", astrologer: "Acharya Aarti", date: "14 May 2024", mode: "Video" },
];

export default function DashboardOverview(): React.ReactElement {
  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <Card title="Saved Kundli" subtitle={`${KUNDLI.rashi} • ${KUNDLI.nakshatra}`}>
        <p className="text-sm text-slate-300">Last updated: {KUNDLI.lastUpdated}</p>
        <div className="mt-4 flex gap-3">
          <Button size="sm">View Chart</Button>
          <Button size="sm" variant="secondary">
            Download PDF
          </Button>
        </div>
      </Card>
      <Card title="Loyalty Points" subtitle="2,450 Jyotishya Coins">
        <p className="text-sm text-slate-300">Redeem for consultation discounts and puja kits.</p>
      </Card>
      <Card title="Upcoming Consultations" subtitle="Stay prepared">
        {CONSULTATIONS.map((consultation) => (
          <div key={consultation.id} className="mt-3 flex justify-between text-sm text-slate-200">
            <span>{consultation.astrologer}</span>
            <span>
              {consultation.date} • {consultation.mode}
            </span>
          </div>
        ))}
      </Card>
      <Card title="Recent Orders" subtitle="Track your sacred purchases">
        {ORDERS.map((order) => (
          <div key={order.id} className="mt-3 flex justify-between text-sm text-slate-200">
            <span>{order.item}</span>
            <span>{order.status}</span>
          </div>
        ))}
      </Card>
    </section>
  );
}
