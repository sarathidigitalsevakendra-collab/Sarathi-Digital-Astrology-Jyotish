export interface Festival {
  id: string;
  name: string;
  date: string; // ISO format MM-DD
  message: string;
  discountCode: string;
  discountPercentage: number;
}

export const festivals: Festival[] = [
  {
    id: "diwali",
    name: "Diwali",
    date: "11-01", // Roughly, though it changes yearly based on lunar calendar. Setting static for demo.
    message: "Happy Diwali! Illuminate your future with 50% off all Kundli reports.",
    discountCode: "DIWALI50",
    discountPercentage: 50,
  },
  {
    id: "makar_sankranti",
    name: "Makar Sankranti",
    date: "01-14",
    message: "Celebrate Makar Sankranti! Get 30% off on your annual horoscope.",
    discountCode: "SANKRANTI30",
    discountPercentage: 30,
  },
  {
    id: "mahashivratri",
    name: "Maha Shivratri",
    date: "03-08",
    message: "Om Namah Shivaya! Special 20% discount on Dosha Analysis.",
    discountCode: "SHIV20",
    discountPercentage: 20,
  },
  {
    id: "holi",
    name: "Holi",
    date: "03-25",
    message: "Colorful Holi! Enjoy 40% off on premium consultations.",
    discountCode: "HOLI40",
    discountPercentage: 40,
  }
];

export function getActiveFestival(): Festival | null {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const currentDate = `${month}-${day}`;

  // Usually campaigns run for a few days, but for simplicity we match the exact day 
  // or you could add a range check here.
  return festivals.find(f => f.date === currentDate) || null;
}
