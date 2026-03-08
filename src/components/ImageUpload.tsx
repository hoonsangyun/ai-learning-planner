"use client";

import { useState } from "react";
import { UploadCloud, Search, AlertCircle, Calculator, Target, BookOpen } from "lucide-react";
import TeX from "@matejmazur/react-katex";
import "katex/dist/katex.min.css";

interface AnalysisResult {
  formulas: string;
  steps: string;
  answer: string;
}

export default function ImageUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      console.error(err);
      setError("이미지를 분석하는 도중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderMathText = (content: string) => {
    // Basic regex to find inline \( ... \) and block \[ ... \]
    const parts = content.split(/(\\\([\s\S]*?\\\)|\\[[\s\S]*?\\])/g);
    return (
      <span className="whitespace-pre-wrap leading-relaxed">
        {parts.map((part, i) => {
          if (part.startsWith("\\(") && part.endsWith("\\)")) {
            return <TeX key={i} math={part.slice(2, -2)} />;
          } else if (part.startsWith("\\[") && part.endsWith("\\]")) {
            return <TeX key={i} math={part.slice(2, -2)} block />;
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

      {/* Analysis Results (3-Parts) */}
      {result && (
         <div className="flex flex-col gap-4 mt-2">
            <h3 className="font-bold text-gray-800 text-lg">✨ AI 튜터의 분석 결과</h3>

            {/* 1. 핵심 공식 */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm">
               <h4 className="flex items-center gap-2 font-bold text-emerald-800 mb-3 border-b border-emerald-200 pb-2">
                 <BookOpen className="w-5 h-5" /> 1. 핵심 수학 공식
               </h4>
               <div className="text-gray-700 text-sm">
                 {renderMathText(result.formulas)}
               </div>
            </div>

            {/* 2. 단계별 풀이 */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 shadow-sm">
               <h4 className="flex items-center gap-2 font-bold text-blue-800 mb-3 border-b border-blue-200 pb-2">
                 <Calculator className="w-5 h-5" /> 2. 단계별 풀이
               </h4>
               <div className="text-gray-700 text-sm">
                 {renderMathText(result.steps)}
               </div>
            </div>

            {/* 3. 최종 결과 */}
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 shadow-sm">
               <h4 className="flex items-center gap-2 font-bold text-indigo-900 mb-3 border-b border-indigo-200 pb-2">
                 <Target className="w-5 h-5" /> 3. 최종 결과
               </h4>
               <div className="text-gray-800 text-base font-medium">
                 {renderMathText(result.answer)}
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
