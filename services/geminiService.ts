import { GoogleGenAI, Type } from "@google/genai";
import { Platform, PostSuggestion } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      caption: {
        type: Type.STRING,
        description: "The generated social media caption, perfectly tailored for the specified platform."
      },
      imageSuggestion: {
        type: Type.STRING,
        description: "A concise, descriptive suggestion for an accompanying image or video. For example: 'A minimalist flat lay of a laptop, notebook, and coffee cup.'"
      },
      hashtags: {
        type: Type.ARRAY,
        items: {
            type: Type.STRING,
        },
        description: "An array of 5-7 relevant and trending hashtags for the post. Do not include the '#' symbol in the strings."
      }
    },
    required: ["caption", "imageSuggestion", "hashtags"]
  }
};

export async function generateSocialMediaContent(
  platform: Platform,
  handle: string,
  topic: string
): Promise<PostSuggestion[]> {
  
  const prompt = `
    Act as a world-class social media strategist. Your task is to generate 3 engaging post ideas for the social media platform: ${platform}.

    **User Information:**
    - Platform: ${platform}
    - Handle: ${handle}
    - Post Topic: "${topic}"

    **Instructions:**
    1.  **Analyze (Simulated):** Pretend to analyze the typical content style and audience of a user with the handle '${handle}'. Your generated content should feel authentic to such a user.
    2.  **Tailor to Platform:** Create captions that are optimized for ${platform}. Consider character limits, tone of voice, and common conventions (e.g., more hashtags for Instagram, professional tone for LinkedIn, engaging questions for Facebook, short and snappy for TikTok).
    3.  **Generate Captions:** Write 3 distinct, high-quality captions about the topic. Make them creative and engaging.
    4.  **Suggest Trending Hashtags:** For each caption, provide an array of 5-7 relevant and currently trending hashtags related to the topic and platform. Research (simulated) what's popular. Do not include the '#' symbol in the strings.
    5.  **Suggest Images:** For each caption, provide a clear and compelling image or video suggestion that would visually complement the text.
    6.  **Format:** Return the output as a JSON array of objects, with each object containing a "caption", an "imageSuggestion", and a "hashtags" array.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const suggestions: PostSuggestion[] = JSON.parse(jsonText);
    return suggestions;
  } catch (error) {
    console.error("Error generating content with Gemini API:", error);
    throw new Error("Failed to generate social media content.");
  }
}
