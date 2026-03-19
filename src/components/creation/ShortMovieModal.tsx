"use client";

import { useState } from "react";
import { X, Loader2, Download } from "lucide-react";
import { getChaptersByBookId } from "@/lib/mock-content";
import { addCreation, type CreationItem } from "@/lib/creation-store";

interface Props {
  bookTitle: string;
  bookId: string;
  onClose: () => void;
  onSaved: () => void;
  item?: CreationItem;
}

export default function ShortMovieModal({ bookTitle, bookId, onClose, onSaved, item }: Props) {
  const chapters = getChaptersByBookId(bookId);
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [additionalContext, setAdditionalContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  const allCharacters = Array.from(
    new Set(chapters.flatMap((ch) => ch.characters))
  );

  const toggleCharacter = (char: string) => {
    setSelectedCharacters((prev) =>
      prev.includes(char) ? prev.filter((c) => c !== char) : [...prev, char]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError("");
    setVideoUrl("");

    const chapter = chapters.find((ch) => ch.number === selectedChapter);
    if (!chapter) return;

    try {
      const response = await fetch("/api/shortmovie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterText: chapter.content,
          characters: selectedCharacters,
          additionalContext,
          bookTitle,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "영상 생성에 실패했습니다.");
        return;
      }

      setVideoUrl(data.videoUrl);
    } catch {
      setError("영상 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = () => {
    addCreation({
      bookId,
      bookTitle,
      type: "shortmovie",
      title: `${bookTitle} ${selectedChapter}장 숏뮤비`,
      thumbnail: "",
      content: videoUrl,
    });
    onSaved();
    onClose();
  };

  // 뷰어 모드: 기존 창작물 읽기 전용
  if (item) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-mono-200">
            <h2 className="text-lg font-bold text-mono-900">{item.title}</h2>
            <button onClick={onClose} className="p-1 hover:bg-mono-100 rounded-lg">
              <X className="w-5 h-5 text-mono-500" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {item.content ? (
              <video src={item.content} controls autoPlay className="w-full rounded-xl" />
            ) : (
              <p className="text-sm text-mono-500 text-center py-8">영상이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-mono-200">
          <h2 className="text-lg font-bold text-mono-900">숏뮤비 만들기</h2>
          <button onClick={onClose} className="p-1 hover:bg-mono-100 rounded-lg">
            <X className="w-5 h-5 text-mono-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!isGenerating && !videoUrl && (
            <>
              {/* 챕터 선택 */}
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  챕터/구간 선택
                </label>
                <select
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-mono-200 rounded-lg text-sm"
                >
                  {chapters.map((ch) => (
                    <option key={ch.number} value={ch.number}>
                      {ch.number}장: {ch.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* 등장인물 */}
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  등장인물 (선택)
                </label>
                <div className="flex flex-wrap gap-2">
                  {allCharacters.map((char) => (
                    <button
                      key={char}
                      onClick={() => toggleCharacter(char)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedCharacters.includes(char)
                          ? "bg-purple-500 text-white"
                          : "bg-mono-100 text-mono-700 hover:bg-mono-200"
                      }`}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {/* 부가 상황 */}
              <div>
                <label className="block text-sm font-medium text-mono-700 mb-2">
                  부가 상황 설명 (선택)
                </label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="예: 밤 장면, 웅장한 분위기"
                  className="w-full px-3 py-2 border border-mono-200 rounded-lg text-sm resize-none h-20"
                />
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors"
              >
                영상 만들기
              </button>
            </>
          )}

          {/* 생성 중 */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-mono-700 font-semibold mb-1">
                AI가 영상을 만들고 있어요...
              </p>
              <p className="text-sm text-mono-500">30~90초 소요될 수 있습니다</p>
            </div>
          )}

          {/* 에러 */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => {
                  setError("");
                  setIsGenerating(false);
                }}
                className="px-6 py-2 bg-mono-100 text-mono-700 rounded-lg hover:bg-mono-200"
              >
                다시 시도
              </button>
            </div>
          )}

          {/* 영상 완료 */}
          {videoUrl && !isGenerating && (
            <div className="space-y-4">
              <video
                src={videoUrl}
                controls
                autoPlay
                className="w-full rounded-xl"
              />
              <div className="flex gap-2">
                <a
                  href={videoUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-mono-100 text-mono-700 rounded-xl hover:bg-mono-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  다운로드
                </a>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  갤러리에 저장
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
