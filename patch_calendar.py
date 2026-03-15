import re

with open("src/components/LearningCalendar.tsx", "r") as f:
    content = f.read()

# Make the signature accept onSelectProblem
new_sig = '''import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { Calendar as CalendarIcon, X, Trash2 } from "lucide-react";
import { AnalysisResult } from "@/components/ImageUpload";

export default function LearningCalendar({ onSelectProblem }: { onSelectProblem?: (img: string, result: AnalysisResult) => void }) {
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [problems, setProblems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProblems = async () => {
    try {
      const res = await fetch("/api/problems");
      if (res.ok) {
        const data = await res.json();
        setProblems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayProblems = (day: Date) => {
    return problems.filter(p => isSameDay(parseISO(p.createdAt), day));
  };

  const handleDayClick = (day: Date) => {
    const dayProblems = getDayProblems(day);
    if (dayProblems.length > 0) {
      setSelectedDate(day);
    } else {
      setSelectedDate(null);
    }
  };

  const handleProblemClick = (problem: any) => {
    if (onSelectProblem) {
      const result: AnalysisResult = {
        title: problem.title || "",
        problem_formalization: problem.problemFormalization || "",
        diagram_generation: problem.diagramGeneration || undefined,
        solution_steps: JSON.parse(problem.solutionSteps || "[]"),
        final_answer: problem.finalAnswer || "",
        formulas: JSON.parse(problem.formulasStr || "[]")
      };
      onSelectProblem(problem.imageUrl, result);
    }
    setSelectedDate(null);
  };

  const handleDeleteProblem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("이 학습 기록을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/problems/${id}`, { method: "DELETE" });
      if (res.ok) {
         fetchProblems();
         // If deleted the last one on this day, close the popup
         if (selectedDate && getDayProblems(selectedDate).length <= 1) {
             setSelectedDate(null);
         }
      } else {
         alert("삭제에 실패했습니다.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };
'''

content = re.sub(
    r'import \{ useState \} from "react";.*?const handleDayClick = \(day: Date\) => \{.*?  \};',
    new_sig,
    content,
    flags=re.DOTALL
)

# Render the problems dynamically
# Replace the days mapping logic
content = re.sub(
    r'\{daysInMonth\.map\(\(day, i\) => \{\n.*?return \(\n.*?\}\)\}',
    r'''{daysInMonth.map((day, i) => {
          const dayProblems = getDayProblems(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={i}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square p-1 relative flex flex-col items-center justify-center rounded-xl transition-all duration-200
                ${isToday ? 'bg-indigo-50 font-bold text-indigo-600' : 'hover:bg-gray-50 text-gray-700'}
                ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                ${dayProblems.length > 0 ? 'bg-white shadow-sm border border-emerald-100 hover:border-emerald-200 cursor-pointer' : 'cursor-default opacity-80'}
              `}
              disabled={dayProblems.length === 0}
            >
              <span className="text-sm">{format(day, 'd')}</span>
              {dayProblems.length > 0 && (
                <div className="flex gap-1 mt-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                </div>
              )}
            </button>
          );
        })}''',
    content,
    flags=re.DOTALL
)

# Replace the popup rendering
content = re.sub(
    r'\{selectedDate && \(.*?<div className="absolute.*?상세 보기.*?</div>\s*\)\}',
    r'''{selectedDate && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-gray-100 z-50">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-800">{format(selectedDate, "yyyy년 M월 d일")} 학습 기록</h4>
            <button onClick={() => setSelectedDate(null)} className="p-1 hover:bg-gray-100 rounded-full text-gray-500"><X className="w-5 h-5"/></button>
          </div>
          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
             {getDayProblems(selectedDate).map((problem, idx) => (
                <div key={problem.id} className="bg-emerald-50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-emerald-100/50 hover:shadow-sm transition-shadow">
                  <div className="flex-1 cursor-pointer" onClick={() => handleProblemClick(problem)}>
                    <div className="text-emerald-800 font-bold text-sm mb-1 line-clamp-1">{problem.title || `문제 ${idx + 1}`}</div>
                    <div className="text-emerald-600/80 text-xs font-medium">{format(parseISO(problem.createdAt), "HH:mm")}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                       className="px-4 py-2 bg-white text-emerald-700 text-xs font-bold rounded-lg shadow-sm hover:shadow active:scale-95 transition-all border border-emerald-100"
                       onClick={() => handleProblemClick(problem)}
                    >
                      다시 보기
                    </button>
                    <button
                       className="p-2 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50 active:scale-95 transition-all border border-red-100"
                       onClick={(e) => handleDeleteProblem(e, problem.id)}
                       title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
             ))}
          </div>
        </div>
      )}''',
    content,
    flags=re.DOTALL
)

with open("src/components/LearningCalendar.tsx", "w") as f:
    f.write(content)
