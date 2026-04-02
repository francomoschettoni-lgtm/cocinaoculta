'use client'

import Link from 'next/link'
import Image from 'next/image'
import { X, Trash2, Plus, Minus, ShoppingBag, AlertCircle, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { MINIMUM_ORDER } from '@/types'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } = useCartStore()
  const total = getTotal()
  const meetsMinimum = total >= MINIMUM_ORDER
  const remaining = MINIMUM_ORDER - total

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 100,
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'var(--bg)',
        borderLeft: '1px solid var(--border)',
        zIndex: 101,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
      }} className="animate-slide-in-right">

        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: 'var(--text)' }}>
              Tu pedido
            </h2>
            {items.length > 0 && (
              <span style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                borderRadius: '20px',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}>
                {items.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            style={{
              width: '36px', height: '36px',
              borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-muted)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', gap: '16px',
              color: 'var(--text-muted)',
            }}>
              <ShoppingBag size={48} opacity={0.3} />
              <p style={{ fontSize: '0.95rem' }}>Tu carrito está vacío</p>
              <Link
                href="/tienda"
                onClick={closeCart}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    alignItems: 'center',
                  }}
                >
                  {/* Image */}
                  <div style={{
                    width: '60px', height: '60px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: 'var(--bg-secondary)',
                    position: 'relative',
                  }}>
                    {product.image_url ? (
                      <Image src={product.image_url} alt={product.name} fill style={{ objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={20} style={{ color: 'var(--border)' }} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: 'var(--text)',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {product.name}
                    </p>
                    <p style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      style={{
                        width: '24px', height: '24px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text)',
                      }}
                    >
                      <Minus size={10} />
                    </button>
                    <span style={{ minWidth: '18px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      style={{
                        width: '24px', height: '24px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'transparent',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--text)',
                      }}
                    >
                      <Plus size={10} />
                    </button>
                    <button
                      onClick={() => removeItem(product.id)}
                      style={{
                        width: '24px', height: '24px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        color: 'var(--error)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginLeft: '4px',
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            {/* Minimum order warning */}
            {!meetsMinimum && (
              <div style={{
                display: 'flex', gap: '8px', alignItems: 'center',
                backgroundColor: 'var(--accent-light)',
                padding: '10px 14px',
                borderRadius: '10px',
                marginBottom: '14px',
                border: '1px solid var(--accent)',
              }}>
                <AlertCircle size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text)' }}>
                  Te faltan <strong>{formatPrice(remaining)}</strong> para el mínimo de {formatPrice(MINIMUM_ORDER)}
                </p>
              </div>
            )}

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
            }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Subtotal</span>
              <span style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '1.3rem',
                fontWeight: 700,
                color: 'var(--text)',
              }}>
                {formatPrice(total)}
              </span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '14px',
                backgroundColor: meetsMinimum ? 'var(--accent)' : 'var(--border)',
                color: meetsMinimum ? 'white' : 'var(--text-muted)',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.95rem',
                pointerEvents: meetsMinimum ? 'auto' : 'none',
                transition: 'background 0.2s ease',
              }}
            >
              Continuar al pago
            </Link>

            <Link
              href="/tienda"
              onClick={closeCart}
              style={{
                display: 'block',
                textAlign: 'center',
                padding: '10px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.85rem',
                marginTop: '8px',
              }}
            >
              Seguir comprando
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
