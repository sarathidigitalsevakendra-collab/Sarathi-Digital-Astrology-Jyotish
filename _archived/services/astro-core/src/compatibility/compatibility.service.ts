import { Injectable } from "@nestjs/common";

@Injectable()
export class CompatibilityService {
  async match(
    partnerOne: { name: string; birthDate: string },
    partnerTwo: { name: string; birthDate: string },
  ) {
    return {
      partners: [partnerOne, partnerTwo],
      score: 82,
      report: "Strong compatibility based on sample data.",
    };
  }
}
