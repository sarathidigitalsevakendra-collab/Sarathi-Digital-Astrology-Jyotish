import { Injectable } from "@nestjs/common";

interface BirthDetails {
  name: string;
  date: string;
  time: string;
  place: string;
}

@Injectable()
export class KundliService {
  async generate(details: BirthDetails) {
    return {
      ...details,
      ascendant: "Taurus",
      moonSign: "Libra",
      houses: [],
    };
  }
}
