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

const PROFANITY_FILTER = ["ë°ë³´", "ë©ì²­ì´"];

const MOCK_MESSAGES: CommunityMessage[] = [
  {
    id: "pin-1",
    userId: "admin",
    userName: "ê´ë¦¬ì",
    content: "íìí©ëë¤! 'ì´, ê· , ì ' ëì ì»¤ë®¤ëí°ìëë¤. ìë¡ ì¡´ì¤íë©° ëíí´ì£¼ì¸ì.",
    type: "text",
    isPinned: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "m1",
    userId: "user1",
    userName: "ëìê´ë¯¼ì",
    content: "ì´ ì± ì§ì§ ì¸ìì ì´ìì. ì§ë¦¬ê° ë¬¸ëªì ê²°ì íë¤ë ê´ì ì´ ì ì íì´ì.",
    type: "text",
    isPinned: false,
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    id: "m2",
    userId: "user2",
    userName: "ì­ì¬ëí",
    content: "ìë¦¬ì ì§ë¬¸ì´ ê°ì¥ ì¸ìê¹ìì´ì. ë¨ìí ì§ë¬¸ì´ì§ë§ ê¹ì ìë¯¸ê° ìì£ .",
    type: "text",
    isPinned: false,
    createdAt: "2024-01-15T10:35:00Z",
  },
  {
    id: "m3",
    userId: "user3",
    userName: "ê³¼íìë",
    content: "ê°ì¶í ìë ì¹´ë ëë ìì¹ ë¶ë¶ ì ë§ ì¬ë¯¸ììì´ì ð",
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
  const [toast, setToast] = useState<string | null>(null);
  const [onlineCount] = useState(12);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // í ì¤í¸ ë©ìì§ ìë ìë©¸
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(t);
    }
  }, [toast]);

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
      userName: "ë",
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

  const emojis = ["ð", "ð", "ð", "â¤ï¸", "ð¥", "ð", "â¨", "ð¤", "ð", "ð¡", "ð", "ð"];

  return (
    <div className="flex flex-col h-full relative">
      {/* í ì¤í¸ ë©ìì§ */}
      {toast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-mono-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none animate-fade-in">
          {toast}
        </div>
      )}

      {/* ìë¨: ì ì ì¸ì */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-mono-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          {/* ì¤ìê° ì ì ì¸ëì¼ì´í° */}
          <div className="relative flex items-center">
            <span className="absolute w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
          <Users className="w-4 h-4 text-mono-500 ml-1" />
          <span className="text-sm text-mono-600">
            <span className="font-semibold text-primary-500">{onlineCount}ëª</span> ì ì ì¤
          </span>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors font-medium"
        >
          <UserPlus className="w-3.5 h-3.5" />
          ì´ë
        </button>
      </div>

      {/* ê³µì§ ê³ ì  ë©ìì§ */}
      {pinnedMessages.map((msg) => (
        <div key={msg.id} className="flex items-start gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
          <Pin className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-mono-700">{msg.content}</p>
        </div>
      ))}

      {/* ë©ìì§ ëª©ë¡ */}
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
                className={`group flex items-start gap-2 py-1.5 ${msg.userId === "me" ? "flex-row-reverse" : ""}`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (msg.userId !== "me") setShowReport(msg.id);
                }}
              >
                {msg.userId !== "me" && (
                  <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary-600">{msg.userName[0]}</span>
                  </div>
                )}
                <div className={msg.userId === "me" ? "text-right" : ""}>
                  {msg.userId !== "me" && (
                    <p className="text-xs font-medium text-mono-700 mb-0.5 ml-1">{msg.userName}</p>
                  )}
                  <div
                    className={`inline-block px-3 py-2 rounded-xl text-sm max-w-[240px] text-left ${
                      msg.userId === "me" ? "bg-primary-500 text-white" : "bg-mono-50 text-mono-900"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1 mt-0.5 ${msg.userId === "me" ? "justify-end" : ""}`}>
                    <span className="text-[10px] text-mono-400">{formatDate(msg.createdAt)}</span>
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

      {/* ì´ëª¨ì§ í¼ì»¤ */}
      {showEmoji && (
        <div className="px-4 py-2 border-t border-mono-200 flex flex-wrap gap-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => { setInput((prev) => prev + emoji); setShowEmoji(false); }}
              className="text-xl hover:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* ìë ¥ì°½ */}
      <div className="p-3 border-t border-mono-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmoji(!showEmoji)}
            className="p-2 text-mono-400 hover:text-mono-600 transition-colors"
            title="ì´ëª¨ì§"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button
            className="p-2 text-mono-400 hover:text-mono-600 transition-colors"
            title="ì´ë¯¸ì§ ì²¨ë¶ (ì¤ë¹ ì¤)"
            onClick={() => setToast("ì´ë¯¸ì§ ì²¨ë¶ ê¸°ë¥ì ì¤ë¹ ì¤ì´ìì ð ï¸")}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="ë©ìì§ ìë ¥... (Enterë¡ ì ì¡)"
            className="flex-1 px-4 py-2.5 bg-mono-50 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-40 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ì´ë ëª¨ë¬ */}
      {showInvite && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-1">ì¹êµ¬ ì´ëíê¸°</h3>
            <p className="text-sm text-mono-400 mb-4">ë§í¬ë¥¼ ê³µì í´ì í¨ê» ì½ì´ì!</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.set("tab", "community");
                  navigator.clipboard.writeText(url.toString());
                  setShowInvite(false);
                  setToast("ë§í¬ê° ë³µì¬ëì´ì! ð");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-mono-50 rounded-xl hover:bg-mono-100 transition-colors"
              >
                <Copy className="w-5 h-5 text-mono-500" />
                <span className="text-sm">ì»¤ë®¤ëí° ë§í¬ ë³µì¬</span>
              </button>
            </div>
            <button onClick={() => setShowInvite(false)} className="w-full mt-4 py-3 text-mono-500 text-sm">
              ë«ê¸°
            </button>
          </div>
        </div>
      )}

      {/* ì ê³  ë©âm4 */}
      {showReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center p-4 md:items-center">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-mono-900 mb-4">ì ê³ íê¸°</h3>
            <div className="space-y-2">
              {["ì¤í¸/ê´ê³ ", "ìì¤/íì¤ íí", "ë¶ì ì í ì½íì¸ ", "ê¸°í"].map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    setShowReport(null);
                    setToast("ì ê³ ê° ì ìëì´ì. ê²í  í ì¡°ì¹í ê²ì.");
                  }}
                  className="w-full px-4 py-3 text-left text-sm bg-mono-50 rounded-xl hover:bg-mono-100 transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button onClick={() => setShowReport(null)} className="w-full mt-4 py-3 text-mono-500 text-sm">
              ì·¨ì
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
