'use client'

import { useEffect, useRef } from 'react'

export default function SmokeParticles() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const colors = [
      'rgba(157,0,255,0.5)',
      'rgba(255,45,120,0.4)',
      'rgba(0,200,255,0.3)',
    ]

    const spawn = () => {
      const el = document.createElement('div')
      const size = 4 + Math.random() * 8
      const x = Math.random() * container.offsetWidth
      const color = colors[Math.floor(Math.random() * colors.length)]
      const duration = 2.5 + Math.random() * 2

      el.style.cssText = `
        position:absolute;
        left:${x}px;
        bottom:0;
        width:${size}px;
        height:${size}px;
        border-radius:50%;
        background:radial-gradient(circle, ${color}, transparent);
        pointer-events:none;
        animation:smoke-rise ${duration}s ease-out forwards;
      `
      container.appendChild(el)
      setTimeout(() => el.remove(), duration * 1000)
    }

    const interval = setInterval(spawn, 300)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none"
    />
  )
}
