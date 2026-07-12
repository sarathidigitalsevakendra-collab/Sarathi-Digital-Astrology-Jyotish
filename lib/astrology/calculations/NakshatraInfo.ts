/**
 * Nakshatra Reference Data
 * 
 * Static details for the 27 Nakshatras for use in deep-dive reports.
 */

export interface NakshatraDetails {
  id: number;
  name: string;
  ruler: string;
  deity: string;
  symbol: string;
  meaning: string;
  quality: string; // e.g. "Create", "Preserve", "Destroy" loosely
}

export const NAKSHATRA_DATA: Record<string, NakshatraDetails> = {
  "Ashwini": { 
     id: 1, name: "Ashwini", ruler: "Ketu", deity: "Ashwini Kumaras (Physicians of Gods)", 
     symbol: "Horse's Head", meaning: "Born of a Horse", quality: "Swiftness, Healing, New Beginnings" 
  },
  "Bharani": { 
     id: 2, name: "Bharani", ruler: "Venus", deity: "Yama (God of Death)", 
     symbol: "Yoni (Female reproductive organ)", meaning: "The Bearer", quality: "Restraint, Struggle, Creativity" 
  },
  "Krittika": { 
     id: 3, name: "Krittika", ruler: "Sun", deity: "Agni (Fire God)", 
     symbol: "Knife or Razor", meaning: "The Cutter", quality: "Purification, Cutting Ties, Sharpness" 
  },
  "Rohini": { 
     id: 4, name: "Rohini", ruler: "Moon", deity: "Brahma", 
     symbol: "Cart or Chariot", meaning: "The Red One", quality: "Growth, Fertility, Attraction" 
  },
  "Mrigashira": { 
     id: 5, name: "Mrigashira", ruler: "Mars", deity: "Soma (Moon God)", 
     symbol: "Deer's Head", meaning: "Deer Head", quality: "Searching, Curiosity, Travel" 
  },
  "Ardra": { 
     id: 6, name: "Ardra", ruler: "Rahu", deity: "Rudra (Storm God)", 
     symbol: "Teardrop", meaning: "The Moist One", quality: "Destruction, Transformation, Storms" 
  },
  "Punarvasu": { 
     id: 7, name: "Punarvasu", ruler: "Jupiter", deity: "Aditi (Mother of Gods)", 
     symbol: "Bow and Quiver", meaning: "Return of the Light", quality: "Renewal, Restoration, Safety" 
  },
  "Pushya": { 
     id: 8, name: "Pushya", ruler: "Saturn", deity: "Brihaspati", 
     symbol: "Cow's Udder or Flower", meaning: "Nourisher", quality: "Nourishment, Care, Spiritual Growth" 
  },
  "Ashlesha": { 
     id: 9, name: "Ashlesha", ruler: "Mercury", deity: "Nagas (Serpents)", 
     symbol: "Coiled Serpent", meaning: "The Entwiner", quality: "Binding, Mystery, Intuition" 
  },
  "Magha": { 
     id: 10, name: "Magha", ruler: "Ketu", deity: "Pitris (Ancestors)", 
     symbol: "Royal Throne", meaning: "The Mighty", quality: "Authority, Lineage, Power" 
  },
  "Purva Phalguni": { 
     id: 11, name: "Purva Phalguni", ruler: "Venus", deity: "Bhaga (God of Prosperity)", 
     symbol: "Front legs of a bed", meaning: "Former Red One", quality: "Relaxation, Romance, enjoyment" 
  },
  "Uttara Phalguni": { 
     id: 12, name: "Uttara Phalguni", ruler: "Sun", deity: "Aryaman (God of Contracts)", 
     symbol: "Back legs of a bed", meaning: "Latter Red One", quality: "Patronage, Kindness, Union" 
  },
  "Hasta": { 
     id: 13, name: "Hasta", ruler: "Moon", deity: "Savitr (Sun God)", 
     symbol: "Hand or Fist", meaning: "The Hand", quality: "Skill, Craftsmanship, Grasping" 
  },
  "Chitra": { 
     id: 14, name: "Chitra", ruler: "Mars", deity: "Vishvakarma (Divine Architect)", 
     symbol: "Pearl or Gem", meaning: "The Bright One", quality: "Design, Architecture, Creativity" 
  },
  "Swati": { 
     id: 15, name: "Swati", ruler: "Rahu", deity: "Vayu (Wind God)", 
     symbol: "Shoot of plant or Sword", meaning: "Independent", quality: "Independence, Movement, Scattered" 
  },
  "Vishakha": { 
     id: 16, name: "Vishakha", ruler: "Jupiter", deity: "Indra and Agni", 
     symbol: "Archway or Potter's Wheel", meaning: "Forked", quality: "Goal-oriented, Fixation, Success" 
  },
  "Anuradha": { 
     id: 17, name: "Anuradha", ruler: "Saturn", deity: "Mitra (God of Friendship)", 
     symbol: "Lotus or Staff", meaning: "Following Radha", quality: "Friendship, Devotion, Cooperation" 
  },
  "Jyeshtha": { 
     id: 18, name: "Jyeshtha", ruler: "Mercury", deity: "Indra (King of Gods)", 
     symbol: "Earring or Umbrella", meaning: "The Eldest", quality: "Seniority, Protection, Courage" 
  },
  "Mula": { 
     id: 19, name: "Mula", ruler: "Ketu", deity: "Nirriti (Goddess of Destruction)", 
     symbol: "Roots", meaning: "The Root", quality: "Foundation, Investigation, Uprooting" 
  },
  "Purva Ashadha": { 
     id: 20, name: "Purva Ashadha", ruler: "Venus", deity: "Apah (Water Goddess)", 
     symbol: "Winnowing Basket", meaning: "Former Invincible One", quality: "Invincibility, Fluidity, Purification" 
  },
  "Uttara Ashadha": { 
     id: 21, name: "Uttara Ashadha", ruler: "Sun", deity: "Vishwadevas (Universal Gods)", 
     symbol: "Elephant Tusk", meaning: "Latter Invincible One", quality: "Endurance, Victory, Integrity" 
  },
  "Shravana": { 
     id: 22, name: "Shravana", ruler: "Moon", deity: "Vishnu", 
     symbol: "Ear", meaning: "To Listen", quality: "Listening, Learning, Knowledge" 
  },
  "Dhanishta": { 
     id: 23, name: "Dhanishta", ruler: "Mars", deity: "Ashta Vasus", 
     symbol: "Drum or Flute", meaning: "The Wealthiest", quality: "Wealth, Music, Rhythm" 
  },
  "Shatabhisha": { 
     id: 24, name: "Shatabhisha", ruler: "Rahu", deity: "Varuna (God of Waters)", 
     symbol: "Empty Circle", meaning: "Hundred Physicians", quality: "Healing, Secrecy, Mysticism" 
  },
  "Purva Bhadrapada": { 
     id: 25, name: "Purva Bhadrapada", ruler: "Jupiter", deity: "Aja Ekapada", 
     symbol: "Front of a funeral cot", meaning: "Former Blessed Feet", quality: "Penance, Spirituality, Fire" 
  },
  "Uttara Bhadrapada": { 
     id: 26, name: "Uttara Bhadrapada", ruler: "Saturn", deity: "Ahir Budhnya", 
     symbol: "Back of a funeral cot", meaning: "Latter Blessed Feet", quality: "Deep sea, Stability, Wisdom" 
  },
  "Revati": { 
     id: 27, name: "Revati", ruler: "Mercury", deity: "Pushan", 
     symbol: "Fish or Drum", meaning: "The Wealthy", quality: "Nourishment, Protection, Safe Travel" 
  },
};
