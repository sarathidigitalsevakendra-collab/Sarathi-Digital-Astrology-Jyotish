import type { SunSign } from "@digital-astrology/lib";

interface HoroscopeContent {
  summary: string;
  mood: string;
  color: string;
  number: number;
  planet: string;
  element: string;
}

export const MOCK_HOROSCOPE_DATA: Record<SunSign, HoroscopeContent> = {
  aries: {
    summary: "Your energy is high today, Aries! Use this boost to tackle challenging projects. However, be mindful of impulsive decisions in financial matters.",
    mood: "Energetic",
    color: "Red",
    number: 9,
    planet: "Mars",
    element: "Fire"
  },
  taurus: {
    summary: "A steady approach wins the race. Today highlights your persistence. Take some time to enjoy the sensory pleasures of life and connect with nature.",
    mood: "Grounded",
    color: "Green",
    number: 6,
    planet: "Venus",
    element: "Earth"
  },
  gemini: {
    summary: "Communication flows easily today. It's a perfect time for networking or catching up with old friends. Your curiosity will lead you to interesting discoveries.",
    mood: "Curious",
    color: "Yellow",
    number: 5,
    planet: "Mercury",
    element: "Air"
  },
  cancer: {
    summary: "Trust your intuition, Cancer. Emotional insights are strong today. Focus on home and family matters, as they will bring you the most comfort and joy.",
    mood: "Intuitive",
    color: "Silver",
    number: 2,
    planet: "Moon",
    element: "Water"
  },
  leo: {
    summary: "You are shining bright today! Your creativity and charisma are at their peak. Don't be afraid to take the lead in group situations.",
    mood: "Radiant",
    color: "Gold",
    number: 1,
    planet: "Sun",
    element: "Fire"
  },
  virgo: {
    summary: "Detail-oriented work is favored. Your analytical skills are sharp, making it a great day for planning and organization. Remember to take breaks.",
    mood: "Analytical",
    color: "Brown",
    number: 5,
    planet: "Mercury",
    element: "Earth"
  },
  libra: {
    summary: "Balance and harmony are your focus. Relationships take center stage today. Seek compromise and look for win-win solutions in any conflicts.",
    mood: "Harmonious",
    color: "Pink",
    number: 6,
    planet: "Venus",
    element: "Air"
  },
  scorpio: {
    summary: "Depth and intensity define your day. You may uncover hidden truths or dive deep into a passion project. Embrace the transformative energy.",
    mood: "Intense",
    color: "Black",
    number: 9,
    planet: "Mars",
    element: "Water"
  },
  sagittarius: {
    summary: "Adventure calls! Expansive energy surrounds you. Whether it's planning a trip or learning something new, broadening your horizons is favored.",
    mood: "Adventurous",
    color: "Purple",
    number: 3,
    planet: "Jupiter",
    element: "Fire"
  },
  capricorn: {
    summary: "Discipline pays off. Focus on your long-term goals and career ambitions. Your practical approach will help you overcome any obstacles.",
    mood: "Determined",
    color: "Grey",
    number: 8,
    planet: "Saturn",
    element: "Earth"
  },
  aquarius: {
    summary: "Your innovative ideas are flowing. Think outside the box and connect with like-minded individuals. Humanitarian causes may appeal to you today.",
    mood: "Innovative",
    color: "Blue",
    number: 11,
    planet: "Saturn",
    element: "Air"
  },
  pisces: {
    summary: "Creativity and dreams are highlighted. Your compassionate nature shines through. It's a wonderful day for artistic pursuits or spiritual practices.",
    mood: "Dreamy",
    color: "Sea Green",
    number: 7,
    planet: "Jupiter",
    element: "Water"
  }
};
