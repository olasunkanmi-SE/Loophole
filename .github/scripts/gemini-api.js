import fetch from "node-fetch";
async function callGeminiApi(prompt, diff) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error("Error: GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;
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
    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      console.error(`Error: API call failed with status ${response.status}`);
      process.exit(1);
    }

    const result = await response.json();

    if (!result.candidates || !result.candidates[0]?.content?.parts[0]?.text) {
      console.error("Error: Unexpected API response structure.");
      console.error("Response:", JSON.stringify(result, null, 2));
      process.exit(1);
    }

    // The response is expected to be a JSON string, so we parse it.
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
    // The error is already logged in callGeminiApi, so just exit.
    process.exit(1);
  }
})();
