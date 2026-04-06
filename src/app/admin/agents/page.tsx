"use client";

import { useState } from "react";
import { Plus, Bot, ThumbsUp, ThumbsDown, ToggleLeft, ToggleRight, Loader2, Sparkles } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import Link from "next/link";

interface AnalyzedCharacter {
  id: string;
  name: string;
  role: string;
  personality: string[];
  speechStyle: string;
  background: string;
  systemPrompt: string;
  representativeQuotes?: string[];
}

export default function AdminAgentsPage() {
  const [selectedBook, setSelectedBook] = useState(mockBooks[0]?.id || "");
  const book = mockBooks.find((b) => b.id === selectedBook);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedChars, setAnalyzedChars] = useState<AnalyzedCharacter[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalyzedChars([]);
    try {
      const res = await fetch("/api/analyze-characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: selectedBook }),
      });
      const data = await res.json();
      if (data.success) {
        setAnalyzedChars(data.characters);
        setToast(`${data.savedCount}명의 인물이 분석 완료됐습니다!`);
      } else {
        setToast(`분석 실패: ${data.error}`);
      }
    } catch (e) {
      setToast(`오류: ${String(e)}`);
    } finally {
      setIsAnalyzing(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-mono-900">AI Agent 관리</h1>
        <div className="flex gap-2">
          <button onClick={handleAnalyze} disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600 disabled:opacity-50 transition-colors">
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isAnalyzing ? "Gemini가 분석 중..." : "본문 자동 분석"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600">
            <Plus className="w-4 h-4" /> Agent 추가
          </button>
        </div>
      </div>

      {/* 토스트 */}
      {toast && (
        <div className="mb-4 px-4 py-3 bg-primary-50 border border-primary-200 text-primary-700 rounded-xl text-sm font-medium">{toast}</div>
      )}

      {/* 책 선택 */}
      <div className="mb-6">
        <select value={selectedBook} onChange={(e) => { setSelectedBook(e.target.value); setAnalyzedChars([]); }}
          className="px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
          {mockBooks.map((b) => (<option key={b.id} value={b.id}>{b.title}</option>))}
        </select>
      </div>

      {/* 분석된 인물 카드 */}
      {analyzedChars.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-mono-900 mb-4">Gemini 분석 결과</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analyzedChars.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-primary-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-lg font-bold text-mono-900">{c.name}</p>
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full">{c.role}</span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {c.personality.map((p) => (<span key={p} className="px-2 py-0.5 text-xs bg-mono-100 text-mono-600 rounded-full">{p}</span>))}
                </div>
                <p className="text-sm text-mono-600 mb-2"><strong>말투:</strong> {c.speechStyle}</p>
                <p className="text-sm text-mono-600 mb-2"><strong>배경:</strong> {c.background}</p>
                {c.representativeQuotes && c.representativeQuotes.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-mono-500 mb-1">대표 대사</p>
                    {c.representativeQuotes.map((q, i) => (
                      <p key={i} className="text-xs text-mono-500 italic border-l-2 border-primary-200 pl-2 mb-1">&quot;{q}&quot;</p>
                    ))}
                  </div>
                )}
                <details className="mt-2">
                  <summary className="text-xs font-semibold text-mono-400 cursor-pointer">System Prompt</summary>
                  <p className="text-xs text-mono-500 mt-1 whitespace-pre-wrap bg-mono-50 p-2 rounded-lg">{c.systemPrompt}</p>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 기존 Agent 목록 */}
      <h2 className="text-lg font-bold text-mono-900 mb-4">현재 등록된 Agent</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {book?.agents.map((agent) => (
          <Link key={agent.id} href={`/admin/agents/${agent.id}`}
            className="bg-white rounded-xl border border-mono-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center"><Bot className="w-5 h-5 text-primary-500" /></div>
              <div>
                <p className="font-semibold text-mono-900">{agent.name}</p>
                <p className="text-xs text-mono-500">{agent.role}</p>
              </div>
              {agent.isActive ? <ToggleRight className="w-5 h-5 text-primary-500 ml-auto" /> : <ToggleLeft className="w-5 h-5 text-mono-400 ml-auto" />}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {agent.personality.map((p) => (<span key={p} className="px-2 py-0.5 text-xs bg-mono-100 text-mono-600 rounded-full">{p}</span>))}
            </div>
            <div className="flex items-center gap-4 text-xs text-mono-500">
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {agent.feedbackStats.likes}</span>
              <span className="flex items-center gap-1"><ThumbsDown className="w-3 h-3" /> {agent.feedbackStats.dislikes}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
