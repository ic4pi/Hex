'use client'
import { useEffect, useRef } from 'react'

export default function ParticleBG({ density = 60, colors = ['#ff1177','#3ea6ff','#c9a8ff','#ffb347'] }) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = canvas.width = canvas.offsetWidth
    let h = canvas.height = canvas.offsetHeight
    const dots = Array.from({ length: density }).map(() => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      c: colors[Math.floor(Math.random() * colors.length)],
      a: Math.random() * 0.6 + 0.2,
    }))
    let raf
    const step = () => {
      ctx.clearRect(0,0,w,h)
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy
        if (d.x < 0 || d.x > w) d.vx *= -1
        if (d.y < 0 || d.y > h) d.vy *= -1
        ctx.beginPath()
        ctx.fillStyle = d.c
        ctx.globalAlpha = d.a
        ctx.shadowColor = d.c
        ctx.shadowBlur = 12
        ctx.arc(d.x, d.y, d.r, 0, Math.PI*2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(step)
    }
    step()
    const onResize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight }
    window.addEventListener('resize', onResize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize) }
  }, [density])
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />
}
