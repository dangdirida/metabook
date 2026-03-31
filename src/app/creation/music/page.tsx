"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Music, RefreshCw, Check, Film, Waves, Guitar, Zap, Wind, Disc3, Mic, Coffee, Star, Leaf } from "lucide-react";
import { addCreation } from "@/lib/creation-store";
import { getBookById } from "@/lib/mock-data";

const GENRES = [
  { id: "cinematic", label: "시네마틱", icon: Film, color: "from-slate-600 to-slate-800" },
  { id: "ambient", label: "앰비언트", icon: Waves, color: "from-blue-400 to-cyan-600" },
  { id: "acoustic", label: "어쿠스틱", icon: Guitar, color: "from-amber-500 to-orange-600" },
  { id: "electronic", label: "일렉트로닉", icon: Zap, color: "from-violet-500 to-purple-700" },
  { id: "jazz", label: "재즈", icon: Wind, color: "from-yellow-500 to-amber-700" },
  { id: "classical", label: "클래식", icon: Disc3, color: "from-rose-400 to-pink-600" },
  { id: "hiphop", label: "힙합", icon: Mic, color: "from-gray-700 to-gray-900" },
  { id: "lofi", label: "Lo-Fi", icon: Coffee, color: "from-orange-300 to-amber-500" },
  { id: "pop", label: "팝", icon: Star, color: "from-pink-400 to-rose-500" },
  { id: "folk", label: "포크", icon: Leaf, color: "from-green-500 to-emerald-700" },
];

const MOODS = ["설레는", "슬픈", "따뜻한", "신나는", "고요한", "몽환적", "긴장감", "희망찬", "그리운", "평화로운"];

const DURATIONS = [
  { value: 30, label: "30초" },
  { value: 60, label: "1분" },
  { value: 120, label: "2분" },
  { value: 180, label: "3분" },
];

function MusicCreationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get("bookId") || "";
  const book = getBookById(bookId);

  const [step, setStep] = useState<"form" | "generating" | "result">("form");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(60);
  const [withLyrics, setWithLyrics] = useState(false);
  const [lyricsPrompt, setLyricsPrompt] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [generatedMusic, setGeneratedMusic] = useState<{ title: string; audioUrl: string | null; duration: number; style: string } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [generatingProgress, setGeneratingProgress] = useState(0);

  const generatePrompt = () => {
    if (!book) return;
    const bookPrompts: Record<string, string> = {
      "lovers-lover": "두 사람의 엇갈린 사랑, 빗속에서의 만남, 쓸쓸하고 아름다운",
      "pain-encyclopedia": "치유와 회복, 따뜻한 봄날, 희망찬",
      "dont-know-myself": "자아 탐색, 깊고 내면적인, 고요한 밤",
    };
    setPrompt(bookPrompts[book.id] || `"${book.title}" 책의 감성을 담은`);
  };

  const handleGenerate = async () => {
    if (!selectedGenre) return;
    setStep("generating");
    setGeneratingProgress(0);
    const interval = setInterval(() => {
      setGeneratingProgress((prev) => {
        if (prev >= 90) { clearInterval(interval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 800);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      clearInterval(interval);
      setGeneratingProgress(100);
      const genreLabel = GENRES.find((g) => g.id === selectedGenre)?.label || selectedGenre;
      setGeneratedMusic({
        title: `${book?.title || ""} - ${genreLabel} OST`,
        audioUrl: null,
        duration,
        style: `${genreLabel} ${selectedMoods.join(" ")}`,
      });
      setTimeout(() => setStep("result"), 500);
    } catch {
      clearInterval(interval);
      setStep("form");
    }
  };

  const handleSave = () => {
    if (!generatedMusic) return;
    addCreation({
      bookId,
      bookTitle: book?.title || "",
      type: "music",
      title: generatedMusic.title,
      thumbnail: "",
      content: prompt,
      musicPrompt: prompt,
      musicStyle: generatedMusic.style,
      musicDuration: generatedMusic.duration,
      audioUrl: generatedMusic.audioUrl || undefined,
    });
    router.push(`/library/${bookId}`);
  };

  const togglePlay = () => {
    if (!generatedMusic?.audioUrl) return;
    if (isPlaying) { audioRef.current?.pause(); } else {
      if (!audioRef.current) { audioRef.current = new Audio(generatedMusic.audioUrl); audioRef.current.onended = () => setIsPlaying(false); }
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  if (step === "generating") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900 flex flex-col items-center justify-center text-white z-50">
        <div className="flex items-center gap-1 mb-8">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-1.5 bg-white/60 rounded-full animate-pulse"
              style={{ height: `${20 + Math.sin(i * 0.5) * 20}px`, animationDelay: `${i * 0.1}s`, animationDuration: `${0.8 + i * 0.05}s` }} />
          ))}
        </div>
        <h2 className="text-[22px] font-bold mb-2">음악을 만들고 있어요</h2>
        <p className="text-[14px] text-white/60 mb-8">{GENRES.find((g) => g.id === selectedGenre)?.label} · {duration}초</p>
        <div className="w-64 h-1.5 bg-white/20 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${generatingProgress}%` }} />
        </div>
        <p className="text-[12px] text-white/50">{Math.round(generatingProgress)}%</p>
        <div className="mt-8 space-y-2 text-center">
          {[{ threshold: 0, text: "음악 스타일 분석 중..." }, { threshold: 30, text: "멜로디 생성 중..." }, { threshold: 60, text: "편곡 중..." }, { threshold: 80, text: "마무리 작업 중..." }].map(
            (item) => generatingProgress >= item.threshold && (
              <p key={item.threshold} className={`text-[13px] transition-all ${generatingProgress < item.threshold + 30 ? "text-white/80" : "text-white/30"}`}>
                {generatingProgress >= item.threshold + 30 ? "✓ " : "• "}{item.text}
              </p>
            )
          )}
        </div>
      </div>
    );
  }

  if (step === "result" && generatedMusic) {
    return (
      <div className="min-h-screen bg-[var(--color-mono-030)]">
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[var(--color-mono-080)]">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
            <button onClick={() => { setStep("form"); setGeneratedMusic(null); setIsPlaying(false); }}
              className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-mono-600)]">
              <ArrowLeft className="w-4 h-4" />돌아가기
            </button>
            <span className="text-[14px] font-semibold text-[var(--color-mono-900)]">음악 완성</span>
          </div>
        </header>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-center gap-0.5 mb-6 h-16">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className={`w-1 rounded-full transition-all ${isPlaying ? "animate-pulse bg-white" : "bg-white/40"}`}
                  style={{ height: `${8 + Math.sin(i * 0.4) * 20 + Math.cos(i * 0.8) * 10}px` }} />
              ))}
            </div>
            <h2 className="text-[20px] font-bold text-center mb-1">{generatedMusic.title}</h2>
            <p className="text-[13px] text-white/70 text-center mb-6">{generatedMusic.style}</p>
            <div className="flex items-center justify-center">
              <button onClick={togglePlay}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${generatedMusic.audioUrl ? "bg-white hover:scale-105" : "bg-white/20 cursor-not-allowed"}`}>
                {isPlaying ? (
                  <svg className="w-7 h-7 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                ) : (
                  <svg className="w-7 h-7 text-indigo-600 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
            </div>
            {!generatedMusic.audioUrl && (
              <div className="mt-4 bg-white/10 rounded-xl p-3 text-center">
                <p className="text-[12px] text-white/80">Suno API 연동 후 실제 음악이 재생됩니다</p>
              </div>
            )}
            <p className="text-[12px] text-white/60 text-center mt-3">
              {Math.floor(generatedMusic.duration / 60)}:{String(generatedMusic.duration % 60).padStart(2, "0")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => { setStep("form"); setGeneratedMusic(null); setIsPlaying(false); }}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-[var(--color-mono-100)] text-[14px] font-medium text-[var(--color-mono-600)] hover:bg-[var(--color-mono-050)] transition-colors">
              <RefreshCw className="w-4 h-4" />다시 만들기
            </button>
            <button onClick={handleSave}
              className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[14px] font-bold hover:from-indigo-600 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200">
              <Check className="w-4 h-4" />갤러리에 저장
            </button>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-[12px] font-semibold text-[var(--color-mono-500)] mb-3">생성 설정</p>
            <div className="space-y-2">
              {[
                ["장르", GENRES.find((g) => g.id === selectedGenre)?.label || ""],
                ["분위기", selectedMoods.length > 0 ? selectedMoods.join(", ") : "없음"],
                ["길이", `${duration}초`],
                ["가사", withLyrics ? "포함" : "없음"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[12px] text-[var(--color-mono-500)]">{label}</span>
                  <span className="text-[12px] font-medium text-[var(--color-mono-800)]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-mono-030)]">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-[var(--color-mono-080)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-mono-600)]">
            <ArrowLeft className="w-4 h-4" />돌아가기
          </button>
          <span className="text-[14px] font-semibold text-[var(--color-mono-900)]">음악 만들기</span>
          {book && <span className="text-[12px] text-[var(--color-mono-400)]">· {book.title}</span>}
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        {/* 프롬프트 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-bold text-[var(--color-mono-900)]">이 책의 감성으로 만들기</h2>
            <button onClick={generatePrompt} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-medium text-[var(--color-primary-600)] hover:bg-[var(--color-primary-030)] transition-colors">
              <Music className="w-3.5 h-3.5" />자동 완성
            </button>
          </div>
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}
            placeholder={`"${book?.title || "책"}"에서 받은 영감, 장면, 감정을 자유롭게 적어주세요`}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-[var(--color-mono-100)] text-[14px] text-[var(--color-mono-800)] placeholder:text-[var(--color-mono-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-300)] resize-none" />
          <p className="text-[11px] text-[var(--color-mono-400)] mt-2">구체적일수록 더 어울리는 음악이 만들어져요</p>
        </div>

        {/* 장르 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-[var(--color-mono-900)] mb-4">장르 선택</h2>
          <div className="grid grid-cols-5 gap-2">
            {GENRES.map((genre) => (
              <button key={genre.id} onClick={() => setSelectedGenre(genre.id)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                  selectedGenre === genre.id
                    ? "ring-2 ring-[var(--color-primary-400)] bg-[var(--color-primary-030)]"
                    : "border border-[var(--color-mono-100)] hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-030)]"
                }`}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${genre.color} flex items-center justify-center`}><genre.icon className="w-5 h-5 text-white" /></div>
                <span className="text-[11px] font-medium text-[var(--color-mono-700)]">{genre.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 분위기 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-[var(--color-mono-900)] mb-3">
            분위기 <span className="text-[var(--color-mono-400)] font-normal text-[12px]">여러 개 선택 가능</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => (
              <button key={mood}
                onClick={() => setSelectedMoods((prev) => prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood])}
                className={`px-3 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                  selectedMoods.includes(mood)
                    ? "bg-[var(--color-primary-500)] text-white"
                    : "bg-[var(--color-mono-050)] text-[var(--color-mono-600)] hover:bg-[var(--color-primary-030)] hover:text-[var(--color-primary-600)]"
                }`}>
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* 재생시간 + 가사 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[14px] font-bold text-[var(--color-mono-900)]">재생 시간</h2>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button key={d.value} onClick={() => setDuration(d.value)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                    duration === d.value
                      ? "bg-[var(--color-primary-500)] text-white"
                      : "bg-[var(--color-mono-050)] text-[var(--color-mono-600)] hover:bg-[var(--color-mono-100)]"
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-[var(--color-mono-080)] pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-medium text-[var(--color-mono-800)]">가사 포함</p>
                <p className="text-[11px] text-[var(--color-mono-400)]">책의 문장을 가사로 만들어드려요</p>
              </div>
              <button onClick={() => setWithLyrics(!withLyrics)}
                className={`w-12 h-6 rounded-full transition-all duration-200 relative ${withLyrics ? "bg-[var(--color-primary-500)]" : "bg-[var(--color-mono-200)]"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${withLyrics ? "left-7" : "left-1"}`} />
              </button>
            </div>
            {withLyrics && (
              <textarea value={lyricsPrompt} onChange={(e) => setLyricsPrompt(e.target.value)}
                placeholder="가사로 만들 문장이나 감정을 입력해주세요" rows={2}
                className="mt-3 w-full px-3 py-2.5 rounded-xl border border-[var(--color-mono-100)] text-[13px] text-[var(--color-mono-800)] placeholder:text-[var(--color-mono-300)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-300)] resize-none" />
            )}
          </div>
        </div>

        {/* Suno 안내 */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-indigo-800 mb-1">Suno AI로 음악을 생성해요</p>
              <p className="text-[12px] text-indigo-600 leading-relaxed">
                전문 AI 음악 생성 엔진 Suno를 이용해 책의 감성에 딱 맞는 오리지널 음악을 만들어드려요.
                현재 API 준비 중이에요 — 곧 실제 음악이 생성됩니다!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 생성 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[var(--color-mono-080)]">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button onClick={handleGenerate} disabled={!selectedGenre}
            className={`w-full py-4 rounded-2xl text-[15px] font-bold flex items-center justify-center gap-2 transition-all ${
              selectedGenre
                ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:from-indigo-600 hover:to-violet-700 shadow-lg shadow-indigo-200"
                : "bg-[var(--color-mono-100)] text-[var(--color-mono-400)] cursor-not-allowed"
            }`}>
            <Music className="w-5 h-5" />음악 만들기
            {selectedGenre && <span className="text-[12px] opacity-80">· {GENRES.find((g) => g.id === selectedGenre)?.label}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MusicCreationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-mono-030)] flex items-center justify-center"><Music className="w-8 h-8 text-[var(--color-mono-300)] animate-pulse" /></div>}>
      <MusicCreationContent />
    </Suspense>
  );
}
