'use client'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartCtx = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [open, setOpen] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hexpose_cart')
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try { localStorage.setItem('hexpose_cart', JSON.stringify(items)) } catch {}
  }, [items, hydrated])

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex(p => p.id === product.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: next[idx].qty + qty }
        return next
      }
      return [...prev, { id: product.id, name: product.name, slug: product.slug, price: product.price, image: product.hero_image, qty }]
    })
    setOpen(true)
  }
  const remove = (id) => setItems(prev => prev.filter(p => p.id !== id))
  const setQty = (id, qty) => setItems(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, qty) } : p))
  const clear = () => setItems([])

  const { count, subtotal } = useMemo(() => {
    const count = items.reduce((s, i) => s + i.qty, 0)
    const subtotal = items.reduce((s, i) => s + i.qty * (i.price || 0), 0)
    return { count, subtotal }
  }, [items])

  return (
    <CartCtx.Provider value={{ items, add, remove, setQty, clear, count, subtotal, open, setOpen }}>
      {children}
    </CartCtx.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
