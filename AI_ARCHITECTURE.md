# AI Logic Architecture (StudyLens)

This document outlines the strategy for integrating AI capabilities (specifically referencing multimodal models like Gemini 2.0 Flash/Pro) into the StudyLens web app.

## 1. Core Objectives
- **Vision (Image Recognition):** Parse handwritten or printed math problems from user-uploaded images.
- **Socratic Dialogue (Chat):** Guide students to the answer step-by-step without simply giving away the final solution.
- **Formula Scraping (Data Extraction):** Automatically identify and extract core mathematical formulas used during the problem-solving process.

## 2. Model Selection
- **Primary Model:** `gemini-2.0-flash` (or `gemini-pro-vision` equivalent)
- **Reasoning:** Fast response times for chat, strong multimodal capabilities for reading messy handwriting or low-quality photos of textbooks, and large context windows for maintaining chat history.

## 3. Workflow & Prompt Engineering

### Step 3.1: Image Parsing & Initial Assessment
**Trigger:** User uploads an image via the `ImageUpload` component.
**Action:** The image is converted to Base64 and sent to the multimodal AI API.
**System Prompt Example:**
> "You are an expert middle school math tutor. Analyze the following image containing a math problem.
> 1. Transcribe the problem accurately.
> 2. Do NOT provide the final answer yet.
> 3. Identify the core concepts required to solve this problem.
> 4. Greet the student and ask an initial guiding question to test their understanding of the first step."

### Step 3.2: Socratic Dialogue Loop
**Trigger:** User responds in the `ChatInterface`.
**Action:** Append the user's message to the chat history and send it to the AI.
**System Prompt Example:**
> "Maintain your persona as a patient Socratic tutor.
> Evaluate the student's response.
> If they are correct, praise them and ask for the next step.
> If they are stuck or incorrect, provide a small hint or ask a simpler related question.
> Always output math formulas using LaTeX format wrapped in `\(` and `\)` for inline or `\[` and `\]` for block equations so the frontend can render them with KaTeX."

### Step 3.3: Formula Extraction
**Trigger:** Triggered asynchronously when the AI identifies a key formula in the chat, or explicitly when the user clicks "이해했어요! (Understood)".
**Action:** Send the entire chat transcript to the AI with a strict JSON output requirement.
**System Prompt Example:**
> "Review the following math tutoring transcript.
> Extract all fundamental mathematical formulas or theorems that were discussed.
> Output the result strictly in the following JSON format:
> `[{ "category": "Algebra", "title": "Quadratic Formula", "latex": "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", "description": "Used to find roots of a quadratic equation" }]`
> Do not include any markdown formatting outside of the JSON block."

## 4. State Management & Database
- When the user clicks the **"이해했어요!" (ConfettiButton)**, the frontend sends a `POST` request to update the `Problem` record's `isUnderstood` state to `true` in the Prisma database.
- The extracted formulas from Step 3.3 are saved to the `Formula` table and linked to the `UserId` and `ProblemId`.
- The Calendar component fetches aggregated data based on the `updatedAt` timestamps and `isUnderstood` states of the user's problems.