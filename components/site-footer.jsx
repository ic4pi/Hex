'use client'
import Link from 'next/link'
import { Instagram, Facebook, Twitter, Youtube, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SiteFooter({ branding }) {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const subscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    setBusy(true)
    try {
      const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ email }) })
      if (r.ok) { toast.success('Welcome, witch. Your spellbook awaits.'); setEmail('') }
      else toast.error('Something went wrong')
    } catch { toast.error('Network error') } finally { setBusy(false) }
  }
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="font-display text-2xl mb-3">
            <span className="neon-pink">Hex</span><span className="neon-blue">pose</span><span className="text-white">!</span>
          </div>
          <p className="text-white/60 text-sm max-w-md">{branding?.tagline || 'A Witch\u2019s Boutique & Apothecary. Modern rituals, handcrafted intention.'}</p>
          <form onSubmit={subscribe} className="mt-6 flex gap-2 max-w-sm">
            <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" className="bg-white/5 border-white/10 text-white placeholder:text-white/40" />
            <Button type="submit" disabled={busy} className="bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink"><Mail className="h-4 w-4"/></Button>
          </form>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-widest text-white/60 mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/shop" className="text-white/80 hover:text-white">Shop</Link></li>
            <li><Link href="/shop?category=spell-jars" className="text-white/80 hover:text-white">Spell Jars</Link></li>
            <li><Link href="/shop?category=apparel" className="text-white/80 hover:text-white">Apparel</Link></li>
            <li><Link href="/about" className="text-white/80 hover:text-white">About</Link></li>
            <li><Link href="/faq" className="text-white/80 hover:text-white">FAQ</Link></li>
            <li><Link href="/contact" className="text-white/80 hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm uppercase tracking-widest text-white/60 mb-4">Policies</h4>
          <ul className="space-y-2 text-sm">
            <li><span className="text-white/60">Shipping Policy</span></li>
            <li><span className="text-white/60">Returns & Exchanges</span></li>
            <li><span className="text-white/60">Privacy Policy</span></li>
            <li><span className="text-white/60">Terms of Service</span></li>
          </ul>
          <div className="flex gap-3 mt-6">
            <a href="#" className="text-white/70 hover:text-[#ff1177]"><Instagram className="h-5 w-5"/></a>
            <a href="#" className="text-white/70 hover:text-[#3ea6ff]"><Facebook className="h-5 w-5"/></a>
            <a href="#" className="text-white/70 hover:text-[#c9a8ff]"><Twitter className="h-5 w-5"/></a>
            <a href="#" className="text-white/70 hover:text-[#ffb347]"><Youtube className="h-5 w-5"/></a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row justify-between items-center text-xs text-white/50">
          <span>{branding?.footer_text || '\u00a9 ' + new Date().getFullYear() + ' Hexpose! All rights reserved.'}</span>
          <span className="mt-2 sm:mt-0">hello@hexpose.shop</span>
        </div>
      </div>
    </footer>
  )
}
