import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserConfig, getConfig } from "../../store/config-storage";
import { OPENROUTER_KEY } from '@env';
async function getUserConfig(): Promise<UserConfig> {
  return await getConfig() || {};
}

// Get the current user ID from AsyncStorage
async function getCurrentUserId(): Promise<string | null> {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (!userJson) {
      console.log('No user found in AsyncStorage');
      return null;
    }
    
    const userData = JSON.parse(userJson);
    return userData.id || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Get user-specific storage key
async function getUserStorageKey(baseKey: string): Promise<string> {
  const userId = await getCurrentUserId();
  return userId ? `${baseKey}_${userId}` : baseKey;
}

// Function to get uploaded file info
async function getUploadedFileInfo(): Promise<any> {
  try {
    console.log('Getting file info from AsyncStorage');
    
    // Get user-specific file key
    const fileKey = await getUserStorageKey('userUploadedFile');
    console.log('Using storage key:', fileKey);
    
    const fileDataJson = await AsyncStorage.getItem(fileKey);
    if (!fileDataJson) {
      console.log('No file has been uploaded for this user');
      return null;
    }
    
    try {
      const parsedData = JSON.parse(fileDataJson);
      console.log('File metadata found:', {
        name: parsedData.name,
        type: parsedData.type,
        size: parsedData.size,
        uploadDate: parsedData.uploadDate
      });
      return parsedData;
    } catch (parseError) {
      console.error('Error parsing file data JSON:', parseError);
      
      // If JSON parsing fails, try to remove corrupted data
      await AsyncStorage.removeItem(fileKey);
      return null;
    }
  } catch (error) {
    console.error('Error getting uploaded file info:', error);
    return null;
  }
}

// Get file content from AsyncStorage if available
export async function getFileContent(): Promise<string> {
  try {
    console.log('Getting file content from AsyncStorage');
    
    // Get user-specific file keys
    const fileInfoKey = await getUserStorageKey('userUploadedFile');
    const contentKey = await getUserStorageKey('userUploadedFileContent');
    
    // First check if file info exists
    const fileInfo = await AsyncStorage.getItem(fileInfoKey);
    if (!fileInfo) {
      console.log('No file info found for current user, cannot retrieve content');
      return '';
    }
    
    const fileContent = await AsyncStorage.getItem(contentKey);
    
    if (!fileContent) {
      console.log('No file content found in AsyncStorage for current user');
      return '';
    }
    
    console.log('Retrieved file content from AsyncStorage:', 
      fileContent ? `${fileContent.substring(0, 100)}... (${fileContent.length} chars)` : 'No content found');
    return fileContent;
  } catch (error) {
    console.error('Error getting file content:', error);
    return '';
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
    console.log('User config:', config);
    
    const fileInfo = await getUploadedFileInfo();
    console.log('File info:', fileInfo);
    
    const fileContent = await getFileContent();
    console.log('File content available:', fileContent);

    // Determine winery name from website URL if available, otherwise use generic term
    let wineryName = "your winery";
    
    if (config.website) {
      try {
        // Try to extract domain without www. prefix
        const hostname = config.website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
        wineryName = hostname.split('.')[0];
      } catch {
        // Keep default generic name
      }
    }
    
    console.log('Building system prompt with personality:', config.personality);
    console.log('File content available for prompt:', fileContent ? 'Yes' : 'No');
    
    const systemPrompt = `
  You are a ${
    config.personality || "friendly sommelier"
  } AI concierge for a winery.
  Always respond in ${config.language || "English"}.
  User's name (if provided): ${config.name || "Guest"}.
  Theme preference: ${config.theme || "default"}.
  Font preference: ${config.font || "system"}.
  
  ${fileContent ? `
  IMPORTANT: Use the following uploaded document as your primary source of knowledge:
  
  ${fileContent}
  
  Base all your answers on the above information. The document contains the specific details about the winery you're representing. Extract the winery name, tour information, pricing, and all other details from this document.
  ` : `
  Important Notes:
  - Focus on providing accurate information about ${wineryName} tours and tastings:
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
  - If user asks about unrelated topics, redirect to winery offerings
  - When sharing tour/tasting info, always mention:
    * Advance booking requirements
    * Duration of experience
    * What's included
    * Current pricing
    * Any seasonal variations
  `}
  
  - Include relevant images (using markdown format: ![description](image_url)) for:
    * Tasting rooms and spaces
    * Tour locations and views
    * Wine flight presentations
    * Food pairing examples
    * Special events and experiences
  - Keep tone professional yet approachable, aligned with personality preference
  `;

  console.log('Sending request to OpenRouter API with messages:', [{ role: "system", content: systemPrompt }, ...messages]);
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
    if (!response.ok) {
      console.error("OpenRouter API HTTP error:", response);
      return {
        text: "Sorry, I couldn't connect to the AI service. Please try again."
      };
    }

    const data = await response.json();

    if (data.error) {
      console.error("OpenRouter API error:", data.error);
      return {
        text: "Sorry, there was an error with the AI service. Please try again."
      };
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid OpenRouter response structure:", data);
      return {
        text: "Sorry, I didn't understand that. Please try rephrasing your question."
      };
    }

    const content = data.choices[0].message.content;
    
    if (!content || typeof content !== 'string') {
      console.error("Invalid message content in OpenRouter response:", data.choices[0].message);
      return {
        text: "Sorry, I received an invalid response. Please try again."
      };
    }
    
    const trimmedContent = content.trim();
    
    // Parse the response for any image URLs
    // Looking for markdown format images: ![description](url)
    const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/g;
    const images = [...trimmedContent.matchAll(imageRegex)].map(match => match[1]);
    
    // Remove the image markdown from the text
    const textContent = trimmedContent.replace(imageRegex, '').trim();

    return {
      text: textContent,
      ...(images.length > 0 && { images })
    };
  } catch (err) {
    console.error("OpenRouter API error:", err);
    
    // Provide more specific error messages based on error type
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return {
        text: "Sorry, I couldn't connect to the AI service. Please check your internet connection."
      };
    }
    
    if (err instanceof SyntaxError) {
      return {
        text: "Sorry, there was an error processing the AI response. Please try again."
      };
    }
    
    return {
      text: "Sorry, I couldn't connect to the AI service. Please try again later."
    };
  }
}
