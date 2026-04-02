'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Sun, Moon, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'
import { useCartStore } from '@/store/cart'

const NAV_LINKS = [
  { href: '/', label: 'Inicio' },
  { href: '/tienda', label: 'Tienda' },
  { href: '/#nosotros', label: 'Nosotros' },
  { href: '/#contacto', label: 'Contacto' },
]

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { getItemCount, toggleCart } = useCartStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const itemCount = getItemCount()

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: '0 24px', height: '68px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <Image
              src={theme === 'dark' ? '/logo-white.svg' : '/logo-dark.svg'}
              alt="Cocina Oculta"
              width={36} height={40}
              style={{ objectFit: 'contain' }}
            />
            <span style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: '1.15rem', fontWeight: 700,
              color: 'var(--text)', letterSpacing: '0.02em',
            }}>
              Cocina Oculta
            </span>
          </Link>

          {/* Desktop nav — gap/alignment via inline, show/hide via Tailwind only */}
          <nav
            className="hidden md:flex"
            style={{ gap: '36px', alignItems: 'center' }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <NavLink key={href} href={href}>{label}</NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                border: '1px solid var(--border)', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
              }}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Cart */}
            <button
              onClick={toggleCart}
              aria-label="Ver carrito"
              style={{
                position: 'relative', width: '42px', height: '42px',
                borderRadius: '12px', border: 'none',
                background: 'var(--accent)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', transition: 'background 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'}
            >
              <ShoppingCart size={19} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-5px',
                  width: '19px', height: '19px', borderRadius: '50%',
                  background: 'var(--text)', color: 'var(--bg)',
                  fontSize: '10px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Hamburger — mobile only, no inline display override */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className="flex md:hidden"
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                border: '1px solid var(--border)', background: 'transparent',
                cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text)', transition: 'all 0.2s',
              }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — floating overlay, never pushes content */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 98,
              backgroundColor: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          />

          {/* Floating panel */}
          <div
            className="md:hidden"
            style={{
              position: 'fixed', top: '80px', left: '16px', right: '16px',
              zIndex: 99,
              backgroundColor: 'var(--bg-card)',
              borderRadius: '18px',
              border: '1px solid var(--border)',
              padding: '10px',
              boxShadow: 'var(--shadow-lg)',
              animation: 'scaleIn 0.18s ease forwards',
              transformOrigin: 'top center',
            }}
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', padding: '13px 18px',
                  borderRadius: '11px',
                  textDecoration: 'none',
                  color: 'var(--text)',
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '1rem', fontWeight: 500,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'}
              >
                {label}
              </Link>
            ))}

            <div style={{
              margin: '8px 0 4px',
              borderTop: '1px solid var(--border)',
              paddingTop: '10px',
              display: 'flex', gap: '8px', padding: '10px 8px 2px',
            }}>
              <a
                href="https://wa.me/5491153447998"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '7px', padding: '11px',
                  backgroundColor: '#25D366', color: 'white',
                  borderRadius: '10px', textDecoration: 'none',
                  fontWeight: 600, fontSize: '0.88rem',
                }}
              >
                WhatsApp
              </a>
              <Link
                href="/tienda"
                onClick={() => setMenuOpen(false)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '11px',
                  backgroundColor: 'var(--accent)', color: 'white',
                  borderRadius: '10px', textDecoration: 'none',
                  fontWeight: 600, fontSize: '0.88rem',
                }}
              >
                Ver tienda
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        textDecoration: 'none',
        color: 'var(--text-muted)',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: '0.88rem', fontWeight: 500,
        letterSpacing: '0.01em',
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'}
      onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'}
    >
      {children}
    </Link>
  )
}
