import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateCourseDescription = async (title: string, department: string): Promise<string> => {
  try {
    const ai = getClient();
    const model = "gemini-2.5-flash";

    const prompt = `
      You are an academic curriculum developer. Write a concise but professional 
      course syllabus description (approx 60-80 words) for a university catalog.
      
      Course Title: ${title}
      Department: ${department}
      
      Include key learning outcomes or topics covered. 
      Tone: Formal, Educational. Do not use markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Description generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate description. Please check API configuration.";
  }
};

export const generateEventDescription = async (title: string, category: string): Promise<string> => {
  try {
    const ai = getClient();
    const model = "gemini-2.5-flash";

    const prompt = `
      You are an event coordinator. Write a catchy and informative description (approx 50-70 words) for a campus event.
      
      Event Title: ${title}
      Category: ${category}
      
      Tone: Exciting, Inviting. Do not use markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Description generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate description. Please check API configuration.";
  }
};