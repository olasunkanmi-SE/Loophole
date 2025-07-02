import axios from "axios";
import fs from "fs";
import crypto from "crypto"; // Import crypto for hashing

async function callGeminiApi(prompt, diff) {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!geminiApiKey) {
    console.error("Error: GEMINI_API_KEY is not set.");
    process.exit(1);
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`;

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
  const promptPath = process.argv[2];
  const diff = process.argv[3];
  const outputDir = "output";

  if (!promptPath || !diff) {
    console.error("Usage: node gemini-api.js <promptPath> <diff>");
    process.exit(1);
  }

  try {
    const prompt = fs.readFileSync(promptPath, "utf-8");
    const result = await callGeminiApi(prompt, diff);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    if (promptPath.includes("code-review")) {
      fs.writeFileSync(`${outputDir}/code_review.md`, result);
      console.log("Code review has been generated in the 'output' directory.");
    } else if (promptPath.includes("documentation")) {
      // Generate a safe filename using a hash of the diff content
      const hash = crypto
        .createHash("sha256")
        .update(diff)
        .digest("hex")
        .slice(0, 16);
      const safeFileName = `documentation_${hash}.md`;
      fs.writeFileSync(`${outputDir}/${safeFileName}`, result);
      console.log(
        `Documentation has been generated in the 'output' directory with filename: ${safeFileName}`
      );
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
})();

export default callGeminiApi;
