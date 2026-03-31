"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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

export default function ChatPage() {
  const [rooms, setRooms] = useState<Record<string, ChatRoom>>({});
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<{ agent: Agent; book: Book }[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("chat_bookmarks") || "[]"); }
    catch { return []; }
  });

  const currentRoom = currentRoomId ? rooms[currentRoomId] : null;
  const currentAgents = currentRoom?.agents || [];

  const booksWithAgents = mockBooks.filter((b) => b.agents && b.agents.length > 0);

  const filteredBooks = searchQuery.trim() === ""
    ? booksWithAgents
    : booksWithAgents.filter((book) => {
        const q = searchQuery.toLowerCase();
        return book.title.toLowerCase().includes(q) || book.agents.some((a) => a.name.toLowerCase().includes(q));
      });

  const getFilteredAgents = (book: Book) => {
    if (!searchQuery.trim()) return book.agents || [];
    const q = searchQuery.toLowerCase();
    if (book.title.toLowerCase().includes(q)) return book.agents || [];
    return (book.agents || []).filter((a) => a.name.toLowerCase().includes(q));
  };

  const groupRooms = Object.values(rooms).filter((r) => r.agents.length > 1);

  const openChat = (agent: Agent, book: Book) => {
    if (selectMode) { toggleSelect(agent, book); return; }
    const roomId = agent.id;
    if (!rooms[roomId]) {
      setRooms((prev) => ({ ...prev, [roomId]: { id: roomId, agents: [{ agent, book }], messages: [] } }));
    }
    setCurrentRoomId(roomId);
    setMobileView("chat");
  };

  const toggleSelect = (agent: Agent, book: Book) => {
    setSelectedAgents((prev) => {
      const exists = prev.find((s) => s.agent.id === agent.id);
      if (exists) return prev.filter((s) => s.agent.id !== agent.id);
      return [...prev, { agent, book }];
    });
  };

  const createGroupChat = () => {
    if (selectedAgents.length < 2) return;
    const roomId = selectedAgents.map((s) => s.agent.id).sort().join("_");
    if (!rooms[roomId]) {
      setRooms((prev) => ({ ...prev, [roomId]: { id: roomId, agents: [...selectedAgents], messages: [] } }));
    }
    setCurrentRoomId(roomId);
    setMobileView("chat");
    setSelectMode(false);
    setSelectedAgents([]);
  };

  const inviteAgent = (agent: Agent, book: Book) => {
    if (!currentRoom) return;
    if (currentRoom.agents.find((a) => a.agent.id === agent.id)) return;
    const newAgents = [...currentRoom.agents, { agent, book }];
    const newRoomId = newAgents.map((a) => a.agent.id).sort().join("_");
    setRooms((prev) => ({ ...prev, [newRoomId]: { id: newRoomId, agents: newAgents, messages: currentRoom.messages } }));
    setCurrentRoomId(newRoomId);
    setShowInviteModal(false);
  };

  const toggleBookmark = (roomId: string, messageId: string, content: string, agentName: string) => {
    setBookmarks((prev) => {
      const exists = prev.find((b) => b.messageId === messageId);
      const next = exists
        ? prev.filter((b) => b.messageId !== messageId)
        : [...prev, { id: Date.now().toString(), roomId, messageId, content, agentName, createdAt: new Date().toISOString() }];
      localStorage.setItem("chat_bookmarks", JSON.stringify(next));
      return next;
    });
  };

  const invitableAgents = currentRoom
    ? booksWithAgents.flatMap((b) =>
        (b.agents || []).filter((a) => !currentRoom.agents.find((ca) => ca.agent.id === a.id)).map((a) => ({ agent: a, book: b }))
      )
    : [];

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      {/* 왼쪽: 연락처 목록 */}
      <div className={`w-full md:w-72 flex-shrink-0 border-r border-[var(--color-mono-080)] flex flex-col bg-white ${mobileView === "chat" ? "hidden md:flex" : "flex"}`}>
        {/* 헤더 */}
        <div className="px-4 py-4 border-b border-[var(--color-mono-080)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link href="/library" className="p-1.5 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors">
                <ArrowLeft className="w-4 h-4 text-[var(--color-mono-600)]" />
              </Link>
              <h1 className="text-lg font-bold text-[var(--color-mono-990)]">채팅</h1>
            </div>
            <button
              onClick={() => { setSelectMode(!selectMode); setSelectedAgents([]); }}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors ${
                selectMode ? "bg-[var(--color-primary-500)] text-white" : "border border-[var(--color-mono-100)] text-[var(--color-mono-600)] hover:bg-[var(--color-mono-050)]"
              }`}
            >
              <Users className="w-3.5 h-3.5 inline mr-1" />
              {selectMode ? "취소" : "그룹 채팅"}
            </button>
          </div>
          {selectMode && selectedAgents.length > 0 && (
            <button onClick={createGroupChat} className="w-full py-2 rounded-xl text-[13px] font-semibold bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-colors">
              {selectedAgents.length}명으로 채팅방 만들기
            </button>
          )}
        </div>

        {/* 그룹 채팅방 목록 */}
        {groupRooms.length > 0 && (
          <div className="border-b border-[var(--color-mono-080)]">
            <div className="px-4 py-2 bg-[var(--color-mono-050)]">
              <span className="text-[11px] font-semibold text-[var(--color-mono-500)] tracking-wide">그룹 채팅</span>
            </div>
            {groupRooms.map((room) => (
              <div key={room.id} onClick={() => { setCurrentRoomId(room.id); setMobileView("chat"); }}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${currentRoomId === room.id ? "bg-[var(--color-primary-030)]" : "hover:bg-[var(--color-mono-030)]"}`}>
                <div className="relative w-10 h-10 flex-shrink-0">
                  {room.agents.slice(0, 3).map((ra, i) => (
                    <div key={ra.agent.id} style={{ position: "absolute", left: i * 10, top: 0, zIndex: 3 - i }}
                      className="w-7 h-7 rounded-full bg-[var(--color-secondary-100)] border-2 border-white flex items-center justify-center text-[10px] font-bold text-[var(--color-secondary-600)]">
                      {ra.agent.name[0]}
                    </div>
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[var(--color-mono-900)] truncate">{room.agents.map((ra) => ra.agent.name).join(", ")}</p>
                  <p className="text-[11px] text-[var(--color-mono-400)] truncate">그룹 채팅 · {room.agents.length}명</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 검색창 */}
        <div className="px-3 py-2 border-b border-[var(--color-mono-080)]">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--color-mono-050)] rounded-xl">
            <Search className="w-4 h-4 text-[var(--color-mono-400)] flex-shrink-0" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="인물 또는 책 이름 검색"
              className="flex-1 bg-transparent text-[13px] text-[var(--color-mono-800)] placeholder:text-[var(--color-mono-300)] outline-none" />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-[var(--color-mono-300)] hover:text-[var(--color-mono-600)]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 연락처 목록 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredBooks.map((book) => {
            const agents = getFilteredAgents(book);
            if (agents.length === 0) return null;
            return (
              <div key={book.id}>
                <div className="px-4 py-2 sticky top-0 bg-[var(--color-mono-050)] border-b border-[var(--color-mono-080)]">
                  <span className="text-[11px] font-semibold text-[var(--color-mono-500)] tracking-wide">{book.title}</span>
                </div>
                {agents.map((agent) => {
                  const isSelected = selectedAgents.find((s) => s.agent.id === agent.id);
                  return (
                    <div key={agent.id} onClick={() => openChat(agent, book)}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-mono-030)] cursor-pointer transition-colors ${currentRoomId === agent.id ? "bg-[var(--color-primary-030)]" : ""}`}>
                      {selectMode && (
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "bg-[var(--color-primary-500)] border-[var(--color-primary-500)]" : "border-[var(--color-mono-200)]"}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      )}
                      {agent.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={agent.avatar} alt={agent.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center flex-shrink-0">
                          <span className="text-[14px] font-bold text-[var(--color-primary-600)]">{agent.name[0]}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-[14px] font-medium text-[var(--color-mono-900)]">{agent.name}</span>
                        <p className="text-[12px] text-[var(--color-mono-400)] truncate">{agent.speechStyle}</p>
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
        </div>
      </div>

      {/* 가운데: 채팅 영역 */}
      <div className={`flex-1 flex flex-col min-w-0 ${mobileView === "list" ? "hidden md:flex" : "flex"}`}>
        {!currentRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-[var(--color-mono-050)] rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-[var(--color-mono-300)]" />
            </div>
            <p className="text-[16px] font-semibold text-[var(--color-mono-700)]">채팅할 인물을 선택해보세요</p>
            <p className="text-[13px] text-[var(--color-mono-400)] mt-1">왼쪽에서 AI 캐릭터를 클릭하면 대화가 시작돼요</p>
          </div>
        ) : (
          <ChatRoomView
            room={currentRoom}
            setRooms={setRooms}
            onInvite={() => setShowInviteModal(true)}
            onBack={() => setMobileView("list")}
            bookmarks={bookmarks}
            toggleBookmark={toggleBookmark}
          />
        )}
      </div>

      {/* 오른쪽: 인물 프로필 패널 */}
      {currentRoom && (
        <aside className="hidden md:flex w-72 flex-shrink-0 border-l border-[var(--color-mono-080)] flex-col bg-white overflow-y-auto">
          {/* 아바타 + 이름 */}
          <div className="flex flex-col items-center pt-8 pb-6 px-4 border-b border-[var(--color-mono-080)]">
            {currentAgents[0]?.agent.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentAgents[0].agent.avatar} alt={currentAgents[0].agent.name} className="w-20 h-20 rounded-full object-cover mb-3" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center mb-3">
                <span className="text-2xl font-bold text-[var(--color-primary-600)]">{currentAgents[0]?.agent.name[0]}</span>
              </div>
            )}
            <p className="text-[15px] font-bold text-[var(--color-mono-990)]">
              {currentAgents.length === 1 ? currentAgents[0].agent.name : `${currentAgents[0].agent.name} 외 ${currentAgents.length - 1}명`}
            </p>
            <p className="text-[12px] text-[var(--color-mono-400)] mt-1">{currentAgents[0]?.book.title}</p>
            {currentAgents.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap justify-center">
                {currentAgents.map((ra) => (
                  <div key={ra.agent.id} className="flex flex-col items-center gap-1">
                    {ra.agent.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ra.agent.avatar} alt={ra.agent.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--color-secondary-100)] flex items-center justify-center">
                        <span className="text-[12px] font-bold text-[var(--color-secondary-600)]">{ra.agent.name[0]}</span>
                      </div>
                    )}
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
            <Link href={`/library/${currentAgents[0]?.book.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--color-mono-030)] transition-colors group">
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
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--color-mono-900)]">인물 초대</h3>
              <button onClick={() => setShowInviteModal(false)} className="p-1 hover:bg-[var(--color-mono-050)] rounded-lg">
                <X className="w-5 h-5 text-[var(--color-mono-500)]" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {invitableAgents.length === 0 ? (
                <p className="text-[13px] text-[var(--color-mono-400)] text-center py-8">초대할 수 있는 인물이 없어요</p>
              ) : (
                invitableAgents.map(({ agent, book }) => (
                  <button key={agent.id} onClick={() => inviteAgent(agent, book)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-mono-030)] transition-colors text-left">
                    {agent.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={agent.avatar} alt={agent.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center flex-shrink-0">
                        <span className="text-[13px] font-bold text-[var(--color-primary-600)]">{agent.name[0]}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium text-[var(--color-mono-900)]">{agent.name}</p>
                      <p className="text-[11px] text-[var(--color-mono-400)] truncate">{book.title}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
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
}: {
  room: ChatRoom;
  setRooms: React.Dispatch<React.SetStateAction<Record<string, ChatRoom>>>;
  onInvite: () => void;
  onBack: () => void;
  bookmarks: BookmarkItem[];
  toggleBookmark: (roomId: string, messageId: string, content: string, agentName: string) => void;
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

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: new Date().toISOString() };
    updateMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setIsStreaming(true);
    const allMessages = [...room.messages, userMsg];

    for (const { agent, book } of room.agents) {
      setTypingAgent(agent.name);
      const aiMsg: ChatMessage = { id: `${Date.now()}_${agent.id}`, role: "assistant", agentId: agent.id, agentName: agent.name, content: "", timestamp: new Date().toISOString() };
      updateMessages((msgs) => [...msgs, aiMsg]);
      try {
        const response = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: allMessages.map((m) => ({ role: m.role, content: m.content })), agentName: agent.name, bookTitle: book.title, persona: `성격: ${agent.personality.join(", ")}. 말투: ${agent.speechStyle}` }),
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
              const data = line.slice(6).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.type === "content_block_delta" ? parsed.delta?.text : parsed.type === "content_block_start" ? parsed.content_block?.text : parsed.content;
                if (delta) { fullContent += delta; const captured = fullContent; updateMessages((msgs) => { const u = [...msgs]; u[u.length - 1] = { ...u[u.length - 1], content: captured }; return u; }); }
              } catch { /* ignore */ }
            }
          }
        }
      } catch {
        updateMessages((msgs) => { const u = [...msgs]; u[u.length - 1] = { ...u[u.length - 1], content: "죄송해요, 응답을 생성하지 못했어요." }; return u; });
      }
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
        {firstAgent.agent.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={firstAgent.agent.avatar} alt={firstAgent.agent.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center flex-shrink-0">
            <span className="text-[13px] font-bold text-[var(--color-primary-600)]">{firstAgent.agent.name[0]}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[var(--color-mono-990)] truncate">
            {isGroup ? room.agents.map((ra) => ra.agent.name).join(", ") : firstAgent.agent.name}
          </p>
          <p className="text-[11px] text-[var(--color-mono-400)] truncate">{firstAgent.book.title}</p>
        </div>
        <Link href={`/library/${firstAgent.book.id}`} className="md:hidden p-2 rounded-lg hover:bg-[var(--color-mono-050)] text-[var(--color-mono-400)]" title="책 페이지로 이동">
          <BookOpen className="w-4 h-4" />
        </Link>
        <button onClick={onInvite} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium border border-[var(--color-mono-100)] text-[var(--color-mono-600)] hover:bg-[var(--color-mono-050)] transition-colors">
          <UserPlus className="w-3.5 h-3.5" />인물 초대
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {room.messages.length === 0 && !typingAgent && (
          <div className="flex flex-col items-center pt-12">
            <div className="flex -space-x-3 mb-4">
              {room.agents.map(({ agent }) => (
                <div key={agent.id} className="w-14 h-14 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center border-3 border-white ring-2 ring-[var(--color-primary-050)]">
                  {agent.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={agent.avatar} alt={agent.name} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <span className="text-[18px] font-bold text-[var(--color-primary-600)]">{agent.name[0]}</span>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[15px] font-semibold text-[var(--color-mono-800)]">{room.agents.map((a) => a.agent.name).join(", ")}</p>
            <p className="text-[12px] text-[var(--color-mono-400)] mt-1 text-center max-w-xs">
              {isGroup ? "그룹 채팅방이에요. 메시지를 보내면 모든 인물이 답장해요." : firstAgent.agent.speechStyle}
            </p>
          </div>
        )}

        {room.messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-[var(--color-primary-100)] flex items-center justify-center overflow-hidden">
                    {(() => {
                      const a = room.agents.find((ra) => ra.agent.id === msg.agentId);
                      return a?.agent.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.agent.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-bold text-[var(--color-primary-600)]">{msg.agentName?.[0]}</span>
                      );
                    })()}
                  </div>
                  <span className="text-[11px] text-[var(--color-mono-500)]">{msg.agentName}</span>
                </div>
              )}
              <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${msg.role === "user" ? "bg-[var(--color-primary-500)] text-white rounded-tr-sm" : "bg-[var(--color-primary-030)] text-[var(--color-mono-800)] rounded-tl-sm"}`}>
                {msg.content || (
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-mono-300 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-mono-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 bg-mono-300 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </span>
                )}
              </div>
              {msg.role === "assistant" && msg.content && (
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
        ))}

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
