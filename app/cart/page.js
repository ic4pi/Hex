'use client'
import { useEffect, useState } from 'react'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/components/cart-provider'
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function CartPage() {
  const [branding, setBranding] = useState(null)
  const [checkingOut, setCheckingOut] = useState(false)
  const { items, remove, setQty, subtotal } = useCart()

  const handleCheckout = async () => {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: items.map(i => ({ id: i.id, qty: i.qty })) }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Checkout failed. Please try again.')
        setCheckingOut(false)
      }
    } catch {
      toast.error('Checkout failed. Please try again.')
      setCheckingOut(false)
    }
  }
  useEffect(() => { fetch('/api/branding').then(r => r.json()).then(d => { if (d && !d.error) setBranding(d) }) }, [])
  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar branding={branding}/>
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-14">
        <h1 className="font-display text-4xl md:text-5xl">Your Grimoire</h1>
        <p className="text-white/60 mt-2">Review your ritual selections.</p>
        <div className="mt-10 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-3">
            {items.length === 0 ? (
              <div className="glass rounded-2xl p-14 text-center">
                <ShoppingBag className="h-10 w-10 mx-auto text-white/40 mb-4"/>
                <p className="text-white/60">Your cart is empty.</p>
                <Button asChild className="mt-6 bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink"><Link href="/shop">Explore the shop</Link></Button>
              </div>
            ) : items.map(i => (
              <div key={i.id} className="glass rounded-xl p-4 flex gap-4 items-center">
                <div className="w-20 h-20 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                  {i.image ? <img src={i.image} className="w-full h-full object-cover"/> : <div className="w-full h-full placeholder-jar-love"/>}
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${i.slug}`} className="font-display text-lg hover:neon-pink">{i.name}</Link>
                  <p className="text-white/50 text-sm">${i.price?.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="icon" variant="outline" className="h-8 w-8 border-white/15" onClick={() => setQty(i.id, i.qty - 1)}><Minus className="h-3 w-3"/></Button>
                  <span className="w-8 text-center">{i.qty}</span>
                  <Button size="icon" variant="outline" className="h-8 w-8 border-white/15" onClick={() => setQty(i.id, i.qty + 1)}><Plus className="h-3 w-3"/></Button>
                </div>
                <div className="text-right w-24">
                  <p className="font-medium">${(i.price * i.qty).toFixed(2)}</p>
                  <button className="text-xs text-white/50 hover:text-red-400 flex items-center gap-1 ml-auto mt-1" onClick={() => remove(i.id)}><Trash2 className="h-3 w-3"/> Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h3 className="font-display text-xl">Order Summary</h3>
              <Separator className="my-4 bg-white/10"/>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/60">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-white/60">Shipping</span><span className="text-white/60">Calculated at checkout</span></div>
              </div>
              <Separator className="my-4 bg-white/10"/>
              <div className="flex justify-between font-medium text-lg"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
              <Button
                disabled={items.length === 0 || checkingOut}
                className="mt-5 w-full bg-gradient-to-r from-[#ff1177] to-[#3ea6ff] hover:opacity-90 glow-pink text-white h-11"
                onClick={handleCheckout}
              >
                {checkingOut ? <><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Redirecting to Stripe...</> : 'Checkout via Stripe'}
              </Button>
              <p className="text-[10px] text-white/40 mt-3 text-center">Secure checkout powered by Stripe.</p>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter branding={branding}/>
    </div>
  )
}
