'use client'

import { signIn } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

export default function LoginPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [bookOpen, setBookOpen] = useState(false)
  const [btnVisible, setBtnVisible] = useState(false)

  // 책 펼치기 애니메이션 시퀀스
  useEffect(() => {
    const t1 = setTimeout(() => setBookOpen(true), 800)
    const t2 = setTimeout(() => setBtnVisible(true), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  // Canvas 파티클 — 환상적인 빛 효과
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    type Particle = {
      x: number; y: number; vx: number; vy: number
      size: number; alpha: number; color: string; life: number; maxLife: number
    }

    const colors = ['#32d29d', '#7e5ae2', '#ffffff', '#a5f3e8', '#c4b5fd', '#fde68a']
    const particles: Particle[] = []

    const spawn = () => {
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.3 + Math.random() * 1.2
        const maxLife = 120 + Math.random() * 180
        particles.push({
          x: cx + (Math.random() - 0.5) * 80,
          y: cy + (Math.random() - 0.5) * 60,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.2,
          size: 1 + Math.random() * 3,
          alpha: 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife,
        })
      }
    }

    let frame = 0
    let animId: number
    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 15, 0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (frame % 3 === 0) spawn()

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.004
        const prog = p.life / p.maxLife
        p.alpha = prog < 0.2 ? prog / 0.2 : prog > 0.7 ? (1 - prog) / 0.3 : 1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * 0.85
        ctx.fill()

        // 빛 번짐
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        grad.addColorStop(0, p.color)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.globalAlpha = p.alpha * 0.2
        ctx.fill()
        ctx.globalAlpha = 1

        if (p.life >= p.maxLife) particles.splice(i, 1)
      }

      frame++
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center"
      style={{ background: '#05050f' }}>

      {/* 배경 미묘한 그레인 효과 */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }} />

      {/* 상단 타이포 */}
      <div className="relative z-10 flex flex-col items-center pt-16 pb-8">
        <h1 className="text-white font-bold tracking-tight"
          style={{
            fontSize: 'clamp(52px, 8vw, 96px)',
            fontFamily: '"Georgia", "Times New Roman", serif',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}>
          Meta<span style={{ color: '#32d29d' }}>Book</span>
        </h1>
        <p className="text-white/40 mt-3 text-center"
          style={{ fontSize: 'clamp(13px, 1.5vw, 17px)', letterSpacing: '0.02em', fontFamily: 'inherit' }}>
          책 속 세계가 살아 움직이는 인터랙티브 독서 플랫폼
        </p>
      </div>

      {/* 책 오브젝트 */}
      <div className="relative z-10 flex items-center justify-center"
        style={{ width: '420px', height: '280px', perspective: '1200px' }}>

        {/* 책등 (가운데 spine) */}
        <div className="absolute z-20 rounded-sm"
          style={{
            width: '12px', height: '220px',
            background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a, #2a2a2a)',
            boxShadow: '0 0 20px rgba(50,210,157,0.15)',
            top: '30px',
          }} />

        {/* 왼쪽 페이지 */}
        <div className="absolute"
          style={{
            width: '198px', height: '240px',
            top: '20px',
            right: '50%',
            transformOrigin: 'right center',
            transform: bookOpen ? 'rotateY(0deg)' : 'rotateY(80deg)',
            transition: 'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
            transformStyle: 'preserve-3d',
          }}>
          {/* 앞면 */}
          <div className="absolute inset-0 rounded-l-sm overflow-hidden"
            style={{
              background: '#0d0d1a',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRight: 'none',
            }}>
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
          {/* 뒷면 — 종이 질감 */}
          <div className="absolute inset-0 rounded-l-sm"
            style={{
              background: '#1a1a2e',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }} />
        </div>

        {/* 오른쪽 페이지 */}
        <div className="absolute"
          style={{
            width: '198px', height: '240px',
            top: '20px',
            left: '50%',
            transformOrigin: 'left center',
            transform: bookOpen ? 'rotateY(0deg)' : 'rotateY(-80deg)',
            transition: 'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
            transformStyle: 'preserve-3d',
          }}>
          <div className="absolute inset-0 rounded-r-sm overflow-hidden"
            style={{
              background: '#0d0d1a',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderLeft: 'none',
            }}>
            {/* 오른쪽 페이지 — 텍스트 라인 효과 */}
            <div className="w-full h-full flex flex-col justify-center items-center gap-2 p-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-full"
                  style={{
                    height: '1.5px',
                    width: `${60 + Math.sin(i * 1.3) * 25}%`,
                    background: `rgba(255,255,255,${0.04 + (i % 3) * 0.02})`,
                    transition: `opacity 0.5s ease ${i * 0.1}s`,
                    opacity: bookOpen ? 1 : 0,
                  }} />
              ))}
            </div>
          </div>
        </div>

        {/* 그림자 */}
        <div className="absolute bottom-0"
          style={{
            width: bookOpen ? '380px' : '120px',
            height: '20px',
            background: 'radial-gradient(ellipse, rgba(50,210,157,0.12) 0%, transparent 70%)',
            transition: 'width 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
            filter: 'blur(8px)',
          }} />
      </div>

      {/* 구글 로그인 버튼 */}
      <div className="relative z-10 mt-10"
        style={{
          opacity: btnVisible ? 1 : 0,
          transform: btnVisible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}>
        <button
          onClick={() => signIn('google', { callbackUrl: '/library' })}
          className="flex items-center gap-3 px-7 py-3.5 rounded-full font-medium text-sm"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '0.5px solid rgba(255,255,255,0.18)',
            color: '#fff',
            backdropFilter: 'blur(12px)',
            cursor: 'pointer',
            letterSpacing: '0.01em',
            transition: 'background 0.2s ease, border-color 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.3)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.18)'
          }}
        >
          {/* Google 로고 SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 계속하기
        </button>
        <p className="text-center mt-3 text-white/20" style={{ fontSize: '11px' }}>
          로그인하면 서비스 이용약관에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}
