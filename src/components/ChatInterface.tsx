"use client";

import { useState } from "react";
import "katex/dist/katex.min.css";
import TeX from "@matejmazur/react-katex";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
  isFormula?: boolean;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "안녕! 올려준 문제를 같이 풀어볼까? 먼저 어떤 부분부터 막혔는지 알려줄래?",
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    const newUserMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, newUserMsg]);
    setInput("");

    // Mock AI Response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: "좋아! 이차방정식의 근을 구하려면 먼저 이 공식을 떠올려봐야 해. \\(x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\\) \n이 공식을 문제에 어떻게 적용하면 좋을까?",
          isFormula: true
        },
      ]);
    }, 1000);
  };

  const renderContent = (content: string, isFormula?: boolean) => {
    if (!isFormula) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }

    // A simple regex approach to find inline math \( ... \)
    const parts = content.split(/(\\\(.*?\\\))/g);
    return (
      <p className="whitespace-pre-wrap">
        {parts.map((part, i) => {
          if (part.startsWith("\\(") && part.endsWith("\\)")) {
            const math = part.slice(2, -2);
            return <TeX key={i} math={math} />;
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Bot className="w-5 h-5" /> AI 학습 메이트
        </h2>
        <p className="text-blue-100 text-sm">소크라테스식 문답으로 스스로 답을 찾게 도와줄게!</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-br-none shadow-sm"
                : "bg-white text-gray-800 border border-gray-100 shadow-sm rounded-bl-none"
            }`}>
              {renderContent(msg.content, msg.isFormula)}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2 relative">
          <input
            type="text"
            className="flex-1 border border-gray-200 rounded-full px-5 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
            placeholder="답변을 입력해봐!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
