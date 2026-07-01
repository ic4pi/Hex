'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import ParticleBG from '@/components/particle-bg'
import ProductCard from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Moon, Flame, Wand2, Stars, ChevronRight, Instagram } from 'lucide-react'

export default function Home() {
  const [hero, setHero] = useState(null)
  const [products, setProducts] = useState([])
  const [branding, setBranding] = useState(null)

  useEffect(() => {
    fetch('/api/hero').then(r => r.json()).then(setHero).catch(() => {})
    fetch('/api/products').then(r => r.json()).then(setProducts).catch(() => {})
    fetch('/api/branding').then(r => r.json()).then(setBranding).catch(() => {})
  }, [])

  const featured = products.filter(p => p.featured).slice(0, 8)
  const spellJars = products.filter(p => p.category === 'spell-jars').slice(0, 3)
  const apparel = products.filter(p => p.category === 'apparel').slice(0, 4)

  const glow = hero?.glow_color || '#ff1177'

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar branding={branding} />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {hero?.background_image && (
            <img src={hero.background_image} alt="" className="w-full h-full object-cover opacity-60"/>
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"/>
          <div className="absolute inset-0 grad-cyber"/>
        </div>
        <ParticleBG density={80} />
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-24 md:py-36 min-h-[70vh] flex flex-col items-center text-center">
          {hero?.promo_badge && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <Badge className="mb-6 bg-black/60 border border-white/20 text-white/90 px-4 py-1.5 rounded-full uppercase tracking-widest text-[11px]">
                <Sparkles className="h-3 w-3 mr-2" style={{ color: glow }}/>
                {hero.promo_badge}
              </Badge>
            </motion.div>
          )}
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl">
            {hero?.headline?.split(' ').map((w, i) => (
              <span key={i} className={i % 3 === 1 ? 'neon-pink' : i % 3 === 2 ? 'neon-blue' : 'text-white'}> {w} </span>
            )) || 'Modern Witchcraft, Handcrafted with Intention'}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }} className="mt-6 text-base md:text-lg text-white/70 max-w-2xl">
            {hero?.subheadline}
          </motion.p>
          {hero?.promo_text && (
            <p className="mt-4 text-sm neon-gold uppercase tracking-widest">{hero.promo_text}</p>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild className="h-12 px-8 text-base bg-[#ff1177] hover:bg-[#ff1177]/90 text-white glow-pink" style={{ boxShadow: `0 0 24px ${glow}66, 0 0 48px ${glow}33` }}>
              <Link href={hero?.primary_cta?.href || '/shop'}>{hero?.primary_cta?.label || 'Shop the Ritual'} <ChevronRight className="h-4 w-4 ml-1"/></Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 text-base border-white/25 hover:bg-white/10 text-white bg-transparent">
              <Link href={hero?.secondary_cta?.href || '/shop?category=spell-jars'}>{hero?.secondary_cta?.label || 'Explore Spell Jars'}</Link>
            </Button>
          </motion.div>

          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl">
            {[{ icon: Moon, label: 'Moon-Charged' }, { icon: Flame, label: 'Ritual-Blessed' }, { icon: Wand2, label: 'Small-Batch' }, { icon: Stars, label: 'Ethically Sourced' }].map((f, i) => (
              <div key={i} className="glass rounded-lg py-3 px-4 flex items-center gap-2 justify-center">
                <f.icon className="h-4 w-4" style={{ color: glow }}/>
                <span className="text-xs uppercase tracking-widest text-white/80">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="hex-divider"/>
      </section>

      {/* FEATURED PRODUCTS */}
      <Section title="Featured Rituals" subtitle="Handpicked for the season" accent="pink">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* SPELL JARS */}
      <Section title="Signature Spell Jars" subtitle="Sealed magic. Uncapped intention." accent="blue">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {spellJars.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* APPAREL */}
      <Section title="Cyber-Occult Apparel" subtitle="Wear the witchcraft" accent="lav">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {apparel.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </Section>

      {/* BRAND STORY */}
      <section className="relative py-24 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="neon-pink uppercase tracking-widest text-xs mb-4">Our Story</p>
            <h2 className="font-display text-3xl md:text-5xl leading-tight">A boutique where the <span className="neon-blue">ancient</span> meets the <span className="neon-pink">neon</span>.</h2>
            <p className="mt-6 text-white/70 leading-relaxed">
              Hexpose! is a modern coven of makers, curators, and rebels reimagining witchcraft for the luminous era.
              Every jar is hand-blended in small batches. Every garment is printed with intention. Every ritual, elevated.
            </p>
            <Button asChild variant="outline" className="mt-8 border-white/25 hover:bg-white/10">
              <Link href="/about">Read the grimoire</Link>
            </Button>
          </div>
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden glass">
            <img src="https://images.unsplash.com/photo-1615381034338-0ce3a8d47866?fm=jpg&q=60&w=1200&auto=format&fit=crop" alt="brand" className="w-full h-full object-cover opacity-90"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"/>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <Section title="From the Coven" subtitle="Whispers of transformation" accent="gold">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { q: 'The Protection jar felt real. My apartment finally exhaled.', a: '— Luna R.' },
            { q: 'Prosperity jar and a raise in the same month. Coincidence? I think not.', a: '— Marcus V.' },
            { q: 'The Hexpose tee glows under my studio lights. Compliments every set.', a: '— Iris K.' },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="glass rounded-xl p-6">
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, s) => <Stars key={s} className="h-4 w-4 neon-gold"/>)}</div>
              <p className="text-white/85 italic leading-relaxed">“{t.q}”</p>
              <p className="mt-4 text-sm text-white/50">{t.a}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* INSTAGRAM PLACEHOLDER */}
      <section className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-white/50">Follow the coven</p>
              <h3 className="font-display text-2xl md:text-3xl">@hexpose on Instagram</h3>
            </div>
            <a href="#" className="text-white/70 hover:text-white flex items-center gap-2"><Instagram className="h-4 w-4"/> Follow</a>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              'https://images.unsplash.com/photo-1617171073885-7a17050d0992?fm=jpg&q=60&w=400',
              'https://plus.unsplash.com/premium_photo-1667105168041-3fad1d08b58b?fm=jpg&q=60&w=400',
              'https://images.unsplash.com/photo-1615381034338-0ce3a8d47866?fm=jpg&q=60&w=400',
              'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?fm=jpg&q=60&w=400',
              'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?fm=jpg&q=60&w=400',
              'https://images.unsplash.com/photo-1562135291-7728cc647783?fm=jpg&q=60&w=400',
            ].map((src, i) => (
              <div key={i} className="aspect-square rounded-md overflow-hidden group relative">
                <img src={src} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <Instagram className="h-4 w-4 text-white"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter branding={branding}/>
    </div>
  )
}

function Section({ title, subtitle, accent = 'pink', children }) {
  const cls = accent === 'pink' ? 'neon-pink' : accent === 'blue' ? 'neon-blue' : accent === 'lav' ? 'neon-lav' : 'neon-gold'
  return (
    <section className="py-16 md:py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-10 text-center">
          <p className={`text-xs uppercase tracking-[0.3em] ${cls}`}>{subtitle}</p>
          <h2 className="font-display text-3xl md:text-4xl mt-3">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  )
}
