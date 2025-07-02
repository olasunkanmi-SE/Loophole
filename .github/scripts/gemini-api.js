import axios from "axios";
import fs from "fs"; // Import fs for file operations

async function callGeminiApi(prompt, diff) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error("Error: GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  // Updated model to gemini-2.5-flash
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

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

    return result.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error(
      "Error: Failed to call Gemini API.",
      error.response ? error.response.data : error.message
    );
    process.exit(1);
  }
}

(async () => {
  const prompt = process.argv[2];
  const diff = process.argv[3];
  const outputDir = "output";

  if (!prompt || !diff) {
    console.error("Usage: node gemini-api.js <prompt> <diff>");
    process.exit(1);
  }

  try {
    const result = await callGeminiApi(prompt, diff);

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Write result to code_review.md
    fs.writeFileSync(`${outputDir}/code_review.md`, result);

    // Set output for GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `result=${JSON.stringify(result)}\n`
    );
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
})();

export default callGeminiApi;
