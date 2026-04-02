import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/store/CartDrawer'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Cocina Oculta — Comida al Vacío',
  description: 'Comida al vacío artesanal, lista para calentar y disfrutar. Envíos a Tigre, San Isidro y Escobar.',
  keywords: 'comida al vacío, Puertos Escobar, Tigre, San Isidro, comida casera, delivery',
  openGraph: {
    title: 'Cocina Oculta',
    description: 'Comida al vacío artesanal, lista para calentar y disfrutar.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo-dark.svg" type="image/svg+xml" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body>
        <ThemeProvider>
          <Header />
          <main style={{ minHeight: '70vh' }}>
            {children}
          </main>
          <Footer />
          <CartDrawer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                fontFamily: 'Outfit, sans-serif',
                borderRadius: '12px',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
