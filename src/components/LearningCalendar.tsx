"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";

// Dummy data representing learning progress
const learningData = [
  { date: new Date(new Date().setDate(new Date().getDate() - 2)), status: "review", count: 3 },
  { date: new Date(new Date().setDate(new Date().getDate() - 1)), status: "understood", count: 5 },
  { date: new Date(), status: "understood", count: 2 },
];

export default function LearningCalendar() {
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const handleDayClick = (day: Date) => {
    const data = learningData.find(d => isSameDay(d.date, day));
    if (data) setSelectedDate(day);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full relative">
      <div className="flex items-center gap-2 mb-6 text-gray-800">
        <CalendarIcon className="w-5 h-5 text-indigo-500" />
        <h3 className="font-bold text-lg">{format(currentDate, "MMMM yyyy")} 학습 기록</h3>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {/* Placeholder for days before the start of the month */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}

        {daysInMonth.map((day, i) => {
          const data = learningData.find(d => isSameDay(d.date, day));
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={i}
              onClick={() => handleDayClick(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-xl p-1 cursor-pointer transition-all duration-200
                ${isToday ? "ring-2 ring-indigo-200 font-bold" : "font-medium"}
                ${data ? "hover:-translate-y-1 hover:shadow-md" : "opacity-50 hover:bg-gray-50"}
                ${data?.status === 'understood' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : ""}
                ${data?.status === 'review' ? "bg-rose-50 text-rose-700 border border-rose-100" : ""}
                ${!data ? "bg-white border border-transparent" : ""}
              `}
            >
              <span className="text-sm">{format(day, "d")}</span>
              {data && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full mt-1 ${
                  data.status === 'understood' ? "bg-emerald-200/50" : "bg-rose-200/50"
                }`}>
                  {data.count}문제
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Popup Modal */}
      {selectedDate && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-2xl p-6 flex flex-col border border-indigo-100 shadow-xl transition-all">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-lg text-indigo-900">
              {format(selectedDate, "M월 d일")} 학습 상세
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="p-1.5 hover:bg-indigo-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Understood</span>
              <p className="mt-1 text-sm text-gray-700">이차방정식 근의 공식 응용 문제 (2건)</p>
            </div>
            <div className="p-4 bg-rose-50 rounded-xl border border-rose-100">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Needs Review</span>
              <p className="mt-1 text-sm text-gray-700">피타고라스의 정리 활용 심화 (1건)</p>
            </div>

            <div className="mt-6">
              <h5 className="text-sm font-bold text-gray-500 mb-3">새로 알게 된 공식</h5>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center text-sm font-mono text-gray-700">
                x = (-b ± √(b² - 4ac)) / 2a
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
