import './globals.css'
import { Toaster } from 'sonner'
import { CartProvider } from '@/components/cart-provider'

export const metadata = {
  title: 'Hexpose! — A Witch\u2019s Boutique & Apothecary',
  description: 'Handcrafted spell jars, ritual apothecary, and cyber-occult apparel. Modern witchcraft, elevated.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-foreground min-h-screen antialiased">
        <CartProvider>
          {children}
          <Toaster theme="dark" position="top-center" richColors closeButton />
        </CartProvider>
      </body>
    </html>
  )
}
