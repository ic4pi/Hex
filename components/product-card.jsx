'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/components/cart-provider'
import { Button } from '@/components/ui/button'
import { ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'

const placeholderClass = (slug='') => {
  if (slug.includes('protection')) return 'placeholder-jar-protect'
  if (slug.includes('prosperity')) return 'placeholder-jar-prosper'
  if (slug.includes('love')) return 'placeholder-jar-love'
  return 'bg-gradient-to-br from-white/5 to-black'
}

export default function ProductCard({ product }) {
  const { add } = useCart()
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="group">
      <Link href={`/product/${product.slug}`} className="block glass rounded-xl overflow-hidden relative hover:border-[#ff1177]/40 transition-all">
        <div className={`aspect-[4/5] w-full relative overflow-hidden ${!product.hero_image ? placeholderClass(product.slug) : ''}`}>
          {product.hero_image ? (
            <img src={product.hero_image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="font-display text-lg text-white/80 text-center px-4">{product.name}</div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {product.new_arrival && <Badge className="bg-[#3ea6ff] hover:bg-[#3ea6ff] text-white glow-blue">New</Badge>}
            {product.bestseller && <Badge className="bg-[#ffb347] hover:bg-[#ffb347] text-black">Bestseller</Badge>}
            {product.limited_edition && <Badge className="bg-[#c9a8ff] hover:bg-[#c9a8ff] text-black">Limited</Badge>}
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" onClick={(e) => { e.preventDefault(); add(product); toast.success('Added to cart') }} className="w-full bg-[#ff1177] hover:bg-[#ff1177]/90 glow-pink">
              <ShoppingBag className="h-4 w-4 mr-2"/> Add to Cart
            </Button>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs uppercase tracking-widest text-white/50">{product.category}</p>
          <h3 className="mt-1 font-display text-lg text-white group-hover:neon-pink transition-all">{product.name}</h3>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-white font-medium">${product.price?.toFixed(2)}</span>
            {product.compare_at_price > product.price && (
              <span className="text-white/40 line-through text-sm">${product.compare_at_price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
