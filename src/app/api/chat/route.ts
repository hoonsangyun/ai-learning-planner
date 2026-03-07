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

    // Initialize the SDK. It will automatically use the GEMINI_API_KEY environment variable.
    const ai = new GoogleGenAI({});

    // The system instruction helps define the AI's persona and constraints.
    const systemInstruction =
      "You are an expert middle school math tutor named StudyLens AI. " +
      "Your goal is to guide students to the answer step-by-step using the Socratic method. " +
      "DO NOT simply give away the final solution immediately. " +
      "Praise them when correct, provide small hints when stuck. " +
      "ALWAYS format mathematical formulas using LaTeX. Use \\( ... \\) for inline formulas and \\[ ... \\] for block formulas.";

    // Convert the frontend message format to the format expected by the GenAI SDK
    // Note: The GenAI SDK typically expects roles to be 'user' or 'model'
    const formattedHistory = messages.map((msg: any) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Use generateContent with the full history to maintain conversation state
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash", // Corrected model name
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