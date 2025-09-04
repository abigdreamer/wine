const OPENROUTER_KEY =
  "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";

export async function getAIResponse(userMessage: string): Promise<string> {
  try {
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
          messages: [
            {
              role: "system",
              content:
                "You are a friendly sommelier AI. Always talk about wines, food pairings, and tasting notes in an approachable tone.",
            },
            {
              role: "user",
              content: userMessage,
            },
          ],
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
