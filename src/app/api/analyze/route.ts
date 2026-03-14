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
            problemAndDrawing: `1. 문제 재구성 (Problem Formalization)
[문제 35]오른쪽 그림과 같이 넓이가 $900$인 사다리꼴 $ABCD$가 있다. 꼭짓점 $C$에서 직선 $AD$에 내린 수선의 발을 $E$, 꼭짓점 $D$에서 직선 $BC$에 내린 수선의 발을 $F$라 하자. 문제에서 주어진 조건은 다음과 같다.
$\\overline{AB} = 50, \\overline{CD} = 25$
$\\overline{DE} = 15, \\overline{CF} = 7$
점 $C$와 직선 $AD$ 사이의 거리(\\(\\overline{CE}\\))는 $20$이다.
점 $D$와 직선 $BC$ 사이의 거리(\\(\\overline{DF}\\))는 $24$이다.
세 점 $A, E, F$와 직선 $DC$ 사이의 거리를 각각 $a, b, c$라 할 때, $\\frac{100bc}{a}$의 값을 구하시오.

2. 고정밀 기하 도면 생성 (Python Visualization)
이미지의 수치와 기하학적 비율을 정확히 계산하여 도면을 생성합니다.
\`\`\`python
import matplotlib.pyplot as plt
import numpy as np

# Coordinates calculation based on the problem geometry
# Let D be at (0, 24) and C be at (25, 24) for height a=24
D = np.array([0, 24])
C = np.array([25, 24])
A = np.array([-10, 0])
B = np.array([40, 0]) # AB = 50

# E is (9, 36) because DE=15, CE=20, CD=25 (Right triangle CDE at E)
# x^2 + (y-24)^2 = 15^2 and (x-25)^2 + (y-24)^2 = 20^2 -> x=9, y=36
E = np.array([9, 36])

# F is (23.04, 17.28) because DF=24, CF=7, CD=25 (Right triangle DCF at F)
# x^2 + (y-24)^2 = 24^2 and (x-25)^2 + (y-24)^2 = 7^2 -> x=23.04, y=17.28
F = np.array([23.04, 17.28])

fig, ax = plt.subplots(figsize=(8, 7))
ax.set_facecolor('white')

# Draw Main Trapezoid
ax.plot([A[0], B[0]], [A[1], B[1]], 'k-', lw=2)
ax.plot([B[0], C[0]], [B[1], C[1]], 'k-', lw=2)
ax.plot([C[0], D[0]], [C[1], D[1]], 'k-', lw=2)
ax.plot([D[0], A[0]], [D[1], A[1]], 'k-', lw=2)

# Perpendiculars and Extensions
ax.plot([D[0], E[0]], [D[1], E[1]], 'k--', lw=1)
ax.plot([C[0], E[0]], [C[1], E[1]], 'k-', lw=1.5)
ax.plot([C[0], F[0]], [C[1], F[1]], 'k--', lw=1)
ax.plot([D[0], F[0]], [D[1], F[1]], 'k-', lw=1.5)

# Label Points
for label, pos in {'A': A, 'B': B, 'C': C, 'D': D, 'E': E, 'F': F}.items():
    ax.text(pos[0], pos[1]+1, label, ha='center', fontsize=12, fontweight='bold')

# Right angle markers
def draw_sq(p, v1, v2, size=1.5):
    v1 = v1 / np.linalg.norm(v1) * size
    v2 = v2 / np.linalg.norm(v2) * size
    ax.plot([p[0]+v1[0], p[0]+v1[0]+v2[0], p[0]+v2[0]], [p[1]+v1[1], p[1]+v1[1]+v2[1], p[1]+v2[1]], 'k-', lw=1)

draw_sq(E, D-E, C-E)
draw_sq(F, C-F, D-F)

ax.set_aspect('equal')
ax.axis('off')
plt.title("Geometry Reconstruction ($a=24, b=12, c=6.72$)", fontsize=14)
plt.savefig('reconstructed_geometry.png')
plt.show()
\`\`\``,
            coreConcepts: `이 문제를 풀기 위해 다음의 개념과 공식을 활용합니다.
사다리꼴의 넓이 공식: $S = \\frac{1}{2} \\times (\\text{윗변} + \\text{아랫변}) \\times \\text{높이}$
삼각형의 넓이 이중 계산: 직각삼각형에서 두 변의 곱은 빗변과 빗변에 내린 수선의 발까지의 거리의 곱과 같습니다.
$(\\text{밑변} \\times \\text{높이}) = (\\text{빗변} \\times \\text{수선의 거리})$
피타고라스의 정리: $a^2 + b^2 = c^2$ (본 문제의 수치 $15, 20, 25$ 및 $7, 24, 25$가 직각삼각형임을 확인하는 데 사용)`,
            stepByStepSolution: `Step 1: $a$ 구하기 (사다리꼴의 높이)
$a$는 점 $A$에서 직선 $DC$ 사이의 거리이므로 사다리꼴의 높이와 같습니다.
$$900 = \\frac{1}{2} \\times (50 + 25) \\times a$$
$$900 = 37.5 \\times a$$
$$a = \\frac{900}{37.5} = 24$$
$a = 24$

Step 2: $b$ 구하기 (점 $E$에서 직선 $DC$ 사이의 거리)
점 $E$에서 $DC$까지의 거리는 직각삼각형 $CDE$의 넓이를 활용하여 구합니다.
$\\triangle CDE$의 넓이 = $\\frac{1}{2} \\times \\overline{DE} \\times \\overline{CE} = \\frac{1}{2} \\times 15 \\times 20 = 150$
동시에 넓이 = $\\frac{1}{2} \\times \\overline{CD} \\times b = \\frac{1}{2} \\times 25 \\times b$
$$12.5 \\times b = 150$$
$$b = \\frac{150}{12.5} = 12$$
$b = 12$

Step 3: $c$ 구하기 (점 $F$에서 직선 $DC$ 사이의 거리)
점 $F$에서 $DC$까지의 거리는 직각삼각형 $DCF$의 넓이를 활용하여 구합니다.
$\\triangle DCF$의 넓이 = $\\frac{1}{2} \\times \\overline{CF} \\times \\overline{DF} = \\frac{1}{2} \\times 7 \\times 24 = 84$
동시에 넓이 = $\\frac{1}{2} \\times \\overline{CD} \\times c = \\frac{1}{2} \\times 25 \\times c$
$$12.5 \\times c = 84$$
$$c = \\frac{84}{12.5} = \\frac{168}{25} = 6.72$$
$c = \\frac{168}{25}$

Step 4: 최종 값 계산
구하고자 하는 식 $\\frac{100bc}{a}$에 위에서 구한 값들을 대입합니다.
$$\\frac{100 \\times 12 \\times \\frac{168}{25}}{24}$$
$$= \\frac{4 \\times 12 \\times 168}{24} \\quad (\\because 100/25 = 4)$$
$$= \\frac{48 \\times 168}{24} = 2 \\times 168 = 336$$

최종 결과값: **336**`
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