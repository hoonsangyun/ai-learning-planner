import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Image data is required (imageBase64, mimeType)." },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing.");
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // Clean up base64 string if it contains the data URI prefix
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `
[시스템 역할 지정]너는 학생들의 공부를 도와주는 수학 튜터야.
업로드된 이미지의 문제를 분석하여 다음 4가지 섹션에 맞춰 답변해줘.

1. LaTeX 기반 문제 재구성 (Problem Formalization)이미지의 텍스트를 인식하여 문제집 스타일의 정형화된 문장으로 다시 작성해줘.
모든 수치와 변수는 LaTeX 기법($...$)을 사용하여 깔끔하게 표현해줘.

2. 문제 중, 기하도면이나 그림이 있을 경우에는 그림을 재생성하여 그려줘.
배경은 흰색, 선은 검은색으로 하여 LaTeX 스타일의 깔끔한 도면으로 만들어줘
고정밀 기하 도면일 경우, 고정밀 기하 도면 생성 (Python Visualization)이미지의 수치와 기하학적 비율을 정확히 계산하여 Python(Matplotlib) 코드로 도면을 생성해줘.

3.  핵심 수학 공식 (Core Concepts)이 문제를 해결하는 데 필요한 정의와 공식(예: 사다리꼴 넓이, 피타고라스 정리, 삼각형의 넓이 이중 계산 등)을 나열해줘.

4. 논리적 단계별 풀이 (Step-by-Step Solution)모든 풀이 과정을 논리적 순서에 따라 수식으로 상세히 기술해줘.
특히 구해야 하는 미지수($a, b, c$ 등)별로 섹션을 나누어 풀이하고, 중간 계산 과정을 생략하지 마.

[주의사항]가독성을 위해 불필요한 서술은 줄이고, 수식과 도면에 집중해줘.
최종 결과값은 마지막에 Bold 처리하여 강조해줘.
LaTeX 수식 작성 시, 인라인 수식은 \\( ... \\) 로 감싸고, 블록 수식은 \\[ ... \\] 로 감싸줘. (프론트엔드 렌더링을 위해 필요함)

반드시 아래 JSON 형식으로만 응답해줘. 어떠한 마크다운 백틱(\`\`\`json 등)도 포함하지 말고 순수 JSON만 반환해.
{
  "problemAndDrawing": "1번 문제 재구성과 2번 Python 시각화 코드를 모두 포함한 텍스트...",
  "coreConcepts": "3번 핵심 수학 공식과 정의...",
  "stepByStepSolution": "4번 논리적 단계별 풀이 과정과 최종 정답(Bold)..."
}
`;

    // Make the API call using the specified model from environment variables, defaulting to gemini-1.5-flash
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
      config: {
          temperature: 0.2, // Low temperature for consistent JSON structure
      }
    });

    const responseText = response.text || "{}";

    // Safely parse JSON from the response. Sometimes models wrap it in markdown block.
    let jsonResult;
    try {
       const cleanedText = responseText.replace(/```json/gi, '').replace(/```/gi, '').trim();
       jsonResult = JSON.parse(cleanedText);
    } catch (e) {
       console.error("Failed to parse JSON from AI response:", responseText);
       // Fallback structure if parsing fails
       jsonResult = {
         problemAndDrawing: "수식 파싱 중 오류가 발생했습니다.",
         coreConcepts: "분석 실패",
         stepByStepSolution: responseText
       };
    }

    return NextResponse.json(jsonResult);
  } catch (error: any) {
    console.error("Vision API Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image.", details: error.message },
      { status: 500 }
    );
  }
}