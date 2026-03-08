import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request payload. Expected 'messages' array." },
        { status: 400 }
      );
    }

    // Initialize the SDK explicitly passing the API key from environment variables.
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
    }

    const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY
    });

    // The system instruction helps define the AI's persona and constraints.
    const systemInstruction =
      "You are an expert middle school math tutor named StudyLens AI. " +
      "Your goal is to guide students to the answer step-by-step using the Socratic method. " +
      "DO NOT simply give away the final solution immediately. " +
      "Praise them when correct, provide small hints when stuck. " +
      "ALWAYS format mathematical formulas using LaTeX. Use \\( ... \\) for inline formulas and \\[ ... \\] for block formulas.";

    // Convert the frontend message format to the format expected by the GenAI SDK
    // Note: The GenAI SDK typically expects roles to be 'user' or 'model'
    // Gemini API requires the conversation history to start with a 'user' message.
    // If the first message in our frontend state is the AI greeting, we should filter it out.
    let formattedHistory = messages.map((msg: any) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Ensure the history starts with a 'user' role
    while (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
        formattedHistory.shift();
    }

    // Use generateContent with the full history to maintain conversation state
    const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        contents: formattedHistory,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
        }
    });

    return NextResponse.json({
        role: "ai",
        content: response.text
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response.", details: error.message },
      { status: 500 }
    );
  }
}