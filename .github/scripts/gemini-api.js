import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function callGeminiApi(prompt, diff) {
  if (!process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${prompt}\n\n${diff}`,
    });

    if (!response.text) {
      console.error("Error: Unexpected API response structure.");
      console.error("Response:", JSON.stringify(response, null, 2));
      process.exit(1);
    }

    return JSON.parse(response.text);
  } catch (error) {
    console.error(
      "Error: Failed to call or parse Gemini API response.",
      error.message
    );
    process.exit(1);
  }
}

(async () => {
  const prompt = process.argv[2];
  const diff = process.argv[3];

  if (!prompt || !diff) {
    console.error("Usage: node gemini-api.js <prompt> <diff>");
    process.exit(1);
  }

  try {
    const result = await callGeminiApi(prompt, diff);
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    process.exit(1);
  }
})();
