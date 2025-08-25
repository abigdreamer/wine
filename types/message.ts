export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: number;
  confidence?: number;
  sources?: string[];
}