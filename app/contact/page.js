'use client'
import { useEffect, useState } from 'react'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Mail, MapPin, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  const [branding, setBranding] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [busy, setBusy] = useState(false)
  useEffect(() => { fetch('/api/branding').then(r => r.json()).then(setBranding) }, [])
  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const r = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(form) })
      if (r.ok) { toast.success('The coven has received your whisper.'); setForm({ name:'', email:'', subject:'', message:'' }) }
      else toast.error('Something went wrong')
    } finally { setBusy(false) }
  }
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar branding={branding}/>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 grid md:grid-cols-2 gap-12">
        <div>
          <p className="neon-pink uppercase tracking-widest text-xs">Whisper to us</p>
          <h1 className="font-display text-4xl md:text-5xl mt-3">Contact</h1>
          <p className="text-white/60 mt-4 leading-relaxed">Questions about a ritual? Custom order? Wholesale? Send us a note and we’ll respond within the next full moon (usually within 48 hours).</p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3"><Mail className="h-4 w-4 neon-pink"/> hello@hexpose.shop</div>
            <div className="flex items-center gap-3"><MessageCircle className="h-4 w-4 neon-blue"/> @hexpose on socials</div>
            <div className="flex items-center gap-3"><MapPin className="h-4 w-4 neon-lav"/> Ships worldwide, brewed in Brooklyn</div>
          </div>
        </div>
        <form onSubmit={submit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <Label className="text-white/70">Name</Label>
            <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 mt-1"/>
          </div>
          <div>
            <Label className="text-white/70">Email *</Label>
            <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10 mt-1"/>
          </div>
          <div>
            <Label className="text-white/70">Subject</Label>
            <Input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="bg-white/5 border-white/10 mt-1"/>
          </div>
          <div>
            <Label className="text-white/70">Message *</Label>
            <Textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="bg-white/5 border-white/10 mt-1"/>
          </div>
          <Button type="submit" disabled={busy} className="w-full bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink">{busy ? 'Sending...' : 'Send Whisper'}</Button>
        </form>
      </div>
      <SiteFooter branding={branding}/>
    </div>
  )
}
