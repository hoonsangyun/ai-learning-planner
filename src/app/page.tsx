import ImageUpload from "@/components/ImageUpload";
import ChatInterface from "@/components/ChatInterface";
import FormulaNote from "@/components/FormulaNote";
import ConfettiButton from "@/components/ConfettiButton";
import LearningCalendar from "@/components/LearningCalendar";
import AuthForm from "@/components/AuthForm";
import { Sparkles, LayoutDashboard, LogOut } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If not logged in, show Auth form
  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row font-sans">
      {/* Sidebar Layout */}
      <aside className="w-full lg:w-[400px] h-auto lg:h-screen p-6 border-b lg:border-r border-gray-200 bg-white shadow-sm flex flex-col overflow-y-auto z-10 sticky top-0 custom-scrollbar">
        <div className="mb-8 mt-2 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3 tracking-tight">
              <Sparkles className="w-8 h-8 text-blue-500" />
              StudyLens
            </h1>
            <p className="text-gray-500 text-sm mt-3 font-medium flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" /> AI 학습 매니저 대시보드
            </p>
          </div>
          <form action={async () => {
            'use server';
            const sb = await createClient();
            await sb.auth.signOut();
          }}>
            <button
              type="submit"
              className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors flex flex-col items-center gap-1 group"
              title="로그아웃"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>

        <div className="flex-1 space-y-8">
          <LearningCalendar />
          <FormulaNote />
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 pb-2">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100/50 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150 duration-700"></div>
            <h4 className="font-bold text-indigo-900 mb-2 z-10 relative">오늘의 학습 목표 🎯</h4>
            <p className="text-sm text-indigo-700/80 mb-4 z-10 relative">
              &quot;수학은 개념을 이해하는 과정이야! 모르는 문제를 피하지 말고 마주해보자!&quot;
            </p>
            <div className="flex gap-2 relative z-10">
               <span className="px-3 py-1 bg-white/60 text-indigo-800 text-xs font-bold rounded-full backdrop-blur-sm border border-indigo-100/50">🔥 연속 3일 학습</span>
               <span className="px-3 py-1 bg-white/60 text-emerald-700 text-xs font-bold rounded-full backdrop-blur-sm border border-emerald-100/50">✨ 85% 이해도</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area Layout */}
      <main className="flex-1 h-auto lg:h-screen flex flex-col overflow-hidden bg-gray-50/50">
        {/* Mobile Header Removed as Sidebar is now always visible at top */}
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full">
          <div className="flex-[1] min-w-0 flex flex-col gap-6 lg:max-w-xl xl:max-w-2xl">
            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black">1</span>
                질문할 문제 업로드
              </h2>
              <ImageUpload />
            </div>

            <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col justify-center items-center gap-6 hover:shadow-md transition-shadow mt-auto">
              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-gray-800">이해를 완료했나요?</h3>
                <p className="text-sm text-gray-500">
                  충분히 이해했다면 아래 버튼을 눌러 학습을 기록해보세요.
                </p>
              </div>
              <ConfettiButton />
            </div>
          </div>

          <div className="flex-[1.5] min-w-0 flex flex-col h-[600px] lg:h-auto rounded-3xl overflow-hidden shadow-lg border border-indigo-50/50 hover:shadow-xl transition-shadow relative group">
             <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none z-0"></div>
             <div className="relative z-10 h-full w-full">
                <ChatInterface />
             </div>
          </div>
        </div>
      </main>

      {/* Global styles for custom scrollbar to make UI look cleaner */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}} />
    </div>
  );
}