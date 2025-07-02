# AI Code Review and Documentation Generation

You will be provided with a git diff. Your task is to perform two actions based on this diff:

1.  **Code Review:**

- Code quality and adherence to best practices
- Identification of potential bugs or security vulnerabilities
- Performance implications and optimizations
- Maintainability and scalability concerns
- Test coverage gaps and recommendations
- Completeness and accuracy of documentation

2.  **Documentation:** For each changed file in the diff, generate documentation.
    - Identify if existing documentation exists for the changed code.
    - If well-documented, create change documentation explaining what was modified and why.
    - If poorly documented, create comprehensive documentation for the entire function/class/module.
    - Focus on business logic changes, new dependencies, and API modifications.

## Output Format

Your response MUST be a single, valid JSON object. Do not include any text or markdown before or after the JSON object. The JSON object should have the following structure:

```json
{
  "code_review": "<Your full code review text here>",
  "documentation": {
    "<filePath1>": "<Documentation for file 1>",
    "<filePath2>": "<Documentation for file 2>"
  }
}
```

The `documentation` object should have a key for each file path that was modified in the provided diff.
