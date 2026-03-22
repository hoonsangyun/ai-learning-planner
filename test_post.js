const result = {
  title: "테스트 제목",
  problem_formalization: "테스트 문제",
  diagram_generation: null,
  solution_steps: [],
  final_answer: "정답",
  formulas: []
};

// We create a very long base64 string to simulate an image upload
const imageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

fetch("http://localhost:3000/api/problems", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ imageUrl, result, isUnderstood: false })
}).then(async res => {
  console.log("POST Status:", res.status);
  const text = await res.text();
  console.log("POST Response:", text);
}).catch(e => console.error(e));

fetch("http://localhost:3000/api/problems").then(async res => {
  console.log("GET Status:", res.status);
  const text = await res.text();
  console.log("GET Response:", text);
}).catch(e => console.error(e));
