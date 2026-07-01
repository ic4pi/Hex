'use client'
import { useEffect, useState } from 'react'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import ParticleBG from '@/components/particle-bg'
import { Sparkles, Moon, Feather, Stars } from 'lucide-react'

export default function AboutPage() {
  const [branding, setBranding] = useState(null)
  useEffect(() => { fetch('/api/branding').then(r => r.json()).then(setBranding) }, [])
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar branding={branding}/>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 grad-cyber"/>
        <ParticleBG density={50}/>
        <div className="relative max-w-4xl mx-auto px-4 md:px-6 py-24 text-center">
          <p className="neon-pink uppercase tracking-widest text-xs">Our Grimoire</p>
          <h1 className="font-display text-4xl md:text-6xl mt-4">A modern coven for the <span className="neon-blue">luminous era</span>.</h1>
          <p className="mt-6 text-white/70 text-lg leading-relaxed">Hexpose! is a boutique apothecary where ancient ritual meets neon-lit modernity. We hand-craft small-batch spell jars, ceremonial apparel, and enchanted essentials for the seekers, the rebels, and the softly magical.</p>
        </div>
      </section>
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-20 grid md:grid-cols-4 gap-6">
        {[
          { icon: Sparkles, title: 'Intention', text: 'Every product is charged in ritual before it leaves our altar.' },
          { icon: Moon, title: 'Moon-Timed', text: 'Batches are made under the phases that match their purpose.' },
          { icon: Feather, title: 'Ethical', text: 'Herbs, crystals, and materials sourced with respect.' },
          { icon: Stars, title: 'Elevated', text: 'Design-forward, luxurious, and mysterious — no cheesy Halloween aesthetic.' },
        ].map((v, i) => (
          <div key={i} className="glass rounded-xl p-6">
            <v.icon className="h-6 w-6 neon-pink mb-3"/>
            <h3 className="font-display text-lg">{v.title}</h3>
            <p className="text-white/60 mt-2 text-sm leading-relaxed">{v.text}</p>
          </div>
        ))}
      </section>
      <section className="max-w-4xl mx-auto px-4 md:px-6 pb-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl">Founded by witches. Built for witches.</h2>
        <p className="mt-4 text-white/70 leading-relaxed">We believe magic is a design language. Our packaging, our web, our jars — everything is a spell.</p>
      </section>
      <SiteFooter branding={branding}/>
    </div>
  )
}
