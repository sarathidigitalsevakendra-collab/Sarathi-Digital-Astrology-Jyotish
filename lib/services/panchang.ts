export interface PanchangDay {
  date: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise: string;
  sunset: string;
}

export interface PanchangClient {
  getToday(locale: string): Promise<PanchangDay>;
  getMonth(month: number, year: number, locale: string): Promise<PanchangDay[]>;
}

export class MockPanchangClient implements PanchangClient {
  async getToday(_locale: string) {
    return {
      date: new Date().toISOString(),
      tithi: "Shukla Paksha Pratipada",
      nakshatra: "Ashwini",
      yoga: "Vishkambha",
      karana: "Kinstughna",
      sunrise: "06:05",
      sunset: "18:45",
    };
  }

  async getMonth(month: number, year: number, _locale: string) {
    const days = Array.from({ length: 5 }).map((_, index) => ({
      date: new Date(year, month - 1, index + 1).toISOString(),
      tithi: "Sample Tithi",
      nakshatra: "Sample Nakshatra",
      yoga: "Sample Yoga",
      karana: "Sample Karana",
      sunrise: "06:00",
      sunset: "18:30",
    }));

    return days;
  }
}
