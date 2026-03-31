"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronRight, Moon, Sun } from "lucide-react";

/* ─── 인라인 SVG 비주얼 컴포넌트들 ─── */

function QRVisual() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{height:320}}>
      {/* 배경 빛 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{width:280,height:280,background:"radial-gradient(ellipse at center, rgba(50,210,157,0.15) 0%, transparent 70%)",borderRadius:"50%"}} />
      </div>
      {/* 책 목업 */}
      <svg width="320" height="280" viewBox="0 0 320 280" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 책 그림자 */}
        <ellipse cx="130" cy="260" rx="80" ry="12" fill="rgba(0,0,0,0.08)" />
        {/* 책 바디 */}
        <rect x="50" y="40" width="160" height="210" rx="8" fill="#1a1a2e" />
        <rect x="54" y="44" width="152" height="202" rx="6" fill="#16213e" />
        {/* 책 표지 그라디언트 */}
        <rect x="58" y="48" width="144" height="194" rx="4" fill="url(#bookGrad)" />
        <defs>
          <linearGradient id="bookGrad" x1="58" y1="48" x2="202" y2="242" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f3460" />
            <stop offset="1" stopColor="#16213e" />
          </linearGradient>
        </defs>
        {/* 책 제목 라인 */}
        <rect x="74" y="72" width="112" height="8" rx="4" fill="rgba(255,255,255,0.7)" />
        <rect x="74" y="88" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.35)" />
        {/* QR 코드 영역 */}
        <rect x="88" y="120" width="84" height="84" rx="6" fill="white" />
        {/* QR 패턴 */}
        <rect x="94" y="126" width="20" height="20" rx="2" fill="#111" />
        <rect x="96" y="128" width="16" height="16" rx="1.5" fill="white" />
        <rect x="99" y="131" width="10" height="10" rx="1" fill="#111" />
        <rect x="152" y="126" width="20" height="20" rx="2" fill="#111" />
        <rect x="154" y="128" width="16" height="16" rx="1.5" fill="white" />
        <rect x="157" y="131" width="10" height="10" rx="1" fill="#111" />
        <rect x="94" y="184" width="20" height="20" rx="2" fill="#111" />
        <rect x="96" y="186" width="16" height="16" rx="1.5" fill="white" />
        <rect x="99" y="189" width="10" height="10" rx="1" fill="#111" />
        <rect x="120" y="126" width="6" height="6" rx="1" fill="#111" />
        <rect x="130" y="126" width="6" height="6" rx="1" fill="#111" />
        <rect x="140" y="126" width="6" height="6" rx="1" fill="#111" />
        <rect x="120" y="136" width="6" height="6" rx="1" fill="#111" />
        <rect x="140" y="136" width="6" height="6" rx="1" fill="#111" />
        <rect x="120" y="146" width="6" height="6" rx="1" fill="#111" />
        <rect x="130" y="146" width="6" height="6" rx="1" fill="#111" />
        <rect x="140" y="146" width="6" height="6" rx="1" fill="#111" />
        <rect x="120" y="156" width="6" height="6" rx="1" fill="#111" />
        <rect x="130" y="156" width="6" height="6" rx="1" fill="#111" />
        <rect x="120" y="166" width="6" height="6" rx="1" fill="#111" />
        <rect x="130" y="166" width="6" height="6" rx="1" fill="#111" />
        <rect x="140" y="166" width="6" height="6" rx="1" fill="#111" />
        <rect x="120" y="176" width="6" height="6" rx="1" fill="#111" />
        <rect x="140" y="176" width="6" height="6" rx="1" fill="#111" />
        <rect x="130" y="176" width="6" height="6" rx="1" fill="#111" />
        {/* QR 스캔 라인 애니메이션 */}
        <rect x="88" y="162" width="84" height="2" rx="1" fill="rgba(50,210,157,0.8)">
          <animateTransform attributeName="transform" type="translate" values="0 -36; 0 36; 0 -36" dur="2s" repeatCount="indefinite" />
        </rect>
        {/* 폰 */}
        <rect x="210" y="80" width="78" height="140" rx="12" fill="#0d0d0d" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        <rect x="215" y="88" width="68" height="124" rx="8" fill="#111827" />
        {/* 폰 화면 내용 */}
        <rect x="219" y="100" width="60" height="10" rx="3" fill="rgba(50,210,157,0.7)" />
        <rect x="219" y="116" width="40" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
        <rect x="219" y="128" width="52" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
        <rect x="219" y="140" width="44" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
        {/* 연결선 */}
        <path d="M172 162 Q191 162 210 140" stroke="rgba(50,210,157,0.5)" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
        {/* OGQ 레이블 */}
        <rect x="215" y="158" width="60" height="20" rx="4" fill="rgba(50,210,157,0.15)" stroke="rgba(50,210,157,0.3)" strokeWidth="1" />
        <text x="245" y="172" textAnchor="middle" fontSize="8" fontWeight="600" fill="rgba(50,210,157,0.9)" fontFamily="system-ui">OGQ</text>
      </svg>
    </div>
  );
}

