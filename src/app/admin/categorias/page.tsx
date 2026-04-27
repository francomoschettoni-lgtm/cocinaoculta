'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminNav from '@/components/admin/AdminNav'
import {
  Plus, Pencil, Trash2, Eye, EyeOff,
  ChevronUp, ChevronDown, X, Check, AlertCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function CategoriasAdmin() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: cats }, { data: prods }] = await Promise.all([
      supabase.from('categories').select('*').order('display_order'),
      supabase.from('products').select('id, category'),
    ])
    setCategories(cats || [])
    const counts: Record<string, number> = {}
    ;(prods || []).forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + 1
    })
    setProductCounts(counts)
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setName('')
    setShowModal(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setName(cat.name)
    setShowModal(true)
  }

  async function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('El nombre es requerido')
      return
    }
    setSaving(true)
    try {
      if (editing) {
        const slug = slugify(trimmed)
        const oldSlug = editing.slug
        const { error } = await supabase
          .from('categories')
          .update({ name: trimmed, slug })
          .eq('id', editing.id)
        if (error) throw error
        if (slug !== oldSlug) {
          await supabase
            .from('products')
            .update({ category: slug })
            .eq('category', oldSlug)
        }
        toast.success('Categoría actualizada')
      } else {
        const slug = slugify(trimmed)
        const maxOrder = categories.reduce((max, c) => Math.max(max, c.display_order), 0)
        const { error } = await supabase
          .from('categories')
          .insert({ name: trimmed, slug, display_order: maxOrder + 1 })
        if (error) throw error
        toast.success('Categoría creada')
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Error al guardar. ¿El nombre ya existe?')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(cat: Category) {
    const count = productCounts[cat.slug] || 0
    if (count > 0) {
      toast.error(`No se puede borrar: tiene ${count} producto${count > 1 ? 's' : ''} asignado${count > 1 ? 's' : ''}`)
      return
    }
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return
    const { error } = await supabase.from('categories').delete().eq('id', cat.id)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Categoría eliminada')
    load()
  }

  async function toggleActive(cat: Category) {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !cat.is_active })
      .eq('id', cat.id)
    if (error) { toast.error('Error'); return }
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !cat.is_active } : c))
    toast.success(cat.is_active ? 'Categoría ocultada' : 'Categoría visible')
  }

  async function move(cat: Category, direction: 'up' | 'down') {
    const idx = categories.findIndex(c => c.id === cat.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= categories.length) return

    const other = categories[swapIdx]
    const [orderA, orderB] = [cat.display_order, other.display_order]

    const { error: e1 } = await supabase.from('categories').update({ display_order: orderB }).eq('id', cat.id)
    const { error: e2 } = await supabase.from('categories').update({ display_order: orderA }).eq('id', other.id)
    if (e1 || e2) { toast.error('Error al reordenar'); return }

    setCategories(prev => {
      const next = [...prev]
      next[idx] = { ...cat, display_order: orderB }
      next[swapIdx] = { ...other, display_order: orderA }
      next.sort((a, b) => a.display_order - b.display_order)
      return next
    })
  }

  return (
    <AdminGuard>
      <AdminNav />
      <div style={{ flex: 1, padding: '32px', backgroundColor: 'var(--bg)', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)' }}>
              Categorías
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              {categories.length} categorías · {categories.filter(c => c.is_active).length} activas
            </p>
          </div>
          <button onClick={openCreate} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '11px 20px',
            backgroundColor: 'var(--accent)', color: 'white',
            border: 'none', borderRadius: '11px',
            fontSize: '0.9rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
          }}>
            <Plus size={16} /> Nueva categoría
          </button>
        </div>

        {/* Info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '12px 16px', marginBottom: '20px',
          backgroundColor: 'var(--accent-light)', borderRadius: '12px',
          fontSize: '0.83rem', color: 'var(--accent)',
        }}>
          <AlertCircle size={16} />
          El orden de arriba a abajo es como aparecen en la tienda. Usá las flechas para reordenar.
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: '56px', borderRadius: '12px' }} className="skeleton" />
            ))}
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  {['Orden', 'Categoría', 'Slug', 'Productos', 'Estado', 'Acciones'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left',
                      fontSize: '0.75rem', fontWeight: 700,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.id} style={{
                    borderTop: '1px solid var(--border)',
                    backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                    opacity: cat.is_active ? 1 : 0.6,
                  }}>
                    <td style={{ padding: '12px 16px', width: '90px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <ArrowBtn
                          disabled={i === 0}
                          onClick={() => move(cat, 'up')}
                          title="Subir"
                        >
                          <ChevronUp size={14} />
                        </ArrowBtn>
                        <ArrowBtn
                          disabled={i === categories.length - 1}
                          onClick={() => move(cat, 'down')}
                          title="Bajar"
                        >
                          <ChevronDown size={14} />
                        </ArrowBtn>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
                        {cat.name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <code style={{ fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '6px' }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text)' }}>
                        {productCounts[cat.slug] || 0}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px',
                        fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: cat.is_active ? '#d4edda' : '#f8d7da',
                        color: cat.is_active ? '#155724' : '#721c24',
                      }}>
                        {cat.is_active ? 'Activa' : 'Oculta'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <ActionBtn onClick={() => openEdit(cat)} title="Editar" color="var(--accent)">
                          <Pencil size={14} />
                        </ActionBtn>
                        <ActionBtn onClick={() => toggleActive(cat)} title={cat.is_active ? 'Ocultar' : 'Mostrar'} color="var(--text-muted)">
                          {cat.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        </ActionBtn>
                        <ActionBtn onClick={() => handleDelete(cat)} title="Eliminar" color="var(--error)">
                          <Trash2 size={14} />
                        </ActionBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 200, backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '420px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '20px', border: '1px solid var(--border)',
            padding: '28px',
            zIndex: 201, boxShadow: 'var(--shadow-lg)',
          }} className="animate-scale-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.2rem', color: 'var(--text)' }}>
                {editing ? 'Editar categoría' : 'Nueva categoría'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{
                display: 'block', fontSize: '0.78rem', fontWeight: 600,
                color: 'var(--text-muted)', marginBottom: '5px',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                Nombre *
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ej: Postres"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
                autoFocus
                style={{
                  width: '100%', padding: '10px 12px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '9px', color: 'var(--text)',
                  fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif',
                  outline: 'none',
                }}
              />
            </div>
            {name.trim() && (
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Slug: <code style={{ backgroundColor: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '4px' }}>
                  {slugify(name.trim())}
                </code>
              </p>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '11px 20px', border: '1px solid var(--border)',
                backgroundColor: 'transparent', color: 'var(--text)',
                borderRadius: '10px', cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem',
              }}>
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                padding: '11px 24px',
                backgroundColor: saving ? 'var(--border)' : 'var(--accent)',
                color: saving ? 'var(--text-muted)' : 'white',
                border: 'none', borderRadius: '10px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                {saving ? 'Guardando...' : <><Check size={15} /> {editing ? 'Guardar' : 'Crear'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminGuard>
  )
}

function ArrowBtn({ disabled, onClick, title, children }: {
  disabled: boolean; onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} disabled={disabled} title={title} style={{
      width: '28px', height: '28px', borderRadius: '7px',
      border: '1px solid var(--border)',
      backgroundColor: 'transparent',
      cursor: disabled ? 'default' : 'pointer',
      color: disabled ? 'var(--border)' : 'var(--text-muted)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.4 : 1,
      transition: 'all 0.15s ease',
    }}>
      {children}
    </button>
  )
}

function ActionBtn({ onClick, title, color, children }: {
  onClick: () => void; title: string; color: string; children: React.ReactNode
}) {
  return (
    <button onClick={onClick} title={title} style={{
      width: '30px', height: '30px', borderRadius: '7px',
      border: '1px solid var(--border)', backgroundColor: 'transparent',
      cursor: 'pointer', color, display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.15s ease',
    }}
    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)'}
    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
    >
      {children}
    </button>
  )
}
