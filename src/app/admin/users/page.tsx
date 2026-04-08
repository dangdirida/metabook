"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Users, UserPlus, Activity, Loader2, RefreshCw } from "lucide-react";

type Role = "user" | "creator" | "admin";
type Status = "active" | "suspended";

interface FirestoreUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  createdAt?: { seconds: number; nanoseconds: number } | string;
  updatedAt?: { seconds: number; nanoseconds: number } | string;
  library?: string[];
  role?: Role;
  status?: Status;
}

function toDate(val: unknown): string {
  if (!val) return "-";
  if (typeof val === "object" && val !== null && "seconds" in val) {
    return new Date((val as { seconds: number }).seconds * 1000).toLocaleDateString("ko-KR");
  }
  if (typeof val === "string") return new Date(val).toLocaleDateString("ko-KR");
  return "-";
}

function isWithinDays(val: unknown, days: number): boolean {
  if (!val) return false;
  let ts: number;
  if (typeof val === "object" && val !== null && "seconds" in val) {
    ts = (val as { seconds: number }).seconds * 1000;
  } else if (typeof val === "string") {
    ts = new Date(val).getTime();
  } else {
    return false;
  }
  return Date.now() - ts < days * 24 * 60 * 60 * 1000;
}

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
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [selectedUser, setSelectedUser] = useState<FirestoreUser | null>(null);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setUsers((data.users || []).map((u: Record<string, unknown>) => ({
        id: u.uid || u.id || "",
        name: u.name || u.displayName || "",
        email: u.email || "",
        image: u.avatar || u.photoURL || u.image || "",
        createdAt: u.createdAt || (u.metadata as Record<string, unknown>)?.creationTime || "",
        updatedAt: u.lastSignIn || (u.metadata as Record<string, unknown>)?.lastSignInTime || "",
        role: u.role || "user",
        status: u.status || "active",
        library: u.library || [],
      } as FirestoreUser)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter((u) => {
    const name = u.name || "";
    const email = u.email || "";
    if (search && !name.includes(search) && !email.includes(search)) return false;
    const role = u.role || "user";
    const status = u.status || "active";
    if (roleFilter !== "all" && role !== roleFilter) return false;
    if (statusFilter !== "all" && status !== statusFilter) return false;
    return true;
  });

  const totalCount = users.length;
  const thisWeekNew = users.filter((u) => isWithinDays(u.createdAt, 7)).length;
  const activeCount = users.filter((u) => (u.status || "active") === "active").length;

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error("역할 변경 실패");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      if (selectedUser?.id === userId) setSelectedUser((prev) => prev ? { ...prev, role: newRole } : null);
    } catch (e) {
      alert("역할 변경 실패: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    const currentStatus = user.status || "active";
    const newStatus: Status = currentStatus === "active" ? "suspended" : "active";
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      if (!res.ok) throw new Error("상태 변경 실패");
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      if (selectedUser?.id === userId) setSelectedUser((prev) => prev ? { ...prev, status: newStatus } : null);
    } catch (e) {
      alert("상태 변경 실패: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const getInitial = (name?: string) => (name || "U").charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary-500)] mb-4" />
        <p className="text-sm text-mono-500">회원 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <p className="text-sm text-red-500 mb-4">데이터를 불러오지 못했어요</p>
        <p className="text-xs text-mono-400 mb-4 max-w-md text-center break-all">{error}</p>
        <button onClick={loadUsers} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary-500)] text-white text-sm rounded-lg hover:bg-[var(--color-primary-600)] transition-colors">
          <RefreshCw className="w-4 h-4" />
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-mono-900">회원 관리</h1>
        <p className="text-sm text-mono-500 mt-1">Firestore 기반 실제 회원 데이터</p>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mono-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="닉네임, 이메일 검색..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-mono-080 rounded-lg focus:outline-none focus:border-[var(--color-primary-400)]"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-mono-500 mr-1">역할:</span>
            {(["all", "user", "creator", "admin"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  roleFilter === r ? "bg-[var(--color-primary-500)] text-white" : "text-mono-500 hover:bg-mono-100"
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
                  statusFilter === s ? "bg-[var(--color-primary-500)] text-white" : "text-mono-500 hover:bg-mono-100"
                }`}
              >
                {s === "all" ? "전체" : s === "active" ? "활성" : "정지"}
              </button>
            ))}
          </div>
        </div>

        {/* 테이블 */}
        {filtered.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <Users className="w-10 h-10 text-mono-200 mx-auto mb-3" />
            <p className="text-sm text-mono-500">{users.length === 0 ? "아직 가입한 회원이 없어요" : "검색 결과가 없습니다"}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-mono-050">
              <tr>
                {["#", "닉네임", "이메일", "가입일", "역할", "상태", "관리"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-mono-500 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => {
                const role = user.role || "user";
                const status = user.status || "active";
                return (
                  <tr
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className="border-t border-mono-050 hover:bg-mono-050 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-mono-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={user.image} alt="" className="w-7 h-7 rounded-full object-cover" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xs font-bold text-[var(--color-primary-600)]">
                            {getInitial(user.name)}
                          </div>
                        )}
                        <span className="text-sm font-medium text-mono-900">{user.name || "이름 없음"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-mono-500">{user.email || "-"}</td>
                    <td className="px-4 py-3 text-xs text-mono-400">{toDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                        {ROLE_LABELS[role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
                        {status === "active" ? "활성" : "정지"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedUser(user); }}
                        className="text-xs text-[var(--color-primary-500)] hover:underline"
                      >
                        관리
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 상세 모달 */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-mono-100">
              <h2 className="text-lg font-bold text-mono-900">회원 상세</h2>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 hover:bg-mono-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-mono-500" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* 프로필 */}
              <div className="flex items-center gap-4">
                {selectedUser.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedUser.image} alt="" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center text-xl font-bold text-[var(--color-primary-600)]">
                    {getInitial(selectedUser.name)}
                  </div>
                )}
                <div>
                  <p className="text-lg font-bold text-mono-900">{selectedUser.name || "이름 없음"}</p>
                  <p className="text-sm text-mono-500">{selectedUser.email || "-"}</p>
                  <p className="text-xs text-mono-400 mt-0.5">가입일: {toDate(selectedUser.createdAt)}</p>
                  <p className="text-xs text-mono-400">마지막 로그인: {toDate(selectedUser.updatedAt)}</p>
                </div>
              </div>

              {/* 활동 통계 */}
              <div>
                <p className="text-xs font-semibold text-mono-600 mb-2">활동 통계</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-mono-050 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-mono-900">{selectedUser.library?.length ?? 0}</p>
                    <p className="text-[10px] text-mono-500">서재 책 수</p>
                  </div>
                  <div className="bg-mono-050 rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-mono-900">{toDate(selectedUser.updatedAt)}</p>
                    <p className="text-[10px] text-mono-500">최근 활동</p>
                  </div>
                </div>
              </div>

              {/* 권한 변경 */}
              <div>
                <p className="text-xs font-semibold text-mono-600 mb-2">권한 변경</p>
                <select
                  value={selectedUser.role || "user"}
                  onChange={(e) => handleRoleChange(selectedUser.id, e.target.value as Role)}
                  disabled={saving}
                  className="w-full px-3 py-2 text-sm border border-mono-080 rounded-lg focus:outline-none focus:border-[var(--color-primary-400)] disabled:opacity-50"
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
                    현재: {(selectedUser.status || "active") === "active" ? "활성" : "정지"}
                  </p>
                </div>
                <button
                  onClick={() => handleStatusToggle(selectedUser.id)}
                  disabled={saving}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                    (selectedUser.status || "active") === "active"
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                >
                  {saving ? "저장 중..." : (selectedUser.status || "active") === "active" ? "계정 정지" : "활성화"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
