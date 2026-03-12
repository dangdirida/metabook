"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Upload,
  Sticker,
  Music,
  Image as ImageIcon,
  Video,
  BookOpen,
  FileText,
  Bot,
  Terminal,
  Chrome,
  ShoppingBag,
  Film,
} from "lucide-react";

const TYPES = [
  { value: "sticker", label: "스티커", icon: Sticker, formats: "PNG, APNG", maxSize: "10MB" },
  { value: "music", label: "음악", icon: Music, formats: "MP3, WAV", maxSize: "50MB" },
  { value: "photo", label: "이미지", icon: ImageIcon, formats: "JPG, PNG", maxSize: "20MB" },
  { value: "video", label: "동영상", icon: Video, formats: "MP4", maxSize: "200MB" },
  { value: "webtoon", label: "웹툰", icon: BookOpen, formats: "JPG 시리즈", maxSize: "50MB" },
  { value: "novel", label: "소설", icon: FileText, formats: "TXT, PDF", maxSize: "10MB" },
  { value: "webdrama", label: "웹드라마", icon: Film, formats: "MP4", maxSize: "500MB" },
  { value: "ai_agent", label: "AI Agent", icon: Bot, formats: "JSON", maxSize: "5MB" },
  { value: "prompt", label: "프롬프트", icon: Terminal, formats: "TXT", maxSize: "1MB" },
  { value: "extension", label: "익스텐션", icon: Chrome, formats: "ZIP", maxSize: "50MB" },
  { value: "goods", label: "굿즈", icon: ShoppingBag, formats: "제휴 업체", maxSize: "-" },
];

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [sourceText, setSourceText] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem("creation_source_text");
    if (saved) {
      setSourceText(saved);
      setDescription(`"${saved}" 에서 영감받은 창작물`);
      sessionStorage.removeItem("creation_source_text");
    }
  }, []);

  const typeInfo = TYPES.find((t) => t.value === selectedType);

  const canNext = () => {
    switch (step) {
      case 1: return !!selectedType;
      case 2: return true;
      case 3: return title.trim().length > 0;
      case 4: return true;
      case 5: return agreed;
      default: return true;
    }
  };

  return (
    <div className="min-h-screen bg-mono-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-2 hover:bg-mono-200 rounded-lg">
            <ChevronLeft className="w-5 h-5 text-mono-600" />
          </button>
          <h1 className="text-xl font-bold text-mono-900">2차 창작 업로드</h1>
        </div>

        {/* 프로그레스 */}
        <div className="flex items-center gap-1 mb-8">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary-500" : "bg-mono-200"
              }`}
            />
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-mono-200 p-6">
          {/* Step 1: 유형 선택 */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-semibold text-mono-900 mb-4">창작물 유형 선택</h2>
              {sourceText && (
                <div className="mb-4 p-3 bg-primary-50 rounded-xl text-sm text-primary-700">
                  선택된 텍스트: &quot;{sourceText.slice(0, 50)}...&quot;
                </div>
              )}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
                      selectedType === type.value
                        ? "bg-primary-50 border-2 border-primary-500"
                        : "border border-mono-200 hover:bg-mono-50"
                    }`}
                  >
                    <type.icon className="w-6 h-6 text-primary-500" />
                    <span className="text-xs font-medium text-mono-700">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: 파일 업로드 */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-semibold text-mono-900 mb-4">파일 업로드</h2>
              <div className="border-2 border-dashed border-mono-300 rounded-xl p-10 text-center">
                <Upload className="w-10 h-10 text-mono-400 mx-auto mb-3" />
                <p className="text-mono-600 font-medium">드래그 & 드롭 또는 클릭하여 업로드</p>
                {typeInfo && (
                  <p className="text-sm text-mono-400 mt-2">
                    {typeInfo.formats} · 최대 {typeInfo.maxSize}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 3: 메타데이터 */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-mono-900 mb-4">정보 입력</h2>
              <div>
                <label className="text-sm font-medium text-mono-700 mb-1 block">제목 *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-mono-700 mb-1 block">설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-mono-700 mb-1 block">태그 (쉼표 구분)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="캐릭터, 팬아트, 일러스트"
                  className="w-full px-4 py-2 border border-mono-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: 미리보기 */}
          {step === 4 && (
            <div>
              <h2 className="text-lg font-semibold text-mono-900 mb-4">미리보기</h2>
              <div className="bg-mono-50 rounded-xl p-6 text-center">
                <div className="w-32 h-32 bg-mono-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  {typeInfo && <typeInfo.icon className="w-10 h-10 text-mono-400" />}
                </div>
                <p className="font-semibold text-mono-900">{title || "제목 없음"}</p>
                <p className="text-sm text-mono-500 mt-1">{typeInfo?.label}</p>
                {description && <p className="text-sm text-mono-600 mt-3">{description}</p>}
              </div>
            </div>
          )}

          {/* Step 5: 저작권 동의 */}
          {step === 5 && (
            <div>
              <h2 className="text-lg font-semibold text-mono-900 mb-4">저작권 동의</h2>
              <div className="bg-mono-50 rounded-xl p-4 mb-4 text-sm text-mono-600 space-y-2">
                <p>1. 이 창작물은 MetaBook 2차 창작 가이드라인을 준수합니다.</p>
                <p>2. 원작의 저작권을 존중하며, 2차 창작 허용 범위 내에서 제작되었습니다.</p>
                <p>3. OGQ Market 등록 시 수익 분배 정책에 동의합니다.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 accent-primary-500"
                />
                <span className="text-sm text-mono-700">위 내용에 모두 동의합니다</span>
              </label>
            </div>
          )}

          {/* Step 6: 완료 */}
          {step === 6 && (
            <div className="text-center py-10">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary-500" />
              </div>
              <h2 className="text-xl font-bold text-mono-900 mb-2">제출 완료!</h2>
              <p className="text-mono-500 mb-6">어드민 검토 후 갤러리에 공개됩니다.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push("/library")}
                  className="px-6 py-2.5 border border-mono-200 rounded-xl text-sm"
                >
                  도서관으로
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setSelectedType("");
                    setTitle("");
                    setDescription("");
                    setTags("");
                    setAgreed(false);
                  }}
                  className="px-6 py-2.5 bg-primary-500 text-white rounded-xl text-sm hover:bg-primary-600"
                >
                  하나 더 올리기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 네비게이션 버튼 */}
        {step < 6 && (
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="flex items-center gap-1 px-4 py-2 text-sm text-mono-600 hover:bg-mono-200 rounded-xl disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" /> 이전
            </button>
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="flex items-center gap-1 px-6 py-2 bg-primary-500 text-white text-sm rounded-xl hover:bg-primary-600 disabled:opacity-40"
            >
              {step === 5 ? "제출" : "다음"} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
