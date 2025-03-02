import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyDnlEog-qRSHkS0MhtEWWnLDh6gq4k9Ke4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const extractTaskDetails = async (text: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Extract task details from this text:
      - Task Name
      - Task Deadline (in YYYY-MM-DD format)
      - Estimated Duration (in minutes or hours)
      - Task Description (optional)
      - Difficulty Level (Easy, Medium, Hard)
      - Priority Level (High, Medium, Low)
      
      If any information is missing, return null for that field.

      Input: "${text}"
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text(); // Gemini returns a structured response

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini LLM extraction error:", error);
    return null;
  }
};
