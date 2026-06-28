import Link from 'next/link'
import SmokeParticles from '@/components/SmokeParticles'

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(157,0,255,0.15) 0%, rgba(255,45,120,0.08) 40%, transparent 70%)',
        }}
      />
      <SmokeParticles />

      {/* Sigil ring */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 'min(500px, 90vw)',
          height: 'min(500px, 90vw)',
          border: '1px solid rgba(157,0,255,0.15)',
          borderRadius: '50%',
          animation: 'spin-slow 30s linear infinite',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute pointer-events-none left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 'min(360px, 70vw)',
          height: 'min(360px, 70vw)',
          border: '1px solid rgba(255,45,120,0.1)',
          borderRadius: '50%',
          animation: 'spin-slow 20s linear infinite reverse',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-lg">
        {/* Icon */}
        <div
          className="text-8xl animate-float select-none"
          style={{
            filter: 'drop-shadow(0 0 20px #9d00ff) drop-shadow(0 0 40px #ff2d78)',
          }}
        >
          ✦
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-3">
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tighter uppercase animate-flicker"
            style={{
              color: '#ff2d78',
              textShadow: '0 0 20px #ff2d78, 0 0 40px #ff2d78, 0 0 80px #cc1f60',
            }}
          >
            It&rsquo;s Done.
          </h1>
          <p
            className="text-base sm:text-lg tracking-widest uppercase"
            style={{ color: '#00c8ff', textShadow: '0 0 10px #00c8ff' }}
          >
            Your order is sealed.
          </p>
        </div>

        {/* Message */}
        <div
          className="rounded-lg p-6 text-sm leading-relaxed"
          style={{
            background: 'rgba(13,0,25,0.8)',
            border: '1px solid rgba(157,0,255,0.3)',
            boxShadow: '0 0 20px rgba(157,0,255,0.15)',
            color: '#c4b0e0',
          }}
        >
          <p className="mb-3">
            Your purchase has been received. Your jar is being hand-filled and
            intention-set — it ships when the energy is right (usually 3–5
            business days).
          </p>
          <p className="opacity-70 text-xs">
            Check your email for a receipt and shipping confirmation.
          </p>
        </div>

        {/* Ritual note */}
        <p
          className="text-xs tracking-widest uppercase opacity-60"
          style={{ color: '#9d00ff', textShadow: '0 0 6px #9d00ff' }}
        >
          ✧ the work begins now ✧
        </p>

        {/* Return button */}
        <Link
          href="/"
          className="btn-neon-pink font-bold tracking-widest uppercase px-10 py-4 rounded text-sm"
        >
          ← Return to the Shop
        </Link>
      </div>
    </div>
  )
}
