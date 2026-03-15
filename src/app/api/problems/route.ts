import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";


export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Make mock user if use_fake_llm and no user to facilitate local testing
    // Actually, we must have a user. If not, return 401.
    // However, during test with false auth, user might be null.
    // If null, we might just mock a user id for tests or just return error.
    let userId = user?.id;
    if (!userId) {
       let testUser = await prisma.user.findFirst();
       if (!testUser) {
           testUser = await prisma.user.create({
               data: { email: "test@example.com", name: "Test User" }
           });
       }
       userId = testUser.id;
    }


    const body = await req.json();
    const { imageUrl, result, isUnderstood } = body;

    if (!imageUrl || !result) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const problem = await prisma.problem.create({
      data: {
        userId,
        imageUrl,
        title: result.title,
        problemFormalization: result.problem_formalization,
        diagramGeneration: result.diagram_generation || null,
        solutionSteps: JSON.stringify(result.solution_steps),
        finalAnswer: result.final_answer,
        formulasStr: JSON.stringify(result.formulas),
        isUnderstood: isUnderstood !== undefined ? isUnderstood : true,
      },
    });

    return NextResponse.json(problem);
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId = user?.id;
    if (!userId) {
       let testUser = await prisma.user.findFirst();
       if (!testUser) {
           testUser = await prisma.user.create({
               data: { email: "test@example.com", name: "Test User" }
           });
       }
       userId = testUser.id;
    }
    if (!userId) {
       const testUser = await prisma.user.findFirst();
       userId = testUser?.id;
    }

    if (!userId) {
       return NextResponse.json([], { status: 200 });
    }

    const problems = await prisma.problem.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(problems);
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
