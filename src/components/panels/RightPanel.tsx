"use client";
import { useState, useRef, useEffect } from "react";
import { Send, ThumbsUp, ThumbsDown, Camera, MessageCircle, ExternalLink } from "lucide-react";
import { usePanelStore } from "@/store/panelStore";
import { mockBooks } from "@/lib/mock-data";
import { useParams, useRouter } from "next/navigation";
import CommunityChat from "./CommunityChat";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  feedback?: "like" | "dislike";
}

export default function RightPanel() {
  const { activeTab, setActiveTab, selectedAgentId } = usePanelStore();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "community") setActiveTab("community");
    }
  }, [setActiveTab]);

  return (
    <aside className="w-full md:w-[380px] border-l border-[var(--color-mono-080)] flex-shrink-0 bg-white flex flex-col h-full">
      <div className="flex border-b border-[var(--color-mono-080)] flex-shrink-0">
        {(["ai", "community"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-[13px] font-medium transition-colors ${
              activeTab === tab ? "text-[var(--color-primary-500)] border-b-2 border-[var(--color-primary-500)]" : "text-[var(--color-mono-400)] hover:text-[var(--color-mono-700)]"
            }`}>
            {tab === "ai" ? "채팅" : "커뮤니티"}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "ai" && <AIChat selectedAgentId={selectedAgentId} />}
        {activeTab === "community" && <CommunityChat />}
      </div>
    </aside>
  );
}

const PERSONALITY_COLORS: Record<string, string> = {
  "논리적": "bg-blue-50 text-blue-600 border-blue-100",
  "학문적": "bg-violet-50 text-violet-600 border-violet-100",
  "호기심 넘침": "bg-amber-50 text-amber-600 border-amber-100",
  "따뜻함": "bg-rose-50 text-rose-600 border-rose-100",
  "유머러스": "bg-green-50 text-green-600 border-green-100",
  "직관적": "bg-cyan-50 text-cyan-600 border-cyan-100",
  "솔직함": "bg-orange-50 text-orange-600 border-orange-100",
};
const TAG_DEFAULT = "bg-[var(--color-mono-050)] text-[var(--color-mono-600)]";

function PersonalityTag({ label }: { label: string }) {
  const colorClass = PERSONALITY_COLORS[label] ?? TAG_DEFAULT;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${colorClass}`}>
      {label}
    </span>
  );
}

function AIChat({ selectedAgentId }: { selectedAgentId: string | null }) {
  const { bookId } = useParams();
  const book = mockBooks.find((b) => b.id === bookId);
  const agents = book?.agents || [];
  const [currentAgentId, setCurrentAgentId] = useState<string>(selectedAgentId || agents[0]?.id || "");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setSelectedAgent } = usePanelStore();
  const router = useRouter();
  const currentAgent = agents.find((a) => a.id === currentAgentId);

  useEffect(() => {
    if (selectedAgentId && selectedAgentId !== currentAgentId) setCurrentAgentId(selectedAgentId);
  }, [selectedAgentId, currentAgentId]);

  const prevAgentIdRef = useRef<string>("");

  useEffect(() => {
    const saved = localStorage.getItem(`chat_${bookId}_${currentAgentId}`);
    setMessages(saved ? JSON.parse(saved) : []);
    prevAgentIdRef.current = currentAgentId;
  }, [bookId, currentAgentId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (messages.length === 0) return;
    if (prevAgentIdRef.current !== currentAgentId) return;
    localStorage.setItem(`chat_${bookId}_${currentAgentId}`, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || !currentAgent) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);
    const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: "assistant", content: "", timestamp: new Date().toISOString() };
    setMessages([...newMessages, aiMsg]);
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map((m) => ({ role: m.role, content: m.content })), agentName: currentAgent.name, bookTitle: book?.title || "", persona: `성격: ${currentAgent.personality.join(", ")}. 말투: ${currentAgent.speechStyle}` }),
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
              if (delta) { fullContent += delta; setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { ...u[u.length - 1], content: fullContent }; return u; }); }
            } catch { /* ignore */ }
          }
        }
      }
    } catch {
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { ...u[u.length - 1], content: "죄송해요, 응답을 생성하지 못했어요. 다시 시도해주세요." }; return u; });
    } finally { setIsStreaming(false); }
  };

  const toggleFeedback = (msgId: string, type: "like" | "dislike") => {
    setMessages((prev) => prev.map((m) => m.id === msgId ? { ...m, feedback: m.feedback === type ? undefined : type } : m));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent 선택 버튼 */}
      <div className="flex items-center border-b border-[var(--color-mono-080)] flex-shrink-0">
        <div className="flex gap-2 p-3 overflow-x-auto flex-1">
          {agents.map((agent) => (
            <button key={agent.id} onClick={() => { setCurrentAgentId(agent.id); setSelectedAgent(agent.id); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] font-medium whitespace-nowrap transition-all ${
                currentAgentId === agent.id
                  ? "border border-[var(--color-primary-400)] bg-[var(--color-primary-030)] text-[var(--color-primary-700)]"
                  : "border border-[var(--color-mono-100)] bg-white text-mono-600 hover:border-[var(--color-primary-300)] hover:bg-[var(--color-primary-030)]"
              }`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={agent.avatar || "/avatars/default-profile.svg"} alt={agent.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
              {agent.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => router.push(`/chat?bookId=${bookId}&agentId=${currentAgentId}`)}
          title="채팅 페이지에서 열기"
          className="p-2.5 mr-2 flex-shrink-0 rounded-xl text-mono-400 hover:text-primary-500 hover:bg-primary-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {/* Agent 소개 카드 */}
        {messages.length === 0 && currentAgent && (
          <div className="flex flex-col items-center pt-6 pb-4">
            <div className="relative mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentAgent.avatar || "/avatars/default-profile.svg"} alt={currentAgent.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-50 shadow-sm" />
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-[var(--color-primary-500)] rounded-full border-2 border-white flex items-center justify-center">
                <MessageCircle className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            <p className="text-[16px] font-bold text-[var(--color-mono-990)] mb-1">{currentAgent.name}</p>
            <p className="text-[12px] text-[var(--color-mono-500)] mb-3">{currentAgent.speechStyle}</p>
            <div className="flex flex-wrap justify-center gap-1.5 mb-4 px-4">
              {currentAgent.personality.map((trait) => (<PersonalityTag key={trait} label={trait} />))}
            </div>
            {/* AI 첫 말풍선 */}
            <div className="bg-[var(--color-primary-030)] border border-[var(--color-primary-080)] rounded-2xl rounded-tl-sm px-4 py-3 mx-4 text-center">
              <p className="text-[14px] text-[var(--color-mono-800)] leading-relaxed">안녕하세요! 저는 <span className="font-semibold text-[var(--color-primary-600)]">{currentAgent.name}</span>이에요.</p>
              <p className="text-[14px] text-[var(--color-mono-500)] mt-1">책에 대해 궁금한 것, 무엇이든 물어보세요</p>
            </div>
            {/* 퀵 리플라이 */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3 px-2">
              {["어떤 내용을 다루나요?", "주요 등장인물은?", "핵심 메시지가 뭐갈까요?"].map((q) => (
                <button key={q} onClick={() => setInput(q)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium border border-[var(--color-primary-200)] text-[var(--color-primary-600)] hover:bg-[var(--color-primary-030)] transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={currentAgent?.avatar || "/avatars/default-profile.svg"} alt="" className="w-5 h-5 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/avatars/default-profile.svg"; }} />
                  <span className="text-xs text-[var(--color-mono-500)]">{currentAgent?.name}</span>
                </div>
              )}
              {/* AI / 사용자 말풍선 */}
              <div className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-[var(--color-primary-500)] text-white rounded-tr-sm ml-auto"
                  : "bg-[var(--color-primary-030)] text-[var(--color-mono-800)] rounded-tl-sm"
              }`}>
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
                  <button onClick={() => toggleFeedback(msg.id, "like")} title="도움이 됐어요"
                    className={`p-1 rounded transition-colors ${msg.feedback === "like" ? "text-primary-500" : "text-mono-300 hover:text-mono-500"}`}>
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleFeedback(msg.id, "dislike")} title="별로였어요"
                    className={`p-1 rounded transition-colors ${msg.feedback === "dislike" ? "text-red-300" : "text-mono-300 hover:text-mono-500"}`}>
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 채팅 입력 영역 */}
      <div className="border-t border-[var(--color-mono-080)] bg-white px-3 py-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <button className="p-2 text-mono-400 hover:text-mono-600 transition-colors" title="대화 스냅샷 저장">
            <Camera className="w-5 h-5" />
          </button>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder={currentAgent ? `${currentAgent.name}에게 메시지...` : "Agent를 선택하세요"}
            disabled={!currentAgent}
            rows={1}
            className="flex-1 resize-none text-[14px] text-[var(--color-mono-800)] placeholder:text-[var(--color-mono-300)] bg-[var(--color-mono-050)] border border-mono-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 max-h-32 overflow-y-auto" />
          <button onClick={sendMessage} disabled={!input.trim() || isStreaming || !currentAgent}
            className="w-9 h-9 rounded-xl bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white flex items-center justify-center transition-colors disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--color-mono-400)] text-center mt-1.5">Enter로 전송 · Shift+Enter로 줄바꿈</p>
      </div>
    </div>
  );
}
