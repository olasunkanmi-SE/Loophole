import axios from "axios";
import fs from "fs"; // Import fs for file operations

async function callGeminiApi(prompt, diff) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error("Error: GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  // Updated model to gemini-2.5-flash
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`;

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

    // Clean the response by removing markdown backticks and 'json' specifier
    const cleanedText = result.candidates[0].content.parts[0].text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Write cleansed response to a file
    fs.writeFileSync("ai_output.json", cleanedText);

    // Attempt to parse the cleaned text as JSON
    try {
      return JSON.parse(cleanedText);
    } catch (jsonError) {
      try {
        // If JSON parsing fails, try to parse as URL-encoded string
        const params = new URLSearchParams(cleanedText);
        const json = {};
        for (const [key, value] of params) {
          json[key] = value;
        }
        return json;
      } catch (urlParamsError) {
        // If both parsing methods fail, log the errors and exit
        console.error("Error: API response is not valid JSON or URL-encoded.");
        console.error("Cleaned Text:", cleanedText);
        console.error("JSON Error:", jsonError.message);
        console.error("URLSearchParams Error:", urlParamsError.message);
        process.exit(1);
      }
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
    // Set output for GitHub Actions
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `result=${JSON.stringify(result)}\n`
    );
  } catch (error) {
    process.exit(1);
  }
})();
