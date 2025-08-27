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

const nextStepsSchema = {
    type: Type.OBJECT,
    properties: {
        nextSteps: {
            type: Type.ARRAY,
            description: "An array of 3-5 distinct, actionable, and creative ideas for future social media posts that logically follow the current topic.",
            items: {
                type: Type.STRING
            }
        }
    },
    required: ["nextSteps"]
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


export async function generateNextPostIdeas(
    platform: Platform,
    handle: string,
    topic: string
): Promise<string[]> {
    const prompt = `
        Act as a senior social media content strategist. Based on a user's recent post, your task is to suggest a series of 3-5 follow-up post ideas to create a content pipeline.

        **User Information & Current Post Context:**
        - Platform: ${platform}
        - Handle: ${handle}
        - Original Post Topic: "${topic}"

        **Instructions:**
        1.  **Analyze the Topic:** Consider the core message and potential audience questions or interests related to "${topic}".
        2.  **Brainstorm Follow-ups:** Generate 3 to 5 distinct ideas for the *next* posts. These should build upon the original topic, not just repeat it. Think about creating a mini-series, diving deeper into a specific aspect, showing behind-the-scenes content, or addressing potential customer feedback.
        3.  **Keep it Actionable:** Each idea should be a concise, clear concept for a post. For example: "A 'before and after' Reel showing the impact of the new app feature" or "A LinkedIn article detailing the research behind the app's development."
        4.  **Tailor to Platform:** Ensure the ideas are suitable for ${platform}.
        5.  **Format:** Return the output as a JSON object containing a "nextSteps" array of strings.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: nextStepsSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);

        if (result && Array.isArray(result.nextSteps)) {
            return result.nextSteps;
        } else {
            console.error("Invalid format for next steps response:", result);
            return [];
        }

    } catch (error) {
        console.error("Error generating next post ideas with Gemini API:", error);
        throw new Error("Failed to generate next post ideas.");
    }
}