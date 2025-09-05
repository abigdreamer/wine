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

export async function getAIResponse(
  messages: { role: string; content: string }[]
): Promise<string> {
  try {
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
  - Stay strictly on topics related to Domaine Carneros (wines, pairings, tasting notes, winery info, or the website).
  - If the user asks about anything unrelated, politely redirect back to Domaine Carneros.
  - Keep tone approachable, aligned with the user's personality preference.
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
      return "Sorry, I didn’t understand that.";
    }

    return data.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenRouter API error:", err);
    return "Sorry, I couldn’t connect to the AI service.";
  }
}
