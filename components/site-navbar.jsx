'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ShoppingBag, Menu, X, Search, Sparkles } from 'lucide-react'
import { useCart } from '@/components/cart-provider'
import { Button } from '@/components/ui/button'
import CartDrawer from '@/components/cart-drawer'

export default function SiteNavbar({ branding }) {
  const { count, setOpen } = useCart()
  const [mobile, setMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [announce, setAnnounce] = useState('')
  useEffect(() => {
    setAnnounce(branding?.announcement_banner || '')
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [branding])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/shop', label: 'Shop' },
    { href: '/shop?category=spell-jars', label: 'Spell Jars' },
    { href: '/shop?category=apparel', label: 'Apparel' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <>
      {announce && (
        <div className="w-full text-center text-xs py-2 bg-gradient-to-r from-[#ff1177]/30 via-[#3ea6ff]/20 to-[#c9a8ff]/30 border-b border-white/10">
          <span className="tracking-widest uppercase text-white/90">{announce}</span>
        </div>
      )}
      <header className={`sticky top-0 z-40 transition-all ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="h-5 w-5 text-[#ff1177] animate-pulse-glow" />
            <span className="font-display text-xl md:text-2xl tracking-wider">
              <span className="neon-pink">Hex</span><span className="neon-blue">pose</span><span className="text-white">!</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {links.map(l => (
              <Link key={l.href} href={l.href} className="text-sm text-white/80 hover:text-white transition-colors relative group">
                {l.label}
                <span className="absolute left-0 -bottom-1 h-px w-0 group-hover:w-full bg-gradient-to-r from-[#ff1177] to-[#3ea6ff] transition-all" />
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={() => setOpen(true)}>
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -mt-4 ml-4 text-[10px] bg-[#ff1177] text-white rounded-full h-4 min-w-4 px-1 flex items-center justify-center glow-pink">{count}</span>
              )}
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10" onClick={() => setMobile(v => !v)}>
              {mobile ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
            </Button>
          </div>
        </div>
        {mobile && (
          <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-xl">
            <div className="px-4 py-4 flex flex-col gap-3">
              {links.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMobile(false)} className="text-white/85 hover:text-white py-1">{l.label}</Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <CartDrawer />
    </>
  )
}