function WorldVisual() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{height:320}}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{width:300,height:300,background:"radial-gradient(ellipse at 40% 40%, rgba(124,58,237,0.18) 0%, transparent 65%)",borderRadius:"50%"}} />
      </div>
      <svg width="340" height="300" viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 3D 방 바닥 */}
        <path d="M60 200 L170 260 L280 200 L170 140 Z" fill="url(#floorGrad)" />
        <defs>
          <linearGradient id="floorGrad" x1="60" y1="200" x2="280" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e1b4b" />
            <stop offset="1" stopColor="#312e81" />
          </linearGradient>
          <linearGradient id="wallLeft" x1="60" y1="200" x2="170" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0f172a" />
            <stop offset="1" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="wallRight" x1="280" y1="200" x2="170" y2="140" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e1b4b" />
            <stop offset="1" stopColor="#2d1d6e" />
          </linearGradient>
        </defs>
        {/* 왼쪽 벽 */}
        <path d="M60 200 L170 140 L170 40 L60 100 Z" fill="url(#wallLeft)" />
        {/* 오른쪽 벽 */}
        <path d="M280 200 L170 140 L170 40 L280 100 Z" fill="url(#wallRight)" />
        {/* 벽 모서리 선 */}
        <line x1="170" y1="40" x2="170" y2="140" stroke="rgba(139,92,246,0.5)" strokeWidth="1" />
        <line x1="170" y1="140" x2="60" y2="200" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
        <line x1="170" y1="140" x2="280" y2="200" stroke="rgba(139,92,246,0.3)" strokeWidth="1" />
        {/* 바닥 그리드 */}
        <line x1="115" y1="170" x2="225" y2="230" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
        <line x1="140" y1="155" x2="250" y2="215" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
        <line x1="90" y1="185" x2="200" y2="245" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
        <line x1="100" y1="215" x2="210" y2="170" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
        <line x1="120" y1="230" x2="230" y2="185" stroke="rgba(139,92,246,0.15)" strokeWidth="0.5" />
        {/* 3D 가구 - 소파 */}
        <path d="M95 195 L135 218 L135 208 L155 219 L155 229 L95 205 Z" fill="#4c1d95" />
        <path d="M95 195 L135 218 L155 208 L115 185 Z" fill="#6d28d9" />
        <path d="M155 208 L155 229 L175 218 L175 197 Z" fill="#5b21b6" />
        {/* 창문 효과 */}
        <rect x="90" y="55" width="60" height="70" rx="3" fill="rgba(139,92,246,0.05)" stroke="rgba(139,92,246,0.2)" strokeWidth="1" />
        <line x1="120" y1="55" x2="120" y2="125" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
        <line x1="90" y1="90" x2="150" y2="90" stroke="rgba(139,92,246,0.2)" strokeWidth="0.5" />
        {/* 빛 줄기 */}
        <path d="M90 55 L60 200" stroke="rgba(196,181,253,0.06)" strokeWidth="25" />
        {/* 조작 힌트 원형 */}
        <circle cx="260" cy="80" r="26" fill="rgba(139,92,246,0.12)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
        <circle cx="260" cy="80" r="18" fill="rgba(139,92,246,0.18)" />
        <text x="260" y="76" textAnchor="middle" fontSize="10" fill="rgba(196,181,253,0.9)">360°</text>
        <text x="260" y="88" textAnchor="middle" fontSize="7" fill="rgba(196,181,253,0.6)">자유시점</text>
        {/* 네비게이션 도트 */}
        <circle cx="170" cy="260" r="3" fill="rgba(139,92,246,0.8)" />
        <circle cx="155" cy="255" r="2" fill="rgba(139,92,246,0.4)" />
        <circle cx="185" cy="255" r="2" fill="rgba(139,92,246,0.4)" />
        <circle cx="140" cy="248" r="1.5" fill="rgba(139,92,246,0.2)" />
        <circle cx="200" cy="248" r="1.5" fill="rgba(139,92,246,0.2)" />
      </svg>
    </div>
  );
}

