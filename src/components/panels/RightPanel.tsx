"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ThumbsUp, ThumbsDown, Camera, Bot } from "lucide-react";
import { usePanelStore } from "@/store/panelStore";
import { mockBooks } from "@/lib/mock-data";
import { useParams } from "next/navigation";
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

  // URL 파라미터로 탭 자동 전환
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "community") {
        setActiveTab("community");
      }
    }
  }, [setActiveTab]);

  return (
    <aside className="w-full md:w-[380px] border-l border-mono-200 flex-shrink-0 bg-white flex flex-col h-full">
      {/* 탭 헤더 */}
      <div className="flex border-b border-mono-200 flex-shrink-0">
        {(["ai", "community"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "text-primary-500 border-b-2 border-primary-500"
                : "text-mono-500 hover:text-mono-700"
            }`}
          >
            {tab === "ai" ? "채팅" : "커뮤니티"}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "ai" && <AIChat selectedAgentId={selectedAgentId} />}
        {activeTab === "community" && <CommunityChat />}
      </div>
    </aside>
  );
}

function AIChat({ selectedAgentId }: { selectedAgentId: string | null }) {
  const { bookId } = useParams();
  const book = mockBooks.find((b) => b.id === bookId);
  const agents = book?.agents || [];

  const [currentAgentId, setCurrentAgentId] = useState<string>(
    selectedAgentId || agents[0]?.id || ""
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { setSelectedAgent } = usePanelStore();

  const currentAgent = agents.find((a) => a.id === currentAgentId);

  // selectedAgentId 변경 시 동기화
  useEffect(() => {
    if (selectedAgentId && selectedAgentId !== currentAgentId) {
      setCurrentAgentId(selectedAgentId);
    }
  }, [selectedAgentId, currentAgentId]);

  // 대화 기록 localStorage 복원
  useEffect(() => {
    const saved = localStorage.getItem(`chat_${bookId}_${currentAgentId}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages([]);
    }
  }, [bookId, currentAgentId]);

  // 대화 기록 저장
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(
        `chat_${bookId}_${currentAgentId}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, bookId, currentAgentId]);

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming || !currentAgent) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsStreaming(true);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
    };
    setMessages([...newMessages, aiMsg]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          agentName: currentAgent.name,
          bookTitle: book?.title || "",
          persona: `성격: ${currentAgent.personality.join(", ")}. 말투: ${currentAgent.speechStyle}`,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (!data || data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                // Claude API 스트림 형식
                if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                  fullContent += parsed.delta.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: fullContent,
                    };
                    return updated;
                  });
                }
                // 목업 응답 형식 (API 키 없을 때)
                if (parsed.content) {
                  fullContent += parsed.content;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: fullContent,
                    };
                    return updated;
                  });
                }
              } catch {
                // 파싱 실패 무시
              }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: "죄송해요, 응답을 생성하지 못했어요. 다시 시도해주세요.",
        };
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const toggleFeedback = (msgId: string, type: "like" | "dislike") => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, feedback: m.feedback === type ? undefined : type }
          : m
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Agent 목록 */}
      <div className="flex gap-2 p-3 border-b border-mono-200 overflow-x-auto flex-shrink-0">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => {
              setCurrentAgentId(agent.id);
              setSelectedAgent(agent.id);
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-colors ${
              currentAgentId === agent.id
                ? "bg-primary-50 text-primary-600 border border-primary-200"
                : "bg-mono-50 text-mono-600 hover:bg-mono-100"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary-600">
                {agent.name[0]}
              </span>
            </div>
            {agent.name}
          </button>
        ))}
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {messages.length === 0 && currentAgent && (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-primary-400" />
            </div>
            <p className="font-semibold text-mono-900">{currentAgent.name}</p>
            <p className="text-sm text-mono-500 mt-1">
              {currentAgent.personality.join(", ")}
            </p>
            <p className="text-xs text-mono-400 mt-3">
              메시지를 보내 대화를 시작해보세요
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
              {msg.role === "assistant" && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-primary-600">
                      {currentAgent?.name[0]}
                    </span>
                  </div>
                  <span className="text-xs text-mono-500">
                    {currentAgent?.name}
                  </span>
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary-500 text-white rounded-tr-md"
                    : "bg-mono-50 text-mono-900 rounded-tl-md"
                }`}
              >
                {msg.content || (
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-mono-300 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-mono-300 rounded-full animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 bg-mono-300 rounded-full animate-bounce [animation-delay:0.3s]" />
                  </span>
                )}
              </div>
              {/* 피드백 버튼 */}
              {msg.role === "assistant" && msg.content && (
                <div className="flex gap-1 mt-1 ml-1">
                  <button
                    onClick={() => toggleFeedback(msg.id, "like")}
                    className={`p-1 rounded transition-colors ${
                      msg.feedback === "like"
                        ? "text-primary-500"
                        : "text-mono-300 hover:text-mono-500"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => toggleFeedback(msg.id, "dislike")}
                    className={`p-1 rounded transition-colors ${
                      msg.feedback === "dislike"
                        ? "text-red-300"
                        : "text-mono-300 hover:text-mono-500"
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className="p-3 border-t border-mono-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            className="p-2 text-mono-400 hover:text-mono-600 transition-colors"
            title="대화 스냅샷 저장"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={
              currentAgent
                ? `${currentAgent.name}에게 메시지...`
                : "Agent를 선택하세요"
            }
            disabled={!currentAgent || isStreaming}
            className="flex-1 px-4 py-2.5 bg-mono-50 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming || !currentAgent}
            className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
