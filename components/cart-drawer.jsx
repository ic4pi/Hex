'use client'
import { useCart } from '@/components/cart-provider'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'

export default function CartDrawer() {
  const { open, setOpen, items, remove, setQty, subtotal } = useCart()
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="bg-black/95 border-l border-white/10 text-white w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-white font-display text-2xl">Your Grimoire</SheetTitle>
        </SheetHeader>
        <div className="mt-6 flex flex-col h-[calc(100vh-160px)]">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/60">
              <ShoppingBag className="h-10 w-10 mb-4 opacity-50"/>
              <p>Your cart is empty.</p>
              <Button asChild className="mt-6 bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink">
                <Link href="/shop" onClick={() => setOpen(false)}>Explore the shop</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto space-y-4 pr-1">
                {items.map(i => (
                  <div key={i.id} className="flex gap-3 glass rounded-lg p-3">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                      {i.image ? <img src={i.image} alt={i.name} className="w-full h-full object-cover"/> : <div className="w-full h-full placeholder-jar-love"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{i.name}</p>
                      <p className="text-xs text-white/60">${i.price?.toFixed(2)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-7 w-7 border-white/20" onClick={() => setQty(i.id, i.qty - 1)}><Minus className="h-3 w-3"/></Button>
                        <span className="text-sm w-6 text-center">{i.qty}</span>
                        <Button size="icon" variant="outline" className="h-7 w-7 border-white/20" onClick={() => setQty(i.id, i.qty + 1)}><Plus className="h-3 w-3"/></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-white/60 hover:text-red-400" onClick={() => remove(i.id)}><Trash2 className="h-3 w-3"/></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <Button asChild variant="outline" className="w-full border-white/20 hover:bg-white/10">
                  <Link href="/cart" onClick={() => setOpen(false)}>View full cart</Link>
                </Button>
                <Button className="w-full bg-gradient-to-r from-[#ff1177] to-[#3ea6ff] hover:opacity-90 text-white glow-pink" onClick={() => alert('Stripe checkout coming in Module 2')}>Checkout (Stripe)</Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