function ChatVisual() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{height:320}}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{width:260,height:260,background:"radial-gradient(ellipse at center, rgba(14,165,233,0.12) 0%, transparent 70%)",borderRadius:"50%"}} />
      </div>
      <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 채팅 창 메인 */}
        <rect x="40" y="30" width="220" height="240" rx="20" fill="#0c1a2e" stroke="rgba(14,165,233,0.15)" strokeWidth="1.5" />
        {/* 헤더 */}
        <rect x="40" y="30" width="220" height="56" rx="20" fill="#0e2233" />
        <rect x="40" y="64" width="220" height="22" fill="#0e2233" />
        {/* 아바타 */}
        <circle cx="78" cy="58" r="18" fill="url(#avatarGrad)" />
        <defs>
          <radialGradient id="avatarGrad" cx="50%" cy="30%" r="70%">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#0284c7" />
          </radialGradient>
        </defs>
        <text x="78" y="63" textAnchor="middle" fontSize="13" fontWeight="700" fill="white" fontFamily="system-ui">재</text>
        {/* 캐릭터 이름 */}
        <text x="104" y="54" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">재레드 다이아모드</text>
        <text x="104" y="68" fontSize="9" fill="rgba(56,189,248,0.7)" fontFamily="system-ui">AI 캐릭터 · 온라인</text>
        {/* 온라인 점 */}
        <circle cx="92" cy="72" r="4" fill="#22c55e" stroke="#0c1a2e" strokeWidth="1.5" />
        {/* 메시지들 */}
        {/* 캐릭터 메시지 1 */}
        <rect x="56" y="102" width="148" height="36" rx="14" fill="#1e3a5f" />
        <path d="M56 112 L46 120 L56 122 Z" fill="#1e3a5f" />
        <text x="74" y="117" fontSize="9" fill="rgba(255,255,255,0.85)" fontFamily="system-ui">안녕하세요, 저는 재레드입니다.</text>
        <text x="74" y="130" fontSize="9" fill="rgba(255,255,255,0.85)" fontFamily="system-ui">묵었든 묻어보세요!</text>
        {/* 내 메시지 */}
        <rect x="110" y="152" width="134" height="28" rx="14" fill="url(#myMsgGrad)" />
        <path d="M244 158 L254 164 L244 168 Z" fill="url(#myMsgGrad)" />
        <defs>
          <linearGradient id="myMsgGrad" x1="110" y1="152" x2="244" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0ea5e9" />
            <stop offset="1" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <text x="177" y="171" textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui">문명이 발전한 이유가 뫐가요?</text>
        {/* 캐릭터 메시지 2 (타이핑) */}
        <rect x="56" y="196" width="100" height="30" rx="14" fill="#1e3a5f" />
        <path d="M56 206 L46 213 L56 216 Z" fill="#1e3a5f" />
        {/* 타이핑 도트 */}
        <circle cx="86" cy="211" r="3" fill="rgba(56,189,248,0.7)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0s" repeatCount="indefinite" />
        </circle>
        <circle cx="101" cy="211" r="3" fill="rgba(56,189,248,0.7)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.3s" repeatCount="indefinite" />
        </circle>
        <circle cx="116" cy="211" r="3" fill="rgba(56,189,248,0.7)">
          <animate attributeName="opacity" values="0.3;1;0.3" dur="1.2s" begin="0.6s" repeatCount="indefinite" />
        </circle>
        {/* 입력창 */}
        <rect x="50" y="240" width="200" height="20" rx="10" fill="#1a2740" stroke="rgba(14,165,233,0.2)" strokeWidth="1" />
        <text x="70" y="254" fontSize="8" fill="rgba(255,255,255,0.25)" fontFamily="system-ui">메시지를 입력하세요...</text>
        <circle cx="238" cy="250" r="7" fill="#0ea5e9" />
        <path d="M234 250 L239 247 L239 253 Z" fill="white" />
      </svg>
    </div>
  );
}

