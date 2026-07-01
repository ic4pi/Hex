'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Save } from 'lucide-react'

export default function BrandingEditor() {
  const [b, setB] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => { fetch('/api/branding').then(r => r.json()).then(setB) }, [])
  const set = (k, v) => setB(prev => ({ ...prev, [k]: v }))
  const setNested = (parent, k, v) => setB(prev => ({ ...prev, [parent]: { ...(prev?.[parent] || {}), [k]: v } }))

  const save = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/branding', { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(b) })
      if (r.ok) toast.success('Branding updated')
      else toast.error('Failed to save')
    } finally { setBusy(false) }
  }

  if (!b) return <div className="text-white/60">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div>
          <p className="neon-pink uppercase tracking-widest text-xs">Identity</p>
          <h1 className="font-display text-3xl md:text-4xl mt-2">Branding</h1>
        </div>
        <Button onClick={save} disabled={busy} className="bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink"><Save className="h-4 w-4 mr-2"/>Save</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="font-display text-lg">Core</h3>
          <F label="Site Name"><Input value={b.site_name || ''} onChange={e => set('site_name', e.target.value)} className="bg-white/5 border-white/10"/></F>
          <F label="Tagline"><Input value={b.tagline || ''} onChange={e => set('tagline', e.target.value)} className="bg-white/5 border-white/10"/></F>
          <F label="Logo URL"><Input value={b.logo || ''} onChange={e => set('logo', e.target.value)} className="bg-white/5 border-white/10"/></F>
          <F label="Wordmark URL"><Input value={b.wordmark || ''} onChange={e => set('wordmark', e.target.value)} className="bg-white/5 border-white/10"/></F>
          <F label="Favicon URL"><Input value={b.favicon || ''} onChange={e => set('favicon', e.target.value)} className="bg-white/5 border-white/10"/></F>
          <F label="Announcement Banner"><Input value={b.announcement_banner || ''} onChange={e => set('announcement_banner', e.target.value)} className="bg-white/5 border-white/10"/></F>
          <F label="Footer Text"><Textarea rows={2} value={b.footer_text || ''} onChange={e => set('footer_text', e.target.value)} className="bg-white/5 border-white/10"/></F>
        </div>

        <div className="glass rounded-xl p-5 space-y-4">
          <h3 className="font-display text-lg">Theme Colors</h3>
          {['background','primary','accent','lavender','gold'].map(k => (
            <F key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
              <div className="flex gap-2">
                <Input type="color" value={b.theme_colors?.[k] || '#000000'} onChange={e => setNested('theme_colors', k, e.target.value)} className="h-10 w-16 p-1 bg-white/5 border-white/10"/>
                <Input value={b.theme_colors?.[k] || ''} onChange={e => setNested('theme_colors', k, e.target.value)} className="bg-white/5 border-white/10"/>
              </div>
            </F>
          ))}
          <F label="Button Style"><Input value={b.button_style || 'glow'} onChange={e => set('button_style', e.target.value)} placeholder="glow, flat, outline..." className="bg-white/5 border-white/10"/></F>
          <F label="Display Font"><Input value={b.typography?.display || ''} onChange={e => setNested('typography', 'display', e.target.value)} className="bg-white/5 border-white/10"/></F>
          <F label="Body Font"><Input value={b.typography?.body || ''} onChange={e => setNested('typography', 'body', e.target.value)} className="bg-white/5 border-white/10"/></F>
        </div>

        <div className="glass rounded-xl p-5 space-y-4 md:col-span-2">
          <h3 className="font-display text-lg">Social Links</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {['instagram','facebook','twitter','tiktok','youtube'].map(k => (
              <F key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}><Input value={b.social?.[k] || ''} onChange={e => setNested('social', k, e.target.value)} placeholder={`https://${k}.com/hexpose`} className="bg-white/5 border-white/10"/></F>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function F({ label, children }) { return <div><Label className="text-white/70 mb-1 block">{label}</Label>{children}</div> }
