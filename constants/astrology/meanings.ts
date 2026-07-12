/**
 * Astrology meanings and reference data
 */

import type { PlanetMeaning, SignMeaning, HouseMeaning } from "@/types/astrology/birthChart.types";

export const planetMeanings: { [key: string]: PlanetMeaning } = {
  Sun: {
    icon: "☀️",
    meaning: "Your core self, ego, and vitality",
    area: "Identity & Purpose",
  },
  Moon: {
    icon: "🌙",
    meaning: "Your emotions, mind, and instincts",
    area: "Emotions & Feelings",
  },
  Mars: {
    icon: "🔥",
    meaning: "Your energy, courage, and actions",
    area: "Drive & Action",
  },
  Mercury: {
    icon: "💬",
    meaning: "Your communication and intellect",
    area: "Mind & Speech",
  },
  Jupiter: {
    icon: "🎓",
    meaning: "Your wisdom, luck, and growth",
    area: "Expansion & Fortune",
  },
  Venus: {
    icon: "💝",
    meaning: "Your love, beauty, and relationships",
    area: "Love & Pleasure",
  },
  Saturn: {
    icon: "⏱️",
    meaning: "Your discipline, karma, and lessons",
    area: "Discipline & Karma",
  },
  Rahu: {
    icon: "🌑",
    meaning: "Your desires and worldly ambitions",
    area: "Material Desires",
  },
  Ketu: {
    icon: "🌑",
    meaning: "Your spirituality and detachment",
    area: "Spirituality",
  },
};

export const signMeanings: { [key: string]: SignMeaning } = {
  Aries: { element: "Fire", nature: "Leadership, Initiative", color: "text-red-400" },
  Taurus: {
    element: "Earth",
    nature: "Stability, Patience",
    color: "text-green-400",
  },
  Gemini: {
    element: "Air",
    nature: "Communication, Versatility",
    color: "text-yellow-400",
  },
  Cancer: {
    element: "Water",
    nature: "Nurturing, Emotions",
    color: "text-blue-400",
  },
  Leo: {
    element: "Fire",
    nature: "Confidence, Creativity",
    color: "text-orange-400",
  },
  Virgo: { element: "Earth", nature: "Analysis, Service", color: "text-green-400" },
  Libra: {
    element: "Air",
    nature: "Balance, Relationships",
    color: "text-pink-400",
  },
  Scorpio: {
    element: "Water",
    nature: "Transformation, Intensity",
    color: "text-purple-400",
  },
  Sagittarius: {
    element: "Fire",
    nature: "Philosophy, Adventure",
    color: "text-orange-400",
  },
  Capricorn: {
    element: "Earth",
    nature: "Ambition, Structure",
    color: "text-gray-400",
  },
  Aquarius: {
    element: "Air",
    nature: "Innovation, Humanity",
    color: "text-cyan-400",
  },
  Pisces: {
    element: "Water",
    nature: "Spirituality, Compassion",
    color: "text-indigo-400",
  },
};

export const houseMeanings: { [key: number]: HouseMeaning } = {
  1: {
    name: "1st House (Lagna)",
    meaning: "Your personality, appearance, and how you approach life",
    lifeArea: "Self & Identity",
  },
  2: {
    name: "2nd House",
    meaning: "Wealth, family, speech, and values",
    lifeArea: "Money & Family",
  },
  3: {
    name: "3rd House",
    meaning: "Courage, siblings, communication, and short travels",
    lifeArea: "Courage & Communication",
  },
  4: {
    name: "4th House",
    meaning: "Mother, home, emotions, and property",
    lifeArea: "Home & Emotions",
  },
  5: {
    name: "5th House",
    meaning: "Children, creativity, intelligence, and romance",
    lifeArea: "Creativity & Children",
  },
  6: {
    name: "6th House",
    meaning: "Health, enemies, service, and daily work",
    lifeArea: "Health & Service",
  },
  7: {
    name: "7th House",
    meaning: "Marriage, partnerships, and business relationships",
    lifeArea: "Marriage & Partnership",
  },
  8: {
    name: "8th House",
    meaning: "Longevity, transformation, and hidden things",
    lifeArea: "Transformation & Secrets",
  },
  9: {
    name: "9th House",
    meaning: "Father, luck, spirituality, and higher learning",
    lifeArea: "Luck & Spirituality",
  },
  10: {
    name: "10th House",
    meaning: "Career, reputation, and public life",
    lifeArea: "Career & Status",
  },
  11: {
    name: "11th House",
    meaning: "Gains, friends, ambitions, and fulfillment",
    lifeArea: "Gains & Friends",
  },
  12: {
    name: "12th House",
    meaning: "Expenses, losses, spirituality, and foreign lands",
    lifeArea: "Liberation & Foreign",
  },
};
