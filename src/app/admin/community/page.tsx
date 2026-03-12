"use client";

import { useState } from "react";
import { Pin, AlertTriangle, Ban, MessageSquare } from "lucide-react";

const MOCK_USERS = [
  { id: "u1", name: "독서광민수", status: "active", warnings: 0 },
  { id: "u2", name: "역사덕후", status: "active", warnings: 1 },
  { id: "u3", name: "과학소녀", status: "active", warnings: 0 },
];

export default function AdminCommunityPage() {
  const [notice, setNotice] = useState("환영합니다! 서로 존중하며 대화해주세요.");

  return (
    <div>
      <h1 className="text-2xl font-bold text-mono-900 mb-6">커뮤니티 관리</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 공지 관리 */}
        <div className="bg-white rounded-xl border border-mono-200 p-5">
          <h3 className="font-semibold text-mono-900 mb-3 flex items-center gap-2">
            <Pin className="w-4 h-4 text-accent-orange" /> 공지 관리
          </h3>
          <textarea
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
          />
          <button className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600">
            공지 저장
          </button>
        </div>

        {/* 사용자 제재 */}
        <div className="bg-white rounded-xl border border-mono-200 p-5">
          <h3 className="font-semibold text-mono-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-300" /> 사용자 관리
          </h3>
          <div className="space-y-2">
            {MOCK_USERS.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-mono-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-mono-900">{user.name}</p>
                  <p className="text-xs text-mono-500">경고: {user.warnings}회</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs bg-accent-orange/10 text-accent-orange rounded-lg hover:bg-accent-orange/20">
                    경고
                  </button>
                  <button className="px-3 py-1 text-xs bg-red-50 text-red-300 rounded-lg hover:bg-red-100">
                    1일 정지
                  </button>
                  <button className="px-3 py-1 text-xs bg-mono-900 text-white rounded-lg hover:bg-mono-800">
                    <Ban className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 채팅 로그 */}
        <div className="bg-white rounded-xl border border-mono-200 p-5 lg:col-span-2">
          <h3 className="font-semibold text-mono-900 mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary-500" /> 채팅 로그
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {[
              { user: "독서광민수", msg: "이 책 진짜 인상적이에요.", time: "10:30" },
              { user: "역사덕후", msg: "얄리의 질문이 가장 인상깊었어요.", time: "10:35" },
              { user: "과학소녀", msg: "가축화 안나 카레니나 원칙 부분 정말 재미있었어요 😂", time: "11:00" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-2 hover:bg-mono-50 rounded-lg text-sm">
                <span className="text-xs text-mono-400 w-12 flex-shrink-0">{log.time}</span>
                <span className="font-medium text-mono-700 w-24 flex-shrink-0">{log.user}</span>
                <span className="text-mono-600">{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
