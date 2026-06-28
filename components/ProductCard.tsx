'use client'

import Image from 'next/image'
import type { Product } from '@/lib/products'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const handleBuy = () => {
    if (product.stripeLink) {
      window.open(product.stripeLink, '_blank', 'noopener,noreferrer')
    }
  }

  const categoryColor = {
    spell: '#ff2d78',
    apothecary: '#00c8ff',
    apparel: '#9d00ff',
  }[product.category]

  const subcategoryTag =
    product.subcategory.includes('Banishing') ? '🔒 Banishing' :
    product.subcategory.includes('Confidence') || product.subcategory.includes('Empower') ? '⚡ Empowerment' :
    product.subcategory.includes('Justice') || product.subcategory.includes('Ritual') ? '⚖ Justice' :
    product.subcategory.includes('Chakra') ? '✦ Chakra' :
    product.subcategory.includes('Bundled') || product.subcategory.includes('Bundle') ? '📦 Bundle' :
    product.subcategory.includes('Apparel') ? '👕 Apparel' :
    `✧ ${product.subcategory}`

  return (
    <div className="product-card rounded-lg overflow-hidden flex flex-col group relative">
      {/* Image area */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '1/1', background: 'rgba(13,0,25,0.9)' }}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <PlaceholderImage category={product.category} />
        )}

        {/* Overlay gradient on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, transparent 50%, rgba(255,45,120,0.15) 100%)',
          }}
        />

        {/* Category tag */}
        <div
          className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded"
          style={{
            color: categoryColor,
            border: `1px solid ${categoryColor}`,
            background: 'rgba(0,0,0,0.7)',
            textShadow: `0 0 8px ${categoryColor}`,
            boxShadow: `0 0 6px ${categoryColor}40`,
            backdropFilter: 'blur(4px)',
          }}
        >
          {subcategoryTag}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3
          className="product-name font-bold tracking-widest uppercase text-sm leading-tight transition-all duration-300"
          style={{ color: '#f0e6ff', letterSpacing: '0.1em' }}
        >
          {product.name}
        </h3>

        <p
          className="text-xs leading-relaxed flex-1 opacity-75"
          style={{ color: '#c4b0e0' }}
        >
          {product.description.length > 140
            ? product.description.slice(0, 140) + '…'
            : product.description}
        </p>

        {/* Price + Buy */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <span
            className="text-xl font-bold"
            style={{
              color: '#ff2d78',
              textShadow: '0 0 10px rgba(255,45,120,0.6)',
            }}
          >
            $33
          </span>

          <button
            onClick={handleBuy}
            disabled={!product.stripeLink}
            className="btn-neon-pink text-xs font-bold tracking-widest uppercase px-4 py-2 rounded disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {product.stripeLink ? 'BUY NOW' : 'COMING SOON'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PlaceholderImage({
  category,
}: {
  category: string
  name?: string
}) {
  const glyphs = {
    spell: '⬡',
    apothecary: '◈',
    apparel: '✦',
  }[category] ?? '✧'

  const colors = {
    spell: { primary: '#ff2d78', secondary: '#9d00ff' },
    apothecary: { primary: '#00c8ff', secondary: '#9d00ff' },
    apparel: { primary: '#9d00ff', secondary: '#ff2d78' },
  }[category] ?? { primary: '#ff2d78', secondary: '#9d00ff' }

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center gap-2"
      style={{
        background: `radial-gradient(ellipse at center, ${colors.secondary}18 0%, transparent 70%)`,
      }}
    >
      <span
        className="text-5xl animate-float select-none"
        style={{
          color: colors.primary,
          textShadow: `0 0 20px ${colors.primary}, 0 0 40px ${colors.primary}`,
          filter: 'drop-shadow(0 0 10px currentColor)',
        }}
      >
        {glyphs}
      </span>
      <span
        className="text-xs opacity-30 tracking-widest uppercase text-center px-4"
        style={{ color: colors.primary }}
      >
        Photo coming soon
      </span>
    </div>
  )
}