function CommunityVisual() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{height:320}}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{width:280,height:280,background:"radial-gradient(ellipse at center, rgba(244,63,94,0.1) 0%, transparent 70%)",borderRadius:"50%"}} />
      </div>
      <svg width="320" height="300" viewBox="0 0 320 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 메인 채팅방 카드 */}
        <rect x="40" y="20" width="240" height="260" rx="20" fill="#12141a" stroke="rgba(244,63,94,0.12)" strokeWidth="1.5" />
        {/* 헤더 */}
        <rect x="40" y="20" width="240" height="52" rx="20" fill="#1a1d26" />
        <rect x="40" y="52" width="240" height="20" fill="#1a1d26" />
        {/* 실시간 dot */}
        <circle cx="62" cy="46" r="5" fill="#22c55e">
          <animate attributeName="r" values="5;7;5" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="62" cy="46" r="4" fill="#22c55e" />
        <text x="74" y="42" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">독자 커뮤니티</text>
        <text x="74" y="56" fontSize="9" fill="rgba(34,197,94,0.8)" fontFamily="system-ui">24명 실시간 접속</text>
        {/* 메시지 1 */}
        <circle cx="62" cy="92" r="12" fill="#be123c" />
        <text x="62" y="96" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" fontFamily="system-ui">민</text>
        <rect x="82" y="80" width="156" height="32" rx="12" fill="#1f2937" />
        <text x="96" y="93" fontSize="9" fill="rgba(255,255,255,0.8)" fontFamily="system-ui">결말이 너무 충격적이에요 😱</text>
        <text x="96" y="105" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="system-ui">민지 · 오후 2:34</text>
        {/* 메시지 2 */}
        <circle cx="62" cy="138" r="12" fill="#1d4ed8" />
        <text x="62" y="142" textAnchor="middle" fontSize="9" fontWeight="700" fill="white" fontFamily="system-ui">수</text>
        <rect x="82" y="126" width="148" height="32" rx="12" fill="#1f2937" />
        <text x="96" y="139" fontSize="9" fill="rgba(255,255,255,0.8)" fontFamily="system-ui">3장부터 복선이있었어요!</text>
        <text x="96" y="151" fontSize="8" fill="rgba(255,255,255,0.4)" fontFamily="system-ui">수연 · 오후 2:35</text>
        {/* 내 메시지 (오른쪽) */}
        <rect x="100" y="174" width="148" height="30" rx="12" fill="url(#commGrad)" />
        <defs>
          <linearGradient id="commGrad" x1="100" y1="174" x2="248" y2="204" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f43f5e" />
            <stop offset="1" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <text x="174" y="191" textAnchor="middle" fontSize="9" fill="white" fontFamily="system-ui">작가님 천재인듯</text>
        <text x="238" y="205" fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="system-ui">나 · 오후 2:35</text>
        {/* 이모지 반응 바 */}
        <rect x="82" y="216" width="176" height="24" rx="12" fill="#1f2937" />
        <text x="98" y="232" fontSize="10" fontFamily="system-ui" fill="rgba(239,68,68,0.8)">F</text>
        <text x="110" y="232" fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="system-ui">12</text>
        <text x="126" y="232" fontSize="10" fontFamily="system-ui" fill="rgba(251,191,36,0.8)">!</text>
        <text x="138" y="232" fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="system-ui">8</text>
        <text x="154" y="232" fontSize="10" fontFamily="system-ui" fill="rgba(244,63,94,0.8)">H</text>
        <text x="166" y="232" fontSize="8" fill="rgba(255,255,255,0.5)" fontFamily="system-ui">24</text>
        <text x="190" y="232" fontSize="9" fill="rgba(244,63,94,0.7)" fontFamily="system-ui">+ 반응</text>
        {/* 하단 입력 */}
        <rect x="50" y="254" width="220" height="18" rx="9" fill="#1f2937" stroke="rgba(244,63,94,0.15)" strokeWidth="1" />
        <text x="70" y="267" fontSize="8" fill="rgba(255,255,255,0.2)" fontFamily="system-ui">감상을 나눠보세요...</text>
      </svg>
    </div>
  );
}

