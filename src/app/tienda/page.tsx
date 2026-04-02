'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, Category } from '@/types'
import ProductCard from '@/components/store/ProductCard'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function TiendaPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*').eq('is_available', true).order('category').order('name'),
        supabase.from('categories').select('*').eq('is_active', true).order('display_order'),
      ])
      setProducts(prods || [])
      setCategories(cats || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const matchSearch = search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // Group by category
  const grouped: Record<string, { label: string; products: Product[] }> = {}
  filtered.forEach(p => {
    if (!grouped[p.category]) {
      const cat = categories.find(c => c.slug === p.category)
      grouped[p.category] = { label: cat?.name || p.category, products: [] }
    }
    grouped[p.category].products.push(p)
  })

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <span style={{
          color: 'var(--accent)', fontSize: '0.78rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          Catálogo
        </span>
        <h1 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 700, color: 'var(--text)', marginTop: '8px',
        }}>
          Nuestra Tienda
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.95rem' }}>
          Pedido mínimo: <strong style={{ color: 'var(--text)' }}>$20.000</strong> · Envíos a Tigre, San Isidro y Escobar
        </p>
      </div>

      {/* Search + Filters */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '360px' }}>
          <Search size={16} style={{
            position: 'absolute', left: '12px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
          }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            style={{
              width: '100%', paddingLeft: '38px', paddingRight: '14px',
              paddingTop: '10px', paddingBottom: '10px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text)',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'Outfit, sans-serif',
            }}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} />
          <FilterButton active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
            Todo
          </FilterButton>
          {categories.map(cat => (
            <FilterButton
              key={cat.id}
              active={activeCategory === cat.slug}
              onClick={() => setActiveCategory(cat.slug)}
            >
              {cat.name}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Products */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '24px',
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              height: '340px', borderRadius: '16px',
            }} className="skeleton" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          color: 'var(--text-muted)',
        }}>
          <Search size={36} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.3 }} />
          <p style={{ fontSize: '1rem' }}>No encontramos productos con ese criterio.</p>
        </div>
      ) : activeCategory === 'all' ? (
        // Show grouped by category
        Object.entries(grouped).map(([slug, { label, products: catProds }]) => (
          <div key={slug} style={{ marginBottom: '52px' }}>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '1.5rem', fontWeight: 600,
              color: 'var(--text)', marginBottom: '20px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              {label}
              <span style={{
                fontSize: '0.8rem', color: 'var(--text-muted)',
                fontFamily: 'Outfit, sans-serif', fontWeight: 400,
              }}>
                {catProds.length} {catProds.length === 1 ? 'producto' : 'productos'}
              </span>
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '24px',
            }} className="stagger-children">
              {catProds.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        ))
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '24px',
        }} className="stagger-children">
          {filtered.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  )
}

function FilterButton({ active, onClick, children }: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: '20px',
        border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
        backgroundColor: active ? 'var(--accent)' : 'transparent',
        color: active ? 'white' : 'var(--text-muted)',
        cursor: 'pointer',
        fontSize: '0.83rem',
        fontWeight: active ? 600 : 400,
        fontFamily: 'Outfit, sans-serif',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  )
}
