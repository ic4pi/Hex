'use client'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react'
import { useCart } from '@/components/cart-provider'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clear } = useCart()

  useEffect(() => {
    if (sessionId) clear()
  }, [sessionId])

  return (
    <>
      <div className="flex justify-center mb-6">
        <div className="relative">
          <CheckCircle2 className="h-20 w-20 text-[#ff1177]" />
          <Sparkles className="h-6 w-6 text-[#3ea6ff] absolute -top-1 -right-1 animate-pulse" />
        </div>
      </div>
      <h1 className="font-display text-4xl md:text-5xl mb-4">
        <span className="neon-pink">Your ritual</span> is sealed.
      </h1>
      <p className="text-white/70 text-lg mb-2">
        Order confirmed — the universe received your intention.
      </p>
      <p className="text-white/50 text-sm mb-8">
        A confirmation email is on its way. Your items will be handcrafted and shipped with care.
      </p>
      {sessionId && (
        <p className="text-xs text-white/30 mb-8 font-mono break-all">
          ref: {sessionId}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild className="bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink">
          <Link href="/shop"><ShoppingBag className="h-4 w-4 mr-2" />Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </>
  )
}

export default function OrderSuccessPage() {
  const [branding, setBranding] = useState(null)

  useEffect(() => {
    fetch('/api/branding').then(r => r.json()).then(d => { if (d && !d.error) setBranding(d) })
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar branding={branding} />
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="glass rounded-3xl p-12">
          <Suspense fallback={<p className="text-white/50">Loading...</p>}>
            <OrderSuccessContent />
          </Suspense>
        </div>
      </div>
      <SiteFooter branding={branding} />
    </div>
  )
}
