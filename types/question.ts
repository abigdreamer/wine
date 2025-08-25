export interface Question {
  id: string;
  text: string;
  answer?: string;
  status: "active" | "completed" | "failed";
  createdAt: number;
  confidence: number;
  domain: string;
  isFavorite: boolean;
  sources: string[];
}