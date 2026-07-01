'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Package, Users, Mail, MessageSquare, ArrowUpRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  useEffect(() => { fetch('/api/admin/overview').then(r => r.json()).then(setStats) }, [])
  const cards = [
    { label: 'Total Products', value: stats?.products ?? '—', icon: Package, color: '#ff1177', href: '/admin/products' },
    { label: 'Active Products', value: stats?.active_products ?? '—', icon: Sparkles, color: '#3ea6ff', href: '/admin/products' },
    { label: 'Newsletter Signups', value: stats?.newsletter ?? '—', icon: Mail, color: '#c9a8ff', href: '#' },
    { label: 'Contact Messages', value: stats?.contact ?? '—', icon: MessageSquare, color: '#ffb347', href: '#' },
  ]
  return (
    <div>
      <div className="mb-8">
        <p className="neon-pink uppercase tracking-widest text-xs">Dashboard</p>
        <h1 className="font-display text-4xl mt-2">Overview</h1>
        <p className="text-white/60 mt-2">Your coven at a glance.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <Link key={i} href={c.href} className="glass rounded-xl p-5 hover:border-white/25 transition">
            <div className="flex items-center justify-between">
              <c.icon className="h-5 w-5" style={{ color: c.color }}/>
              <ArrowUpRight className="h-4 w-4 text-white/40"/>
            </div>
            <p className="text-3xl font-display mt-4">{c.value}</p>
            <p className="text-xs uppercase tracking-widest text-white/50 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid md:grid-cols-3 gap-4">
        <Link href="/admin/products" className="glass rounded-xl p-6 hover:border-[#ff1177]/40 transition">
          <h3 className="font-display text-lg">Manage Products</h3>
          <p className="text-white/60 text-sm mt-1">Edit, add, and organize the catalog.</p>
          <Button className="mt-4 bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink">Open →</Button>
        </Link>
        <Link href="/admin/hero" className="glass rounded-xl p-6 hover:border-[#3ea6ff]/40 transition">
          <h3 className="font-display text-lg">Hero Builder</h3>
          <p className="text-white/60 text-sm mt-1">Visually edit your homepage hero.</p>
          <Button className="mt-4 bg-[#3ea6ff] hover:bg-[#3ea6ff]/90 text-white">Open →</Button>
        </Link>
        <Link href="/admin/branding" className="glass rounded-xl p-6 hover:border-[#c9a8ff]/40 transition">
          <h3 className="font-display text-lg">Branding</h3>
          <p className="text-white/60 text-sm mt-1">Tune your site’s identity.</p>
          <Button className="mt-4 bg-[#c9a8ff] hover:bg-[#c9a8ff]/90 text-black">Open →</Button>
        </Link>
      </div>
    </div>
  )
}
