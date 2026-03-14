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
            problem_formalization: "[문제 35]오른쪽 그림과 같이 넓이가 $900$인 사다리꼴 $ABCD$가 있다. 꼭짓점 $C$에서 직선 $AD$에 내린 수선의 발을 $E$, 꼭짓점 $D$에서 직선 $BC$에 내린 수선의 발을 $F$라 하자. 문제에서 주어진 조건은 다음과 같다.\n$\\overline{AB} = 50, \\overline{CD} = 25$\n$\\overline{DE} = 15, \\overline{CF} = 7$\n점 $C$와 직선 $AD$ 사이의 거리(\\(\\overline{CE}\\))는 $20$이다.\n점 $D$와 직선 $BC$ 사이의 거리(\\(\\overline{DF}\\))는 $24$이다.\n세 점 $A, E, F$와 직선 $DC$ 사이의 거리를 각각 $a, b, c$라 할 때, $\\frac{100bc}{a}$의 값을 구하시오.",
            formulas: [
                "사다리꼴의 넓이 공식: $S = \\frac{1}{2} \\times (\\text{윗변} + \\text{아랫변}) \\times \\text{높이}$",
                "삼각형의 넓이 이중 계산: $(\\text{밑변} \\times \\text{높이}) = (\\text{빗변} \\times \\text{수선의 거리})$",
                "피타고라스의 정리: $a^2 + b^2 = c^2$"
            ],
            diagram_generation: "import matplotlib.pyplot as plt\nimport numpy as np\n\n# Coordinates calculation based on the problem geometry\n# Let D be at (0, 24) and C be at (25, 24) for height a=24\nD = np.array([0, 24])\nC = np.array([25, 24])\nA = np.array([-10, 0])\nB = np.array([40, 0]) # AB = 50\n\n# E is (9, 36) because DE=15, CE=20, CD=25 (Right triangle CDE at E)\n# x^2 + (y-24)^2 = 15^2 and (x-25)^2 + (y-24)^2 = 20^2 -> x=9, y=36\nE = np.array([9, 36])\n\n# F is (23.04, 17.28) because DF=24, CF=7, CD=25 (Right triangle DCF at F)\n# x^2 + (y-24)^2 = 24^2 and (x-25)^2 + (y-24)^2 = 7^2 -> x=23.04, y=17.28\nF = np.array([23.04, 17.28])\n\nfig, ax = plt.subplots(figsize=(8, 7))\nax.set_facecolor('white')\n\n# Draw Main Trapezoid\nax.plot([A[0], B[0]], [A[1], B[1]], 'k-', lw=2)\nax.plot([B[0], C[0]], [B[1], C[1]], 'k-', lw=2)\nax.plot([C[0], D[0]], [C[1], D[1]], 'k-', lw=2)\nax.plot([D[0], A[0]], [D[1], A[1]], 'k-', lw=2)\n\n# Perpendiculars and Extensions\nax.plot([D[0], E[0]], [D[1], E[1]], 'k--', lw=1)\nax.plot([C[0], E[0]], [C[1], E[1]], 'k-', lw=1.5)\nax.plot([C[0], F[0]], [C[1], F[1]], 'k--', lw=1)\nax.plot([D[0], F[0]], [D[1], F[1]], 'k-', lw=1.5)\n\n# Label Points\nfor label, pos in {'A': A, 'B': B, 'C': C, 'D': D, 'E': E, 'F': F}.items():\n    ax.text(pos[0], pos[1]+1, label, ha='center', fontsize=12, fontweight='bold')\n\n# Right angle markers\ndef draw_sq(p, v1, v2, size=1.5):\n    v1 = v1 / np.linalg.norm(v1) * size\n    v2 = v2 / np.linalg.norm(v2) * size\n    ax.plot([p[0]+v1[0], p[0]+v1[0]+v2[0], p[0]+v2[0]], [p[1]+v1[1], p[1]+v1[1]+v2[1], p[1]+v2[1]], 'k-', lw=1)\n\ndraw_sq(E, D-E, C-E)\ndraw_sq(F, C-F, D-F)\n\nax.set_aspect('equal')\nax.axis('off')\nplt.title(\"Geometry Reconstruction ($a=24, b=12, c=6.72$)\", fontsize=14)\n# plt.savefig('reconstructed_geometry.png')\n# plt.show()",
            solution_steps: [
                {
                    step: 1,
                    title: "$a$ 구하기 (사다리꼴의 높이)",
                    content: "$a$는 점 $A$에서 직선 $DC$ 사이의 거리이므로 사다리꼴의 높이와 같습니다.\n$$900 = \\frac{1}{2} \\times (50 + 25) \\times a$$\n$$900 = 37.5 \\times a$$\n$$a = \\frac{900}{37.5} = 24$$"
                },
                {
                    step: 2,
                    title: "$b$ 구하기 (점 $E$에서 직선 $DC$ 사이의 거리)",
                    content: "점 $E$에서 $DC$까지의 거리는 직각삼각형 $CDE$의 넓이를 활용하여 구합니다.\n$\\triangle CDE$의 넓이 = $\\frac{1}{2} \\times \\overline{DE} \\times \\overline{CE} = \\frac{1}{2} \\times 15 \\times 20 = 150$\n동시에 넓이 = $\\frac{1}{2} \\times \\overline{CD} \\times b = \\frac{1}{2} \\times 25 \\times b$\n$$12.5 \\times b = 150$$\n$$b = 12$$"
                },
                {
                    step: 3,
                    title: "$c$ 구하기 (점 $F$에서 직선 $DC$ 사이의 거리)",
                    content: "점 $F$에서 $DC$까지의 거리는 직각삼각형 $DCF$의 넓이를 활용하여 구합니다.\n$\\triangle DCF$의 넓이 = $\\frac{1}{2} \\times \\overline{CF} \\times \\overline{DF} = \\frac{1}{2} \\times 7 \\times 24 = 84$\n동시에 넓이 = $\\frac{1}{2} \\times \\overline{CD} \\times c = \\frac{1}{2} \\times 25 \\times c$\n$$12.5 \\times c = 84$$\n$$c = \\frac{168}{25}$$"
                },
                {
                    step: 4,
                    title: "최종 값 계산",
                    content: "구하고자 하는 식 $\\frac{100bc}{a}$에 위에서 구한 값들을 대입합니다.\n$$\\frac{100 \\times 12 \\times \\frac{168}{25}}{24}$$\n$$= \\frac{4 \\times 12 \\times 168}{24} \\quad (\\because 100/25 = 4)$$\n$$= 336$$"
                }
            ],
            final_answer: "336"
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