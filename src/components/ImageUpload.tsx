"use client";

import { useState, useEffect } from "react";
import { UploadCloud, Search, AlertCircle, Calculator, Target, BookOpen } from "lucide-react";
import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";

interface SolutionStep {
  step: number;
  title: string;
  content: string;
}

export interface AnalysisResult {
  title: string;
  problem_formalization: string;
  formulas: string[];
  diagram_generation?: string;
  solution_steps: SolutionStep[];
  final_answer: string;
}

export default function ImageUpload({
  externalImage,
  externalResult,
  onAnalysisComplete
}: {
  externalImage?: string | null,
  externalResult?: AnalysisResult | null,
  onAnalysisComplete?: (img: string, res: AnalysisResult) => void
} = {}) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [executeError, setExecuteError] = useState<string | null>(null);

  useEffect(() => {
    if (result && result.diagram_generation) {
    } else {
      setGeneratedImage(null);
      setExecuteError(null);
    }
  }, [result]);


  useEffect(() => {
    if (externalImage) setPreview(externalImage);
    if (externalResult) setResult(externalResult);
  }, [externalImage, externalResult]);


  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setResult(null); // Reset previous analysis when new file is uploaded
    setError(null);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!preview || !fileType) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: preview,
          mimeType: fileType,
        })
      });

      if (!res.ok) {
        throw new Error('Failed to analyze image.');
      }

      const data = await res.json();
      setResult(data);
      if (onAnalysisComplete && preview) {
        onAnalysisComplete(preview, data);
      }
    } catch (err: any) {
      console.error(err);
      setError("이미지를 분석하는 도중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderMathText = (content: string) => {
    // Regex to find inline (\(...\) or $...$) and block (\[...\] or $$...$$)
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\([\s\S]*?\\\)|\\[[\s\S]*?\\])/g);
    return (
      <span className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith("$$") && part.endsWith("$$")) {
            return <TeX key={i} math={part.slice(2, -2)} block />;
          } else if (part.startsWith("\\[") && part.endsWith("\\]")) {
            return <TeX key={i} math={part.slice(2, -2)} block />;
          } else if (part.startsWith("$") && part.endsWith("$")) {
             return <TeX key={i} math={part.slice(1, -1)} />;
          } else if (part.startsWith("\\(") && part.endsWith("\\)")) {
            return <TeX key={i} math={part.slice(2, -2)} />;
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-4">
          {preview ? (
            <div className="relative w-full aspect-video flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Problem Preview" className="max-w-full max-h-full object-contain shadow-sm" />
            </div>
          ) : (
            <>
              <div className="p-4 bg-white rounded-full shadow-sm">
                <UploadCloud className="w-8 h-8 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-700">모르는 문제 사진을 올려주세요!</p>
                <p className="text-sm text-gray-500 mt-1">클릭하거나 사진을 이곳으로 드래그 하세요.</p>
              </div>
            </>
          )}
        </label>
      </div>

      {/* Analyze Button */}
      {preview && !result && (
         <button
           onClick={analyzeImage}
           disabled={isAnalyzing}
           className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
         >
           {isAnalyzing ? (
              <>
                <span className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                수학 튜터가 문제를 분석 중입니다...
              </>
           ) : (
              <>
                <Search className="w-5 h-5" />
                문제 분석하기
              </>
           )}
         </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
           <AlertCircle className="w-5 h-5" /> {error}
        </div>
      )}

      {/* Analysis Results (New JSON Structure) */}
      {result && (
         <div className="flex flex-col gap-4 mt-2">
            <h3 className="font-bold text-gray-800 text-lg flex flex-col gap-1">
               <span>✨ AI 튜터의 분석 결과</span>
               {result.title && (
                 <span className="text-xl text-blue-600 ml-6">{result.title}</span>
               )}
            </h3>

            {/* 1. 문제 재구성 */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-5 shadow-sm">
               <h4 className="flex items-center gap-2 font-bold text-purple-800 mb-3 border-b border-purple-200 pb-2">
                 <Target className="w-5 h-5" /> 1. 문제 재구성 (Problem Formalization)
               </h4>
               <div className="text-gray-700 text-sm">
                 {renderMathText(result.problem_formalization)}
               </div>

               {/* 2. 기하 도면 코드 (If any) */}
               {result.diagram_generation && (
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
               )}
            </div>

            {/* 3. 핵심 수학 공식 */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm">
               <h4 className="flex items-center gap-2 font-bold text-emerald-800 mb-3 border-b border-emerald-200 pb-2">
                 <BookOpen className="w-5 h-5" /> 3. 핵심 수학 공식
               </h4>
               <ul className="list-disc list-inside text-gray-700 text-sm space-y-2">
                 {result.formulas.map((formula, idx) => (
                    <li key={idx}>{renderMathText(formula)}</li>
                 ))}
               </ul>
            </div>

            {/* 4. 단계별 풀이 및 정답 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
               <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">
                 <Calculator className="w-5 h-5" /> 4. 논리적 단계별 풀이
               </h4>
               <div className="flex flex-col gap-3">
                 {result.solution_steps.map((stepInfo, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                       <h5 className="font-bold text-blue-900 text-sm mb-1 border-b border-gray-100 pb-1">
                          Step {stepInfo.step}: {renderMathText(stepInfo.title)}
                       </h5>
                       <div className="text-gray-700 text-sm mt-2">
                          {renderMathText(stepInfo.content)}
                       </div>
                    </div>
                 ))}
               </div>

               {/* Final Answer */}
               <div className="mt-5 pt-4 border-t border-blue-200 flex items-center justify-between">
                  <span className="font-bold text-blue-900 text-lg">최종 정답</span>
                  <div className="bg-blue-600 text-white font-black px-6 py-2 rounded-full shadow-inner text-xl">
                     {renderMathText(result.final_answer)}
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
