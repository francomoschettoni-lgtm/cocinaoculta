'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Order, OrderStatus, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, DELIVERY_ZONE_LABELS } from '@/types'
import { formatDate, formatPrice } from '@/lib/utils'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminNav from '@/components/admin/AdminNav'
import { ChevronDown, ChevronUp, Phone, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  pending: { bg: '#FFF3CD', color: '#856404' },
  confirmed: { bg: '#CCE5FF', color: '#004085' },
  preparing: { bg: '#E2D9F3', color: '#4A1485' },
  ready: { bg: '#D4EDDA', color: '#155724' },
  delivered: { bg: '#D1ECF1', color: '#0C5460' },
  cancelled: { bg: '#F8D7DA', color: '#721C24' },
}

export default function PedidosAdmin() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all')

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    setOrders(data as Order[] || [])
    setLoading(false)
  }

  async function updateStatus(orderId: string, status: OrderStatus) {
    const { error } = await supabase.from('orders').update({ order_status: status }).eq('id', orderId)
    if (error) { toast.error('Error al actualizar'); return }
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, order_status: status } : o))
    toast.success(`Estado actualizado: ${ORDER_STATUS_LABELS[status]}`)
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.order_status === filter)

  return (
    <AdminGuard>
      <AdminNav />
      <div style={{ flex: 1, padding: '32px', backgroundColor: 'var(--bg)', overflowY: 'auto' }}>
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)' }}>
            Pedidos
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {orders.length} pedidos totales · {orders.filter(o => o.order_status === 'pending').length} pendientes
          </p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', ...Object.keys(ORDER_STATUS_LABELS)].map(s => (
            <button key={s} onClick={() => setFilter(s as OrderStatus | 'all')} style={{
              padding: '6px 14px', borderRadius: '20px',
              border: `1px solid ${filter === s ? 'var(--accent)' : 'var(--border)'}`,
              backgroundColor: filter === s ? 'var(--accent)' : 'transparent',
              color: filter === s ? 'white' : 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
              fontFamily: 'Outfit, sans-serif',
            }}>
              {s === 'all' ? 'Todos' : ORDER_STATUS_LABELS[s as OrderStatus]}
              {s !== 'all' && ` (${orders.filter(o => o.order_status === s).length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: '80px', borderRadius: '12px' }} className="skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No hay pedidos para este filtro.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(order => (
              <div key={order.id} style={{
                backgroundColor: 'var(--bg-card)',
                borderRadius: '14px',
                border: '1px solid var(--border)',
                overflow: 'hidden',
              }}>
                {/* Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto auto auto',
                  gap: '16px',
                  alignItems: 'center',
                  padding: '16px 20px',
                  cursor: 'pointer',
                }} onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.9rem' }}>
                      #{order.order_number}
                    </span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>
                      {order.customer_name}
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {DELIVERY_ZONE_LABELS[order.delivery_zone]}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>
                    {formatPrice(order.total)}
                  </span>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    ...STATUS_COLORS[order.order_status],
                  }}>
                    {ORDER_STATUS_LABELS[order.order_status]}
                  </span>
                  {expanded === order.id ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                </div>

                {/* Expanded */}
                {expanded === order.id && (
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '20px',
                    backgroundColor: 'var(--bg-secondary)',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                      <InfoBlock label="Cliente">
                        <p style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{order.customer_name}</p>
                        <a href={`tel:${order.customer_phone}`} style={{ fontSize: '0.82rem', color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <Phone size={12} /> {order.customer_phone}
                        </a>
                        {order.customer_email && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{order.customer_email}</p>}
                      </InfoBlock>
                      <InfoBlock label="Entrega">
                        <p style={{ fontSize: '0.88rem', color: 'var(--text)' }}>{order.delivery_address}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{DELIVERY_ZONE_LABELS[order.delivery_zone]}</p>
                      </InfoBlock>
                      <InfoBlock label="Pago">
                        <p style={{ fontSize: '0.88rem', color: 'var(--text)', textTransform: 'capitalize' }}>{order.payment_method}</p>
                        <span style={{
                          display: 'inline-block', marginTop: '4px',
                          padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem',
                          backgroundColor: order.payment_status === 'approved' ? '#d4edda' : '#fff3cd',
                          color: order.payment_status === 'approved' ? '#155724' : '#856404',
                        }}>
                          {PAYMENT_STATUS_LABELS[order.payment_status]}
                        </span>
                      </InfoBlock>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                        Productos
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {order.order_items?.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem' }}>
                            <span style={{ color: 'var(--text)' }}>
                              {item.quantity}x {item.product_name}
                            </span>
                            <span style={{ color: 'var(--text)', fontWeight: 600 }}>
                              {formatPrice(item.subtotal)}
                            </span>
                          </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Envío</span>
                          <span style={{ fontSize: '0.87rem', fontWeight: 500, color: 'var(--text)' }}>{formatPrice(order.delivery_cost)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Total</span>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)' }}>{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {order.notes && (
                      <div style={{ marginBottom: '16px', padding: '10px 14px', backgroundColor: 'var(--accent-light)', borderRadius: '8px', border: '1px solid var(--accent)' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '4px' }}>NOTAS</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{order.notes}</p>
                      </div>
                    )}

                    {/* Status update */}
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Estado:</span>
                      {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map(s => (
                        <button key={s} onClick={() => updateStatus(order.id, s)} style={{
                          padding: '5px 12px', borderRadius: '20px',
                          border: `1px solid ${order.order_status === s ? STATUS_COLORS[s].color : 'var(--border)'}`,
                          backgroundColor: order.order_status === s ? STATUS_COLORS[s].bg : 'transparent',
                          color: order.order_status === s ? STATUS_COLORS[s].color : 'var(--text-muted)',
                          cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
                          fontFamily: 'Outfit, sans-serif',
                        }}>
                          {ORDER_STATUS_LABELS[s]}
                        </button>
                      ))}
                      <a href={`https://wa.me/${order.customer_phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                        marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', backgroundColor: '#25D366', color: 'white',
                        borderRadius: '20px', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600,
                      }}>
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  )
}

function InfoBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
        {label}
      </p>
      {children}
    </div>
  )
}
