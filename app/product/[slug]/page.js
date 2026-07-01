'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import SiteNavbar from '@/components/site-navbar'
import SiteFooter from '@/components/site-footer'
import ProductCard from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/components/cart-provider'
import { Moon, Flame, Wand2, Stars, Sparkles, Share2, Heart, ShoppingBag, Minus, Plus, Info, Leaf, Gem, Sun } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

const placeholderClass = (slug='') => {
  if (slug.includes('protection')) return 'placeholder-jar-protect'
  if (slug.includes('prosperity')) return 'placeholder-jar-prosper'
  if (slug.includes('love')) return 'placeholder-jar-love'
  return 'bg-gradient-to-br from-white/5 to-black'
}

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [branding, setBranding] = useState(null)
  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)
  const { add } = useCart()

  useEffect(() => {
    if (!slug) return
    fetch(`/api/products/slug/${slug}`).then(r => r.json()).then(setProduct)
    fetch('/api/branding').then(r => r.json()).then(setBranding)
    fetch('/api/products').then(r => r.json()).then(all => setRelated(all))
  }, [slug])

  const gallery = product ? [product.hero_image, ...(product.gallery_images || [])].filter(Boolean) : []
  const currentImg = gallery[imgIdx]

  if (!product) return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar branding={branding}/>
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="h-8 w-40 bg-white/5 rounded animate-pulse"/>
        <div className="mt-6 h-96 bg-white/5 rounded-xl animate-pulse"/>
      </div>
    </div>
  )

  const rel = related.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4)
  const s = product.spell || {}

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteNavbar branding={branding}/>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-14">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className={`relative aspect-square rounded-2xl overflow-hidden glass ${!currentImg ? placeholderClass(product.slug) : ''}`}>
              {currentImg ? (
                <motion.img key={imgIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} src={currentImg} alt={product.name} className="w-full h-full object-cover"/>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-6">
                    <Sparkles className="h-8 w-8 mx-auto animate-pulse-glow" style={{ color: '#ff1177' }}/>
                    <p className="font-display text-2xl mt-4">{product.name}</p>
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {product.new_arrival && <Badge className="bg-[#3ea6ff] text-white glow-blue">New</Badge>}
                {product.bestseller && <Badge className="bg-[#ffb347] text-black">Bestseller</Badge>}
                {product.limited_edition && <Badge className="bg-[#c9a8ff] text-black">Limited Edition</Badge>}
              </div>
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {gallery.map((g, i) => (
                  <button key={i} onClick={() => setImgIdx(i)} className={`aspect-square rounded-md overflow-hidden border ${i === imgIdx ? 'border-[#ff1177]' : 'border-white/10'}`}>
                    <img src={g} className="w-full h-full object-cover"/>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50">{product.category}</p>
            <h1 className="font-display text-3xl md:text-5xl mt-2">{product.name}</h1>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl font-medium">${product.price?.toFixed(2)}</span>
              {product.compare_at_price > product.price && (
                <span className="text-white/40 line-through">${product.compare_at_price.toFixed(2)}</span>
              )}
              <Badge className="ml-2 bg-white/10 text-white border-white/10">{product.inventory > 0 ? `${product.inventory} in stock` : 'Sold out'}</Badge>
            </div>
            <p className="text-white/70 mt-5 leading-relaxed">{product.description}</p>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-white/15 rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4"/></Button>
                <span className="w-10 text-center">{qty}</span>
                <Button variant="ghost" size="icon" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4"/></Button>
              </div>
              <Button onClick={() => { add(product, qty); toast.success('Added to cart') }} className="flex-1 h-11 bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink">
                <ShoppingBag className="h-4 w-4 mr-2"/> Add to Cart
              </Button>
              <Button variant="outline" size="icon" className="h-11 w-11 border-white/15"><Heart className="h-4 w-4"/></Button>
              <Button variant="outline" size="icon" className="h-11 w-11 border-white/15" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied') }}><Share2 className="h-4 w-4"/></Button>
            </div>

            {product.spell && (
              <div className="mt-8 glass rounded-2xl p-5">
                <p className="neon-pink uppercase text-xs tracking-widest mb-3">Spell Metadata</p>
                <div className="grid grid-cols-2 gap-3">
                  <MetaItem icon={Sparkles} label="Intention" value={s.magical_intention}/>
                  <MetaItem icon={Moon} label="Moon Phase" value={s.moon_phase}/>
                  <MetaItem icon={Sun} label="Planet" value={s.planet}/>
                  <MetaItem icon={Stars} label="Zodiac" value={s.zodiac}/>
                  <MetaItem icon={Wand2} label="Element" value={s.element}/>
                  <MetaItem icon={Flame} label="Chakra" value={s.chakra}/>
                  <MetaItem icon={Gem} label="Crystal" value={s.crystal}/>
                  <MetaItem icon={Leaf} label="Herbs" value={s.herbs}/>
                  <MetaItem icon={Flame} label="Candle Color" value={s.candle_color}/>
                  <MetaItem icon={Info} label="Duration" value={s.ritual_duration}/>
                  <MetaItem icon={Info} label="Difficulty" value={s.difficulty}/>
                  <MetaItem icon={Info} label="Energy Level" value={s.energy_level}/>
                </div>
                <Separator className="my-5 bg-white/10"/>
                <div className="space-y-3 text-sm">
                  {s.ingredients && <p><span className="text-white/50 uppercase text-xs tracking-widest mr-2">Ingredients:</span><span className="text-white/85">{s.ingredients}</span></p>}
                  {s.care_instructions && <p><span className="text-white/50 uppercase text-xs tracking-widest mr-2">Care:</span><span className="text-white/85">{s.care_instructions}</span></p>}
                  {s.safety_disclaimer && <p className="text-white/60 italic">⚠ {s.safety_disclaimer}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rich Description */}
        {product.rich_description && (
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl mb-4 text-center">The Ritual</h2>
            <p className="text-white/70 leading-relaxed text-lg text-center">{product.rich_description}</p>
          </div>
        )}

        {/* Related */}
        {rel.length > 0 && (
          <div className="mt-20">
            <h3 className="font-display text-2xl mb-6">You may also love</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rel.map(p => <ProductCard key={p.id} product={p}/>)}
            </div>
          </div>
        )}
      </div>
      <SiteFooter branding={branding}/>
    </div>
  )
}

function MetaItem({ icon: Icon, label, value }) {
  const isArr = Array.isArray(value)
  if (!value || (isArr && value.length === 0)) return null
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-[#ff1177] mt-0.5 flex-shrink-0"/>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-white/40">{label}</p>
        {isArr ? (
          <div className="flex flex-wrap gap-1 mt-1">
            {value.map((v, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/90">{v}</span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/90 break-words">{value}</p>
        )}
      </div>
    </div>
  )
}
