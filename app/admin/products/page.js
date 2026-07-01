'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Pencil, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [q, setQ] = useState('')
  const load = () => fetch('/api/products?all=1').then(r => r.json()).then(setProducts)
  useEffect(() => { load() }, [])

  const del = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    if (r.ok) { toast.success('Deleted'); load() }
    else toast.error('Failed to delete')
  }

  const filtered = q ? products.filter(p => p.name.toLowerCase().includes(q.toLowerCase())) : products

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <p className="neon-pink uppercase tracking-widest text-xs">Catalog</p>
          <h1 className="font-display text-4xl mt-2">Products</h1>
        </div>
        <Button asChild className="bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink"><Link href="/admin/products/new"><Plus className="h-4 w-4 mr-2"/> New Product</Link></Button>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search products..." className="pl-9 bg-white/5 border-white/10 max-w-md"/>
      </div>
      <div className="glass rounded-xl overflow-hidden">
        <div className="hidden md:grid grid-cols-12 text-xs uppercase tracking-widest text-white/50 px-5 py-3 border-b border-white/10">
          <div className="col-span-5">Product</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-white/50">No products.</div>
        ) : filtered.map(p => (
          <div key={p.id} className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 px-5 py-4 border-b border-white/5">
            <div className="col-span-5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                {p.hero_image ? <img src={p.hero_image} className="w-full h-full object-cover"/> : <div className="w-full h-full placeholder-jar-love"/>}
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-xs text-white/50">{p.sku || '—'}</p>
              </div>
            </div>
            <div className="col-span-2 text-white/70 text-sm capitalize">{p.category}</div>
            <div className="col-span-1 text-sm">${p.price?.toFixed(2)}</div>
            <div className="col-span-2 flex gap-1 flex-wrap">
              {p.active ? <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">Active</Badge> : <Badge className="bg-white/10 text-white/60">Draft</Badge>}
              {p.featured && <Badge className="bg-[#ff1177]/20 text-[#ff1177] border border-[#ff1177]/30">Featured</Badge>}
            </div>
            <div className="col-span-2 flex justify-end gap-1">
              <Button asChild size="icon" variant="ghost"><Link href={`/product/${p.slug}`} target="_blank"><Eye className="h-4 w-4"/></Link></Button>
              <Button asChild size="icon" variant="ghost"><Link href={`/admin/products/${p.id}`}><Pencil className="h-4 w-4"/></Link></Button>
              <Button size="icon" variant="ghost" onClick={() => del(p.id)} className="hover:text-red-400"><Trash2 className="h-4 w-4"/></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
