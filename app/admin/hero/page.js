'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save, Eye } from 'lucide-react'
import Link from 'next/link'

export default function HeroBuilder() {
  const [h, setH] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { fetch('/api/hero').then(r => r.json()).then(setH) }, [])
  const set = (k, v) => setH(prev => ({ ...prev, [k]: v }))
  const setCTA = (which, field, v) => setH(prev => ({ ...prev, [which]: { ...(prev?.[which] || {}), [field]: v } }))

  const save = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/hero', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(h) })
      if (r.ok) toast.success('Hero updated')
      else toast.error('Failed to save')
    } finally { setBusy(false) }
  }

  if (!h) return <div className="text-white/60">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div>
          <p className="neon-pink uppercase tracking-widest text-xs">Homepage</p>
          <h1 className="font-display text-3xl md:text-4xl mt-2">Hero Builder</h1>
          <p className="text-white/60 mt-2">Everything on the homepage hero is editable here.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="border-white/15"><Link href="/" target="_blank"><Eye className="h-4 w-4 mr-2"/>Preview</Link></Button>
          <Button onClick={save} disabled={busy} className="bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink"><Save className="h-4 w-4 mr-2"/>Save</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div><Label className="text-white/70">Headline</Label><Input value={h.headline || ''} onChange={e => set('headline', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
          <div><Label className="text-white/70">Subheadline</Label><Textarea rows={3} value={h.subheadline || ''} onChange={e => set('subheadline', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
          <div><Label className="text-white/70">Promotional Text</Label><Input value={h.promo_text || ''} onChange={e => set('promo_text', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
          <div><Label className="text-white/70">Promo Badge</Label><Input value={h.promo_badge || ''} onChange={e => set('promo_badge', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-white/70">Primary CTA Label</Label><Input value={h.primary_cta?.label || ''} onChange={e => setCTA('primary_cta', 'label', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
            <div><Label className="text-white/70">Primary CTA Link</Label><Input value={h.primary_cta?.href || ''} onChange={e => setCTA('primary_cta', 'href', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
            <div><Label className="text-white/70">Secondary CTA Label</Label><Input value={h.secondary_cta?.label || ''} onChange={e => setCTA('secondary_cta', 'label', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
            <div><Label className="text-white/70">Secondary CTA Link</Label><Input value={h.secondary_cta?.href || ''} onChange={e => setCTA('secondary_cta', 'href', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
          </div>
          <div><Label className="text-white/70">Background Image URL</Label><Input value={h.background_image || ''} onChange={e => set('background_image', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
          <div><Label className="text-white/70">Overlay Image URL (optional)</Label><Input value={h.overlay_image || ''} onChange={e => set('overlay_image', e.target.value)} className="bg-white/5 border-white/10 mt-1"/></div>
          <div><Label className="text-white/70">Glow Accent Color</Label><div className="flex gap-2 mt-1"><Input type="color" value={h.glow_color || '#ff1177'} onChange={e => set('glow_color', e.target.value)} className="bg-white/5 border-white/10 h-10 w-20 p-1"/><Input value={h.glow_color || '#ff1177'} onChange={e => set('glow_color', e.target.value)} className="bg-white/5 border-white/10"/></div></div>
        </div>

        {/* Live preview */}
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50 mb-2">Live Preview</p>
          <div className="relative rounded-2xl overflow-hidden glass aspect-[4/5] md:aspect-square">
            {h.background_image && <img src={h.background_image} className="absolute inset-0 w-full h-full object-cover opacity-60"/>}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black grad-cyber"/>
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
              {h.promo_badge && <div className="mb-4 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full bg-black/60 border border-white/20">{h.promo_badge}</div>}
              <h2 className="font-display text-2xl md:text-4xl leading-tight" style={{ textShadow: `0 0 12px ${h.glow_color || '#ff1177'}66` }}>{h.headline}</h2>
              <p className="text-white/70 text-sm mt-3 max-w-md">{h.subheadline}</p>
              {h.promo_text && <p className="neon-gold text-xs uppercase tracking-widest mt-3">{h.promo_text}</p>}
              <div className="mt-5 flex gap-2">
                {h.primary_cta?.label && <span className="px-4 py-2 rounded-md text-xs" style={{ background: h.glow_color || '#ff1177', boxShadow: `0 0 16px ${h.glow_color || '#ff1177'}88` }}>{h.primary_cta.label}</span>}
                {h.secondary_cta?.label && <span className="px-4 py-2 rounded-md text-xs border border-white/25">{h.secondary_cta.label}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
