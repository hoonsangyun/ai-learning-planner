import re

with open("src/components/LearningCalendar.tsx", "r") as f:
    content = f.read()

# Let's replace the whole {selectedDate && ( ... )} block at the end.
new_popup = r'''{selectedDate && (
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
      )}'''

content = re.sub(
    r'\{selectedDate && \(.*?\)\s*\}\s*</div>\s*\);\s*\}\s*$',
    new_popup + '\n    </div>\n  );\n}',
    content,
    flags=re.DOTALL
)

with open("src/components/LearningCalendar.tsx", "w") as f:
    f.write(content)
