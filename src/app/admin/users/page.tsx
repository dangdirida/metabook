"use client";

import { useState } from "react";
import { Search, X, Users, UserPlus, Activity } from "lucide-react";

type Role = "user" | "creator" | "admin";
type Status = "active" | "suspended";

interface MockUser {
  id: string;
  nickname: string;
  email: string;
  joinedAt: string;
  role: Role;
  status: Status;
  aiChats: number;
  communityMessages: number;
  creations: number;
}

const MOCK_USERS: MockUser[] = [
  { id: "u01", nickname: "콤니니", email: "komnini@example.com", joinedAt: "2024-10-01", role: "user", status: "active", aiChats: 45, communityMessages: 12, creations: 3 },
  { id: "u02", nickname: "시오연", email: "sioyeon@example.com", joinedAt: "2024-10-15", role: "creator", status: "active", aiChats: 120, communityMessages: 58, creations: 23 },
  { id: "u03", nickname: "레이나", email: "reina@example.com", joinedAt: "2025-01-20", role: "user", status: "active", aiChats: 8, communityMessages: 2, creations: 1 },
  { id: "u04", nickname: "미나", email: "mina@example.com", joinedAt: "2024-12-05", role: "user", status: "suspended", aiChats: 67, communityMessages: 31, creations: 15 },
  { id: "u05", nickname: "하루", email: "haru@example.com", joinedAt: "2025-02-11", role: "user", status: "active", aiChats: 22, communityMessages: 5, creations: 4 },
  { id: "u06", nickname: "북마크", email: "bookmark@example.com", joinedAt: "2024-11-03", role: "creator", status: "active", aiChats: 89, communityMessages: 44, creations: 18 },
  { id: "u07", nickname: "달빛독서", email: "moonread@example.com", joinedAt: "2024-09-20", role: "user", status: "active", aiChats: 33, communityMessages: 15, creations: 6 },
  { id: "u08", nickname: "어드민수", email: "adminsu@example.com", joinedAt: "2024-08-01", role: "admin", status: "active", aiChats: 200, communityMessages: 100, creations: 50 },
  { id: "u09", nickname: "소설가지니", email: "novelist@example.com", joinedAt: "2024-12-20", role: "creator", status: "active", aiChats: 156, communityMessages: 72, creations: 31 },
  { id: "u10", nickname: "아트민수", email: "artminsu@example.com", joinedAt: "2024-11-15", role: "creator", status: "active", aiChats: 78, communityMessages: 35, creations: 22 },
  { id: "u11", nickname: "웹툰작가", email: "webtoon@example.com", joinedAt: "2025-01-05", role: "creator", status: "active", aiChats: 95, communityMessages: 28, creations: 14 },
  { id: "u12", nickname: "음악하는독자", email: "musician@example.com", joinedAt: "2024-12-10", role: "user", status: "active", aiChats: 41, communityMessages: 19, creations: 7 },
  { id: "u13", nickname: "영상크리에이터", email: "video@example.com", joinedAt: "2024-11-25", role: "creator", status: "active", aiChats: 63, communityMessages: 25, creations: 11 },
  { id: "u14", nickname: "책벌레", email: "bookworm@example.com", joinedAt: "2025-02-01", role: "user", status: "active", aiChats: 15, communityMessages: 3, creations: 0 },
  { id: "u15", nickname: "스토리텔러", email: "storyteller@example.com", joinedAt: "2024-10-30", role: "user", status: "suspended", aiChats: 52, communityMessages: 20, creations: 8 },
  { id: "u16", nickname: "그림쟁이", email: "painter@example.com", joinedAt: "2025-01-15", role: "user", status: "active", aiChats: 29, communityMessages: 11, creations: 5 },
  { id: "u17", nickname: "독서왕", email: "readking@example.com", joinedAt: "2024-09-10", role: "user", status: "active", aiChats: 110, communityMessages: 48, creations: 9 },
  { id: "u18", nickname: "창작마스터", email: "master@example.com", joinedAt: "2024-11-08", role: "creator", status: "active", aiChats: 180, communityMessages: 85, creations: 42 },
  { id: "u19", nickname: "뉴비리더", email: "newbie@example.com", joinedAt: "2025-03-01", role: "user", status: "active", aiChats: 3, communityMessages: 0, creations: 0 },
  { id: "u20", nickname: "북클럽장", email: "clubleader@example.com", joinedAt: "2024-10-20", role: "admin", status: "active", aiChats: 145, communityMessages: 92, creations: 27 },
];

