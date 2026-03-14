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

    if (process.env.USE_FAKE_LLM === 'true') {
        // Return a dummy response for local testing
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network latency
        return NextResponse.json({
            "title": "사다리꼴 넓이와 수선 거리 계산",
            "problem_formalization": "넓이가 $900$인 사다리꼴 $ABCD$에서 $\\overline{AB}=50$, $\\overline{CD}=25$이다. 점 $C$에서 직선 $AD$에 내린 수선의 발을 $E$, 점 $D$에서 직선 $BC$에 내린 수선의 발을 $F$라 하자. $\\overline{DE}=15, \\overline{CF}=7$이고, 점 $C$와 직선 $AD$ 사이의 거리는 $20$, 점 $D$와 직선 $BC$ 사이의 거리는 $24$이다. 세 점 $A, E, F$와 직선 $DC$ 사이의 거리를 각각 $a, b, c$라 할 때, $\\frac{100bc}{a}$의 값을 구하시오.",
            "formulas": [
                "사다리꼴의 넓이 공식: $S = \\frac{1}{2}(a+b)h$",
                "삼각형의 넓이 공식: $S = \\frac{1}{2} \\times \\text{밑변} \\times \\text{높이}$",
                "점과 직선 사이의 거리: 한 점에서 직선에 내린 수선의 길이"
            ],
            "diagram_generation": "import matplotlib.pyplot as plt\nimport numpy as np\n\n# 정밀한 좌표 계산 (a=24, CD=25, AB=50)\nA, B = np.array([0, 0]), np.array([50, 0])\nD, C = np.array([10, 24]), np.array([35, 24])\n\n# 수선의 발 E와 F 좌표 근사 계산\nE = np.array([17.5, 32.5])\nF = np.array([42.5, 12.5])\n\nfig, ax = plt.subplots(figsize=(8, 6))\nax.set_facecolor('white')\n\n# 사다리꼴 그리기\nax.plot([A[0], B[0]], [A[1], B[1]], 'k-', lw=2)\nax.plot([B[0], C[0]], [B[1], B[1] if B[1]==C[1] else C[1]], 'k-', lw=2)\nax.plot([C[0], D[0]], [C[1], D[1]], 'k-', lw=2)\nax.plot([D[0], A[0]], [D[1], A[1]], 'k-', lw=2)\n\n# 수선 및 연장선 그리기\nax.plot([C[0], E[0]], [C[1], E[1]], 'k--', lw=1.5) # CE\nax.plot([D[0], E[0]], [D[1], E[1]], 'k:', lw=1)\nax.plot([D[0], F[0]], [D[1], F[1]], 'k--', lw=1.5) # DF\nax.plot([C[0], F[0]], [C[1], F[1]], 'k:', lw=1)\n\n# 점 레이블\nfor label, pt, pos in zip(['A', 'B', 'C', 'D', 'E', 'F'], [A, B, C, D, E, F], ['bottom', 'bottom', 'right', 'left', 'top', 'right']):\n    ax.text(pt[0], pt[1], f' {label}', fontsize=12, fontweight='bold', va=pos)\n\n# 수치 및 기호 표시\nax.text(22.5, 25, '25', ha='center')\nax.text(25, -2, '50', ha='center')\nax.text(12, 29, '15', rotation=45)\nax.text(39, 18, '7', rotation=-45)\n\n# 직각 표시 (사각형)\ndef draw_perp(p, v1, v2, size=1.5):\n    v1, v2 = v1/np.linalg.norm(v1)*size, v2/np.linalg.norm(v2)*size\n    ax.plot([p[0]+v1[0], p[0]+v1[0]+v2[0], p[0]+v2[0]], [p[1]+v1[1], p[1]+v1[1]+v2[1], p[1]+v2[1]], 'k-', lw=1)\n\ndraw_perp(E, D-E, C-E)\ndraw_perp(F, C-F, D-F)\n\nax.set_aspect('equal')\nax.axis('off')\nplt.tight_layout()\nplt.show()",
            "solution_steps": [
                {
                    "step": "1",
                    "title": "a 구하기 (사다리꼴의 높이)",
                    "content": "$a$는 점 $A$에서 직선 $DC$까지의 거리이므로 사다리꼴의 높이와 같습니다. 넓이 공식을 이용하면, $900 = \\frac{1}{2}(50 + 25) \\times a \\implies 900 = 37.5a \\implies a = 24$."
                },
                {
                    "step": "2",
                    "title": "b 구하기 (점 E에서 직선 DC까지의 거리)",
                    "content": "$\\triangle CDE$는 $\\angle CED = 90^\\circ, \\overline{DE}=15, \\overline{CE}=20, \\overline{CD}=25$인 직각삼각형입니다. 넓이는 $\\frac{1}{2} \\times 15 \\times 20 = 150$입니다. 밑변을 $\\overline{CD}$로 할 때의 높이가 $b$이므로, $150 = \\frac{1}{2} \\times 25 \\times b \\implies b = 12$."
                },
                {
                    "step": "3",
                    "title": "c 구하기 (점 F에서 직선 DC까지의 거리)",
                    "content": "$\\triangle DCF$는 $\\angle DFC = 90^\\circ, \\overline{CF}=7, \\overline{DF}=24, \\overline{CD}=25$인 직각삼각형입니다. 넓이는 $\\frac{1}{2} \\times 7 \\times 24 = 84$입니다. 밑변을 $\\overline{CD}$로 할 때의 높이가 $c$이므로, $84 = \\frac{1}{2} \\times 25 \\times c \\implies c = \\frac{168}{25}$."
                },
                {
                    "step": "4",
                    "title": "최종 식 계산",
                    "content": "구한 $a, b, c$ 값을 대입하면 $\\frac{100bc}{a} = \\frac{100 \\times 12 \\times \\frac{168}{25}}{24}$입니다. 약분하면 $\\frac{4 \\times 12 \\times 168}{24} = \\frac{48 \\times 168}{24} = 2 \\times 168 = 336$."
                }
            ],
            "final_answer": "336"
        });
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
[시스템 역할]
너는 교육용 앱 StudyLens의 백엔드 API 서버야. 업로드된 수학 문제 이미지를 분석하여 정해진 JSON 포맷으로 응답해줘.

[JSON 구조 규격]
title: 문제를 간단히 10자~15자로 요약
problem_formalization: 문제를 LaTeX 형식을 포함한 깔끔한 문장으로 재구성.
formulas: 문제 풀이에 필요한 핵심 공식들을 리스트 형태로 추출.
diagram_generation: (도형이 있는 경우 필수) Python Matplotlib을 사용하여 해당 도형을 그리는 코드를 작성.
  - 배경은 흰색, 선은 검은색, 텍스트는 LaTeX 스타일로 구성.
  - 모든 꼭짓점, 수치, 직각 표시(\\perp)가 포함되어야 함.
solution_steps: 단계별 풀이 과정을 step, title, content 키를 가진 객체 리스트로 구성.
final_answer: 최종 정답 수치 또는 수식.

[기술적 제약사항]
모든 수학 기호와 수식은 LaTeX ($...$)를 사용한다.
JSON 내부의 모든 백슬래시(\\)는 이스케이프 처리(\\\\)하여 전달한다.
diagram_generation 코드는 문자열(String) 형태로 포함하며, 바로 실행 가능한 완성된 형태여야 한다.
불필요한 서술 없이 JSON 데이터만 출력한다.
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
         title: "분석 실패",
         problem_formalization: "수식 파싱 중 오류가 발생했습니다.",
         formulas: [],
         diagram_generation: "",
         solution_steps: [{step: 1, title: "오류", content: responseText}],
         final_answer: "분석 실패"
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