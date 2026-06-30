export type WeatherType = "sunny" | "sunset" | "night" | "rainy";

export interface ActiveHotspot {
  id: string;
  name: string;
  description: string;
  cameraPos: [number, number, number];
  targetPos: [number, number, number];
}

export interface Product {
  id: string;
  name: string;
  category: "Oils" | "Rice" | "Millets" | "Honey & Sweets";
  price: number;
  unit: string;
  rating: number;
  reviews: number;
  description: string;
  benefits: string[];
  imageUrl: string;
  stock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: Date;
}

export interface SoilDiagnosis {
  diagnosis: string;
  urgency: string;
  remedySteps: string[];
  soilAdvice: string;
  estimatedRecovery: string;
  scientificContext: string;
}

export interface CustomRecipe {
  patronGreeting: string;
  benefitsList: {
    itemName: string;
    benefit: string;
  }[];
  recipeTitle: string;
  recipeIngredients: string[];
  recipeInstructions: string[];
  dailyWellnessTip: string;
}

export interface StayBooking {
  checkIn: string;
  checkOut: string;
  cottageType: "clay" | "bamboo" | "brick";
  guests: number;
  activities: string[];
}
