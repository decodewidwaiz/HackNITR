export interface PlantDisease {
  id: number;
  name: string;
  description: string;
  prevention: string;
  category: 'healthy' | 'disease';
  plantType: string;
}

export interface Product {
  id: number;
  name: string;
  image: string;
  category: 'fertilizer' | 'supplement';
  diseaseId: number;
  buyLink: string;
  rating: number;
}

export interface AnalysisResult {
  title: string;
  description: string;
  prevention: string;
  isHealthy: boolean;
  confidence: number;
  imageUrl: string;
  recommendedProduct?: Product;
}

export interface CropInfo {
  name: string;
  image: string;
  diseaseCount: number;
  diseases: string[];
  icon: string;
}
