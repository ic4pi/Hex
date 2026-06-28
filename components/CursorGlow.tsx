'use client'

import { useEffect } from 'react'

export default function CursorGlow() {
  useEffect(() => {
    const glow = document.getElementById('cursor-glow')
    if (!glow) return

    const move = (e: MouseEvent) => {
      glow.style.left = e.clientX + 'px'
      glow.style.top = e.clientY + 'px'
    }

    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      id="cursor-glow"
      aria-hidden="true"
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(157,0,255,0.09) 0%, rgba(255,45,120,0.04) 40%, transparent 70%)',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        transition: 'left 0.12s ease, top 0.12s ease',
      }}
    />
  )
}