function CreationVisual() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{height:320}}>
      <div className="absolute inset-0 flex items-center justify-center">
        <div style={{width:300,height:300,background:"radial-gradient(ellipse at 60% 40%, rgba(245,158,11,0.15) 0%, transparent 65%)",borderRadius:"50%"}} />
      </div>
      <svg width="340" height="300" viewBox="0 0 340 300" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* 숏북 카드 */}
        <rect x="30" y="50" width="88" height="120" rx="10" fill="url(#sbGrad)" />
        <defs>
          <linearGradient id="sbGrad" x1="30" y1="50" x2="118" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" />
            <stop offset="1" stopColor="#047857" />
          </linearGradient>
          <linearGradient id="smGrad" x1="126" y1="30" x2="214" y2="190" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#5b21b6" />
          </linearGradient>
          <linearGradient id="gdGrad" x1="222" y1="50" x2="310" y2="170" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f59e0b" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <rect x="34" y="58" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
        <rect x="34" y="68" width="56" height="3.5" rx="1.75" fill="rgba(255,255,255,0.3)" />
        <rect x="34" y="78" width="64" height="3.5" rx="1.75" fill="rgba(255,255,255,0.25)" />
        <rect x="34" y="88" width="48" height="3.5" rx="1.75" fill="rgba(255,255,255,0.2)" />
        <text x="44" y="138" fontSize="14" textAnchor="middle" fontWeight="700" fill="white" fontFamily="system-ui">B</text>
        <rect x="34" y="154" width="80" height="10" rx="5" fill="rgba(255,255,255,0.2)" />
        <text x="74" y="163" textAnchor="middle" fontSize="8" fontWeight="600" fill="white" fontFamily="system-ui">숯북</text>
        <text x="34" y="182" fontSize="9" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">다른 시점으로</text>
        <text x="34" y="194" fontSize="9" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">재집필</text>
        {/* 숏뮤비 카드 (가운데, 위로) */}
        <rect x="126" y="30" width="88" height="160" rx="10" fill="url(#smGrad)" />
        <rect x="130" y="50" width="80" height="45" rx="6" fill="rgba(0,0,0,0.3)" />
        <circle cx="170" cy="72" r="14" fill="rgba(255,255,255,0.15)" />
        <path d="M165 65 L165 79 L179 72 Z" fill="white" />
        <text x="170" y="118" fontSize="14" textAnchor="middle" fontWeight="700" fill="white" fontFamily="system-ui">V</text>
        <rect x="130" y="134" width="80" height="10" rx="5" fill="rgba(255,255,255,0.2)" />
        <text x="170" y="143" textAnchor="middle" fontSize="8" fontWeight="600" fill="white" fontFamily="system-ui">숯뮤비</text>
        <text x="130" y="160" fontSize="9" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">AI 영상으로</text>
        <text x="130" y="172" fontSize="9" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">장면 구현</text>
        {/* 굿즈 카드 */}
        <rect x="222" y="50" width="88" height="120" rx="10" fill="url(#gdGrad)" />
        <rect x="226" y="58" width="80" height="5" rx="2.5" fill="rgba(255,255,255,0.5)" />
        <rect x="226" y="68" width="56" height="3.5" rx="1.75" fill="rgba(255,255,255,0.3)" />
        <rect x="226" y="78" width="64" height="3.5" rx="1.75" fill="rgba(255,255,255,0.25)" />
        <text x="236" y="138" fontSize="20" textAnchor="middle" fontFamily="system-ui">🎁</text>
        <rect x="226" y="154" width="80" height="10" rx="5" fill="rgba(255,255,255,0.2)" />
        <text x="266" y="163" textAnchor="middle" fontSize="8" fontWeight="600" fill="white" fontFamily="system-ui">굿즈</text>
        <text x="226" y="182" fontSize="9" fill="rgba(255,255,255,0.9)" fontFamily="system-ui">체감을 굿즈로</text>
        {/* 하단 "AI와 함께" 레이블 */}
        <rect x="110" y="218" width="120" height="26" rx="13" fill="#1a1a2e" stroke="rgba(245,158,11,0.4)" strokeWidth="1" />
        <text x="170" y="234" textAnchor="middle" fontSize="9" fontWeight="600" fill="rgba(245,158,11,0.9)" fontFamily="system-ui">AI와 함께 만들기</text>
        {/* 별 효과 */}
        <circle cx="52" cy="30" r="2" fill="rgba(255,255,255,0.4)" />
        <circle cx="270" cy="36" r="1.5" fill="rgba(255,255,255,0.3)" />
        <circle cx="155" cy="276" r="2" fill="rgba(255,255,255,0.25)" />
      </svg>
    </div>
  );
}

