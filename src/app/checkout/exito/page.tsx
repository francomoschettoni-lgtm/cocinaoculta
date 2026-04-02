'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'

function ExitoContent() {
  const params = useSearchParams()
  const order = params.get('order')
  const pending = params.get('pending')

  return (
    <div style={{ maxWidth: '520px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow)',
      }}>
        <CheckCircle size={56} style={{ color: 'var(--accent)', margin: '0 auto 20px', display: 'block' }} />
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.8rem', color: 'var(--text)', marginBottom: '12px',
        }}>
          {pending ? 'Pago en proceso' : 'Pago recibido'}
        </h2>
        {order && (
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>
            Pedido <strong style={{ color: 'var(--accent)' }}>#{order}</strong>
          </p>
        )}
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.7, fontSize: '0.95rem' }}>
          {pending
            ? 'Tu pago está siendo procesado. Te avisamos cuando se confirme.'
            : 'Tu pedido fue confirmado. Te contactamos para coordinar la entrega.'}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://wa.me/5491153447998"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '11px 22px', backgroundColor: '#25D366', color: 'white',
              borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
            }}
          >
            Contactar por WhatsApp
          </a>
          <Link href="/tienda" style={{
            padding: '11px 22px',
            border: '1px solid var(--border)', color: 'var(--text)',
            borderRadius: '12px', textDecoration: 'none', fontWeight: 500, fontSize: '0.88rem',
          }}>
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ExitoPage() {
  return (
    <Suspense>
      <ExitoContent />
    </Suspense>
  )
}
