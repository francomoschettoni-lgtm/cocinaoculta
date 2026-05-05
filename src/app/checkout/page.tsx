'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { DeliveryZone, PaymentMethod, DELIVERY_COSTS, DELIVERY_ZONE_LABELS, DELIVERY_ZONES, MINIMUM_ORDER_DELIVERY, MINIMUM_ORDER_PICKUP } from '@/types'
import { ShoppingBag, Banknote, MapPin, User, Phone, Mail, AlertCircle, CheckCircle, MessageCircle, Copy, Truck, Store } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

type DeliveryMethodType = 'envio' | 'retiro' | ''

interface FormData {
  name: string
  email: string
  phone: string
  address: string
  zone: DeliveryZone | ''
  deliveryMethod: DeliveryMethodType
  payment: PaymentMethod | ''
  notes: string
}

function buildWhatsAppMessage(orderNumber: number | null, form: FormData, items: { product: { name: string; price: number }; quantity: number }[], total: number) {
  const isPickup = form.deliveryMethod === 'retiro'
  const lines = [
    `Hola! Hice un pedido${orderNumber ? ` #${orderNumber}` : ''}:`,
    '',
    ...items.map(i => `- ${i.quantity}x ${i.product.name} (${formatPrice(i.product.price * i.quantity)})`),
    '',
    `Total: *${formatPrice(total)}*`,
    isPickup ? 'Retiro en local' : `Zona: ${form.zone ? DELIVERY_ZONE_LABELS[form.zone as DeliveryZone] : ''}`,
    ...(isPickup ? [] : [`Dirección: ${form.address}`]),
    '',
    form.payment === 'transferencia'
      ? 'Ya hice la transferencia, adjunto comprobante.'
      : 'Quiero coordinar el pago.',
  ]
  return encodeURIComponent(lines.join('\n'))
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderNumber, setOrderNumber] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState<FormData>({
    name: '', email: '', phone: '', address: '',
    zone: '', deliveryMethod: '', payment: '', notes: '',
  })

  const isPickup = form.deliveryMethod === 'retiro'
  const effectiveZone: DeliveryZone | '' = isPickup ? 'retiro' : form.zone
  const subtotal = getTotal()
  const deliveryCost = effectiveZone ? DELIVERY_COSTS[effectiveZone as DeliveryZone] : 0
  const total = subtotal + deliveryCost
  const minimumOrder = isPickup ? MINIMUM_ORDER_PICKUP : MINIMUM_ORDER_DELIVERY

  const [savedItems, setSavedItems] = useState(items)
  const [savedTotal, setSavedTotal] = useState(total)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.deliveryMethod || !form.payment) {
      toast.error('Por favor completá todos los campos.')
      return
    }
    if (!isPickup && !form.zone) {
      toast.error('Seleccioná una zona de envío.')
      return
    }
    if (subtotal < minimumOrder) {
      toast.error(`El pedido mínimo ${isPickup ? 'para retiro' : 'para envío'} es ${formatPrice(minimumOrder)}`)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          delivery_zone: effectiveZone,
          delivery_address: isPickup ? 'Retiro en local' : form.address,
          delivery_cost: deliveryCost,
          subtotal,
          total,
          payment_method: form.payment,
          notes: form.notes,
          items: items.map(i => ({
            product_id: i.product.id,
            product_name: i.product.name,
            product_price: i.product.price,
            quantity: i.quantity,
            subtotal: i.product.price * i.quantity,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar el pedido')

      setOrderNumber(data.order_number)
      setSavedItems([...items])
      setSavedTotal(total)
      setSuccess(true)
      clearCart()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al procesar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyAlias = () => {
    navigator.clipboard.writeText('Cocina.oculta')
    setCopied(true)
    toast.success('Alias copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  if (items.length === 0 && !success) {
    return (
      <div style={{
        maxWidth: '480px', margin: '80px auto', textAlign: 'center',
        padding: '0 24px',
      }}>
        <ShoppingBag size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px', display: 'block' }} />
        <h2 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text)', marginBottom: '12px' }}>
          Tu carrito está vacío
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
          Agregá productos desde la tienda para continuar.
        </p>
        <Link href="/tienda" style={{
          display: 'inline-block', padding: '12px 28px',
          backgroundColor: 'var(--accent)', color: 'white',
          borderRadius: '12px', textDecoration: 'none', fontWeight: 600,
        }}>
          Ir a la tienda
        </Link>
      </div>
    )
  }

  if (success) {
    const waMsg = buildWhatsAppMessage(orderNumber, form, savedItems, savedTotal)
    const waUrl = `https://wa.me/5491153447998?text=${waMsg}`

    return (
      <div style={{
        maxWidth: '520px', margin: '80px auto', textAlign: 'center',
        padding: '0 24px',
      }}>
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '20px',
          border: '1px solid var(--border)',
          padding: '40px 32px',
          boxShadow: 'var(--shadow)',
        }}>
          <CheckCircle size={56} style={{ color: 'var(--success)', margin: '0 auto 20px', display: 'block' }} />
          <h2 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '1.8rem', color: 'var(--text)', marginBottom: '12px',
          }}>
            ¡Pedido recibido!
          </h2>
          {orderNumber && (
            <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '0.9rem' }}>
              Pedido <strong style={{ color: 'var(--accent)' }}>#{orderNumber}</strong>
            </p>
          )}

          {form.payment === 'transferencia' ? (
            <>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.7, fontSize: '0.95rem' }}>
                Transferí al alias y envianos el comprobante por WhatsApp para confirmar.
              </p>

              <div style={{
                backgroundColor: 'var(--accent-light)',
                border: '1px solid var(--accent)',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
                textAlign: 'left',
              }}>
                <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: '10px', fontSize: '0.9rem' }}>
                  Datos para transferencia:
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Alias: <strong style={{ color: 'var(--accent)', fontSize: '1rem' }}>Cocina.oculta</strong>
                  </p>
                  <button onClick={handleCopyAlias} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: copied ? 'var(--accent)' : 'var(--text-muted)',
                    padding: '2px',
                  }}>
                    <Copy size={14} />
                  </button>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Monto: <strong style={{ color: 'var(--text)' }}>{formatPrice(savedTotal)}</strong>
                </p>
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.7, fontSize: '0.95rem' }}>
              Coordiná el pago y la entrega por WhatsApp.
            </p>
          )}

          <a href={waUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            width: '100%', padding: '14px',
            backgroundColor: '#25D366', color: 'white',
            borderRadius: '12px', textDecoration: 'none',
            fontWeight: 700, fontSize: '0.95rem',
            boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
            marginBottom: '12px',
          }}>
            <MessageCircle size={18} />
            {form.payment === 'transferencia' ? 'Enviar comprobante por WhatsApp' : 'Confirmar por WhatsApp'}
          </a>

          <Link href="/tienda" style={{
            display: 'block', textAlign: 'center',
            padding: '11px 22px',
            color: 'var(--text-muted)',
            textDecoration: 'none', fontWeight: 500, fontSize: '0.88rem',
          }}>
            Seguir comprando
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
        fontWeight: 700, color: 'var(--text)', marginBottom: '32px',
      }}>
        Finalizar Pedido
      </h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Section title="Tus datos" icon={<User size={16} />}>
            <InputField label="Nombre y apellido *" value={form.name}
              onChange={v => setForm(f => ({ ...f, name: v }))} required />
            <InputField label="Teléfono / WhatsApp *" value={form.phone}
              onChange={v => setForm(f => ({ ...f, phone: v }))} type="tel" required />
            <InputField label="Email (opcional)" value={form.email}
              onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
          </Section>

          <Section title="Entrega" icon={<MapPin size={16} />}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '0.83rem', fontWeight: 600,
                color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Método de entrega *
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[
                  { value: 'envio' as DeliveryMethodType, label: 'Envío a domicilio', desc: `Mínimo ${formatPrice(MINIMUM_ORDER_DELIVERY)}`, icon: <Truck size={18} /> },
                  { value: 'retiro' as DeliveryMethodType, label: 'Retiro en local', desc: `Mínimo ${formatPrice(MINIMUM_ORDER_PICKUP)}`, icon: <Store size={18} /> },
                ].map(({ value, label, desc, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, deliveryMethod: value, zone: value === 'retiro' ? '' : f.zone }))}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '14px 14px',
                      borderRadius: '12px',
                      border: `1px solid ${form.deliveryMethod === value ? 'var(--accent)' : 'var(--border)'}`,
                      backgroundColor: form.deliveryMethod === value ? 'var(--accent-light)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s ease',
                      fontFamily: 'Outfit, sans-serif',
                    }}
                  >
                    <div style={{
                      color: form.deliveryMethod === value ? 'var(--accent)' : 'var(--text-muted)',
                      transition: 'color 0.2s ease',
                    }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{
                        fontWeight: 600, fontSize: '0.88rem',
                        color: form.deliveryMethod === value ? 'var(--accent)' : 'var(--text)',
                      }}>
                        {label}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {form.deliveryMethod === 'envio' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'block', fontSize: '0.83rem', fontWeight: 600,
                    color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    Zona de envío *
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {DELIVERY_ZONES.map(key => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, zone: key }))}
                        style={{
                          flex: 1, minWidth: '100px', padding: '10px 8px',
                          borderRadius: '10px',
                          border: `1px solid ${form.zone === key ? 'var(--accent)' : 'var(--border)'}`,
                          backgroundColor: form.zone === key ? 'var(--accent-light)' : 'transparent',
                          color: form.zone === key ? 'var(--accent)' : 'var(--text-muted)',
                          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                          fontFamily: 'Outfit, sans-serif', textAlign: 'center',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {DELIVERY_ZONE_LABELS[key]}
                        <div style={{ fontSize: '0.75rem', fontWeight: 400, marginTop: '2px' }}>
                          {formatPrice(DELIVERY_COSTS[key])}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <InputField label="Dirección de entrega *" value={form.address}
                  onChange={v => setForm(f => ({ ...f, address: v }))} required
                  placeholder="Calle, número, ciudad" />
              </>
            )}

            <InputField label="Notas (opcional)" value={form.notes}
              onChange={v => setForm(f => ({ ...f, notes: v }))}
              placeholder={isPickup ? 'Indicaciones adicionales' : 'Instrucciones de entrega, referencias, etc.'} />
          </Section>

          <Section title="Método de pago" icon={<Banknote size={16} />}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {
                  value: 'transferencia' as PaymentMethod,
                  label: 'Transferencia',
                  desc: 'Alias: Cocina.oculta · Enviás el comprobante por WhatsApp',
                  icon: <Banknote size={18} />,
                },
                {
                  value: 'efectivo' as PaymentMethod,
                  label: 'Coordinar por WhatsApp',
                  desc: 'Arreglás el pago directamente por WhatsApp',
                  icon: <MessageCircle size={18} />,
                },
              ].map(({ value, label, desc, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, payment: value }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${form.payment === value ? 'var(--accent)' : 'var(--border)'}`,
                    backgroundColor: form.payment === value ? 'var(--accent-light)' : 'var(--bg-card)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s ease',
                    fontFamily: 'Outfit, sans-serif',
                    width: '100%',
                  }}
                >
                  <div style={{
                    color: form.payment === value ? 'var(--accent)' : 'var(--text-muted)',
                    transition: 'color 0.2s ease',
                  }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{
                      fontWeight: 600, fontSize: '0.9rem',
                      color: form.payment === value ? 'var(--accent)' : 'var(--text)',
                    }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {desc}
                    </div>
                  </div>
                  {form.payment === value && (
                    <CheckCircle size={16} style={{ color: 'var(--accent)', marginLeft: 'auto' }} />
                  )}
                </button>
              ))}
            </div>
          </Section>

          <button
            type="submit"
            disabled={loading || !form.name || !form.phone || !form.deliveryMethod || !form.payment || (!isPickup && (!form.address || !form.zone))}
            style={{
              width: '100%', padding: '15px',
              backgroundColor: loading ? 'var(--border)' : 'var(--accent)',
              color: loading ? 'var(--text-muted)' : 'white',
              border: 'none', borderRadius: '12px',
              fontSize: '1rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.2s ease',
            }}
          >
            {loading ? 'Procesando...' : `Confirmar pedido ${formatPrice(total)}`}
          </button>
        </form>

        {/* Order summary */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <ShoppingBag size={16} style={{ color: 'var(--accent)' }} />
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text)', fontSize: '1rem' }}>
                Resumen del pedido
              </h3>
            </div>

            <div style={{ padding: '16px 20px' }}>
              {items.map(({ product, quantity }) => (
                <div key={product.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '12px', gap: '8px',
                }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 500 }}>
                      {product.name}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      x{quantity} · {formatPrice(product.price)} c/u
                    </p>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', flexShrink: 0 }}>
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              ))}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '4px' }}>
                <SummaryRow label="Subtotal" value={formatPrice(subtotal)} />
                <SummaryRow
                  label={isPickup ? 'Retiro en local' : `Envío${form.zone ? ` (${DELIVERY_ZONE_LABELS[form.zone as DeliveryZone]})` : ''}`}
                  value={isPickup ? 'Gratis' : (form.zone ? formatPrice(deliveryCost) : '—')}
                />
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginTop: '10px',
                  paddingTop: '10px', borderTop: '1px solid var(--border)',
                }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 600, color: 'var(--text)' }}>
                    Total
                  </span>
                  <span style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent)',
                  }}>
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {form.deliveryMethod && subtotal < minimumOrder && (
                <div style={{
                  display: 'flex', gap: '8px', alignItems: 'center',
                  backgroundColor: 'var(--accent-light)',
                  padding: '10px 12px', borderRadius: '10px', marginTop: '14px',
                  border: '1px solid var(--accent)',
                }}>
                  <AlertCircle size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.78rem', color: 'var(--text)' }}>
                    Mínimo {isPickup ? 'retiro' : 'envío'}: {formatPrice(minimumOrder)} (faltan {formatPrice(minimumOrder - subtotal)})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        marginBottom: '16px',
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '8px',
          backgroundColor: 'var(--accent-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--accent)',
        }}>
          {icon}
        </div>
        <h3 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: '1rem', fontWeight: 600, color: 'var(--text)',
        }}>
          {title}
        </h3>
      </div>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '14px',
        border: '1px solid var(--border)',
        padding: '16px',
      }}>
        {children}
      </div>
    </div>
  )
}

function InputField({
  label, value, onChange, type = 'text', required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; required?: boolean; placeholder?: string
}) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{
        display: 'block', fontSize: '0.8rem', fontWeight: 600,
        color: 'var(--text-muted)', marginBottom: '6px',
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 12px',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '9px',
          color: 'var(--text)', fontSize: '0.9rem',
          outline: 'none', fontFamily: 'Outfit, sans-serif',
        }}
      />
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontSize: '0.85rem', fontWeight: 500 }}>{value}</span>
    </div>
  )
}
