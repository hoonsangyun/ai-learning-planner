import re

with open("src/app/api/problems/route.ts", "r") as f:
    content = f.read()

# Instead of blindly replacing, let's just write a clean function for ensureUserExists
clean_file = """import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";

async function ensureLocalUser(user: any) {
  if (!user || !user.id) return null;
  const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!existingUser) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email || `${user.id}@example.com`,
        name: user.user_metadata?.full_name || "User"
      }
    });
  }
  return user.id;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId = await ensureLocalUser(user);

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

    let userId = await ensureLocalUser(user);

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
"""

with open("src/app/api/problems/route.ts", "w") as f:
    f.write(clean_file)
