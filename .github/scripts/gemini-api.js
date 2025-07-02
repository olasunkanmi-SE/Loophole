import axios from "axios";
import fs from "fs"; // Import fs for writing to $GITHUB_OUTPUT and temporary files

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

    // Clean the response by removing markdown backticks
    const cleanedText = result.candidates[0].content.parts[0].text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Initialize output
    let codeReview = cleanedText;
    let documentation = {};

    // Extract documentation for changed files from the diff
    const files = [];
    const diffLines = diff.split("\n");
    for (const line of diffLines) {
      if (line.startsWith("+++ ") || line.startsWith("--- ")) {
        const filePath = line.substring(4).replace(/^b\//, "");
        if (filePath && !files.includes(filePath) && !line.startsWith("---")) {
          files.push(filePath);
        }
      }
    }

    // Generate simple documentation for each changed file
    files.forEach((file) => {
      documentation[
        file
      ] = `Auto-generated documentation for ${file}: Updated based on recent changes.`;
    });

    // If the response contains a documentation section, attempt to parse it
    if (cleanedText.includes("## Documentation")) {
      const sections = cleanedText.split("## Documentation");
      codeReview = sections[0].trim();
      const docSection = sections[1]?.trim();
      if (docSection) {
        const docLines = docSection.split("\n");
        let currentFile = null;
        let currentContent = [];
        for (const line of docLines) {
          if (line.startsWith("File: ")) {
            if (currentFile) {
              documentation[currentFile] = currentContent.join("\n").trim();
              currentContent = [];
            }
            currentFile = line.substring(6).trim();
          } else if (currentFile) {
            currentContent.push(line);
          }
        }
        if (currentFile && currentContent.length) {
          documentation[currentFile] = currentContent.join("\n").trim();
        }
      }
    }

    // Write raw code review to a temporary file to preserve markdown
    fs.writeFileSync("code_review_raw.md", codeReview);

    // Sanitize code_review for JSON output (remove quotes and backslashes)
    const jsonSafeCodeReview = codeReview
      .replace(/["\\]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    return {
      code_review: jsonSafeCodeReview,
      code_review_raw: "code_review_raw.md",
      documentation,
    };
  } catch (error) {
    console.error(
      "Error: Failed to call Gemini API.",
      error.response ? error.response.data : error.message
    );
    const errorMessage =
      `Error: Failed to generate code review. ${error.message}`
        .replace(/["\\]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    return {
      code_review: errorMessage,
      code_review_raw: "",
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
      code_review_raw: "",
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
      code_review: `Error: Script execution failed. ${error.message}`
        .replace(/["\\]/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
      code_review_raw: "",
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
