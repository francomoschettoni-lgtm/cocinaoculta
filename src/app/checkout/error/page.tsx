import { XCircle } from 'lucide-react'
import Link from 'next/link'

export default function ErrorPage() {
  return (
    <div style={{ maxWidth: '480px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow)',
      }}>
        <XCircle size={56} style={{ color: '#E53E3E', margin: '0 auto 20px', display: 'block' }} />
        <h2 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '1.8rem', color: 'var(--text)', marginBottom: '12px',
        }}>
          El pago no se completó
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', lineHeight: 1.7, fontSize: '0.95rem' }}>
          No se realizó ningún cobro. Podés intentarlo de nuevo o elegir otro método de pago.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/checkout" style={{
            padding: '11px 22px', backgroundColor: 'var(--accent)', color: 'white',
            borderRadius: '12px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
          }}>
            Volver al checkout
          </Link>
          <Link href="/tienda" style={{
            padding: '11px 22px',
            border: '1px solid var(--border)', color: 'var(--text)',
            borderRadius: '12px', textDecoration: 'none', fontWeight: 500, fontSize: '0.88rem',
          }}>
            Ir a la tienda
          </Link>
        </div>
      </div>
    </div>
  )
}
