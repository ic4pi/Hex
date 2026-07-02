'use client'
import { useEffect, useMemo, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import ProductCard from '@/components/product-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, LayoutGrid, List } from 'lucide-react'

function ShopInner() {
  const params = useSearchParams()
  const initialCat = params.get('category') || 'all'
  const [category, setCategory] = useState(initialCat)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('featured')
  const [layout, setLayout] = useState('grid')
  const [products, setProducts] = useState([])
  const [cats, setCats] = useState([])
  const [branding, setBranding] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 12

  useEffect(() => { fetch('/api/products').then(r => r.json()).then(setProducts) }, [])
  useEffect(() => { fetch('/api/categories').then(r => r.json()).then(setCats) }, [])
  useEffect(() => { fetch('/api/branding').then(r => r.json()).then(setBranding) }, [])

  const filtered = useMemo(() => {
    let list = [...products]
    if (category !== 'all') list = list.filter(p => p.category === category)
    if (q) list = list.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    else if (sort === 'newest') list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    else if (sort === 'bestselling') list.sort((a, b) => Number(b.bestseller) - Number(a.bestseller))
    else list.sort((a, b) => Number(b.featured) - Number(a.featured))
    return list
  }, [products, category, q, sort])

  const paged = filtered.slice((page - 1) * perPage, page * perPage)
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))

  return (
    <div className="min-h-screen bg-black">
      <SiteNavbar branding={branding}/>
      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 grad-cyber opacity-70"/>
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16">
          <p className="neon-pink uppercase tracking-widest text-xs">The Apothecary</p>
          <h1 className="font-display text-4xl md:text-5xl mt-3">Shop the Ritual</h1>
          <p className="text-white/60 mt-2 max-w-xl">Curated spell jars, apparel, and ceremonial essentials.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 md:items-center mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"/>
            <Input value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="Search rituals..." className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"/>
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1) }}>
            <SelectTrigger className="w-full md:w-52 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Category"/></SelectTrigger>
            <SelectContent className="bg-black border-white/10 text-white">
              <SelectItem value="all">All Categories</SelectItem>
              {cats.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-52 bg-white/5 border-white/10 text-white"><SelectValue placeholder="Sort"/></SelectTrigger>
            <SelectContent className="bg-black border-white/10 text-white">
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
              <SelectItem value="bestselling">Best Selling</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className={`border-white/15 ${layout==='grid' ? 'bg-white/10' : ''}`} onClick={() => setLayout('grid')}><LayoutGrid className="h-4 w-4"/></Button>
            <Button variant="outline" size="icon" className={`border-white/15 ${layout==='list' ? 'bg-white/10' : ''}`} onClick={() => setLayout('list')}><List className="h-4 w-4"/></Button>
          </div>
        </div>

        {paged.length === 0 ? (
          <div className="text-center py-24 text-white/50">No products match your search.</div>
        ) : layout === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {paged.map(p => <ProductCard key={p.id} product={p}/>)}
          </div>
        ) : (
          <div className="space-y-3">
            {paged.map(p => (
              <div key={p.id} className="glass rounded-xl p-4 flex gap-4 items-center">
                <div className="w-24 h-24 rounded-md overflow-hidden bg-white/5 flex-shrink-0">
                  {p.hero_image ? <img src={p.hero_image} className="w-full h-full object-cover"/> : <div className="w-full h-full placeholder-jar-love"/>}
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-widest text-white/50">{p.category}</p>
                  <h3 className="font-display text-lg">{p.name}</h3>
                  <p className="text-white/60 text-sm mt-1 line-clamp-1">{p.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">${p.price?.toFixed(2)}</p>
                  <Button asChild size="sm" className="mt-2 bg-[#ff1177] hover:bg-[#ff1177]/90"><a href={`/product/${p.slug}`}>View</a></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button key={i} variant={page === i + 1 ? 'default' : 'outline'} onClick={() => setPage(i + 1)} className={page === i + 1 ? 'bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink' : 'border-white/15'}>{i + 1}</Button>
            ))}
          </div>
        )}
      </div>
      <SiteFooter branding={branding}/>
    </div>
  )
}

export default function ShopPage() {
  return <Suspense fallback={<div className="min-h-screen bg-black"/>}><ShopInner/></Suspense>
}
