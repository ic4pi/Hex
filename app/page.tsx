import { getStoreData } from '@/lib/products'
import ProductCard from '@/components/ProductCard'
import SmokeParticles from '@/components/SmokeParticles'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { products, assets } = getStoreData()

  const spells = products.filter((p) => p.category === 'spell')
  const apothecary = products.filter((p) => p.category === 'apothecary')
  const apparel = products.filter((p) => p.category === 'apparel')

  return (
    <div className="min-h-screen bg-black">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background radial gradients */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(157,0,255,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 20% 80%, rgba(255,45,120,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(0,200,255,0.10) 0%, transparent 60%)',
          }}
        />

        {/* Smoke particles */}
        <SmokeParticles />

        {/* Sigil ring */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            width: 'min(600px, 90vw)',
            height: 'min(600px, 90vw)',
            border: '1px solid rgba(157,0,255,0.12)',
            borderRadius: '50%',
            boxShadow: '0 0 40px rgba(157,0,255,0.08)',
            animation: 'spin-slow 40s linear infinite',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            width: 'min(480px, 75vw)',
            height: 'min(480px, 75vw)',
            border: '1px solid rgba(255,45,120,0.08)',
            borderRadius: '50%',
            animation: 'spin-slow 25s linear infinite reverse',
          }}
        />

        {/* Logo / Wordmark */}
        <div className="relative z-10 flex flex-col items-center gap-6 text-center">
          {assets.logo ? (
            <Image
              src={assets.logo}
              alt="Hexpose Logo"
              width={120}
              height={120}
              className="animate-float"
            />
          ) : (
            <div
              className="text-7xl animate-float select-none"
              style={{
                filter:
                  'drop-shadow(0 0 20px #ff2d78) drop-shadow(0 0 40px #9d00ff)',
              }}
            >
              ⬡
            </div>
          )}

          {assets.wordmark ? (
            <Image
              src={assets.wordmark}
              alt="Hexpose Wordmark"
              width={400}
              height={100}
              className="max-w-xs md:max-w-md"
            />
          ) : (
            <>
              <h1
                className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase animate-flicker"
                style={{
                  color: '#ff2d78',
                  textShadow:
                    '0 0 20px #ff2d78, 0 0 40px #ff2d78, 0 0 80px #cc1f60',
                  letterSpacing: '-0.02em',
                }}
              >
                HEXPOSE
                <span
                  style={{
                    color: '#ff2d78',
                    textShadow: '0 0 10px #ff2d78',
                  }}
                >
                  !
                </span>
              </h1>
              <p
                className="text-sm sm:text-base tracking-[0.3em] uppercase"
                style={{
                  color: '#00c8ff',
                  textShadow: '0 0 10px #00c8ff, 0 0 20px #0099cc',
                  letterSpacing: '0.35em',
                }}
              >
                A Witch&rsquo;s Boutique &amp; Apothecary
              </p>
            </>
          )}

          <p
            className="mt-4 max-w-lg text-sm sm:text-base leading-relaxed opacity-80"
            style={{ color: '#c4b0e0' }}
          >
            Jars for whatever you&rsquo;re carrying. Banish what needs to go,
            bind your own doubt, return what was sent your way, or just clear
            the static between your chakras.
          </p>
          <p
            className="text-xs tracking-widest uppercase"
            style={{ color: '#9d00ff', textShadow: '0 0 8px #9d00ff' }}
          >
            Every jar hand-filled. Intention-set. $33 flat.
          </p>

          <a
            href="#shop"
            className="mt-6 btn-neon-pink font-bold tracking-widest uppercase px-8 py-3 rounded text-sm"
          >
            Enter the Shop ↓
          </a>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-40"
          style={{ color: '#9d00ff' }}
        >
          ↓
        </div>
      </section>

      {/* Store tagline bar */}
      <div
        className="py-4 px-4 text-center text-xs tracking-[0.25em] uppercase overflow-hidden"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(157,0,255,0.15), rgba(255,45,120,0.15), rgba(0,200,255,0.10), transparent)',
          borderTop: '1px solid rgba(157,0,255,0.2)',
          borderBottom: '1px solid rgba(255,45,120,0.2)',
          color: '#c4b0e0',
        }}
      >
        <span>
          Made for women who are done waiting for things to change on their own
        </span>
        <span className="mx-4 opacity-40">✦</span>
        <span>All products $33</span>
        <span className="mx-4 opacity-40">✦</span>
        <span style={{ color: '#9d00ff', textShadow: '0 0 6px #9d00ff' }}>
          Ritual &amp; entertainment purposes
        </span>
      </div>

      {/* Main shop */}
      <main id="shop" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Spells & Jars */}
        <ProductSection
          title="Spells & Jars"
          glyph="⬡"
          glyphColor="#ff2d78"
          subtitle="Banishing • Empowerment • Justice • Chakra Cleansing"
          subtitleColor="#9d00ff"
          description="Hand-filled, intention-set, and ready to work. All justice/curse-line products are sold for ritual and entertainment purposes."
          products={spells}
        />

        <div className="section-divider my-16" />

        {/* Apothecary */}
        <ProductSection
          title="Apothecary"
          glyph="◈"
          glyphColor="#00c8ff"
          subtitle="Staples • Bundles • Ritual Supplies"
          subtitleColor="#00c8ff"
          description="The building blocks of every jar in the shop — sold solo for refills, DIY ritual work, and the nights that call for the full send-off."
          products={apothecary}
        />

        <div className="section-divider my-16" />

        {/* Apparel */}
        <ProductSection
          title="Apparel"
          glyph="✦"
          glyphColor="#9d00ff"
          subtitle="Wear Your Craft"
          subtitleColor="#9d00ff"
          description="Witchy streetwear for the occult-adjacent. Limited drops."
          products={apparel}
        />
      </main>

      {/* Footer */}
      <footer
        className="py-12 px-4 text-center"
        style={{
          borderTop: '1px solid rgba(157,0,255,0.2)',
          background: 'rgba(13,0,25,0.5)',
        }}
      >
        <div
          className="text-2xl font-black tracking-tighter mb-3 animate-flicker"
          style={{ color: '#ff2d78', textShadow: '0 0 15px #ff2d78' }}
        >
          HEXPOSE!
        </div>
        <p
          className="text-xs tracking-widest uppercase opacity-60 mb-6"
          style={{ color: '#c4b0e0' }}
        >
          A Witch&rsquo;s Boutique &amp; Apothecary
        </p>
        <p className="text-xs opacity-40" style={{ color: '#c4b0e0' }}>
          All products are sold for ritual, spiritual, and entertainment
          purposes only. Results not guaranteed. You are responsible for your
          own energy work.
        </p>
        <div className="mt-6">
          <Link
            href="/admin"
            className="text-xs opacity-20 hover:opacity-60 transition-opacity"
            style={{ color: '#9d00ff' }}
          >
            ⚙ Admin
          </Link>
        </div>
      </footer>
    </div>
  )
}

