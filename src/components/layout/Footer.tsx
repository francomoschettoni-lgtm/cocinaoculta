'use client'

import Link from 'next/link'
import { MessageCircle, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      paddingTop: '48px',
      paddingBottom: '32px',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px',
        }}>
          {/* Brand */}
          <div>
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.3rem',
              fontWeight: 700,
              color: 'var(--text)',
              marginBottom: '12px',
            }}>
              Cocina Oculta
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '20px' }}>
              Comida al vacío, hecha con amor. Lista para calentar y disfrutar en minutos.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <SocialLink href="https://www.instagram.com/copuertos/" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>} label="Instagram" />
              <SocialLink href="https://wa.me/5491153447998" icon={<MessageCircle size={18} />} label="WhatsApp" />
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Navegación
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/', label: 'Inicio' },
                { href: '/tienda', label: 'Tienda' },
                { href: '/#nosotros', label: 'Nosotros' },
                { href: '/#contacto', label: 'Contacto' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Envíos */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Envíos
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { zone: 'Tigre', price: '$2.000' },
                { zone: 'San Isidro', price: '$3.000' },
                { zone: 'Escobar', price: '$1.000' },
              ].map(({ zone, price }) => (
                <div key={zone} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{zone}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{price}</span>
                </div>
              ))}
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
                Pedido mínimo: $20.000
              </p>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Ubicación
            </h4>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <MapPin size={16} style={{ color: 'var(--accent)', marginTop: '2px', flexShrink: 0 }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                Puertos Escobar<br />
                Buenos Aires, Argentina
              </p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            © 2024 Cocina Oculta. Todos los derechos reservados.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            Alias de transferencia:{' '}
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Cocina.oculta</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      style={{
        width: '36px', height: '36px',
        borderRadius: '50%',
        border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-muted)',
        textDecoration: 'none',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'var(--accent)'
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)'
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'white'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'
        ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
        ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'
      }}
    >
      {icon}
    </a>
  )
}
