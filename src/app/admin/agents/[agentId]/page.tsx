"use client";

import { useState } from "react";
import { ArrowLeft, Save, Upload, Eye, EyeOff, Send } from "lucide-react";
import Link from "next/link";

const TABS = ["페르소나", "학습 데이터", "테스트 대화"];

export default function AgentDetailPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [testInput, setTestInput] = useState("");
  const [testMessages, setTestMessages] = useState<
    { role: string; content: string }[]
  >([]);

  const handleTestSend = async () => {
    if (!testInput.trim()) return;
    const userMsg = { role: "user", content: testInput };
    setTestMessages((prev) => [...prev, userMsg]);
    setTestInput("");

    // 목업 응답
    setTimeout(() => {
      setTestMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "안녕하세요! 저는 테스트 중인 AI Agent입니다. 어떤 이야기를 나눠볼까요?",
        },
      ]);
    }, 1000);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/agents" className="p-2 hover:bg-mono-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-mono-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-mono-900">Agent 설정</h1>
        </div>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600 flex items-center gap-2">
          <Eye className="w-4 h-4" /> 퍼블리시
        </button>
        <button className="px-4 py-2 border border-mono-200 text-mono-600 rounded-xl text-sm hover:bg-mono-50 flex items-center gap-2">
          <EyeOff className="w-4 h-4" /> 비활성화
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-mono-100 p-1 rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              activeTab === tab
                ? "bg-white text-mono-900 shadow-sm"
                : "text-mono-500 hover:text-mono-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-mono-200 p-6">
        {activeTab === "페르소나" && (
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="text-sm font-medium text-mono-700 mb-1 block">이름</label>
              <input defaultValue="얄리" className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-mono-700 mb-1 block">성격 키워드</label>
              <input defaultValue="순수한, 탐구적, 호기심 많은" className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-mono-700 mb-1 block">말투 스타일</label>
              <select className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option>반말</option>
                <option>해요체</option>
                <option>존댓말</option>
                <option>고어체</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-mono-700 mb-1 block">금지 주제</label>
              <textarea rows={2} placeholder="쉼표로 구분" className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600">
              <Save className="w-4 h-4" /> 저장
            </button>
          </div>
        )}

        {activeTab === "학습 데이터" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-mono-300 rounded-xl p-10 text-center">
              <Upload className="w-8 h-8 text-mono-400 mx-auto mb-3" />
              <p className="text-mono-600 font-medium">PDF, TXT, CSV 파일 업로드</p>
              <p className="text-sm text-mono-400 mt-1">드래그 & 드롭 또는 클릭</p>
            </div>
            <div>
              <h4 className="font-medium text-mono-900 mb-2">시스템 프롬프트 레이어</h4>
              <div className="space-y-2 text-sm">
                <div className="p-3 bg-red-030 border border-red-100 rounded-lg">
                  <span className="font-medium text-red-300">Layer 1</span> — 기본 안전 가이드라인 (수정 불가)
                </div>
                <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <span className="font-medium text-primary-600">Layer 2</span> — 책 세계관/설정
                </div>
                <div className="p-3 bg-primary-010 border border-primary-100 rounded-lg">
                  <span className="font-medium text-primary-600">Layer 3</span> — 캐릭터 페르소나
                </div>
                <div className="p-3 bg-mono-50 border border-mono-200 rounded-lg">
                  <span className="font-medium text-mono-600">Layer 4</span> — 대화 맥락 (자동)
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "테스트 대화" && (
          <div className="max-w-xl">
            <div className="h-80 overflow-y-auto bg-mono-50 rounded-xl p-4 mb-4 space-y-3">
              {testMessages.length === 0 && (
                <p className="text-center text-mono-400 text-sm py-10">
                  테스트 대화를 시작해보세요
                </p>
              )}
              {testMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-xl text-sm ${
                    msg.role === "user" ? "bg-primary-500 text-white" : "bg-white text-mono-900 border border-mono-200"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTestSend()}
                placeholder="테스트 메시지..."
                className="flex-1 px-4 py-2.5 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={handleTestSend}
                className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
