"use client";

import { useState, useRef, useEffect } from "react";
import { X, BookOpen, GitBranch, ChevronRight, Loader2 } from "lucide-react";
import { getChaptersByBookId } from "@/lib/mock-content";
import { addCreation } from "@/lib/creation-store";

interface Props {
  bookTitle: string;
  bookId: string;
  onClose: () => void;
  onSaved: () => void;
}

type StepType = "select" | "perspective" | "ending" | "generating";

export default function ShortBookModal({ bookTitle, bookId, onClose, onSaved }: Props) {
  const chapters = getChaptersByBookId(bookId);
  const [step, setStep] = useState<StepType>("select");
  const [subType, setSubType] = useState<"perspective" | "ending">("perspective");

  // 다른 시점 옵션
  const [startChapter, setStartChapter] = useState(1);
  const [endChapter, setEndChapter] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState("");

  // 다른 결말 옵션
  const [branchChapter, setBranchChapter] = useState(1);
  const [endingDirection, setEndingDirection] = useState("");

  // 생성 상태
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // 모든 챕터의 캐릭터 수집
  const allCharacters = Array.from(
    new Set(chapters.flatMap((ch) => ch.characters))
  );

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [generatedText]);

  const getChapterText = () => {
    const start = Math.min(startChapter, endChapter);
    const end = Math.max(startChapter, endChapter);
    return chapters
      .filter((ch) => ch.number >= start && ch.number <= end)
      .map((ch) => ch.content)
      .join("\n\n");
  };

  const handleGenerate = async () => {
    setStep("generating");
    setIsGenerating(true);
    setGeneratedText("");
    setIsDone(false);

    const chapterText =
      subType === "perspective"
        ? getChapterText()
        : chapters.find((ch) => ch.number === branchChapter)?.content || "";

    const chapterRange =
      subType === "perspective"
        ? `${startChapter}장~${endChapter}장`
        : `${branchChapter}장 이후`;

    try {
      const response = await fetch("/api/shortbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: subType,
          bookTitle,
          chapterText,
          character: selectedCharacter,
          endingDirection,
          chapterRange,
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
              if (parsed.type === "content_block_delta" && parsed.delta?.type === "text_delta") {
                fullContent += parsed.delta.text;
                setGeneratedText(fullContent);
              }
              if (parsed.content) {
                fullContent += parsed.content;
                setGeneratedText(fullContent);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch {
      setGeneratedText("생성에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
      setIsDone(true);
    }
  };

  const handleSave = () => {
    addCreation({
      bookId,
      bookTitle,
      type: "shortbook",
      title:
        subType === "perspective"
          ? `${selectedCharacter}의 시선으로 본 ${bookTitle}`
          : `다른 결말: ${endingDirection.slice(0, 30)}`,
      thumbnail: "",
      content: generatedText,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-mono-200">
          <h2 className="text-lg font-bold text-mono-900">숏북 만들기</h2>
          <button onClick={onClose} className="p-1 hover:bg-mono-100 rounded-lg">
            <X className="w-5 h-5 text-mono-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Step 1: 유형 선택 */}
          {step === "select" && (
            <div className="space-y-4">
              <p className="text-sm text-mono-600 mb-4">어떤 방식으로 다시 쓸까요?</p>
              <button
                onClick={() => {
                  setSubType("perspective");
                  setStep("perspective");
                }}
                className="w-full p-4 border-2 border-mono-200 rounded-xl hover:border-emerald-400 transition-colors text-left flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-mono-900">다른 시점으로</p>
                  <p className="text-sm text-mono-500 mt-1">인물의 시점을 바꿔서 이야기를 다시 써봐요</p>
                </div>
                <ChevronRight className="w-5 h-5 text-mono-300 ml-auto self-center" />
              </button>
              <button
                onClick={() => {
                  setSubType("ending");
                  setStep("ending");
                }}
                className="w-full p-4 border-2 border-mono-200 rounded-xl hover:border-purple-400 transition-colors text-left flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <GitBranch className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-mono-900">다른 결말로</p>
                  <p className="text-sm text-mono-500 mt-1">결말 방향을 바꿔서 새로운 이야기를 만들어봐요</p>
                </div>
                <ChevronRight className="w-5 h-5 text-mono-300 ml-auto self-center" />
              </button>
            </div>
          )}

          {/* Step 2a: 다른 시점 */}
          {step === "perspective" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">챕터 구간 선택</label>
                <div className="flex items-center gap-2">
                  <select
                    value={startChapter}
                    onChange={(e) => setStartChapter(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-mono-200 rounded-lg text-sm"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.number} value={ch.number}>
                        {ch.number}장: {ch.title}
                      </option>
                    ))}
                  </select>
                  <span className="text-mono-400">~</span>
                  <select
                    value={endChapter}
                    onChange={(e) => setEndChapter(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-mono-200 rounded-lg text-sm"
                  >
                    {chapters.map((ch) => (
                      <option key={ch.number} value={ch.number}>
                        {ch.number}장: {ch.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">인물 선택</label>
                <div className="flex flex-wrap gap-2">
                  {allCharacters.map((char) => (
                    <button
                      key={char}
                      onClick={() => setSelectedCharacter(char)}
                      className={`px-4 py-2 rounded-full text-sm transition-colors ${
                        selectedCharacter === char
                          ? "bg-emerald-500 text-white"
                          : "bg-mono-100 text-mono-700 hover:bg-mono-200"
                      }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!selectedCharacter}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 disabled:opacity-40 transition-colors"
              >
                생성하기
              </button>
            </div>
          )}

          {/* Step 2b: 다른 결말 */}
          {step === "ending" && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">분기점 챕터 선택</label>
                <select
                  value={branchChapter}
                  onChange={(e) => setBranchChapter(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-mono-200 rounded-lg text-sm"
                >
                  {chapters.map((ch) => (
                    <option key={ch.number} value={ch.number}>
                      {ch.number}장: {ch.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">결말 방향</label>
                <textarea
                  value={endingDirection}
                  onChange={(e) => setEndingDirection(e.target.value)}
                  placeholder="예: 얄리가 유럽을 정복하는 결말로"
                  className="w-full px-3 py-2 border border-mono-200 rounded-lg text-sm resize-none h-24"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={!endingDirection.trim()}
                className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 disabled:opacity-40 transition-colors"
              >
                생성하기
              </button>
            </div>
          )}

          {/* Step 3: 생성 화면 */}
          {step === "generating" && (
            <div className="space-y-4">
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm text-mono-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI가 소설을 쓰고 있어요...
                </div>
              )}
              <div
                ref={textRef}
                className="prose prose-sm max-w-none bg-mono-50 rounded-xl p-4 max-h-80 overflow-y-auto whitespace-pre-wrap text-mono-800 leading-relaxed"
              >
                {generatedText || "생성 중..."}
              </div>
              {isDone && (
                <button
                  onClick={handleSave}
                  className="w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  창작 갤러리에 저장
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