/* ─── 섹션 컴포넌트 ─── */
const SECTIONS = [
  {
    num: "01",
    tag: "QR 입장",
    title: "QR 코드 하나로 책에 들어오세요",
    desc: "책 표지나 본문 페이지에 인쇄된 QR 코드를 스캔하면, 해당 책의 OGQ 페이지로 즉시 이동합니다. 서점에서, 도서관에서, 집 첵장에서 — QR 하나로 책 속 세계가 열립니다.",
    pills: ["체 표지 QR", "본문 페이지 QR", "앱 설치 불필요"],
    accent: "#32d29d",
    accentLight: "rgba(50,210,157,0.08)",
    accentBorder: "rgba(50,210,157,0.15)",
    visual: QRVisual,
    flip: false,
  },
  {
    num: "02",
    tag: "3D 탐험",
    title: "책 속 공간을 직접 돌아다니세요",
    desc: "직접 장면 이미지를 선택하면 360° 3D 공간으로 입장합니다. 작가가 묘사한 카페, 저택, 골목길을 실제로 걸는 듯한 며칠감으로 경험하세요.",
    pills: ["360° 자유 시점", "주요 장면 재현", "멋진 분위기"],
    accent: "#8b5cf6",
    accentLight: "rgba(139,92,246,0.08)",
    accentBorder: "rgba(139,92,246,0.15)",
    visual: WorldVisual,
    flip: true,
  },
  {
    num: "03",
    tag: "AI 캐릭터",
    title: "책 속 인물과 직접 대화하세요",
    desc: "주인공에게 묻고 싶은 게 있었나요? OGQ에서는 체 속 인물과 직접 1:1 대화할 수 있습니다. AI가 캐릭터의 성격, 말투, 가치관을 학습해 진짜체럼 대답합니다.",
    pills: ["캐릭터 말투 반영", "쭅 내용 기반", "무한 대화"],
    accent: "#0ea5e9",
    accentLight: "rgba(14,165,233,0.08)",
    accentBorder: "rgba(14,165,233,0.15)",
    visual: ChatVisual,
    flip: false,
  },
  {
    num: "04",
    tag: "커뮤니티",
    title: "같은 책을 읽은 독자들과 실시간 감상 공유",
    desc: "혼자 읽고 끝내기 아쉬웠나요? OGQ 커뮤니티에서 같은 체를 읽은 독자들과 실시간으로 감상을 나두세요. 업로드, 이모지, 리액션으로 활발하게 이야기하세요.",
    pills: ["체별 전용 채팅방", "실시간 메시지", "이모지 반응"],
    accent: "#f43f5e",
    accentLight: "rgba(244,63,94,0.08)",
    accentBorder: "rgba(244,63,94,0.15)",
    visual: CommunityVisual,
    flip: true,
  },
  {
    num: "05",
    tag: "2차 시작",
    title: "마음에 드는 장면으로 나만의 2차 시작",
    desc: "체에서 마음에 드는 구절이나 장면을 골라 나만의 2차 시작물을 만들어보세요. AI가 함께하기 때문에 글솔씨나 디자인 실력이 없어도 됩니다.",
    pills: ["숨북 — 다른 시점·결말", "숨뮤비 — AI 영상", "굿즈 — 체갈피·스티커"],
    accent: "#f59e0b",
    accentLight: "rgba(245,158,11,0.08)",
    accentBorder: "rgba(245,158,11,0.15)",
    visual: CreationVisual,
    flip: false,
  },
];

