"use client";
import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Eye, BookOpen } from "lucide-react";

const MOCK_BOOKS = [
  { id: "lovers-lover", title: "애인의 애인에게", author: "백영옥", genre: "소설", members: 341, creations: 19, status: "active" },
  { id: "pain-encyclopedia", title: "통증 어를 때 깨내 보는 백과", author: "김학조", genre: "의학", members: 287, creations: 12, status: "active" },
  { id: "dont-know-myself", title: "나를 모르는 나에게", author: "이수진", genre: "심리", members: 587, creations: 38, status: "active" },
  { id: "what-moves-me", title: "무엇이 나를 움직이게 하는가", author: "한자경", genre: "인문", members: 276, creations: 16, status: "active" },
  { id: "difficult-people", title: "까다로운 사람과 함께 일하는 법", author: "라이언 리크", genre: "자기계발", members: 203, creations: 9, status: "active" },
  { id: "black-comedy", title: "블랙 코미디", author: "이재한", genre: "에세이", members: 156, creations: 7, status: "active" },
];

export default function AdminBooksPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_BOOKS.filter(b =>
    b.title.includes(search) || b.author.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">도서 관리</h1>
          <p className="text-sm text-mono-500 mt-1">전체 {MOCK_BOOKS.length}권</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
          <Plus className="w-4 h-4" /> 도서 요청
        </button>
      </div>

      <div className="bg-white rounded-xl border border-mono-080 overflow-hidden">
        <div className="p-4 border-b border-mono-050">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mono-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="도서명, 저자 검색..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-mono-080 rounded-lg focus:outline-none focus:border-primary-400" />
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-mono-050">
            <tr>
              {["도서명", "저자", "장르", "멤버", "2차창작", "상태", "관리"].map(h => (
                <th key={h} className="text-left text-xs font-medium text-mono-500 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((book) => (
              <tr key={book.id} className="border-t border-mono-050 hover:bg-mono-010">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary-400 shrink-0" />
                    <span className="text-sm font-medium text-mono-900">{book.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-mono-600">{book.author}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-primary-050 text-primary-600 px-2 py-0.5 rounded-full">{book.genre}</span>
                </td>
                <td className="px-4 py-3 text-sm text-mono-600">{book.members.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-mono-600">{book.creations}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-primary-050 text-primary-600 px-2 py-0.5 rounded-full">활성</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-mono-050 rounded text-mono-400 hover:text-blue-300"><Eye className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-mono-050 rounded text-mono-400 hover:text-primary-500"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-mono-050 rounded text-mono-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
