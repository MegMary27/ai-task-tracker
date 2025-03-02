import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = "AIzaSyDnlEog-qRSHkS0MhtEWWnLDh6gq4k9Ke4";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const extractTaskDetails = async (text: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Extract task details from this text in **valid JSON format only** (no markdown, no extra text):
      {
        "task_name": "",
        "task_deadline": "in the format "yyyy-MM-dd"",
        "estimated_duration": "",
        "task_description": "",
        "difficulty_level": "",
        "priority_level": ""
      }

      - If any field is missing, return **null** for that field.
      - Output **only the JSON**, nothing else.

      User input: "${text}"
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text(); // Get raw response

    // ✅ Remove surrounding triple backticks (` ```json ... ``` `)
    responseText = responseText.replace(/^```json\s*|\s*```$/g, "");

    return JSON.parse(responseText); // Parse cleaned JSON
  } catch (error) {
    console.error("❌ Gemini LLM extraction error:", error);
    return null;
  }
};
