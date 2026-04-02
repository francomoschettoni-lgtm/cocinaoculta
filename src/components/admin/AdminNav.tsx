'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Package, ShoppingBag, LayoutDashboard, LogOut, ExternalLink, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useTheme } from '@/components/layout/ThemeProvider'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/productos', label: 'Productos', icon: <Package size={18} /> },
  { href: '/admin/pedidos', label: 'Pedidos', icon: <ShoppingBag size={18} /> },
  { href: '/admin/usuarios', label: 'Usuarios', icon: <Users size={18} /> },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme } = useTheme()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin')
  }

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      backgroundColor: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <Image
          src={theme === 'dark' ? '/logo-white.svg' : '/logo-dark.svg'}
          alt="Cocina Oculta"
          width={32} height={35}
        />
        <div>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
            Admin
          </p>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cocina Oculta</p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px', borderRadius: '10px',
              textDecoration: 'none',
              marginBottom: '2px',
              backgroundColor: active ? 'var(--accent-light)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: active ? 600 : 400,
              fontSize: '0.88rem',
              transition: 'all 0.15s ease',
            }}>
              {icon}
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid var(--border)' }}>
        <Link href="/" target="_blank" style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '10px',
          textDecoration: 'none', color: 'var(--text-muted)',
          fontSize: '0.85rem', marginBottom: '4px',
        }}>
          <ExternalLink size={16} />
          Ver tienda
        </Link>
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '9px 12px', borderRadius: '10px',
          background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--error)',
          fontSize: '0.85rem', width: '100%', textAlign: 'left',
          fontFamily: 'Outfit, sans-serif',
        }}>
          <LogOut size={16} />
          Salir
        </button>
      </div>
    </aside>
  )
}
