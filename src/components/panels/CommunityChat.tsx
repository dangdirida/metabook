"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Users,
  Pin,
  UserPlus,
  Smile,
  Image as ImageIcon,
  Flag,
  Copy,
  Link2,
} from "lucide-react";

interface CommunityMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: "text" | "emoji" | "image" | "creation_link";
  isPinned: boolean;
  createdAt: string;
}

const PROFANITY_FILTER = ["바보", "멍청이"];

const MOCK_MESSAGES: CommunityMessage[] = [
  {
    id: "pin-1",
    userId: "admin",
    userName: "관리자",
    content: "환영합니다! '총, 균, 쇠' 독서 커뮤니티입니다. 서로 존중하며 대화해주세요.",
    type: "text",
    isPinned: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "m1",
    userId: "user1",
    userName: "독서광민수",
    content: "이 책 진짜 인상적이에요. 지리가 문명을 결정한다는 관점이 신선했어요.",
    type: "text",
    isPinned: false,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "m2",
    userId: "user2",
    userName: "역사덕후",
    content: "얄리의 질문이 가장 인상깊었어요. 단순한 질문이지만 깊은 의미가 있죠.",
    type: "text",
    isPinned: false,
    createdAt: "2024-01-15T10:35:00Z",
  },
  {
    id: "m3",
    userId: "user3",
    userName: "과학소녀",
    content: "가축화 안나 카레니나 원칙 부분 정말 재미있었어요 😂",
    type: "text",
    isPinned: false,
    createdAt: "2024-01-15T11:00:00Z",
  },
];

export default function CommunityChat() {
  const [messages, setMessages] = useState<CommunityMessage[]>(MOCK_MESSAGES);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showReport, setShowReport] = useState<string | null>(null);
  const [onlineCount] = useState(12);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filterProfanity = (text: string): string => {
    let filtered = text;
    PROFANITY_FILTER.forEach((word) => {
      filtered = filtered.replace(new RegExp(word, "g"), "***");
    });
    return filtered;
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const newMsg: CommunityMessage = {
      id: Date.now().toString(),
      userId: "me",
      userName: "나",
      content: filterProfanity(input.trim()),
      type: "text",
      isPinned: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const pinnedMessages = messages.filter((m) => m.isPinned);
  const chatMessages = messages.filter((m) => !m.isPinned);

  // 날짜 구분
  const groupByDate = (msgs: CommunityMessage[]) => {
    const groups: { date: string; messages: CommunityMessage[] }[] = [];
    let currentDate = "";
    msgs.forEach((msg) => {
      const d = new Date(msg.createdAt).toLocaleDateString("ko");
      if (d !== currentDate) {
        currentDate = d;
        groups.push({ date: d, messages: [msg] });
      } else {
        groups[groups.length - 1].messages.push(msg);
      }
    });
    return groups;
  };

  const emojis = ["😊", "😂", "👍", "❤️", "🔥", "📖", "✨", "🤔", "👏", "💡", "🎉", "😍"];

  return (
    <div className="flex flex-col h-full">
      {/* 상단: 접속 인원 */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-mono-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-mono-500" />
          <span className="text-sm text-mono-600">
            <span className="font-medium text-primary-500">{onlineCount}</span>명 접속 중
          </span>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          초대
        </button>
      </div>

      {/* 공지 고정 메시지 */}
      {pinnedMessages.map((msg) => (
        <div
          key={msg.id}
          className="flex items-start gap-2 px-4 py-2 bg-accent-yellow/10 border-b border-accent-yellow/20"
        >
          <Pin className="w-3.5 h-3.5 text-accent-orange mt-0.5 flex-shrink-0" />
          <p className="text-xs text-mono-700">{msg.content}</p>
        </div>
      ))}

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-1">
        {groupByDate(chatMessages).map((group) => (
          <div key={group.date}>
            <div className="flex items-center justify-center my-3">
              <span className="text-[10px] text-mono-400 bg-mono-100 px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>
            {group.messages.map((msg) => (
              <div
                key={msg.id}
                className={`group flex items-start gap-2 py-1.5 ${
                  msg.userId === "me" ? "flex-row-reverse" : ""
                }`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (msg.userId !== "me") setShowReport(msg.id);
                }}
              >
                {msg.userId !== "me" && (
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary-600">
                      {msg.userName[0]}
                    </span>
                  </div>
                )}
                <div className={msg.userId === "me" ? "text-right" : ""}>
                  {msg.userId !== "me" && (
                    <span className="text-xs font-medium text-mono-700">
                      {msg.userName}
                    </span>
                  )}
                  <div
                    className={`inline-block px-3 py-2 rounded-xl text-sm max-w-[240px] text-left ${
                      msg.userId === "me"
                        ? "bg-primary-500 text-white"
                        : "bg-mono-50 text-mono-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[10px] text-mono-400">
                      {formatDate(msg.createdAt)}
                    </span>
                    {msg.userId !== "me" && (
                      <button
                        onClick={() => setShowReport(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Flag className="w-3 h-3 text-mono-300 hover:text-red-300" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 이모지 피커 */}
      {showEmoji && (
        <div className="px-4 py-2 border-t border-mono-200 flex flex-wrap gap-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setInput((prev) => prev + emoji);
                setShowEmoji(false);
              }}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* 입력창 */}
      <div className="p-3 border-t border-mono-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-mono-400 hover:text-mono-600"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button className="p-2 text-mono-400 hover:text-mono-600">
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="메시지 입력..."
            className="flex-1 px-4 py-2.5 bg-mono-50 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 초대 모달 */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">초대하기</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setShowInvite(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-mono-50 rounded-xl hover:bg-mono-100 transition-colors"
              >
                <Copy className="w-5 h-5 text-mono-500" />
                <span className="text-sm">링크 복사</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#FEE500] rounded-xl hover:opacity-90 transition-opacity">
                <Link2 className="w-5 h-5 text-mono-900" />
                <span className="text-sm text-mono-900">카카오톡 공유</span>
              </button>
            </div>
            <button
              onClick={() => setShowInvite(false)}
              className="w-full mt-4 py-3 text-mono-500 text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* 신고 메뉴 */}
      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4 md:items-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">신고하기</h3>
            <div className="space-y-2">
              {["스팸/광고", "욕설/혐오 표현", "부적절한 콘텐츠", "기타"].map((reason) => (
                <button
                  key={reason}
                  onClick={() => setShowReport(null)}
                  className="w-full px-4 py-3 text-left text-sm bg-mono-50 rounded-xl hover:bg-mono-100 transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowReport(null)}
              className="w-full mt-4 py-3 text-mono-500 text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
