'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { StoreData, Product, StoreAssets } from '@/lib/products'

interface Props {
  initialData: StoreData
}

export default function AdminDashboard({ initialData }: Props) {
  const [data, setData] = useState<StoreData>(initialData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'assets'>('products')
  const [uploading, setUploading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  const uploadFile = async (file: File, key: string): Promise<string> => {
    const form = new FormData()
    form.append('file', file)
    form.append('key', key)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
    const json = await res.json()
    if (!json.ok) throw new Error(json.error)
    return json.url as string
  }

  const handleProductImageUpload = async (
    productId: string,
    file: File
  ) => {
    setUploading(productId)
    try {
      const url = await uploadFile(file, `product-${productId}`)
      setData((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, image: url } : p
        ),
      }))
    } catch (err) {
      alert('Upload failed: ' + err)
    } finally {
      setUploading(null)
    }
  }

  const handleAssetUpload = async (assetKey: keyof StoreAssets, file: File) => {
    setUploading(assetKey)
    try {
      const url = await uploadFile(file, `asset-${assetKey}`)
      setData((prev) => ({
        ...prev,
        assets: { ...prev.assets, [assetKey]: url },
      }))
    } catch (err) {
      alert('Upload failed: ' + err)
    } finally {
      setUploading(null)
    }
  }

  const updateStripeLink = (productId: string, link: string) => {
    setData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, stripeLink: link } : p
      ),
    }))
  }

  const categoryLabel = (cat: string) => {
    if (cat === 'spell') return { label: 'Spell/Jar', color: '#ff2d78' }
    if (cat === 'apothecary') return { label: 'Apothecary', color: '#00c8ff' }
    return { label: 'Apparel', color: '#9d00ff' }
  }

  return (
    <div className="min-h-screen bg-black text-[#f0e6ff]">
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid rgba(157,0,255,0.3)',
          background: 'rgba(13,0,25,0.95)',
        }}
        className="sticky top-0 z-50 px-4 sm:px-8 py-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs tracking-widest uppercase opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: '#9d00ff' }}
          >
            ← Shop
          </Link>
          <span
            className="text-lg sm:text-xl font-black tracking-tighter uppercase"
            style={{
              color: '#ff2d78',
              textShadow: '0 0 10px #ff2d78',
            }}
          >
            HEXPOSE! Admin
          </span>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-neon-pink text-xs font-bold tracking-widest uppercase px-6 py-2 rounded disabled:opacity-50"
        >
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save All Changes'}
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
        {/* Save notice */}
        {saved && (
          <div
            className="mb-6 rounded px-4 py-3 text-sm text-center"
            style={{
              background: 'rgba(0,200,255,0.1)',
              border: '1px solid rgba(0,200,255,0.4)',
              color: '#00c8ff',
              textShadow: '0 0 6px #00c8ff',
            }}
          >
            ✓ Changes saved successfully.
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8">
          {(['products', 'assets'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-6 py-2 text-xs font-bold tracking-widest uppercase rounded transition-all"
              style={
                activeTab === tab
                  ? {
                      background: 'rgba(255,45,120,0.15)',
                      border: '1px solid rgba(255,45,120,0.6)',
                      color: '#ff2d78',
                      textShadow: '0 0 8px #ff2d78',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid rgba(157,0,255,0.2)',
                      color: '#c4b0e0',
                    }
              }
            >
              {tab === 'products' ? '⬡ Products' : '◈ Brand Assets'}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs opacity-60 mb-2" style={{ color: '#c4b0e0' }}>
              Upload a photo and add a Stripe Payment Link for each product.
              Click a product row to expand it. Hit{' '}
              <strong>Save All Changes</strong> when done.
            </p>

            {data.products.map((product) => {
              const { label, color } = categoryLabel(product.category)
              const isExpanded = expandedId === product.id
              return (
                <div
                  key={product.id}
                  className="rounded-lg overflow-hidden transition-all"
                  style={{
                    background: 'rgba(13,0,25,0.8)',
                    border: `1px solid ${isExpanded ? color + '60' : 'rgba(157,0,255,0.15)'}`,
                    boxShadow: isExpanded
                      ? `0 0 15px ${color}20`
                      : undefined,
                  }}
                >
                  {/* Row header (always visible) */}
                  <button
                    onClick={() =>
                      setExpandedId(isExpanded ? null : product.id)
                    }
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div
                      className="shrink-0 w-12 h-12 rounded overflow-hidden flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.5)' }}
                    >
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span
                          className="text-xl"
                          style={{ color, filter: `drop-shadow(0 0 6px ${color})` }}
                        >
                          {product.category === 'spell'
                            ? '⬡'
                            : product.category === 'apothecary'
                            ? '◈'
                            : '✦'}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-bold tracking-wider uppercase"
                          style={{ color }}
                        >
                          {label}
                        </span>
                        <span
                          className="font-bold tracking-wider uppercase text-sm truncate"
                          style={{ color: '#f0e6ff' }}
                        >
                          {product.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs opacity-50" style={{ color: '#c4b0e0' }}>
                          {product.subcategory}
                        </span>
                        {product.stripeLink && (
                          <span
                            className="text-xs"
                            style={{ color: '#00c8ff', textShadow: '0 0 4px #00c8ff' }}
                          >
                            ✓ Stripe linked
                          </span>
                        )}
                        {product.image && (
                          <span
                            className="text-xs"
                            style={{ color: '#9d00ff', textShadow: '0 0 4px #9d00ff' }}
                          >
                            ✓ Photo uploaded
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className="shrink-0 text-lg transition-transform"
                      style={{
                        color: '#9d00ff',
                        transform: isExpanded ? 'rotate(180deg)' : 'none',
                      }}
                    >
                      ↓
                    </span>
                  </button>

                  {/* Expanded content */}
                  {isExpanded && (
                    <ProductEditor
                      product={product}
                      uploading={uploading === product.id}
                      onImageUpload={(file) =>
                        handleProductImageUpload(product.id, file)
                      }
                      onStripeLinkChange={(link) =>
                        updateStripeLink(product.id, link)
                      }
                      color={color}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <AssetsTab
            assets={data.assets}
            uploading={uploading}
            onUpload={handleAssetUpload}
          />
        )}
      </div>
    </div>
  )
}

function ProductEditor({
  product,
  uploading,
  onImageUpload,
  onStripeLinkChange,
  color,
}: {
  product: Product
  uploading: boolean
  onImageUpload: (file: File) => void
  onStripeLinkChange: (link: string) => void
  color: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className="px-4 pb-5 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-6"
      style={{ borderTop: `1px solid ${color}20` }}
    >
      {/* Left: description + ingredients */}
      <div className="flex flex-col gap-3">
        <p className="text-xs leading-relaxed opacity-70" style={{ color: '#c4b0e0' }}>
          {product.description}
        </p>
        {product.ingredients.length > 0 && (
          <div>
            <p
              className="text-xs font-bold tracking-widest uppercase mb-1"
              style={{ color: color, textShadow: `0 0 6px ${color}` }}
            >
              Ingredients
            </p>
            <ul className="text-xs opacity-60 space-y-1" style={{ color: '#c4b0e0' }}>
              {product.ingredients.map((ing, i) => (
                <li key={i} className="flex gap-2">
                  <span style={{ color }}>·</span>
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Right: upload + stripe */}
      <div className="flex flex-col gap-5">
        {/* Image upload */}
        <div>
          <label
            className="block text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: color, textShadow: `0 0 6px ${color}` }}
          >
            Product Photo
          </label>

          {product.image && (
            <div className="mb-3 relative w-32 h-32 rounded overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onImageUpload(file)
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-neon-blue text-xs font-bold tracking-widest uppercase px-4 py-2 rounded disabled:opacity-50"
          >
            {uploading
              ? 'Uploading…'
              : product.image
              ? 'Replace Photo'
              : 'Upload Photo'}
          </button>
          {product.image && (
            <p className="mt-1 text-xs opacity-40 truncate" style={{ color: '#c4b0e0' }}>
              {product.image}
            </p>
          )}
        </div>

        {/* Stripe link */}
        <div>
          <label
            htmlFor={`stripe-${product.id}`}
            className="block text-xs font-bold tracking-widest uppercase mb-2"
            style={{ color: color, textShadow: `0 0 6px ${color}` }}
          >
            Stripe Payment Link
          </label>
          <input
            id={`stripe-${product.id}`}
            type="url"
            value={product.stripeLink}
            onChange={(e) => onStripeLinkChange(e.target.value)}
            placeholder="https://buy.stripe.com/..."
            className="w-full rounded px-3 py-2 text-xs font-mono outline-none transition-all"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${color}40`,
              color: '#f0e6ff',
            }}
            onFocus={(e) =>
              (e.currentTarget.style.border = `1px solid ${color}80`)
            }
            onBlur={(e) =>
              (e.currentTarget.style.border = `1px solid ${color}40`)
            }
          />
          <p className="mt-1 text-xs opacity-40" style={{ color: '#c4b0e0' }}>
            Paste the Stripe Payment Link for this product. Customers click
            &ldquo;Buy Now&rdquo; to go directly to Stripe.
          </p>
        </div>
      </div>
    </div>
  )
}

function AssetsTab({
  assets,
  uploading,
  onUpload,
}: {
  assets: StoreAssets
  uploading: string | null
  onUpload: (key: keyof StoreAssets, file: File) => void
}) {
  const assetDefs: {
    key: keyof StoreAssets
    label: string
    description: string
    color: string
    glyph: string
  }[] = [
    {
      key: 'logo',
      label: 'Logo',
      description: 'Square or circle icon used throughout the site. Recommended: 512×512 PNG with transparency.',
      color: '#ff2d78',
      glyph: '⬡',
    },
    {
      key: 'favicon',
      label: 'Favicon',
      description: 'Browser tab icon. Recommended: 32×32 or 64×64 ICO or PNG.',
      color: '#9d00ff',
      glyph: '◈',
    },
    {
      key: 'wordmark',
      label: 'Wordmark',
      description: 'Full text logo / brand name lockup. Used in the hero and header. Recommended: wide PNG with transparency.',
      color: '#00c8ff',
      glyph: '✦',
    },
    {
      key: 'socialShare',
      label: 'Social Share Image',
      description: 'Open Graph image for link previews on social media. Recommended: 1200×630 JPG or PNG.',
      color: '#ff2d78',
      glyph: '✧',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {assetDefs.map(({ key, label, description, color, glyph }) => (
        <AssetUploader
          key={key}

          label={label}
          description={description}
          color={color}
          glyph={glyph}
          currentUrl={assets[key]}
          uploading={uploading === key}
          onUpload={(file) => onUpload(key, file)}
        />
      ))}
    </div>
  )
}

function AssetUploader({
  label,
  description,
  color,
  glyph,
  currentUrl,
  uploading,
  onUpload,
}: {
  label: string
  description: string
  color: string
  glyph: string
  currentUrl: string
  uploading: boolean
  onUpload: (file: File) => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-4"
      style={{
        background: 'rgba(13,0,25,0.8)',
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-2xl"
          style={{ color, filter: `drop-shadow(0 0 8px ${color})` }}
        >
          {glyph}
        </span>
        <h3
          className="font-bold tracking-widest uppercase text-sm"
          style={{ color, textShadow: `0 0 8px ${color}` }}
        >
          {label}
        </h3>
      </div>

      <p className="text-xs leading-relaxed opacity-60" style={{ color: '#c4b0e0' }}>
        {description}
      </p>

      {currentUrl && (
        <div
          className="relative rounded overflow-hidden bg-black/50 flex items-center justify-center"
          style={{ height: '120px' }}
        >
          <Image
            src={currentUrl}
            alt={label}
            fill
            className="object-contain p-2"
          />
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
        }}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="btn-neon-blue text-xs font-bold tracking-widest uppercase px-4 py-2 rounded disabled:opacity-50 self-start"
      >
        {uploading ? 'Uploading…' : currentUrl ? 'Replace' : 'Upload'}
      </button>
      {currentUrl && (
        <p className="text-xs opacity-30 truncate" style={{ color: '#c4b0e0' }}>
          {currentUrl}
        </p>
      )}
    </div>
  )
}
