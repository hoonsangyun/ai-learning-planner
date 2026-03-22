with open("src/components/ImageUpload.tsx", "r") as f:
    content = f.read()

# Import useEffect if it's missing (actually I added it before, but let's double check)
if 'import { useState, useEffect } from "react";' not in content:
    content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";')

state_add = """  const [isExecuting, setIsExecuting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [executeError, setExecuteError] = useState<string | null>(null);

  useEffect(() => {
    if (result && result.diagram_generation) {
      // Execute python code automatically
      const executeCode = async () => {
        setIsExecuting(true);
        setExecuteError(null);
        try {
          const res = await fetch("/api/execute-python", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: result.diagram_generation }),
          });
          const data = await res.json();
          if (res.ok && data.base64) {
            setGeneratedImage(`data:image/png;base64,${data.base64}`);
          } else {
            setExecuteError(data.error || "실행 오류");
          }
        } catch (e) {
          console.error(e);
          setExecuteError("서버 오류");
        } finally {
          setIsExecuting(false);
        }
      };

      // if external result changed or fresh result
      executeCode();
    } else {
      setGeneratedImage(null);
      setExecuteError(null);
    }
  }, [result]);
"""

# Insert state
content = content.replace("const [error, setError] = useState<string | null>(null);", "const [error, setError] = useState<string | null>(null);\n" + state_add)

# Replace the JSX for diagram_generation
new_jsx = """{result.diagram_generation && (
                   <div className="mt-4 pt-4 border-t border-purple-200">
                     <h5 className="font-semibold text-purple-700 mb-2">2. 기하 도면 생성 결과 (Python 실행)</h5>

                     <div className="bg-white p-4 rounded-md border border-gray-200 flex flex-col items-center justify-center min-h-[200px]">
                       {isExecuting ? (
                         <div className="flex flex-col items-center gap-3">
                           <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                           <p className="text-sm text-gray-500 font-medium">파이썬 코드를 실행하여 도면을 그리는 중입니다...</p>
                         </div>
                       ) : generatedImage ? (
                         // eslint-disable-next-line @next/next/no-img-element
                         <img src={generatedImage} alt="Generated Diagram" className="max-w-full h-auto rounded-md shadow-sm" />
                       ) : executeError ? (
                         <div className="text-red-500 text-sm flex items-center gap-2">
                           <AlertCircle className="w-4 h-4" />
                           코드 실행 실패: {executeError}
                         </div>
                       ) : (
                         <p className="text-gray-400 text-sm">도면을 불러올 수 없습니다.</p>
                       )}
                     </div>

                     <details className="mt-3 group">
                       <summary className="text-xs text-gray-500 cursor-pointer hover:text-purple-600 transition-colors font-medium">
                         파이썬 소스 코드 보기
                       </summary>
                       <pre className="mt-2 bg-gray-50 p-3 rounded-md text-[10px] text-gray-700 overflow-x-auto border border-gray-100 max-h-[150px] overflow-y-auto">
                         <code>{result.diagram_generation}</code>
                       </pre>
                     </details>
                   </div>
               )}"""

# We need to replace the old JSX exactly
import re
content = re.sub(r'\{result\.diagram_generation && \(\s*<div className="mt-4 pt-4 border-t border-purple-200">.*?</div>\s*\)\}', new_jsx, content, flags=re.DOTALL)

with open("src/components/ImageUpload.tsx", "w") as f:
    f.write(content)
