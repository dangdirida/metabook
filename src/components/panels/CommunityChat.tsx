"use client";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Send, Users, Pin, UserPlus, Flag, Copy, Trash2 } from "lucide-react";

interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  userInitial?: string;
  message: string;
  createdAt: string;
  likes: number;
}

export default function CommunityChat({ bookId }: { bookId: string }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showReport, setShowReport] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 댓글 불러오기
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/community-chat?bookId=${bookId}&limit=100`);
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch { /* */ }
    finally { setLoading(false); }
  };

  // 마운트 시 + 30초마다 갱신
  useEffect(() => {
    if (!bookId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 2000); return () => clearTimeout(t); }
  }, [toast]);

  // 댓글 전송
  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/community-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, message: input.trim(), type: "text" }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        setInput("");
      } else if (data.error) {
        setToast(data.error === "Unauthorized" ? "로그인이 필요해요" : data.error);
      }
    } catch { setToast("전송에 실패했어요"); }
    finally { setSending(false); }
  };

  // 댓글 삭제
  const handleDelete = async (messageId: string) => {
    if (!confirm("댓글을 삭제할까요?")) return;
    try {
      await fetch("/api/community-chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, messageId }),
      });
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch { setToast("삭제에 실패했어요"); }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const groupByDate = (msgs: CommunityMessage[]) => {
    const groups: { date: string; messages: CommunityMessage[] }[] = [];
    let currentDate = "";
    msgs.forEach((msg) => {
      const dd = new Date(msg.createdAt).toLocaleDateString("ko");
      if (dd !== currentDate) { currentDate = dd; groups.push({ date: dd, messages: [msg] }); }
      else { groups[groups.length - 1].messages.push(msg); }
    });
    return groups;
  };

  const myEmail = session?.user?.email;

  return (
    <div className="flex flex-col h-full relative">
      {toast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-mono-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      {/* 상단 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-mono-080)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          <Users className="w-4 h-4 text-mono-500 ml-1" />
          <span className="text-[12px] text-[var(--color-mono-400)]">커뮤니티</span>
        </div>
        <button onClick={() => setShowInvite(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[12px] font-medium bg-[var(--color-primary-500)] text-white hover:bg-[var(--color-primary-600)] transition-colors">
          <UserPlus className="w-3.5 h-3.5" />초대
        </button>
      </div>

      {/* 공지 */}
      <div className="flex items-start gap-2 px-4 py-2 bg-[var(--color-primary-030)] border-b border-[var(--color-primary-080)]">
        <Pin className="w-3.5 h-3.5 text-[var(--color-primary-600)] mt-0.5 flex-shrink-0" />
        <p className="text-[12px] text-[var(--color-primary-700)]">환영합니다! 서로 존중하며 대화해주세요.</p>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-1">
        {loading && (
          <div className="text-center py-8 text-[13px] text-[var(--color-mono-400)]">댓글을 불러오는 중...</div>
        )}

        {!loading && messages.length === 0 && (
          <div className="text-center py-12 text-[13px] text-[var(--color-mono-400)]">
            아직 댓글이 없어요. 첫 번째 댓글을 남겨보세요!
          </div>
        )}

        {groupByDate(messages).map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center my-3">
              <span className="text-[10px] text-[var(--color-mono-400)] bg-[var(--color-mono-050)] px-3 py-1 rounded-full">{group.date}</span>
            </div>
            {group.messages.map((msg) => {
              const isMe = msg.userId === myEmail;
              return (
                <div key={msg.id} className={`group flex items-start gap-2 py-1.5 ${isMe ? "flex-row-reverse" : ""}`}
                  onContextMenu={(e) => { e.preventDefault(); if (!isMe) setShowReport(msg.id); }}>
                  {!isMe && (
                    <div className="w-8 h-8 bg-[var(--color-secondary-100)] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-[12px] font-bold text-[var(--color-secondary-600)]">{msg.userInitial || msg.userName?.[0] || "?"}</span>
                    </div>
                  )}
                  <div className={isMe ? "text-right" : ""}>
                    {!isMe && <p className="text-[12px] font-semibold text-[var(--color-mono-700)] mb-0.5 ml-1">{msg.userName}</p>}
                    <div className={`inline-block px-3 py-2 rounded-xl text-[13px] leading-relaxed max-w-[240px] text-left ${isMe ? "bg-[var(--color-primary-500)] text-white" : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)]"}`}>
                      {msg.message}
                    </div>
                    <div className={`flex items-center gap-1 mt-0.5 ${isMe ? "justify-end" : ""}`}>
                      <span className="text-[10px] text-[var(--color-mono-300)]">{formatDate(msg.createdAt)}</span>
                      {isMe && (
                        <button onClick={() => handleDelete(msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                          <Trash2 className="w-3 h-3 text-mono-300 hover:text-red-400" />
                        </button>
                      )}
                      {!isMe && (
                        <button onClick={() => setShowReport(msg.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                          <Flag className="w-3 h-3 text-mono-300 hover:text-red-300" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="border-t border-[var(--color-mono-080)] bg-white px-3 py-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={session ? "메시지 입력... (Enter로 전송)" : "로그인 후 댓글을 남겨보세요"}
            disabled={!session}
            className="flex-1 text-[14px] text-[var(--color-mono-800)] placeholder:text-[var(--color-mono-300)] bg-[var(--color-mono-050)] border border-mono-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50" />
          <button onClick={handleSend} disabled={!input.trim() || sending || !session}
            className="w-9 h-9 rounded-xl bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white flex items-center justify-center disabled:opacity-40 transition-colors">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 초대 모달 */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-1">친구 초대하기</h3>
            <p className="text-sm text-mono-400 mb-4">링크를 공유해서 함께 읽어요!</p>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); setShowInvite(false); setToast("링크가 복사되었어요!"); }}
              className="w-full flex items-center gap-3 px-4 py-3 bg-mono-50 rounded-xl hover:bg-mono-100 transition-colors">
              <Copy className="w-5 h-5 text-mono-500" /><span className="text-sm">커뮤니티 링크 복사</span>
            </button>
            <button onClick={() => setShowInvite(false)} className="w-full mt-4 py-3 text-mono-500 text-sm">닫기</button>
          </div>
        </div>
      )}

      {/* 신고 모달 */}
      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4 md:items-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">신고하기</h3>
            <div className="space-y-2">
              {["스팸/광고", "욕설/혐오 표현", "부적절한 콘텐츠", "기타"].map((reason) => (
                <button key={reason} onClick={() => { setShowReport(null); setToast("신고가 접수되었어요."); }}
                  className="w-full px-4 py-3 text-left text-sm bg-mono-50 rounded-xl hover:bg-mono-100 transition-colors">{reason}</button>
              ))}
            </div>
            <button onClick={() => setShowReport(null)} className="w-full mt-4 py-3 text-mono-500 text-sm">취소</button>
          </div>
        </div>
      )}
    </div>
  );
}
