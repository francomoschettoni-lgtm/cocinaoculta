'use client'

import Image from 'next/image'
import { Plus, Minus, ShoppingCart, Package } from 'lucide-react'
import { Product } from '@/types'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  const { items, addItem, removeItem, updateQuantity, openCart } = useCartStore()
  const cartItem = items.find(i => i.product.id === product.id)
  const quantity = cartItem?.quantity ?? 0

  const handleAdd = () => {
    addItem(product)
    openCart()
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      position: 'relative',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLDivElement
      el.style.transform = 'translateY(-4px)'
      el.style.boxShadow = 'var(--shadow-lg)'
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLDivElement
      el.style.transform = 'translateY(0)'
      el.style.boxShadow = 'none'
    }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', backgroundColor: 'var(--bg-secondary)' }}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: '8px',
          }}>
            <Package size={32} style={{ color: 'var(--border)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Sin imagen</span>
          </div>
        )}

        {/* Featured badge */}
        {product.is_featured && (
          <span style={{
            position: 'absolute', top: '10px', left: '10px',
            backgroundColor: 'var(--accent)',
            color: 'white',
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '20px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Destacado
          </span>
        )}

        {/* Out of stock overlay */}
        {!product.is_available && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              color: 'white',
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '6px 16px',
              border: '2px solid white',
              borderRadius: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px' }}>
        {product.weight && (
          <span style={{
            fontSize: '0.7rem',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}>
            {product.weight}
          </span>
        )}
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1.05rem',
          fontWeight: 600,
          color: 'var(--text)',
          marginTop: '4px',
          marginBottom: '6px',
          lineHeight: 1.3,
        }}>
          {product.name}
        </h3>

        {product.description && (
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.82rem',
            lineHeight: 1.5,
            marginBottom: '12px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}>
            {product.description}
          </p>
        )}

        {product.preparation && (
          <p style={{
            color: 'var(--accent)',
            fontSize: '0.75rem',
            marginBottom: '14px',
          }}>
            {product.preparation}
          </p>
        )}

        {/* Price + Add */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text)',
          }}>
            {formatPrice(product.price)}
          </span>

          {product.is_available ? (
            quantity === 0 ? (
              <button
                onClick={handleAdd}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-hover)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)'}
              >
                <ShoppingCart size={14} />
                Agregar
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--accent-light)',
                borderRadius: '10px',
                padding: '4px',
              }}>
                <button
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  style={{
                    width: '28px', height: '28px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Minus size={12} />
                </button>
                <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 700, color: 'var(--accent)', fontSize: '0.9rem' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  style={{
                    width: '28px', height: '28px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  )
}
