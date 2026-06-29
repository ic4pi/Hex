import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { getStoreData } from '@/lib/products'
import CursorGlow from '@/components/CursorGlow'

export async function generateMetadata(): Promise<Metadata> {
  let assets = { socialShare: '', favicon: '' }
  try {
    const data = getStoreData()
    assets = data.assets
  } catch {}

  return {
    title: "Hexpose! A Witch's Boutique & Apothecary",
    description:
      "Jars for whatever you're carrying. Banish what needs to go, bind your own doubt, return what was sent your way. Hand-filled, intention-set, made for women who are done waiting.",
    openGraph: {
      title: "Hexpose! A Witch's Boutique & Apothecary",
      description:
        "Jars for whatever you're carrying. Banish what needs to go, bind your own doubt, return what was sent your way.",
      images: assets.socialShare ? [assets.socialShare] : [],
    },
    icons: assets.favicon
      ? { icon: assets.favicon }
      : { icon: '/favicon.ico' },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body className="min-h-screen bg-black text-[#f0e6ff] antialiased overflow-x-hidden">
        <CursorGlow />
        {children}
      </body>
    </html>
  )
}
