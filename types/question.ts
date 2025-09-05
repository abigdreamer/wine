import { Message } from "./message";

export interface Question {
  id: string;
  text: string;
  answer?: string;
  confidence?: number;
  domain: string;
  createdAt: number;
  isFavorite: boolean;
  status: "active" | "completed";
  sources: string[];
  messages?: Message[];
}
