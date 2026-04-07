"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { mockBooks } from "@/lib/mock-data";
import type { Agent, Book } from "@/types";
import {
  MessageCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  UserPlus,
  Users,
  Check,
  X,
  ArrowLeft,
  Search,
  Bookmark,
  ExternalLink,
  ChevronLeft,
  BookOpen,
  PanelRightClose,
  PanelRightOpen,
  Trash2,
} from "lucide-react";
import Link from "next/link";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  agentId?: string;
  agentName?: string;
  content: string;
  timestamp: string;
  feedback?: "like" | "dislike";
}

interface ChatRoom {
  id: string;
  agents: { agent: Agent; book: Book }[];
  messages: ChatMessage[];
}

interface BookmarkItem {
  id: string;
  roomId: string;
  messageId: string;
  content: string;
  agentName: string;
  createdAt: string;
}

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const ROOMS_STORAGE_KEY = "metabook_chat_rooms";
  const CURRENT_ROOM_KEY = "metabook_current_room";

  const [rooms, setRooms] = useState<Record<string, ChatRoom>>({});
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedInvites, setSelectedInvites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showProfile, setShowProfile] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"chats" | "explore">("chats");
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const roomsLoadedRef = useRef(false);

  // localStorage에서 채팅방 + 북마크 복원
  useEffect(() => {
    try { setBookmarks(JSON.parse(localStorage.getItem("chat_bookmarks") || "[]")); }
    catch { setBookmarks([]); }

    try {
      const savedRooms = localStorage.getItem(ROOMS_STORAGE_KEY);
      if (savedRooms) {
        const parsed = JSON.parse(savedRooms) as Record<string, ChatRoom>;
        // agents 데이터 복원: 저장된 agentId/bookId로 mockBooks에서 실제 객체 참조
        const restored: Record<string, ChatRoom> = {};
        for (const [roomId, room] of Object.entries(parsed)) {
          const restoredAgents = (room.agents || [])
            .map((ra: { agent: { id: string }; book: { id: string } }) => {
              const book = mockBooks.find((b) => b.id === ra.book.id);
              const agent = book?.agents.find((a) => a.id === ra.agent.id);
              return agent && book ? { agent, book } : null;
            })
            .filter((x): x is { agent: Agent; book: Book } => x !== null);
          if (restoredAgents.length > 0) {
            restored[roomId] = { id: roomId, agents: restoredAgents, messages: room.messages || [] };
          }
        }
        if (Object.keys(restored).length > 0) {
          setRooms(restored);
          const savedCurrentId = localStorage.getItem(CURRENT_ROOM_KEY);
          if (savedCurrentId && restored[savedCurrentId]) {
            setCurrentRoomId(savedCurrentId);
            setSidebarTab("chats");
          }
        }
      }
    } catch { /* ignore */ }
    roomsLoadedRef.current = true;
  }, []);

  // rooms 변경 시 localStorage에 저장 (직렬화 가능한 형태로)
  useEffect(() => {
    if (!roomsLoadedRef.current) return;
    const serializable: Record<string, { id: string; agents: { agent: { id: string }; book: { id: string } }[]; messages: ChatMessage[] }> = {};
    for (const [roomId, room] of Object.entries(rooms)) {
      serializable[roomId] = {
        id: room.id,
        agents: room.agents.map((ra) => ({ agent: { id: ra.agent.id }, book: { id: ra.book.id } })),
        messages: room.messages.slice(-100), // 최근 100개만 저장
      };
    }
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(serializable));
  }, [rooms]);

  // currentRoomId 변경 시 저장
  useEffect(() => {
    if (!roomsLoadedRef.current) return;
    if (currentRoomId) { localStorage.setItem(CURRENT_ROOM_KEY, currentRoomId); }
    else { localStorage.removeItem(CURRENT_ROOM_KEY); }
  }, [currentRoomId]);

  useEffect(() => {
    const bookIdParam = searchParams.get("bookId");
    const agentIdParam = searchParams.get("agentId");
    if (!bookIdParam) return;
    const book = mockBooks.find((b) => b.id === bookIdParam);
    if (!book) return;
    if (agentIdParam) {
      const agent = book.agents.find((a) => a.id === agentIdParam);
      if (agent) {
        const roomId = agentIdParam;
        setRooms((prev) => ({ ...prev, [roomId]: prev[roomId] ?? { id: roomId, agents: [{ agent, book }], messages: [] } }));
        setCurrentRoomId(roomId);
        setSidebarTab("chats");
        setMobileView("chat");
      }
    }
  }, [searchParams]);

  const currentRoom = currentRoomId ? rooms[currentRoomId] : null;
  const currentAgents = currentRoom?.agents || [];
  const booksWithAgents = mockBooks.filter((b) => b.agents && b.agents.length > 0);

  const chatRooms = Object.values(rooms).sort((a, b) => {
    const aLast = a.messages[a.messages.length - 1]?.timestamp || "";
    const bLast = b.messages[b.messages.length - 1]?.timestamp || "";
    return bLast.localeCompare(aLast);
  });

  const filteredRooms = chatRooms.filter((room) =>
    !searchQuery || room.agents.some((ra) => ra.agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || ra.book.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredBooks = searchQuery
    ? booksWithAgents.filter((book) => { const q = searchQuery.toLowerCase(); return book.title.toLowerCase().includes(q) || book.agents.some((a) => a.name.toLowerCase().includes(q)); })
    : booksWithAgents;

  const getFilteredAgents = (book: Book) => {
    if (!searchQuery) return book.agents;
    const q = searchQuery.toLowerCase();
    if (book.title.toLowerCase().includes(q)) return book.agents;
    return book.agents.filter((a) => a.name.toLowerCase().includes(q));
  };

  const openChat = (agent: Agent, book: Book) => {
    const roomId = agent.id;
    setRooms((prev) => ({ ...prev, [roomId]: prev[roomId] ?? { id: roomId, agents: [{ agent, book }], messages: [] } }));
    setCurrentRoomId(roomId);
    setSidebarTab("chats");
    setMobileView("chat");
  };

  const closeInviteModal = () => { setShowInviteModal(false); setSelectedInvites([]); };

  const handleInviteConfirm = () => {
    if (!currentRoom || selectedInvites.length === 0) return;
    // 선택된 인물들을 현재 채팅방에 추가
    const newAgentEntries = selectedInvites
      .map((id) => {
        for (const b of booksWithAgents) {
          const a = b.agents.find((ag) => ag.id === id);
          if (a) return { agent: a, book: b };
        }
        return null;
      })
      .filter((x): x is { agent: Agent; book: Book } => x !== null);

    if (newAgentEntries.length === 0) { closeInviteModal(); return; }

    const updatedAgents = [...currentRoom.agents, ...newAgentEntries];
    const invitedNames = newAgentEntries.map((e) => e.agent.name).join(", ");

    // 시스템 메시지 추가
    const systemMsg: ChatMessage = {
      id: `sys_${Date.now()}`, role: "assistant",
      content: `${invitedNames}이(가) 대화에 참여했습니다.`,
      timestamp: new Date().toISOString(),
    };

    // 현재 roomId 유지하며 인물 목록 + 시스템 메시지 업데이트
    setRooms((prev) => ({
      ...prev,
      [currentRoom.id]: {
        ...prev[currentRoom.id],
        agents: updatedAgents,
        messages: [...prev[currentRoom.id].messages, systemMsg],
      },
    }));
    closeInviteModal();
  };

  const toggleBookmark = (roomId: string, messageId: string, content: string, agentName: string) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.messageId === messageId);
      const next = exists ? prev.filter((b) => b.messageId !== messageId)
        : [...prev, { id: Date.now().toString(), roomId, messageId, content, agentName, createdAt: new Date().toISOString() }];
      localStorage.setItem("chat_bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const invitableAgents = currentRoom
    ? booksWithAgents.flatMap((b) => (b.agents || []).filter((a) => !currentRoom.agents.find((ca) => ca.agent.id === a.id)).map((a) => ({ agent: a, book: b })))
    : [];

  const fmtTime = (ts: string) => {
    if (!mounted) return "";
    const d = new Date(ts); const now = new Date(); const diff = now.getTime() - d.getTime();
    const m = Math.floor(diff / 60000); const h = Math.floor(diff / 3600000); const dy = Math.floor(diff / 86400000);
    if (m < 1) return "방금"; if (m < 60) return `${m}분`; if (h < 24) return `${h}시간`; if (dy < 7) return `${dy}일`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      {/* 왼쪽 사이드바 */}
      <aside className={`w-full md:w-72 flex-shrink-0 border-r border-[var(--color-mono-080)] flex flex-col bg-white ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
        <div className="px-4 pt-4 pb-2 border-b border-[var(--color-mono-080)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link href="/library" className="p-1.5 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors"><ArrowLeft className="w-4 h-4 text-[var(--color-mono-600)]" /></Link>
              <h1 className="text-[16px] font-bold text-[var(--color-mono-990)]">채팅</h1>
            </div>
            <button onClick={() => { setSelectMode(!selectMode); setSelectedAgentIds([]); if (!selectMode) setSidebarTab("explore"); }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${selectMode ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-600)] hover:bg-[var(--color-mono-080)]"}`}>
              <Users className="w-3.5 h-3.5" />{selectMode ? "취소" : "그룹"}
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-mono-050)] rounded-xl">
            <Search className="w-3.5 h-3.5 text-[var(--color-mono-400)] flex-shrink-0" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={sidebarTab === "chats" ? "대화 검색" : "인물 또는 책 이름"}
              className="flex-1 bg-transparent text-[13px] text-[var(--color-mono-800)] placeholder:text-[var(--color-mono-300)] outline-none" />
            {searchQuery && <button onClick={() => setSearchQuery("")}><X className="w-3.5 h-3.5 text-[var(--color-mono-300)]" /></button>}
          </div>
          <div className="flex gap-2 mt-2.5">
            {([{ key: "chats", label: "내 채팅" }, { key: "explore", label: "인물 찾기" }] as const).map((tab) => (
              <button key={tab.key} onClick={() => { setSidebarTab(tab.key); setSearchQuery(""); }}
                className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors border ${sidebarTab === tab.key ? "bg-[var(--color-primary-030)] text-[var(--color-primary-700)] border-[var(--color-primary-200)]" : "bg-white text-[var(--color-mono-500)] border-[var(--color-mono-100)] hover:bg-[var(--color-mono-030)]"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {sidebarTab === "chats" && (
            <>
              {selectMode && selectedAgentIds.length > 0 && (
                <div className="px-3 py-2 bg-[var(--color-primary-030)] border-b border-[var(--color-primary-100)]">
                  <p className="text-[11px] text-[var(--color-primary-600)] font-medium mb-1">선택됨 ({selectedAgentIds.length}명)</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedAgentIds.map((id) => { const ag = booksWithAgents.flatMap((b) => b.agents).find((a) => a.id === id); return ag ? (
                      <span key={id} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-primary-500)] text-white text-[11px]">
                        {ag.name}<button onClick={() => setSelectedAgentIds((p) => p.filter((x) => x !== id))}><X className="w-3 h-3" /></button>
                      </span>) : null; })}
                  </div>
                </div>
              )}
              {filteredRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <MessageCircle className="w-10 h-10 text-[var(--color-mono-200)] mb-3" />
                  <p className="text-[13px] font-medium text-[var(--color-mono-600)] mb-1">아직 대화한 인물이 없어요</p>
                  <p className="text-[12px] text-[var(--color-mono-400)] mb-4">인물 찾기에서 대화를 시작해보세요</p>
                  <button onClick={() => setSidebarTab("explore")} className="px-4 py-2 rounded-xl bg-[var(--color-primary-500)] text-white text-[12px] font-medium hover:bg-[var(--color-primary-600)] transition-colors">인물 찾기</button>
                </div>
              ) : (
                <>
                  {filteredRooms.map((room) => {
                    const isGroup = room.agents.length > 1;
                    const first = room.agents[0];
                    const lastMsg = room.messages[room.messages.length - 1];
                    const isCurrent = currentRoomId === room.id;
                    const timeStr = lastMsg ? fmtTime(lastMsg.timestamp) : "";
                    return (
                      <div key={room.id} onClick={() => { setCurrentRoomId(room.id); setMobileView("chat"); }}
                        className={`relative group/item flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[var(--color-mono-050)] ${isCurrent ? "bg-[var(--color-primary-030)]" : "hover:bg-[var(--color-mono-030)]"}`}>
                        <div className="relative w-11 h-11 flex-shrink-0">
                          {isGroup ? (<>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={room.agents[0]?.agent.avatar || "/avatars/default-profile.svg"} className="absolute top-0 left-0 w-8 h-8 rounded-full object-cover border-2 border-white" onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={room.agents[1]?.agent.avatar || "/avatars/default-profile.svg"} className="absolute bottom-0 right-0 w-7 h-7 rounded-full object-cover border-2 border-white" onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
                          </>) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={first?.agent.avatar || "/avatars/default-profile.svg"} className="w-11 h-11 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className={`text-[13px] font-semibold truncate ${isCurrent ? "text-[var(--color-primary-700)]" : "text-[var(--color-mono-900)]"}`}>
                              {isGroup ? room.agents.map((ra) => ra.agent.name).join(", ") : first?.agent.name}
                            </p>
                            <span className="text-[10px] text-[var(--color-mono-400)] flex-shrink-0 ml-2">{timeStr}</span>
                          </div>
                          <p className="text-[12px] text-[var(--color-mono-400)] truncate">
                            {lastMsg ? (lastMsg.role === "user" ? `나: ${lastMsg.content}` : lastMsg.content) : first?.agent.speechStyle}
                          </p>
                          <p className="text-[10px] text-[var(--color-mono-300)] truncate mt-0.5">{first?.book.title}{isGroup && ` · ${room.agents.length}명`}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setRooms((prev) => { const n = { ...prev }; delete n[room.id]; return n; }); if (currentRoomId === room.id) { setCurrentRoomId(null); localStorage.removeItem(CURRENT_ROOM_KEY); } }}
                          className="absolute right-3 opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 rounded-lg text-[var(--color-mono-300)] hover:text-red-400 hover:bg-red-50" title="대화 삭제">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  <button onClick={() => setSidebarTab("explore")} className="w-full py-3 text-[13px] font-medium text-[var(--color-primary-500)] hover:bg-[var(--color-primary-030)] transition-colors border-t border-[var(--color-mono-080)]">+ 새 대화 시작</button>
                </>
              )}
            </>
          )}

          {sidebarTab === "explore" && (
            <>
              {filteredBooks.map((book) => {
                const agents = getFilteredAgents(book);
                if (!agents.length) return null;
                return (
                  <div key={book.id}>
                    <div className="px-4 py-2 bg-[var(--color-mono-030)] border-b border-[var(--color-mono-080)] sticky top-0">
                      <p className="text-[11px] font-semibold text-[var(--color-mono-500)] truncate">{book.title}</p>
                    </div>
                    {agents.map((agent) => {
                      const isSelected = selectedAgentIds.includes(agent.id);
                      return (
                        <div key={agent.id} onClick={() => {
                          if (selectMode) { setSelectedAgentIds((p) => p.includes(agent.id) ? p.filter((x) => x !== agent.id) : [...p, agent.id]); }
                          else { openChat(agent, book); }
                        }}
                          className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-b border-[var(--color-mono-050)] ${isSelected ? "bg-[var(--color-primary-030)]" : "hover:bg-[var(--color-mono-030)]"}`}>
                          {selectMode && (
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-[var(--color-primary-500)] border-[var(--color-primary-500)]" : "border-[var(--color-mono-200)]"}`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          )}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={agent.avatar || "/avatars/default-profile.svg"} alt={agent.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[var(--color-mono-900)] truncate">{agent.name}</p>
                            <p className="text-[11px] text-[var(--color-mono-400)] truncate">{agent.speechStyle}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
              {filteredBooks.length === 0 && searchQuery && (
                <div className="text-center py-12"><p className="text-[13px] text-[var(--color-mono-400)]">검색 결과가 없어요</p></div>
              )}
            </>
          )}
        </div>

        {selectMode && selectedAgentIds.length >= 2 && (
          <div className="p-3 border-t border-[var(--color-mono-080)]">
            <button onClick={() => {
              const roomAgents = selectedAgentIds.map((id) => { for (const book of mockBooks) { const agent = book.agents.find((a) => a.id === id); if (agent) return { agent, book }; } return null; }).filter((x): x is { agent: Agent; book: Book } => x !== null);
              if (roomAgents.length >= 2) {
                const roomId = selectedAgentIds.slice().sort().join("_");
                setRooms((prev) => ({ ...prev, [roomId]: prev[roomId] ?? { id: roomId, agents: roomAgents, messages: [] } }));
                setCurrentRoomId(roomId); setSidebarTab("chats"); setSelectMode(false); setSelectedAgentIds([]); setMobileView("chat");
              }
            }} className="w-full py-3 rounded-xl bg-[var(--color-primary-500)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-600)] transition-colors">
              {selectedAgentIds.length}명과 그룹 채팅 시작
            </button>
          </div>
        )}
      </aside>

      {/* 가운데: 채팅 영역 */}
      <div className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
        {!currentRoom ? (
          <div className="flex-1 flex flex-col bg-[var(--color-mono-030)] overflow-y-auto">
            <div className="w-full max-w-3xl mx-auto px-6 py-8">
              <p className="text-xs tracking-widest text-[var(--color-mono-400)] uppercase mb-6">인기 인물</p>
              {(() => {
                const MC: Record<string, number> = { jeong_in: 1243, mari: 876, seong_ju: 654, su_yeong: 512, "ll-a1": 1243, "pe-a1": 445, "dkm-a1": 398, "wmm-a1": 367, "dp-a1": 334, "bc-a1": 312, "wi-a1": 289, "dh-a1": 478, "bph-a1": 256, "slu-a1": 423, "bac-a1": 201, "yb-a1": 345 };
                const fmt = (n: number) => mounted ? n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : String(n);
                const popular = booksWithAgents.flatMap((b) => b.agents.slice(0, 1).map((a) => ({ agent: a, book: b, cc: MC[a.id] || 200 })));
                const sorted = popular.sort((a, b) => b.cc - a.cc || a.agent.id.localeCompare(b.agent.id)).slice(0, 5);
                const top = sorted[0]; const rest = sorted.slice(1);
                return (
                  <>
                    {/* 1위 히어로 카드 */}
                    {top && (
                      <div onClick={() => openChat(top.agent, top.book)}
                        className="flex items-center gap-5 p-6 bg-[var(--color-primary-030)] border border-[var(--color-primary-200)] rounded-2xl cursor-pointer hover:border-[var(--color-primary-400)] hover:shadow-lg hover:scale-[1.01] transition-all duration-200 mb-4">
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-500)] flex items-center justify-center text-sm font-medium text-white">1</div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={top.agent.avatar || "/avatars/default-profile.svg"} alt={top.agent.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--color-primary-200)]" onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[16px] font-semibold text-[var(--color-mono-900)]">{top.agent.name}</p>
                          <p className="text-[13px] text-[var(--color-mono-500)] truncate">{top.book.title} · {top.agent.role === "protagonist" ? "주인공" : "조연"}</p>
                          <p className="text-[12px] text-[var(--color-mono-400)] truncate mt-0.5">{top.agent.speechStyle}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-auto">
                          <span className="text-sm text-[var(--color-primary-600)] font-medium">대화 {fmt(top.cc)}회</span>
                          <span className="bg-[var(--color-primary-500)] text-white rounded-full px-4 py-2 text-sm hover:bg-[var(--color-primary-600)] transition-colors">지금 대화하기</span>
                        </div>
                      </div>
                    )}
                    {/* 2~5위 가로형 리스트 */}
                    <div className="space-y-2 mt-3">
                      {rest.map(({ agent, book, cc }, i) => (
                        <div key={agent.id} onClick={() => openChat(agent, book)}
                          className="flex items-center gap-4 px-5 py-4 bg-white border border-[var(--color-mono-100)] rounded-xl cursor-pointer hover:border-[var(--color-mono-300)] hover:bg-[var(--color-mono-050)] transition-all duration-150">
                          <span className="w-6 text-sm text-[var(--color-mono-400)] font-medium text-center">{i + 2}</span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={agent.avatar || "/avatars/default-profile.svg"} alt={agent.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-mono-900)]">{agent.name}</p>
                            <p className="text-xs text-[var(--color-mono-400)] truncate">{book.title}</p>
                          </div>
                          <span className="text-xs text-[var(--color-mono-400)] flex-shrink-0 ml-auto">대화 {fmt(cc)}회</span>
                          <span className="text-[var(--color-mono-300)] text-sm">→</span>
                        </div>
                      ))}
                    </div>
                    {/* 더 많은 인물 보기 */}
                    <button onClick={() => setSidebarTab("explore")}
                      className="w-full mt-4 border border-[var(--color-mono-200)] rounded-xl py-3 text-sm text-[var(--color-mono-500)] hover:bg-[var(--color-mono-050)] hover:text-[var(--color-mono-700)] transition-colors">
                      더 많은 인물 보기
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        ) : (
          <ChatRoomView
            room={currentRoom}
            setRooms={setRooms}
            onInvite={() => setShowInviteModal(true)}
            onBack={() => setMobileView("list")}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
            showProfile={showProfile}
            setShowProfile={setShowProfile}
          />
        )}
      </div>

      {/* 오른쪽: 인물 프로필 패널 */}
      {currentRoom && (
        <aside className={`hidden md:flex flex-shrink-0 flex-col bg-white overflow-y-auto transition-all duration-300 ${showProfile ? "w-72 border-l border-[var(--color-mono-080)]" : "w-0 overflow-hidden"}`}>
          {/* 아바타 + 이름 */}
          <div className="flex flex-col items-center pt-8 pb-6 px-4 border-b border-[var(--color-mono-080)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentAgents[0]?.agent.avatar || "/avatars/default-profile.svg"} alt={currentAgents[0]?.agent.name || ""} className="w-20 h-20 rounded-full object-cover mb-3" />
            <p className="text-[15px] font-bold text-[var(--color-mono-990)]">
              {currentAgents.length === 1 ? currentAgents[0].agent.name : `${currentAgents[0].agent.name} 외 ${currentAgents.length - 1}명`}
            </p>
            <p className="text-[12px] text-[var(--color-mono-400)] mt-1">{currentAgents[0]?.book.title}</p>
            {currentAgents.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                {currentAgents.map((ra) => (
                  <div key={ra.agent.id} className="flex flex-col items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ra.agent.avatar || "/avatars/default-profile.svg"} alt={ra.agent.name} className="w-10 h-10 rounded-full object-cover" />
                    <span className="text-[10px] text-[var(--color-mono-500)]">{ra.agent.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 성격 태그 */}
          <div className="px-4 py-4 border-b border-[var(--color-mono-080)]">
            <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-2">성격</p>
            <div className="flex flex-wrap gap-1.5">
              {currentAgents[0]?.agent.personality.map((trait) => (
                <span key={trait} className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[var(--color-primary-030)] text-[var(--color-primary-700)]">{trait}</span>
              ))}
            </div>
          </div>

          {/* 말투 */}
          <div className="px-4 py-4 border-b border-[var(--color-mono-080)]">
            <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-2">말투</p>
            <p className="text-[13px] text-[var(--color-mono-600)] leading-relaxed">{currentAgents[0]?.agent.speechStyle}</p>
          </div>

          {/* 책 바로가기 */}
          <div className="px-4 py-4 border-b border-[var(--color-mono-080)]">
            <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-2">등장 도서</p>
            <Link href={`/library/${currentAgents[0]?.book.id}/intro`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-mono-030)] transition-colors group">
              {currentAgents[0]?.book.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={currentAgents[0].book.coverImage} alt={currentAgents[0].book.title} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[var(--color-mono-900)] line-clamp-2">{currentAgents[0]?.book.title}</p>
                <p className="text-[11px] text-[var(--color-mono-400)] mt-0.5">{currentAgents[0]?.book.author}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--color-mono-300)] group-hover:text-[var(--color-primary-500)] transition-colors flex-shrink-0" />
            </Link>
          </div>

          {/* 북마크 */}
          <div className="px-4 py-4 flex-1">
            <p className="text-[11px] font-semibold text-[var(--color-mono-400)] uppercase tracking-wider mb-2">북마크</p>
            {bookmarks.filter((b) => b.roomId === currentRoomId).length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Bookmark className="w-8 h-8 text-[var(--color-mono-200)] mb-2" />
                <p className="text-[12px] text-[var(--color-mono-400)]">대화 중 메시지를 북마크하면 여기에 모여요</p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookmarks.filter((b) => b.roomId === currentRoomId).map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-[var(--color-mono-030)] border border-[var(--color-mono-080)]">
                    <p className="text-[12px] text-[var(--color-mono-600)] leading-relaxed line-clamp-3">{b.content}</p>
                    <p className="text-[10px] text-[var(--color-mono-300)] mt-1">{b.agentName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 초대 모달 */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={closeInviteModal}>
          <div className="bg-white rounded-2xl max-w-sm w-full max-h-[70vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-[16px] font-semibold text-[var(--color-mono-900)]">인물 초대</h3>
              <button onClick={closeInviteModal} className="p-1 hover:bg-[var(--color-mono-050)] rounded-lg">
                <X className="w-5 h-5 text-[var(--color-mono-500)]" />
              </button>
            </div>
            {selectedInvites.length > 0 && (
              <div className="px-5 pb-2">
                <p className="text-[12px] text-[var(--color-primary-600)] font-medium">{selectedInvites.length}명 선택됨</p>
              </div>
            )}
            <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1">
              {invitableAgents.length === 0 ? (
                <p className="text-[13px] text-[var(--color-mono-400)] text-center py-8">초대할 수 있는 인물이 없어요</p>
              ) : (
                invitableAgents.map(({ agent, book }) => {
                  const isSelected = selectedInvites.includes(agent.id);
                  return (
                    <div key={agent.id}
                      onClick={() => setSelectedInvites((p) => p.includes(agent.id) ? p.filter((x) => x !== agent.id) : [...p, agent.id])}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all"
                      style={{ backgroundColor: isSelected ? "#f0fdf4" : "white", border: isSelected ? "1.5px solid #10b981" : "1.5px solid transparent" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={agent.avatar || "/avatars/default-profile.svg"} alt={agent.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[var(--color-mono-900)]">{agent.name}</p>
                        <p className="text-[11px] text-[var(--color-mono-400)] truncate">{book.title}</p>
                      </div>
                      <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 text-[12px]"
                        style={{ border: isSelected ? "none" : "2px solid #e5e7eb", backgroundColor: isSelected ? "#10b981" : "white", color: "white" }}>
                        {isSelected && "✓"}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {selectedInvites.length > 0 && (
              <div className="px-4 py-3 border-t border-[var(--color-mono-080)]">
                <button onClick={handleInviteConfirm}
                  className="w-full py-3 rounded-xl bg-[var(--color-primary-500)] text-white text-[14px] font-semibold hover:bg-[var(--color-primary-600)] transition-colors">
                  {selectedInvites.length}명 초대하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatRoomView({
  room,
  setRooms,
  onInvite,
  onBack,
  bookmarks,
  toggleBookmark,
  showProfile,
  setShowProfile,
}: {
  room: ChatRoom;
  setRooms: React.Dispatch<React.SetStateAction<Record<string, ChatRoom>>>;
  onInvite: () => void;
  onBack: () => void;
  bookmarks: BookmarkItem[];
  toggleBookmark: (roomId: string, messageId: string, content: string, agentName: string) => void;
  showProfile: boolean;
  setShowProfile: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [typingAgent, setTypingAgent] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isGroup = room.agents.length > 1;
  const firstAgent = room.agents[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.messages, typingAgent]);

  const updateMessages = useCallback(
    (updater: (msgs: ChatMessage[]) => ChatMessage[]) => {
      setRooms((prev) => ({
        ...prev,
        [room.id]: { ...prev[room.id], messages: updater(prev[room.id].messages) },
      }));
    },
    [setRooms, room.id]
  );

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const sendGroupMessage = async (userText: string, allMessages: ChatMessage[]) => {
    const book = room.agents[0].book;
    const recentContext = allMessages.slice(-6).map((m) => `${m.role === "user" ? "유저" : m.agentName || "AI"}: ${m.content}`).join("\n");
    setTypingAgent(room.agents.map((a) => a.agent.name).join(", "));
    try {
      const res = await fetch("/api/chat/group", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userText,
          bookId: book.id,
          characters: room.agents.map(({ agent }) => ({
            id: agent.id, name: agent.name, role: agent.role,
            personality: agent.personality, speechStyle: agent.speechStyle,
            background: "", systemPrompt: "", avatar: agent.avatar || "/avatars/default-profile.svg",
          })),
          recentContext,
        }),
      });
      const data = await res.json();
      const responses: { characterId: string; characterName: string; avatar: string; type: string; content: string }[] = data.responses || [];
      for (let i = 0; i < responses.length; i++) {
        const r = responses[i];
        if (i > 0) {
          const delay = r.type === "reaction" ? 400 + Math.random() * 800 : 1000 + Math.random() * 2000;
          setTypingAgent(r.characterName);
          await sleep(delay);
        }
        const aiMsg: ChatMessage = {
          id: `${Date.now()}_${r.characterId}_${i}`, role: "assistant",
          agentId: r.characterId, agentName: r.characterName,
          content: r.type === "reaction" ? r.content : r.content,
          timestamp: new Date().toISOString(),
        };
        updateMessages((msgs) => [...msgs, aiMsg]);
      }
    } catch {
      updateMessages((msgs) => [...msgs, {
        id: `${Date.now()}_err`, role: "assistant" as const,
        agentId: room.agents[0].agent.id, agentName: room.agents[0].agent.name,
        content: "죄송해요, 응답을 생성하지 못했어요.", timestamp: new Date().toISOString(),
      }]);
    }
  };

  const sendSingleMessage = async (userText: string, allMessages: ChatMessage[]) => {
    const { agent, book } = room.agents[0];
    setTypingAgent(agent.name);
    const aiMsg: ChatMessage = { id: `${Date.now()}_${agent.id}`, role: "assistant", agentId: agent.id, agentName: agent.name, content: "", timestamp: new Date().toISOString() };
    updateMessages((msgs) => [...msgs, aiMsg]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages.map((m) => ({ role: m.role, content: m.content })), agentName: agent.name, bookTitle: book.title, persona: `성격: ${agent.personality.join(", ")}. 말투: ${agent.speechStyle}`, userId: "anonymous", agentId: agent.id, bookId: book.id }),
      });
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value, { stream: true }).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const d = line.slice(6).trim();
            if (!d || d === "[DONE]") continue;
            try {
              const parsed = JSON.parse(d);
              const delta = parsed.type === "content_block_delta" ? parsed.delta?.text : parsed.type === "content_block_start" ? parsed.content_block?.text : parsed.content;
              if (delta) { fullContent += delta; const captured = fullContent; updateMessages((msgs) => { const u = [...msgs]; u[u.length - 1] = { ...u[u.length - 1], content: captured }; return u; }); }
            } catch { /* ignore */ }
          }
        }
      }
    } catch {
      updateMessages((msgs) => { const u = [...msgs]; u[u.length - 1] = { ...u[u.length - 1], content: "죄송해요, 응답을 생성하지 못했어요." }; return u; });
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userText = input.trim();
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: userText, timestamp: new Date().toISOString() };
    updateMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setIsStreaming(true);
    const allMessages = [...room.messages, userMsg];

    if (isGroup) {
      await sendGroupMessage(userText, allMessages);
    } else {
      await sendSingleMessage(userText, allMessages);
    }

    setTypingAgent(null);
    setIsStreaming(false);
  };

  const toggleFeedback = (msgId: string, type: "like" | "dislike") => {
    updateMessages((msgs) => msgs.map((m) => (m.id === msgId ? { ...m, feedback: m.feedback === type ? undefined : type } : m)));
  };

  return (
    <>
      {/* 상단 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-mono-080)] bg-white flex-shrink-0">
        <button onClick={onBack} className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-[var(--color-mono-050)] text-[var(--color-mono-600)]">
          <ChevronLeft className="w-5 h-5" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={firstAgent.agent.avatar || "/avatars/default-profile.svg"} alt={firstAgent.agent.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[var(--color-mono-990)] truncate">
            {isGroup ? room.agents.map((ra) => ra.agent.name).join(", ") : firstAgent.agent.name}
          </p>
          <p className="text-[11px] text-[var(--color-mono-400)] truncate">{firstAgent.book.title}</p>
        </div>
        <Link href={`/library/${firstAgent.book.id}/intro`} className="md:hidden p-2 rounded-lg hover:bg-[var(--color-mono-050)] text-[var(--color-mono-400)]" title="책 페이지로 이동">
          <BookOpen className="w-4 h-4" />
        </Link>
        <button onClick={onInvite} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium border border-[var(--color-mono-100)] text-[var(--color-mono-600)] hover:bg-[var(--color-mono-050)] transition-colors">
          <UserPlus className="w-3.5 h-3.5" />인물 초대
        </button>
        <button onClick={() => setShowProfile((prev) => !prev)} title={showProfile ? "프로필 닫기" : "프로필 열기"}
          className={`hidden md:flex p-2 rounded-lg transition-colors ${showProfile ? "text-[var(--color-primary-500)] bg-[var(--color-primary-030)]" : "text-[var(--color-mono-400)] hover:text-[var(--color-primary-500)] hover:bg-[var(--color-primary-030)]"}`}>
          {showProfile ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {room.messages.length === 0 && !typingAgent && (
          <div className="flex flex-col items-center pt-12">
            <div className="flex -space-x-3 mb-4">
              {room.agents.map(({ agent }) => (
                <div key={agent.id} className="w-14 h-14 rounded-full overflow-hidden border-3 border-white ring-2 ring-[var(--color-primary-050)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={agent.avatar || "/avatars/default-profile.svg"} alt={agent.name} className="w-14 h-14 rounded-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-[15px] font-semibold text-[var(--color-mono-800)]">{room.agents.map((a) => a.agent.name).join(", ")}</p>
            <p className="text-[12px] text-[var(--color-mono-400)] mt-1 text-center max-w-xs">
              {isGroup ? "그룹 채팅방이에요. 대화 맥락에 따라 인물들이 자연스럽게 반응해요." : firstAgent.agent.speechStyle}
            </p>
          </div>
        )}

        {room.messages.map((msg) => {
          const isReaction = msg.role === "assistant" && msg.content && msg.content.trim().length <= 2 && !/[a-zA-Z가-힣0-9]/.test(msg.content.trim());
          const isSystemMsg = msg.role === "assistant" && !msg.agentId && msg.id.startsWith("sys_");
          if (isSystemMsg) {
            return (
              <div key={msg.id} className="flex justify-center py-2">
                <span className="text-[11px] text-[var(--color-mono-400)] bg-[var(--color-mono-050)] px-3 py-1 rounded-full">{msg.content}</span>
              </div>
            );
          }
          return (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={room.agents.find((ra) => ra.agent.id === msg.agentId)?.agent.avatar || "/avatars/default-profile.svg"} alt="" className="w-5 h-5 rounded-full object-cover" />
                  <span className="text-[11px] text-[var(--color-mono-500)]">{msg.agentName}</span>
                </div>
              )}
              {isReaction ? (
                <div className="text-[24px] leading-none py-1">{msg.content}</div>
              ) : (
              <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${msg.role === "user" ? "bg-[var(--color-primary-500)] text-white rounded-tr-sm" : "bg-[var(--color-primary-030)] text-[var(--color-mono-800)] rounded-tl-sm"}`}>
                {msg.content || (
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-mono-300 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-mono-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 bg-mono-300 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </span>
                )}
              </div>
              )}
              {msg.role === "assistant" && msg.content && !isReaction && (
                <div className="flex gap-1 mt-1 ml-1">
                  <button onClick={() => toggleFeedback(msg.id, "like")}
                    className={`p-1 rounded transition-colors ${msg.feedback === "like" ? "text-primary-500" : "text-mono-300 hover:text-mono-500"}`}>
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleFeedback(msg.id, "dislike")}
                    className={`p-1 rounded transition-colors ${msg.feedback === "dislike" ? "text-red-300" : "text-mono-300 hover:text-mono-500"}`}>
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleBookmark(room.id, msg.id, msg.content, msg.agentName || "")}
                    className={`p-1 rounded transition-colors ${bookmarks.some((b) => b.messageId === msg.id) ? "text-[var(--color-primary-500)]" : "text-[var(--color-mono-200)] hover:text-[var(--color-mono-400)]"}`}
                    title="북마크">
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          );
        })}

        {typingAgent && (
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-mono-400)]">
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 bg-[var(--color-primary-400)] rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-[var(--color-primary-400)] rounded-full animate-bounce [animation-delay:0.15s]" />
              <span className="w-1.5 h-1.5 bg-[var(--color-primary-400)] rounded-full animate-bounce [animation-delay:0.3s]" />
            </span>
            {typingAgent}이(가) 입력 중...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="border-t border-[var(--color-mono-080)] bg-white px-3 py-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="메시지를 입력하세요..." rows={1}
            className="flex-1 resize-none text-[14px] text-[var(--color-mono-800)] placeholder:text-[var(--color-mono-300)] bg-[var(--color-mono-050)] border border-mono-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-32 overflow-y-auto" />
          <button onClick={sendMessage} disabled={!input.trim() || isStreaming}
            className="w-9 h-9 rounded-xl bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white flex items-center justify-center transition-colors disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--color-mono-400)] text-center mt-1.5">Enter로 전송 · Shift+Enter로 줄바꿈</p>
      </div>
    </>
  );
}
