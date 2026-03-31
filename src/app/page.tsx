"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  // 이미 로그인된 사용자는 /library로 자동 리다이렉트
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/library");
    }
  }, [status, router]);

  // 로딩 중이거나 리다이렉트 중일 때
  if (status === "loading" || status === "authenticated") {
    return (
      <main className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-pulse text-white/40">로딩 중...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#064e3b]" />

      {/* 별 파티클 레이어 */}
      <div className="absolute inset-0">
        {/* 정적 별들 */}
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* 별똥별 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="shooting-star shooting-star-1" />
        <div className="shooting-star shooting-star-2" />
        <div className="shooting-star shooting-star-3" />
      </div>

      {/* 떠다니는 장식 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={`float-${i}`}
            className="absolute w-1.5 h-1.5 bg-white/20 rounded-full animate-float"
            style={{
              top: `${10 + Math.random() * 80}%`,
              left: `${5 + Math.random() * 90}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* 메인 콘텐츠 - 정중앙 */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h1 className="text-6xl sm:text-7xl font-bold text-white mb-4 drop-shadow-lg">
          OGQ
        </h1>
        <p className="text-lg sm:text-xl text-white/70 mb-16 max-w-md">
          책 속 세계가 살아 움직이는 인터랙티브 독서 플랫폼
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/library" })}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-lg font-semibold text-white hover:bg-white/20 transition-all duration-300 hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          구글로 계속하기
        </button>
      </div>

      {/* 인라인 스타일 - 커스텀 애니메이션 */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
          75% { transform: translateY(-25px) rotate(3deg); }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        @keyframes shooting {
          0% {
            transform: translateX(0) translateY(0) rotate(-45deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translateX(300px) translateY(300px) rotate(-45deg);
            opacity: 0;
          }
        }
        .shooting-star {
          position: absolute;
          width: 100px;
          height: 2px;
          background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.8));
          border-radius: 999px;
          animation: shooting linear infinite;
        }
        .shooting-star::after {
          content: '';
          position: absolute;
          right: 0;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 8px 2px rgba(255,255,255,0.6);
        }
        .shooting-star-1 {
          top: 10%;
          left: 20%;
          animation-duration: 2.5s;
          animation-delay: 1s;
        }
        .shooting-star-2 {
          top: 25%;
          left: 60%;
          animation-duration: 3s;
          animation-delay: 4s;
        }
        .shooting-star-3 {
          top: 5%;
          left: 45%;
          animation-duration: 2s;
          animation-delay: 7s;
        }

        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to));
        }
      `}</style>
    </main>
  );
}
