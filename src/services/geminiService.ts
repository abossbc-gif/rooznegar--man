import { GoogleGenAI, Type } from "@google/genai";
import { TAG_SUGGESTIONS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function generateTagsFromText(text: string): Promise<string[]> {
  if (!process.env.API_KEY) {
    console.error("Cannot generate tags: Gemini API key is not configured. Please set it in your environment variables.");
    return [];
  }
  if (!text.trim()) {
    return [];
  }

  const prompt = `
    You are a text analysis assistant for a driver's log app in Persian. 
    Analyze the following text from a driver's recording and assign relevant tags from the provided list.
    The output must be a JSON array of strings, containing only the relevant tags.
    If no tags are relevant, return an empty array.

    Available tags: ${JSON.stringify(TAG_SUGGESTIONS)}

    Text:
    "${text}"

    JSON Output:
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const jsonString = response.text;
    const tags = JSON.parse(jsonString);
    return Array.isArray(tags) ? tags : [];

  } catch (error) {
    console.error("Error generating tags from Gemini:", error);
    return [];
  }
}
