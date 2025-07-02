import axios from "axios";
import fs from "fs"; // Import fs for writing to $GITHUB_OUTPUT

async function callGeminiApi(prompt, diff) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error("Error: GEMINI_API_KEY is not set.");
    return {
      code_review: "Error: GEMINI_API_KEY is not set.",
      documentation: {},
    };
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

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
    const response = await axios.post(geminiUrl, geminiBody, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = response.data;

    if (!result.candidates || !result.candidates[0]?.content?.parts[0]?.text) {
      console.error("Error: Unexpected API response structure.");
      console.error("Response:", JSON.stringify(result, null, 2));
      return {
        code_review: "Error: Unexpected API response structure.",
        documentation: {},
      };
    }

    // Clean the response by removing markdown backticks and newlines
    const cleanedText = result.candidates[0].content.parts[0].text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\n/g, " ") // Replace newlines with spaces
      .replace(/\s+/g, " ") // Collapse multiple spaces
      .trim();

    return { code_review: cleanedText, documentation: {} };
  } catch (error) {
    console.error(
      "Error: Failed to call Gemini API.",
      error.response ? error.response.data : error.message
    );
    return {
      code_review: `Error: Failed to generate code review. ${error.message.replace(
        /\n/g,
        " "
      )}`,
      documentation: {},
    };
  }
}

(async () => {
  const prompt = process.argv[2];
  const diff = process.argv[3];

  if (!prompt || !diff) {
    console.error("Usage: node gemini-api.js <prompt> <diff>");
    const errorResult = {
      code_review: "Error: Missing prompt or diff.",
      documentation: {},
    };
    console.log(JSON.stringify(errorResult));
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `result=${JSON.stringify(errorResult)}\n`
    );
    process.exit(1);
  }

  try {
    const result = await callGeminiApi(prompt, diff);
    console.log(JSON.stringify(result));
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `result=${JSON.stringify(result)}\n`
    );
  } catch (error) {
    console.error("Error:", error.message);
    const errorResult = {
      code_review: `Error: Script execution failed. ${error.message.replace(
        /\n/g,
        " "
      )}`,
      documentation: {},
    };
    console.log(JSON.stringify(errorResult));
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `result=${JSON.stringify(errorResult)}\n`
    );
    process.exit(1);
  }
})();

export default callGeminiApi;
