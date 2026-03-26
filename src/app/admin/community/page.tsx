"use client";
import { useState } from "react";
import { Search, Shield, Ban, Eye, Users } from "lucide-react";

const MOCK_USERS = [
  { id: "u001", email: "user1@example.com", name: "콤니니", books: 3, creations: 8, joined: "2024-11-01", status: "active" },
  { id: "u002", email: "user2@example.com", name: "시오연", books: 7, creations: 23, joined: "2024-10-15", status: "active" },
  { id: "u003", email: "user3@example.com", name: "레이나", books: 1, creations: 2, joined: "2025-01-20", status: "active" },
  { id: "u004", email: "user4@example.com", name: "미나", books: 5, creations: 15, joined: "2024-12-05", status: "suspended" },
  { id: "u005", email: "user5@example.com", name: "하루", books: 2, creations: 4, joined: "2025-02-11", status: "active" },
];

export default function AdminCommunityPage() {
  const [search, setSearch] = useState("");
  const filtered = MOCK_USERS.filter(u => u.name.includes(search) || u.email.includes(search));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-mono-900">커뮤니티 관리</h1>
          <p className="text-sm text-mono-500 mt-1">전체 멤버 {MOCK_USERS.length}명</p>
        </div>
        <div className="flex gap-2">
          <span className="text-xs bg-primary-050 text-primary-600 px-3 py-1.5 rounded-full font-medium">활성 {MOCK_USERS.filter(u=>u.status==="active").length}</span>
          <span className="text-xs bg-red-050 text-red-300 px-3 py-1.5 rounded-full font-medium">정지 {MOCK_USERS.filter(u=>u.status==="suspended").length}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-mono-080 overflow-hidden">
        <div className="p-4 border-b border-mono-050">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mono-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="이름, 이메일 검색..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-mono-080 rounded-lg focus:outline-none focus:border-primary-400" />
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-mono-050">
            <tr>
              {["사용자", "이메일", "도서", "2차창작", "가입일", "상태", "관리"].map(h => (
                <th key={h} className="text-left text-xs font-medium text-mono-500 px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-t border-mono-050 hover:bg-mono-010">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-050 flex items-center justify-center text-xs font-medium text-primary-600">
                      {user.name[0]}
                    </div>
                    <span className="text-sm font-medium text-mono-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-mono-500">{user.email}</td>
                <td className="px-4 py-3 text-sm text-mono-600">{user.books}</td>
                <td className="px-4 py-3 text-sm text-mono-600">{user.creations}</td>
                <td className="px-4 py-3 text-sm text-mono-500">{user.joined}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.status === "active" ? "bg-primary-050 text-primary-600" : "bg-red-050 text-red-300"}`}>
                    {user.status === "active" ? "활성" : "정지"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button className="p-1 hover:bg-mono-050 rounded text-mono-400 hover:text-blue-300"><Eye className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-mono-050 rounded text-mono-400 hover:text-primary-500"><Shield className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-mono-050 rounded text-mono-400 hover:text-red-300"><Ban className="w-4 h-4" /></button>
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