function ProductSection({
  title,
  glyph,
  glyphColor,
  subtitle,
  subtitleColor,
  description,
  products,
}: {
  title: string
  glyph: string
  glyphColor: string
  subtitle: string
  subtitleColor: string
  description: string
  products: ReturnType<typeof getStoreData>['products']
}) {
  return (
    <section>
      {/* Section header */}
      <div className="mb-10 flex flex-col items-center text-center gap-2">
        <span
          className="text-4xl mb-2"
          style={{
            color: glyphColor,
            textShadow: `0 0 20px ${glyphColor}, 0 0 40px ${glyphColor}`,
            filter: `drop-shadow(0 0 8px ${glyphColor})`,
          }}
        >
          {glyph}
        </span>
        <h2
          className="text-3xl sm:text-4xl font-black tracking-widest uppercase"
          style={{
            color: glyphColor,
            textShadow: `0 0 15px ${glyphColor}, 0 0 30px ${glyphColor}80`,
          }}
        >
          {title}
        </h2>
        <p
          className="text-xs tracking-[0.3em] uppercase"
          style={{
            color: subtitleColor,
            textShadow: `0 0 8px ${subtitleColor}`,
          }}
        >
          {subtitle}
        </p>
        <p
          className="mt-2 max-w-lg text-sm opacity-70 leading-relaxed"
          style={{ color: '#c4b0e0' }}
        >
          {description}
        </p>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