/* ─── 테마 ─── */
function getTheme(isDark: boolean) {
  return {
    bg: isDark ? "#09090b" : "#ffffff",
    bgAlt: isDark ? "#0c0c0f" : "#f9fafb",
    text: isDark ? "white" : "#111827",
    subtext: isDark ? "rgba(255,255,255,0.45)" : "#6b7280",
    muted: isDark ? "rgba(255,255,255,0.35)" : "#9ca3af",
    faint: isDark ? "rgba(255,255,255,0.2)" : "#d1d5db",
    pillText: isDark ? "rgba(255,255,255,0.55)" : "#4b5563",
    pillBg: isDark ? "rgba(255,255,255,0.05)" : "#f3f4f6",
    pillBorder: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
    tagText: isDark ? "rgba(255,255,255,0.45)" : "#6b7280",
    navBg: isDark ? "rgba(9,9,11,0.85)" : "rgba(255,255,255,0.9)",
    navBorder: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
    navText: isDark ? "rgba(255,255,255,0.5)" : "#6b7280",
    navTitle: isDark ? "rgba(255,255,255,0.7)" : "#374151",
    sectionBorder: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
    cardBg: (accentLight: string) => isDark ? accentLight : "#f3f4f6",
    scrollHint: isDark ? "rgba(255,255,255,0.15)" : "#d1d5db",
  };
}