const ROLE_LABELS: Record<Role, string> = { user: "일반", creator: "크리에이터", admin: "어드민" };
const ROLE_COLORS: Record<Role, string> = {
  user: "bg-mono-100 text-mono-600",
  creator: "bg-[var(--color-primary-050)] text-[var(--color-primary-600)]",
  admin: "bg-red-50 text-red-600",
};
const STATUS_COLORS: Record<Status, string> = {
  active: "bg-emerald-50 text-emerald-600",
  suspended: "bg-red-50 text-red-600",
};

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [users, setUsers] = useState(MOCK_USERS);

  const filtered = users.filter((u) => {
    if (search && !u.nickname.includes(search) && !u.email.includes(search)) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const totalCount = users.length;
  const thisWeekNew = users.filter((u) => {
    const d = new Date(u.joinedAt);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;
  const activeCount = users.filter((u) => u.status === "active").length;

  const handleRoleChange = (userId: string, newRole: Role) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    if (selectedUser?.id === userId) setSelectedUser((prev) => prev ? { ...prev, role: newRole } : null);
  };

  const handleStatusToggle = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u
      )
    );
    if (selectedUser?.id === userId)
      setSelectedUser((prev) =>
        prev ? { ...prev, status: prev.status === "active" ? "suspended" : "active" } : null
      );
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mono-900">회원 관리</h1>
        <p className="text-sm text-mono-500 mt-1">MetaBook 회원 현황을 관리합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-mono-080 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-050)] flex items-center justify-center">
              <Users className="w-5 h-5 text-[var(--color-primary-500)]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mono-900">{totalCount}</p>
              <p className="text-xs text-mono-500">전체 회원</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-mono-080 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mono-900">{thisWeekNew}</p>
              <p className="text-xs text-mono-500">이번 주 신규</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-mono-080 p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-mono-900">{activeCount}</p>
              <p className="text-xs text-mono-500">활성 회원</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="bg-white rounded-xl border border-mono-080 overflow-hidden">
        <div className="p-4 border-b border-mono-050 space-y-3">
          {/* 검색 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mono-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="닉네임, 이메일 검색..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-mono-080 rounded-lg focus:outline-none focus:border-[var(--color-primary-400)]"
            />
          </div>
          {/* 역할 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-mono-500 mr-1">역할:</span>
            {(["all", "user", "creator", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  roleFilter === r
                    ? "bg-[var(--color-primary-500)] text-white"
                    : "text-mono-500 hover:bg-mono-100"
                }`}
              >
                {r === "all" ? "전체" : ROLE_LABELS[r]}
              </button>
            ))}
            <span className="text-mono-200 mx-2">|</span>
            <span className="text-xs text-mono-500 mr-1">상태:</span>
            {(["all", "active", "suspended"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  statusFilter === s
                    ? "bg-[var(--color-primary-500)] text-white"
                    : "text-mono-500 hover:bg-mono-100"
                }`}
              >
                {s === "all" ? "전체" : s === "active" ? "활성" : "정지"}
              </button>
            ))}
          </div>
        </div>

        {/* 테이블 */}
        <table className="w-full">
          <thead className="bg-mono-050">
            <tr>
              {["#", "닉네임", "이메일", "가입일", "역할", "상태", "관리"].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-mono-500 px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="border-t border-mono-050 hover:bg-mono-050 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-xs text-mono-400">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xs font-bold text-[var(--color-primary-600)]">
                      {getInitial(user.nickname)}
                    </div>
                    <span className="text-sm font-medium text-mono-900">{user.nickname}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-mono-500">{user.email}</td>
                <td className="px-4 py-3 text-xs text-mono-400">{user.joinedAt}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[user.status]}`}>
                    {user.status === "active" ? "활성" : "정지"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                    }}
                    className="text-xs text-[var(--color-primary-500)] hover:underline"
                  >
                    관리
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-mono-400">
                  검색 결과가 없습니다
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 상세 모달 */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-mono-100">
              <h2 className="text-lg font-bold text-mono-900">회원 상세</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 hover:bg-mono-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-mono-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* 프로필 */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xl font-bold text-[var(--color-primary-600)]">
                  {getInitial(selectedUser.nickname)}
                </div>
                <div>
                  <p className="text-lg font-bold text-mono-900">{selectedUser.nickname}</p>
                  <p className="text-sm text-mono-500">{selectedUser.email}</p>
                  <p className="text-xs text-mono-400 mt-0.5">가입일: {selectedUser.joinedAt}</p>
                </div>
              </div>

              {/* 활동 통계 */}
              <div>
                <p className="text-xs font-semibold text-mono-600 mb-2">활동 통계</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-mono-050 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-mono-900">{selectedUser.aiChats}</p>
                    <p className="text-[10px] text-mono-500">AI 대화</p>
                  </div>
                  <div className="bg-mono-050 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-mono-900">{selectedUser.communityMessages}</p>
                    <p className="text-[10px] text-mono-500">커뮤니티</p>
                  </div>
                  <div className="bg-mono-050 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-mono-900">{selectedUser.creations}</p>
                    <p className="text-[10px] text-mono-500">창작물</p>
                  </div>
                </div>
              </div>

              {/* 권한 변경 */}
              <div>
                <p className="text-xs font-semibold text-mono-600 mb-2">권한 변경</p>
                <select
                  value={selectedUser.role}
                  onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as Role)}
                  className="w-full px-3 py-2 text-sm border border-mono-080 rounded-lg focus:outline-none focus:border-[var(--color-primary-400)]"
                >
                  <option value="user">일반</option>
                  <option value="creator">크리에이터</option>
                  <option value="admin">어드민</option>
                </select>
              </div>

              {/* 계정 상태 토글 */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-mono-600">계정 상태</p>
                  <p className="text-[10px] text-mono-400 mt-0.5">
                    현재: {selectedUser.status === "active" ? "활성" : "정지"}
                  </p>
                </div>
                <button
                  onClick={() => handleStatusToggle(selectedUser.id)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                    selectedUser.status === "active"
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  {selectedUser.status === "active" ? "계정 정지" : "활성화"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
