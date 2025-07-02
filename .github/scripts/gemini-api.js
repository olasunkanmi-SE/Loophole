import { execSync } from "child_process";
import axios from "axios";
import fs from "fs"; // Import fs for file operations

async function callGeminiApi(prompt, diff) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error("Error: GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

  // The JSON body for the API request
  const geminiBody = {
    contents: [
      {
        parts: [
          {
            text: `${prompt}\n\n${diff}`,
          },
        ],
      },
    ],
  };

  try {
    // Use axios to make the POST request
    const response = await axios.post(geminiUrl, geminiBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Access the response data
    const result = response.data;

    if (!result.candidates || !result.candidates[0]?.content?.parts[0]?.text) {
      console.error("Error: Unexpected API response structure.");
      console.error("Response:", JSON.stringify(result, null, 2));
      process.exit(1);
    }

    // Extract the JSON object from the response
    const textResponse = result.candidates[0].content.parts[0].text;
    const jsonStart = textResponse.indexOf("{");
    const jsonEnd = textResponse.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("Error: Could not find a JSON object in the response.");
      console.error("Response Text:", textResponse);
      process.exit(1);
    }

    const jsonString = textResponse.substring(jsonStart, jsonEnd + 1);

    try {
      return JSON.parse(jsonString);
    } catch (jsonError) {
      console.error("Error: Failed to parse extracted JSON.");
      console.error("Extracted JSON String:", jsonString);
      console.error("Original Error:", jsonError.message);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      "Error: Failed to call or parse Gemini API response.",
      // Axios provides more detailed error information
      error.response ? error.response.data : error.message
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
