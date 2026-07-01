'use client'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Package, LayoutTemplate, Palette, Settings, LogOut, Tag, ShoppingCart, BarChart3, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authed, setAuthed] = useState(null)

  useEffect(() => {
    if (pathname === '/admin/login') { setAuthed(true); return }
    fetch('/api/admin/verify').then(r => r.json()).then(d => {
      if (!d.authed) router.push('/admin/login')
      else setAuthed(true)
    }).catch(() => router.push('/admin/login'))
  }, [pathname, router])

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') return children
  if (!authed) return <div className="min-h-screen bg-black flex items-center justify-center text-white/60">Unlocking the veil...</div>

  const nav = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/categories', label: 'Categories', icon: Tag },
    { href: '/admin/hero', label: 'Hero Builder', icon: LayoutTemplate },
    { href: '/admin/branding', label: 'Branding', icon: Palette },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-64 border-r border-white/10 bg-black/80 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#ff1177] animate-pulse-glow"/>
            <span className="font-display text-xl"><span className="neon-pink">Hex</span><span className="neon-blue">pose</span> Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(n => {
            const active = pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href))
            return (
              <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${active ? 'bg-[#ff1177]/15 border border-[#ff1177]/40 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
                <n.icon className="h-4 w-4"/> {n.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Button variant="outline" onClick={logout} className="w-full border-white/15 hover:bg-white/10"><LogOut className="h-4 w-4 mr-2"/> Logout</Button>
          <Link href="/" className="block mt-2 text-center text-xs text-white/50 hover:text-white">View storefront →</Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="md:hidden sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/10 p-3 flex items-center justify-between">
          <Link href="/admin" className="font-display text-lg"><span className="neon-pink">Hex</span><span className="neon-blue">pose</span> Admin</Link>
          <Button size="sm" variant="outline" onClick={logout} className="border-white/15">Logout</Button>
        </div>
        <div className="md:hidden flex overflow-x-auto no-scrollbar gap-2 p-3 border-b border-white/10">
          {nav.map(n => {
            const active = pathname === n.href
            return <Link key={n.href} href={n.href} className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap ${active ? 'bg-[#ff1177] text-white' : 'bg-white/5 text-white/70'}`}>{n.label}</Link>
          })}
        </div>
        <div className="p-6 md:p-10 max-w-6xl">{children}</div>
      </main>
    </div>
  )
}
