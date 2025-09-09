import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserConfig } from "../../store/config-storage";

const OPENROUTER_KEY =
  "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";
async function getUserConfig(): Promise<UserConfig> {
  try {
    const raw = await AsyncStorage.getItem("user_config");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export interface AIResponse {
  text: string;
  images?: string[];
}

export async function getAIResponse(
  messages: { role: string; content: string }[]
): Promise<AIResponse> {
  try {
    console.log('AI Service received messages:', messages);
    const config = await getUserConfig();

    const systemPrompt = `
  You are a ${
    config.personality || "friendly sommelier"
  } AI concierge for Domaine Carneros winery.
  Always respond in ${config.language || "English"}.
  User's name (if provided): ${config.name || "Guest"}.
  Website: ${config.website || "http://domainecarneros.com/"}.
  Theme preference: ${config.theme || "default"}.
  Font preference: ${config.font || "system"}.
  
  Important Notes:
  - Focus on providing accurate information about Domaine Carneros tours and tastings:
    * Available tour types and tasting experiences
    * Current pricing and booking requirements
    * What's included in each tasting package
    * Tour timelines and durations
    * Special experiences (e.g., food pairings, private tastings)
    * Venue spaces and accommodations
    * Seasonal events and special occasions
  - Provide specific details about:
    * Tour schedules and availability
    * Booking process and requirements
    * Group size limitations
    * Cancellation policies
    * Special accommodations or accessibility
    * Food and wine pairing options
  - Include relevant images (using markdown format: ![description](image_url)) for:
    * Tasting rooms and spaces
    * Tour locations and views
    * Wine flight presentations
    * Food pairing examples
    * Special events and experiences
  - Keep tone professional yet approachable, aligned with personality preference
  - If user asks about unrelated topics, redirect to Domaine Carneros offerings
  - When sharing tour/tasting info, always mention:
    * Advance booking requirements
    * Duration of experience
    * What's included
    * Current pricing
    * Any seasonal variations
  `;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat-v3.1:free",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
        }),
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      console.error("Invalid OpenRouter response:", data);
      return {
        text: "Sorry, I didn't understand that."
      };
    }

    const content = data.choices[0].message.content.trim();
    
    // Parse the response for any image URLs
    // Looking for markdown format images: ![description](url)
    const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    const images = [...content.matchAll(imageRegex)].map(match => match[1]);
    
    // Remove the image markdown from the text
    const textContent = content.replace(imageRegex, '').trim();

    return {
      text: textContent,
      ...(images.length > 0 && { images })
    };
  } catch (err) {
    console.error("OpenRouter API error:", err);
    return {
      text: "Sorry, I couldn't connect to the AI service."
    };
  }
}
