import { execSync } from "child_process";

async function callGeminiApi(prompt, diff) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error("Error: GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  const geminiBody = JSON.stringify({
    contents: [
      {
        parts: [
          {
            text: `${prompt}\n\n${diff}`,
          },
        ],
      },
    ],
  });

  try {
    const curlCommand = `curl -X POST -H "Content-Type: application/json" -d '${geminiBody}' "${geminiUrl}"`;
    const response = execSync(curlCommand, { encoding: "utf-8" });

    const result = JSON.parse(response);

    if (!result.candidates || !result.candidates[0]?.content?.parts[0]?.text) {
      console.error("Error: Unexpected API response structure.");
      console.error("Response:", JSON.stringify(result, null, 2));
      process.exit(1);
    }

    return JSON.parse(result.candidates[0].content.parts[0].text);
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
