"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Check } from "lucide-react";

const GENRES = [
  "소설", "에세이", "자기계발", "인문", "과학",
  "역사", "경제", "예술", "판타지", "SF",
  "추리", "로맨스",
];

const RECOMMENDED_BOOKS = [
  { id: "1", title: "총, 균, 쇠", author: "재레드 다이아몬드", cover: "/covers/book1.jpg" },
  { id: "2", title: "사피엔스", author: "유발 하라리", cover: "/covers/book2.jpg" },
  { id: "3", title: "코스모스", author: "칼 세이건", cover: "/covers/book3.jpg" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isUnder14, setIsUnder14] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [nickname, setNickname] = useState("");

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleComplete = () => {
    localStorage.setItem("onboarding_complete", "true");
    localStorage.setItem("user_genres", JSON.stringify(selectedGenres));
    localStorage.setItem("user_nickname", nickname);
    if (isUnder14) {
      localStorage.setItem("metabook_junior", "true");
    }
    router.push("/library");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-8">
        {/* 프로그레스 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[0, 1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? "w-10 bg-primary-500" : s < step ? "w-10 bg-primary-200" : "w-10 bg-mono-200"
              }`}
            />
          ))}
        </div>

        {/* Step 0: 연령 확인 */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-bold text-mono-900 mb-2">
              나이를 확인해주세요
            </h2>
            <p className="text-mono-500 mb-6">안전한 환경을 위해 연령을 확인해요</p>
            <div className="space-y-3 mb-8">
              <button
                onClick={() => { setIsUnder14(false); setStep(1); }}
                className="w-full px-4 py-4 text-left rounded-xl border border-mono-200 hover:bg-mono-50 transition-colors"
              >
                <p className="font-medium text-mono-900">만 14세 이상</p>
                <p className="text-sm text-mono-500 mt-0.5">모든 기능 이용 가능</p>
              </button>
              <button
                onClick={() => { setIsUnder14(true); setStep(1); }}
                className="w-full px-4 py-4 text-left rounded-xl border border-mono-200 hover:bg-mono-50 transition-colors"
              >
                <p className="font-medium text-mono-900">만 14세 미만</p>
                <p className="text-sm text-mono-500 mt-0.5">주니어 모드로 이용 (보호자 동의 필요)</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 1: 관심 장르 선택 */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-mono-900 mb-2">
              관심 장르를 선택해주세요
            </h2>
            <p className="text-mono-500 mb-6">여러 개 선택 가능해요</p>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    selectedGenres.includes(genre)
                      ? "bg-primary-500 text-white"
                      : "bg-mono-100 text-mono-700 hover:bg-mono-200"
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={selectedGenres.length === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: 닉네임 입력 */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-mono-900 mb-2">
              닉네임을 정해주세요
            </h2>
            <p className="text-mono-500 mb-6">커뮤니티에서 사용할 이름이에요</p>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="닉네임 입력"
              maxLength={20}
              className="w-full px-4 py-4 border border-mono-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-8"
            />
            <button
              onClick={() => setStep(3)}
              disabled={nickname.trim().length < 2}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음 <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 3: 추천 책 */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-mono-900 mb-2">
              이런 책은 어때요?
            </h2>
            <p className="text-mono-500 mb-6">관심사에 맞는 추천 도서예요</p>
            <div className="space-y-3 mb-8">
              {RECOMMENDED_BOOKS.map((book) => (
                <div
                  key={book.id}
                  className="flex items-center gap-4 p-4 bg-mono-50 rounded-xl"
                >
                  <div className="w-12 h-16 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-mono-900">{book.title}</p>
                    <p className="text-sm text-mono-500">{book.author}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleComplete}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
            >
              <Check className="w-5 h-5" />
              시작하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
