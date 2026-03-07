"use client";

import React from "react";
import "katex/dist/katex.min.css";
import TeX from "@matejmazur/react-katex";
import { BookOpen } from "lucide-react";

export default function FormulaNote() {
  const formulas = [
    {
      id: "1",
      category: "대수학",
      title: "근의 공식",
      latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      description: "이차방정식 $ax^2 + bx + c = 0$ 의 해를 구하는 공식",
    },
    {
      id: "2",
      category: "기하학",
      title: "피타고라스 정리",
      latex: "a^2 + b^2 = c^2",
      description: "직각삼각형에서 빗변의 제곱은 다른 두 변의 제곱의 합과 같다",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
      <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
        <BookOpen className="w-6 h-6 text-emerald-500" />
        나만의 공식 노트
      </h3>

      <div className="space-y-4">
        {formulas.map((formula) => (
          <div key={formula.id} className="p-5 border border-gray-200 rounded-xl hover:border-emerald-200 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                {formula.category}
              </span>
              <span className="text-sm font-medium text-gray-500">{formula.title}</span>
            </div>

            <div className="py-4 bg-gray-50/50 rounded-lg flex justify-center text-xl overflow-x-auto group-hover:bg-emerald-50/30 transition-colors">
              <TeX math={formula.latex} block />
            </div>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              {formula.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}