'use client'
import { useEffect, useState } from 'react'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  { q: 'Do the spell jars really work?', a: 'Every jar is ritual-blessed with focused intention. Whether the magic is external or catalyzed within you — the effect is real to those who commit.' },
  { q: 'How do I use my spell jar?', a: 'Do not open it. Place it on your altar, nightstand, or workspace. Speak your intention aloud once a day for the ritual duration listed on the product page.' },
  { q: 'How long does shipping take?', a: 'Orders ship within 3–5 business days. Domestic delivery: 3–7 days. International: 10–20 days.' },
  { q: 'Are the ingredients safe?', a: 'For spiritual use only. Do not ingest. Keep away from children, pets, and open flames.' },
  { q: 'Can I customize a jar?', a: 'Yes — for larger orders and bespoke rituals, please contact us with details of your intention.' },
  { q: 'What is your return policy?', a: 'Due to the personal nature of ritual products, all sales are final. Damaged items are replaced within 14 days.' },
  { q: 'Do you offer wholesale?', a: 'Absolutely. Reach out via the contact form with your business details.' },
]

export default function FAQPage() {
  const [branding, setBranding] = useState(null)
  useEffect(() => { fetch('/api/branding').then(r => r.json()).then(setBranding) }, [])
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar branding={branding}/>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-16">
        <p className="neon-pink uppercase tracking-widest text-xs text-center">Questions Answered</p>
        <h1 className="font-display text-4xl md:text-5xl mt-3 text-center">FAQ</h1>
        <Accordion type="single" collapsible className="mt-10 space-y-2">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`} className="glass rounded-xl px-5 border-white/10">
              <AccordionTrigger className="text-left hover:no-underline text-white">{f.q}</AccordionTrigger>
              <AccordionContent className="text-white/70 leading-relaxed">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <SiteFooter branding={branding}/>
    </div>
  )
}
