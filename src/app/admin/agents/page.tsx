"use client";

import { useState } from "react";
import { Plus, Bot, ThumbsUp, ThumbsDown, ToggleLeft, ToggleRight } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import Link from "next/link";

export default function AdminAgentsPage() {
  const [selectedBook, setSelectedBook] = useState(mockBooks[0]?.id || "");
  const book = mockBooks.find((b) => b.id === selectedBook);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-mono-900">AI Agent 관리</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600">
          <Plus className="w-4 h-4" /> Agent 추가
        </button>
      </div>

      {/* 책 선택 */}
      <div className="mb-6">
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
          className="px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        >
          {mockBooks.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
      </div>

      {/* Agent 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {book?.agents.map((agent) => (
          <Link
            key={agent.id}
            href={`/admin/agents/${agent.id}`}
            className="bg-white rounded-xl border border-mono-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="font-semibold text-mono-900">{agent.name}</p>
                <p className="text-xs text-mono-500">{agent.role}</p>
              </div>
              {agent.isActive ? (
                <ToggleRight className="w-5 h-5 text-primary-500 ml-auto" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-mono-400 ml-auto" />
              )}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {agent.personality.map((p) => (
                <span key={p} className="px-2 py-0.5 text-xs bg-mono-100 text-mono-600 rounded-full">
                  {p}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-mono-500">
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" /> {agent.feedbackStats.likes}
              </span>
              <span className="flex items-center gap-1">
                <ThumbsDown className="w-3 h-3" /> {agent.feedbackStats.dislikes}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