/* ─── 메인 페이지 ─── */
export default function AboutPage() {
  const router = useRouter();
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleSections, setVisibleSections] = useState<boolean[]>(new Array(SECTIONS.length).fill(false));
  const [isDark, setIsDark] = useState(false);
  const t = getTheme(isDark);

  useEffect(() => {
    const observers = sectionRefs.current.map((ref, i) => {
      if (!ref) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => { const next = [...prev]; next[i] = true; return next; });
            obs.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      obs.observe(ref);
      return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  return (
    <div style={{ fontFamily: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", background: t.bg, minHeight: "100vh", color: t.text, transition: "background 0.3s, color 0.3s" }}>

      {/* ─── 상단 네비게이션 ─── */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", height: 56, background: t.navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${t.navBorder}`, transition: "background 0.3s, border-color 0.3s" }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 8, color: t.navText, fontSize: 13, fontWeight: 500, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
          <ArrowLeft size={16} />
          돌아가기
        </button>
        <span style={{ fontSize: 13, fontWeight: 600, color: t.navTitle, letterSpacing: "0.02em" }}>OGQ 소개</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: isDark ? "rgba(255,255,255,0.1)" : "#f3f4f6", color: isDark ? "rgba(255,255,255,0.7)" : "#374151", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer", transition: "background 0.3s" }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? "라이트모드" : "다크모드"}
          </button>
          <button
            onClick={() => router.push("/library")}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 999, background: "#32d29d", color: "#09090b", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer" }}
          >
            시작하기 <ChevronRight size={14} />
          </button>
        </div>
      </nav>

      {/* ─── 히어로 ─── */}
      <header style={{ paddingTop: 140, paddingBottom: 100, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* 배경 오로라 효과 */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(50,210,157,${isDark ? 0.08 : 0.06}) 0%, transparent 70%)`, filter: "blur(60px)" }} />
          <div style={{ position: "absolute", top: "20%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(139,92,246,${isDark ? 0.07 : 0.05}) 0%, transparent 70%)`, filter: "blur(60px)" }} />
        </div>
        <div style={{ position: "relative", maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, background: "rgba(50,210,157,0.1)", border: "1px solid rgba(50,210,157,0.2)", marginBottom: 32, fontSize: 12, fontWeight: 600, color: "#32d29d", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            책이 살아있는 세계
          </div>
          <h1 style={{ fontSize: "clamp(40px, 8vw, 80px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", marginBottom: 24 }}>
            책 속 세계가<br />
            <span style={{ color: "#32d29d" }}>살아납니다.</span>
          </h1>
          <p style={{ fontSize: "clamp(15px, 2.5vw, 18px)", color: t.subtext, lineHeight: 1.8, maxWidth: 520, margin: "0 auto 40px" }}>
            QR 하나로 들어와 3D 세계를 탐험하고,<br />
            캐릭터와 대화하고, 독자들과 함께 이야기하세요.
          </p>
          {/* 기능 태그 나열 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {SECTIONS.map(s => (
              <span key={s.num} style={{ padding: "6px 14px", borderRadius: 999, background: t.pillBg, border: `1px solid ${t.pillBorder}`, fontSize: 12, fontWeight: 500, color: t.tagText }}>
                {s.tag}
              </span>
            ))}
          </div>
        </div>
        {/* 스크롤 힌트 */}
        <div style={{ marginTop: 60, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: t.faint, fontSize: 11 }}>
          <div style={{ width: 1, height: 40, background: `linear-gradient(to bottom, transparent, ${t.scrollHint})` }} />
          스크롤해서 보기
        </div>
      </header>

      {/* ─── 구분선 ─── */}
      <div style={{ width: "100%", height: 1, background: t.sectionBorder }} />

      {/* ─── 기능 섹션들 ─── */}
      <main>
        {SECTIONS.map((section, i) => {
          const Visual = section.visual;
          const isFlip = section.flip;
          const isVisible = visibleSections[i];
          return (
            <div
              key={section.num}
              ref={el => { sectionRefs.current[i] = el; }}
              style={{
                borderBottom: `1px solid ${t.sectionBorder}`,
                background: i % 2 === 0 ? t.bg : t.bgAlt,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(40px)",
                transition: "opacity 0.7s ease, transform 0.7s ease, background 0.3s",
              }}
            >
              <div style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 32px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
                {/* 텍스트 */}
                <div style={{ order: isFlip ? 2 : 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: section.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>{section.num}</span>
                    <span style={{ width: 32, height: 1, background: section.accent, opacity: 0.5 }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: t.muted, letterSpacing: "0.08em", textTransform: "uppercase" }}>{section.tag}</span>
                  </div>
                  <h2 style={{ fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.025em", marginBottom: 20, whiteSpace: "pre-line" }}>
                    {section.title}
                  </h2>
                  <p style={{ fontSize: 15, color: t.subtext, lineHeight: 1.85, marginBottom: 28 }}>
                    {section.desc}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {section.pills.map(pill => (
                      <div key={pill} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: section.accent, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: t.pillText, fontWeight: 500 }}>{pill}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {/* 비주얼 */}
                <div style={{ order: isFlip ? 1 : 2, display: "flex", alignItems: "center", justifyContent: "center", background: t.cardBg(section.accentLight), border: `1px solid ${section.accentBorder}`, borderRadius: 24, overflow: "hidden" }}>
                  <Visual />
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* ─── CTA ─── */}
      <footer style={{ textAlign: "center", padding: "100px 24px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%, rgba(50,210,157,${isDark ? 0.08 : 0.06}) 0%, transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 480, margin: "0 auto" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#32d29d", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>READY TO START</p>
          <h2 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.025em", marginBottom: 16 }}>
            지금 바로<br />시작해보세요
          </h2>
          <p style={{ fontSize: 15, color: t.subtext, marginBottom: 40, lineHeight: 1.7 }}>
            QR 코드를 스캔하거나, 도서 목록에서 책을 선택하면<br />OGQ의 세계가 펼쳐집니다.
          </p>
          <button
            onClick={() => router.push("/library")}
            style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "16px 36px", borderRadius: 999, background: "#32d29d", color: "#09090b", fontSize: 15, fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "-0.01em" }}
          >
            도서 목록 보러 가기
            <ChevronRight size={18} />
          </button>
          <p style={{ marginTop: 20, fontSize: 12, color: t.faint }}>
            앱 설치 없이 브라우저에서 바로 이용 가능
          </p>
        </div>
      </footer>

    </div>
  );
}
