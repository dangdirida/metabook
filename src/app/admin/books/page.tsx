"use client";

import { useState } from "react";
import { Plus, Search, BookOpen, ToggleLeft, ToggleRight } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";

export default function AdminBooksPage() {
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [books, setBooks] = useState(mockBooks);

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: string) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-mono-900">책 관리</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600"
        >
          <Plus className="w-4 h-4" /> 책 추가
        </button>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mono-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="제목, 저자 검색..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* 데이터 테이블 */}
      <div className="bg-white rounded-xl border border-mono-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mono-200 bg-mono-50">
              <th className="text-left px-4 py-3 font-medium text-mono-600">표지</th>
              <th className="text-left px-4 py-3 font-medium text-mono-600">제목</th>
              <th className="text-left px-4 py-3 font-medium text-mono-600">저자</th>
              <th className="text-left px-4 py-3 font-medium text-mono-600">출판사</th>
              <th className="text-left px-4 py-3 font-medium text-mono-600">Agent</th>
              <th className="text-left px-4 py-3 font-medium text-mono-600">상태</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((book) => (
              <tr
                key={book.id}
                className="border-b border-mono-100 hover:bg-mono-50 cursor-pointer"
                onClick={() => (window.location.href = `/admin/books/${book.id}/edit`)}
              >
                <td className="px-4 py-3">
                  <div className="w-10 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary-400" />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-mono-900">
                  {book.title}
                </td>
                <td className="px-4 py-3 text-mono-600">{book.author}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      book.publisher === "주니어김영사"
                        ? "bg-primary-50 text-primary-700"
                        : "bg-secondary-50 text-secondary-600"
                    }`}
                  >
                    {book.publisher}
                  </span>
                </td>
                <td className="px-4 py-3 text-mono-600">{book.agents.length}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleActive(book.id);
                    }}
                  >
                    {book.isActive ? (
                      <ToggleRight className="w-6 h-6 text-primary-500" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-mono-400" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 책 추가 모달 */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">새 책 추가</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-mono-700 mb-1 block">제목</label>
                <input className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-mono-700 mb-1 block">저자</label>
                <input className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-mono-700 mb-1 block">출판사</label>
                <select className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option>김영사</option>
                  <option>주니어김영사</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-mono-200 rounded-xl text-sm"
              >
                취소
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
