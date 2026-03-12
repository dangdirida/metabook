"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { getBookById } from "@/lib/mock-data";

const TABS = ["기본정보", "챕터관리", "이미지관리", "QR관리"];

export default function BookEditPage() {
  const { bookId } = useParams();
  const book = getBookById(bookId as string);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  if (!book) {
    return (
      <div className="text-center py-20 text-mono-500">
        책을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/books"
          className="p-2 hover:bg-mono-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-mono-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-mono-900">{book.title}</h1>
          <p className="text-sm text-mono-500">{book.author} · {book.publisher}</p>
        </div>
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

      {/* 탭 컨텐츠 */}
      <div className="bg-white rounded-xl border border-mono-200 p-6">
        {activeTab === "기본정보" && (
          <div className="space-y-4 max-w-xl">
            <Field label="제목" defaultValue={book.title} />
            <Field label="저자" defaultValue={book.author} />
            <Field label="설명" defaultValue={book.description} textarea />
            <div>
              <label className="text-sm font-medium text-mono-700 mb-1 block">장르</label>
              <div className="flex flex-wrap gap-2">
                {book.genre.map((g) => (
                  <span key={g} className="px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-sm">
                    {g}
                  </span>
                ))}
              </div>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600">
              <Save className="w-4 h-4" /> 저장
            </button>
          </div>
        )}
        {activeTab === "챕터관리" && (
          <p className="text-mono-500">챕터 관리 UI (목업)</p>
        )}
        {activeTab === "이미지관리" && (
          <p className="text-mono-500">이미지 관리 UI (목업)</p>
        )}
        {activeTab === "QR관리" && (
          <p className="text-mono-500">QR 일괄 생성 UI (목업)</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  defaultValue,
  textarea,
}: {
  label: string;
  defaultValue: string;
  textarea?: boolean;
}) {
  const className = "w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
  return (
    <div>
      <label className="text-sm font-medium text-mono-700 mb-1 block">{label}</label>
      {textarea ? (
        <textarea defaultValue={defaultValue} rows={3} className={className} />
      ) : (
        <input defaultValue={defaultValue} className={className} />
      )}
    </div>
  );
}
