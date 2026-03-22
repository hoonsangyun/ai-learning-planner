import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Basic validation of incoming data
    const { imageUrl, userId, title, problemFormalization, diagramGeneration, solutionSteps, finalAnswer, formulasStr } = data;

    if (!imageUrl) {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Ensure user exists locally before inserting a problem.
    // We use a dummy email if creating them for the first time
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `telegram_${userId}@placeholder.com`,
        name: "Telegram User"
      }
    });

    const newProblem = await prisma.problem.create({
      data: {
        userId,
        imageUrl,
        title: title || "Imported from Telegram",
        problemFormalization: problemFormalization || null,
        diagramGeneration: diagramGeneration || null,
        solutionSteps: solutionSteps ? JSON.stringify(solutionSteps) : null,
        finalAnswer: finalAnswer || null,
        formulasStr: formulasStr ? JSON.stringify(formulasStr) : null,
      },
    });

    return NextResponse.json({ success: true, problem: newProblem });

  } catch (error: any) {
    console.error("Telegram Webhook Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
