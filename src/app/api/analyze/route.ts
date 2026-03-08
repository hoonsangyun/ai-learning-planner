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
[시스템 역할 지정]
너는 기하학 전문 수학 튜터야. 업로드된 이미지의 문제를 분석해서 다음 구조에 맞춰 풀이해줘.

1. 핵심 수학 공식
이 문제를 풀기 위해 필요한 주요 공식(예: 사다리꼴 넓이, 피타고라스 정리, 삼각형의 닮음, 넓이 공식 등)을 나열해줘.

2. 단계별 풀이 (Step-by-Step)
논리적 순서에 따라 수식을 사용하여 단계별로 풀어줘.
특히 미지수(a, b, c 등)를 구하는 과정을 각각 분리해서 설명해줘.

3. 최종 결과
최종 계산 값과 정답을 강조해서 보여줘.

[주의사항]
모든 수식은 LaTeX 형식을 사용하고, 중간 계산 과정을 생략하지 말고 상세히 적어줘.
LaTeX 수식 작성 시, 인라인 수식은 \\( ... \\) 로 감싸고, 블록 수식은 \\[ ... \\] 로 감싸줘.

반드시 아래 JSON 형식으로만 응답해줘. 어떠한 마크다운 백틱(\`\`\`json 등)도 포함하지 말고 순수 JSON만 반환해.
{
  "formulas": "공식 설명 문자열...",
  "steps": "단계별 풀이 문자열...",
  "answer": "최종 결과 문자열..."
}
`;

    // Make the API call using gemini-2.0-flash which supports multimodal
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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
         formulas: "수식 파싱 중 오류가 발생했습니다.",
         steps: responseText,
         answer: "분석 실패"
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