"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, GitBranch, ChevronRight, Loader2 } from "lucide-react";
import { mockBooks } from "@/lib/mock-data";
import { mockChapters } from "@/lib/mock-content";
import { addCreation } from "@/lib/creation-store";

type StepType = "select" | "perspective" | "ending" | "generating";

function ShortBookContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get("bookId") || "";
  const book = mockBooks.find((b) => b.id === bookId);

  const [step, setStep] = useState<StepType>("select");
  const [subType, setSubType] = useState<"perspective" | "ending">("perspective");
  const [startChapter, setStartChapter] = useState(1);
  const [endChapter, setEndChapter] = useState(1);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [branchChapter, setBranchChapter] = useState(1);
  const [endingDirection, setEndingDirection] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const allCharacters = Array.from(
    new Set(mockChapters.flatMap((ch) => ch.characters))
  );

  useEffect(() => {
    if (textRef.current) {
      textRef.current.scrollTop = textRef.current.scrollHeight;
    }
  }, [generatedText]);

  const getChapterText = () => {
    const start = Math.min(startChapter, endChapter);
    const end = Math.max(startChapter, endChapter);
    return mockChapters
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
        : mockChapters.find((ch) => ch.number === branchChapter)?.content || "";

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
          bookTitle: book?.title || "",
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
              // ignore
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
      bookTitle: book?.title || "",
      type: "shortbook",
      title:
        subType === "perspective"
          ? `${selectedCharacter}의 시선으로 본 ${book?.title}`
          : `다른 결말: ${endingDirection.slice(0, 30)}`,
      thumbnail: "",
      content: generatedText,
    });
    router.push(`/library/${bookId}`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-mono-010)]">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-[var(--color-mono-080)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push(`/library/${bookId}`)}
            className="p-2 rounded-lg hover:bg-[var(--color-mono-050)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[var(--color-mono-700)]" />
          </button>
          <h1 className="text-lg font-bold text-[var(--color-mono-990)]">숏북 만들기</h1>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
        {/* 좌측 사이드바: 책 정보 + 챕터 목록 */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-5 sticky top-24">
            <div className="w-full aspect-[3/4] bg-gradient-to-br from-[var(--color-primary-100)] to-[var(--color-primary-200)] rounded-xl flex items-center justify-center mb-4">
              {book?.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <BookOpen className="w-10 h-10 text-[var(--color-primary-300)]" />
              )}
            </div>
            <h3 className="font-bold text-[var(--color-mono-990)] text-sm">{book?.title}</h3>
            <p className="text-xs text-[var(--color-mono-400)] mt-1">{book?.author}</p>

            <div className="mt-5 space-y-1">
              <p className="text-xs font-semibold text-[var(--color-mono-600)] mb-2">챕터 목록</p>
              {mockChapters.map((ch) => (
                <div key={ch.id} className="text-xs text-[var(--color-mono-500)] py-1.5 px-2 rounded-lg hover:bg-[var(--color-mono-050)]">
                  {ch.number}장: {ch.title}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* 우측 메인 */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-[var(--color-mono-080)] p-6 md:p-8">
            {/* Step 1: 유형 선택 */}
            {step === "select" && (
              <div className="max-w-lg mx-auto space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-[var(--color-mono-990)]">어떤 방식으로 다시 쓸까요?</h2>
                  <p className="text-sm text-[var(--color-mono-400)] mt-1">원하는 방식을 선택해주세요</p>
                </div>
                <div className="space-y-4">
                  <button
                    onClick={() => { setSubType("perspective"); setStep("perspective"); }}
                    className="w-full p-5 border-2 border-[var(--color-mono-080)] rounded-2xl hover:border-[var(--color-primary-300)] transition-colors text-left flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[var(--color-mono-990)] text-lg">다른 시점으로</p>
                      <p className="text-sm text-[var(--color-mono-400)] mt-1">인물의 시점을 바꿔서 이야기를 다시 써봐요</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--color-mono-200)] self-center" />
                  </button>
                  <button
                    onClick={() => { setSubType("ending"); setStep("ending"); }}
                    className="w-full p-5 border-2 border-[var(--color-mono-080)] rounded-2xl hover:border-purple-300 transition-colors text-left flex items-start gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <GitBranch className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-[var(--color-mono-990)] text-lg">다른 결말로</p>
                      <p className="text-sm text-[var(--color-mono-400)] mt-1">결말 방향을 바꿔서 새로운 이야기를 만들어봐요</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[var(--color-mono-200)] self-center" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2a: 다른 시점 */}
            {step === "perspective" && (
              <div className="max-w-lg mx-auto space-y-6">
                <div>
                  <button onClick={() => setStep("select")} className="text-sm text-[var(--color-primary-500)] hover:underline mb-2">← 돌아가기</button>
                  <h2 className="text-xl font-bold text-[var(--color-mono-990)]">다른 시점으로 다시 쓰기</h2>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">챕터 구간 선택</label>
                  <div className="flex items-center gap-3">
                    <select
                      value={startChapter}
                      onChange={(e) => setStartChapter(Number(e.target.value))}
                      className="flex-1 px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm bg-white"
                    >
                      {mockChapters.map((ch) => (
                        <option key={ch.number} value={ch.number}>{ch.number}장: {ch.title}</option>
                      ))}
                    </select>
                    <span className="text-[var(--color-mono-300)] font-medium">~</span>
                    <select
                      value={endChapter}
                      onChange={(e) => setEndChapter(Number(e.target.value))}
                      className="flex-1 px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm bg-white"
                    >
                      {mockChapters.map((ch) => (
                        <option key={ch.number} value={ch.number}>{ch.number}장: {ch.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">인물 선택</label>
                  <div className="flex flex-wrap gap-3">
                    {allCharacters.map((char) => (
                      <button
                        key={char}
                        onClick={() => setSelectedCharacter(char)}
                        className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                          selectedCharacter === char
                            ? "bg-emerald-500 text-white shadow-md"
                            : "bg-[var(--color-mono-050)] text-[var(--color-mono-700)] hover:bg-[var(--color-mono-080)]"
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
                  className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-semibold text-base hover:bg-emerald-600 disabled:opacity-40 transition-colors"
                >
                  생성하기
                </button>
              </div>
            )}

            {/* Step 2b: 다른 결말 */}
            {step === "ending" && (
              <div className="max-w-lg mx-auto space-y-6">
                <div>
                  <button onClick={() => setStep("select")} className="text-sm text-[var(--color-primary-500)] hover:underline mb-2">← 돌아가기</button>
                  <h2 className="text-xl font-bold text-[var(--color-mono-990)]">다른 결말로 다시 쓰기</h2>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">분기점 챕터 선택</label>
                  <select
                    value={branchChapter}
                    onChange={(e) => setBranchChapter(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm bg-white"
                  >
                    {mockChapters.map((ch) => (
                      <option key={ch.number} value={ch.number}>{ch.number}장: {ch.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--color-mono-700)] mb-2">결말 방향</label>
                  <textarea
                    value={endingDirection}
                    onChange={(e) => setEndingDirection(e.target.value)}
                    placeholder="예: 얄리가 유럽을 정복하는 결말로"
                    className="w-full px-4 py-3 border border-[var(--color-mono-080)] rounded-xl text-sm resize-none h-28 bg-white"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!endingDirection.trim()}
                  className="w-full py-3.5 bg-purple-500 text-white rounded-xl font-semibold text-base hover:bg-purple-600 disabled:opacity-40 transition-colors"
                >
                  생성하기
                </button>
              </div>
            )}

            {/* Step 3: 생성 화면 */}
            {step === "generating" && (
              <div className="space-y-5">
                {isGenerating && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-mono-400)]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI가 소설을 쓰고 있어요...
                  </div>
                )}
                <div
                  ref={textRef}
                  className="prose prose-sm max-w-none bg-[var(--color-mono-050)] rounded-2xl p-6 min-h-[300px] max-h-[500px] overflow-y-auto whitespace-pre-wrap text-[var(--color-mono-800)] leading-relaxed text-base"
                >
                  {generatedText || "생성 중..."}
                </div>
                {isDone && (
                  <button
                    onClick={handleSave}
                    className="w-full py-3.5 bg-[var(--color-primary-500)] text-white rounded-xl font-semibold text-base hover:bg-[var(--color-primary-600)] transition-colors"
                  >
                    창작 갤러리에 저장
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ShortBookPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}>
      <ShortBookContent />
    </Suspense>
  );
}
