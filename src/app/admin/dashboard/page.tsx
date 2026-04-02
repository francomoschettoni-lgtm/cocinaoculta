'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminNav from '@/components/admin/AdminNav'
import { ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0, pendingOrders: 0,
    totalRevenue: 0, totalProducts: 0, activeProducts: 0,
  })
  const [recentOrders, setRecentOrders] = useState<{ id: string; order_number: number; customer_name: string; total: number; order_status: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: orders }, { data: products }] = await Promise.all([
        supabase.from('orders').select('id, order_number, customer_name, total, order_status, created_at').order('created_at', { ascending: false }).limit(100),
        supabase.from('products').select('id, is_available'),
      ])

      const o = orders || []
      const p = products || []
      const recent = o.slice(0, 5)

      setStats({
        totalOrders: o.length,
        pendingOrders: o.filter(x => x.order_status === 'pending').length,
        totalRevenue: o.reduce((s, x) => s + (x.total || 0), 0),
        totalProducts: p.length,
        activeProducts: p.filter(x => x.is_available).length,
      })
      setRecentOrders(recent)
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { icon: <ShoppingBag size={22} />, label: 'Total pedidos', value: stats.totalOrders, color: '#4A7C59' },
    { icon: <Clock size={22} />, label: 'Pendientes', value: stats.pendingOrders, color: '#C87A3C', alert: stats.pendingOrders > 0 },
    { icon: <TrendingUp size={22} />, label: 'Facturación total', value: formatPrice(stats.totalRevenue), color: '#4A4ABA' },
    { icon: <Package size={22} />, label: 'Productos activos', value: `${stats.activeProducts}/${stats.totalProducts}`, color: '#888' },
  ]

  return (
    <AdminGuard>
      <AdminNav />
      <div style={{ flex: 1, padding: '32px', backgroundColor: 'var(--bg)', overflowY: 'auto' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)', marginBottom: '28px' }}>
          Dashboard
        </h1>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '36px' }}>
          {statCards.map(({ icon, label, value, color, alert }) => (
            <div key={label} style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '14px',
              border: `1px solid ${alert ? 'var(--accent)' : 'var(--border)'}`,
              padding: '20px',
              boxShadow: alert ? '0 0 0 2px var(--accent-light)' : 'none',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                backgroundColor: `${color}22`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color, marginBottom: '14px',
              }}>
                {icon}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {label}
              </p>
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
                {loading ? '—' : value}
              </p>
            </div>
          ))}
        </div>

        {/* Recent orders */}
        <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1rem', color: 'var(--text)' }}>
              Pedidos recientes
            </h2>
          </div>
          <div style={{ padding: '8px 0' }}>
            {loading ? (
              <div style={{ padding: '20px' }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: '44px', borderRadius: '8px', marginBottom: '8px' }} className="skeleton" />
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Aún no hay pedidos
              </p>
            ) : (
              recentOrders.map((order, i) => (
                <div key={order.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 20px',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent)' }}>#{order.order_number}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text)', marginLeft: '8px' }}>{order.customer_name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>{formatPrice(order.total)}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
