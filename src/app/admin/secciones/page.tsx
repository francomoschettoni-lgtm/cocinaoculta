'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Showcase, Product } from '@/types'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminNav from '@/components/admin/AdminNav'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, X, Check,
  ChevronUp, ChevronDown, Search, Package, GripVertical,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ShowcaseWithProducts extends Showcase {
  items: { id: string; product_id: string; display_order: number; product: Product }[]
}

export default function SeccionesAdmin() {
  const [showcases, setShowcases] = useState<ShowcaseWithProducts[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Showcase | null>(null)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [showPicker, setShowPicker] = useState<string | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { load() }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(null)
        setProductSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function load() {
    setLoading(true)
    const [{ data: scs }, { data: sps }, { data: prods }] = await Promise.all([
      supabase.from('showcases').select('*').order('display_order'),
      supabase.from('showcase_products').select('*, products(*)').order('display_order'),
      supabase.from('products').select('*').eq('is_available', true).order('name'),
    ])

    const showcaseList: ShowcaseWithProducts[] = (scs || []).map(s => ({
      ...s,
      items: (sps || [])
        .filter((sp: Record<string, unknown>) => sp.showcase_id === s.id)
        .map((sp: Record<string, unknown>) => ({
          id: sp.id as string,
          product_id: sp.product_id as string,
          display_order: sp.display_order as number,
          product: sp.products as Product,
        })),
    }))

    setShowcases(showcaseList)
    setAllProducts(prods || [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setTitle('')
    setSubtitle('')
    setShowModal(true)
  }

  function openEdit(s: Showcase) {
    setEditing(s)
    setTitle(s.title)
    setSubtitle(s.subtitle || '')
    setShowModal(true)
  }

  async function handleSave() {
    const trimmed = title.trim()
    if (!trimmed) { toast.error('El título es requerido'); return }
    setSaving(true)
    try {
      if (editing) {
        const { error } = await supabase.from('showcases')
          .update({ title: trimmed, subtitle: subtitle.trim() || null })
          .eq('id', editing.id)
        if (error) throw error
        toast.success('Sección actualizada')
      } else {
        const maxOrder = showcases.reduce((max, s) => Math.max(max, s.display_order), 0)
        const { error } = await supabase.from('showcases')
          .insert({ title: trimmed, subtitle: subtitle.trim() || null, display_order: maxOrder + 1 })
        if (error) throw error
        toast.success('Sección creada')
      }
      setShowModal(false)
      load()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(s: Showcase) {
    if (!confirm(`¿Eliminar la sección "${s.title}"? Los productos no se borran, solo la sección.`)) return
    const { error } = await supabase.from('showcases').delete().eq('id', s.id)
    if (error) { toast.error('Error al eliminar'); return }
    toast.success('Sección eliminada')
    load()
  }

  async function toggleActive(s: Showcase) {
    const { error } = await supabase.from('showcases')
      .update({ is_active: !s.is_active }).eq('id', s.id)
    if (error) { toast.error('Error'); return }
    setShowcases(prev => prev.map(x => x.id === s.id ? { ...x, is_active: !s.is_active } : x))
    toast.success(s.is_active ? 'Sección ocultada' : 'Sección visible')
  }

  async function moveShowcase(s: Showcase, direction: 'up' | 'down') {
    const idx = showcases.findIndex(x => x.id === s.id)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= showcases.length) return
    const other = showcases[swapIdx]
    await Promise.all([
      supabase.from('showcases').update({ display_order: other.display_order }).eq('id', s.id),
      supabase.from('showcases').update({ display_order: s.display_order }).eq('id', other.id),
    ])
    load()
  }

  async function addProduct(showcaseId: string, productId: string) {
    const showcase = showcases.find(s => s.id === showcaseId)
    if (!showcase) return
    const maxOrder = showcase.items.reduce((max, i) => Math.max(max, i.display_order), 0)
    const { error } = await supabase.from('showcase_products')
      .insert({ showcase_id: showcaseId, product_id: productId, display_order: maxOrder + 1 })
    if (error) {
      if (error.code === '23505') toast.error('Ese producto ya está en esta sección')
      else toast.error('Error al agregar')
      return
    }
    toast.success('Producto agregado')
    setShowPicker(null)
    setProductSearch('')
    load()
  }

  async function removeProduct(spId: string) {
    const { error } = await supabase.from('showcase_products').delete().eq('id', spId)
    if (error) { toast.error('Error'); return }
    toast.success('Producto quitado')
    load()
  }

  async function moveProduct(showcaseId: string, spId: string, direction: 'up' | 'down') {
    const showcase = showcases.find(s => s.id === showcaseId)
    if (!showcase) return
    const items = showcase.items
    const idx = items.findIndex(i => i.id === spId)
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    if (swapIdx < 0 || swapIdx >= items.length) return
    const current = items[idx]
    const other = items[swapIdx]
    await Promise.all([
      supabase.from('showcase_products').update({ display_order: other.display_order }).eq('id', current.id),
      supabase.from('showcase_products').update({ display_order: current.display_order }).eq('id', other.id),
    ])
    load()
  }

  return (
    <AdminGuard>
      <AdminNav />
      <div style={{ flex: 1, padding: '32px', backgroundColor: 'var(--bg)', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)' }}>
              Secciones de la Home
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              Armá las vitrinas de productos que aparecen en la página principal
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
            <Plus size={16} /> Nueva sección
          </button>
        </div>

        {/* Showcases */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ height: '120px', borderRadius: '16px' }} className="skeleton" />
            ))}
          </div>
        ) : showcases.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            color: 'var(--text-muted)',
          }}>
            <Package size={40} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
            <p style={{ fontSize: '1rem', marginBottom: '8px' }}>No hay secciones todavía</p>
            <p style={{ fontSize: '0.85rem' }}>Creá una para mostrar productos en la home</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {showcases.map((s, i) => {
              const isExpanded = expandedId === s.id
              const usedIds = s.items.map(item => item.product_id)
              const available = allProducts.filter(p =>
                !usedIds.includes(p.id) &&
                (productSearch === '' ||
                  p.name.toLowerCase().includes(productSearch.toLowerCase()))
              )

              return (
                <div key={s.id} style={{
                  backgroundColor: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: `1px solid ${isExpanded ? 'var(--accent)' : 'var(--border)'}`,
                  overflow: 'hidden',
                  transition: 'border-color 0.2s ease',
                }}>
                  {/* Showcase header */}
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      opacity: s.is_active ? 1 : 0.6,
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  >
                    {/* Reorder arrows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
                      onClick={e => e.stopPropagation()}>
                      <ArrowBtn disabled={i === 0} onClick={() => moveShowcase(s, 'up')} title="Subir">
                        <ChevronUp size={12} />
                      </ArrowBtn>
                      <ArrowBtn disabled={i === showcases.length - 1} onClick={() => moveShowcase(s, 'down')} title="Bajar">
                        <ChevronDown size={12} />
                      </ArrowBtn>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)' }}>
                          {s.title}
                        </h3>
                        <span style={{
                          padding: '2px 8px', borderRadius: '10px',
                          fontSize: '0.72rem', fontWeight: 600,
                          backgroundColor: s.is_active ? '#d4edda' : '#f8d7da',
                          color: s.is_active ? '#155724' : '#721c24',
                        }}>
                          {s.is_active ? 'Activa' : 'Oculta'}
                        </span>
                      </div>
                      {s.subtitle && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {s.subtitle}
                        </p>
                      )}
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {s.items.length} producto{s.items.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Product thumbnails preview */}
                    <div style={{ display: 'flex', gap: '0', marginRight: '12px' }}>
                      {s.items.slice(0, 5).map((item, j) => (
                        <div key={item.id} style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          overflow: 'hidden', border: '2px solid var(--bg-card)',
                          marginLeft: j > 0 ? '-8px' : '0',
                          position: 'relative', backgroundColor: 'var(--bg-secondary)',
                          zIndex: 5 - j,
                        }}>
                          {item.product?.image_url ? (
                            <Image src={item.product.image_url} alt="" fill style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={14} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          )}
                        </div>
                      ))}
                      {s.items.length > 5 && (
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '8px',
                          backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--bg-card)',
                          marginLeft: '-8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
                        }}>
                          +{s.items.length - 5}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                      <ActionBtn onClick={() => openEdit(s)} title="Editar" color="var(--accent)">
                        <Pencil size={14} />
                      </ActionBtn>
                      <ActionBtn onClick={() => toggleActive(s)} title={s.is_active ? 'Ocultar' : 'Mostrar'} color="var(--text-muted)">
                        {s.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                      </ActionBtn>
                      <ActionBtn onClick={() => handleDelete(s)} title="Eliminar" color="var(--error)">
                        <Trash2 size={14} />
                      </ActionBtn>
                    </div>
                  </div>

                  {/* Expanded: product list */}
                  {isExpanded && (
                    <div style={{
                      borderTop: '1px solid var(--border)',
                      padding: '16px 20px',
                      backgroundColor: 'var(--bg-secondary)',
                    }}>
                      {/* Add product */}
                      <div style={{ position: 'relative', marginBottom: '16px' }} ref={showPicker === s.id ? pickerRef : undefined}>
                        <button
                          onClick={() => {
                            setShowPicker(showPicker === s.id ? null : s.id)
                            setProductSearch('')
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '9px 16px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px dashed var(--border)',
                            borderRadius: '10px', cursor: 'pointer',
                            fontSize: '0.85rem', color: 'var(--accent)',
                            fontWeight: 600, fontFamily: 'Outfit, sans-serif',
                            width: '100%', justifyContent: 'center',
                          }}
                        >
                          <Plus size={15} /> Agregar producto
                        </button>

                        {showPicker === s.id && (
                          <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0,
                            marginTop: '4px', zIndex: 100,
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            boxShadow: 'var(--shadow-lg)',
                            maxHeight: '320px', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column',
                          }}>
                            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                              <div style={{ position: 'relative' }}>
                                <Search size={14} style={{
                                  position: 'absolute', left: '10px', top: '50%',
                                  transform: 'translateY(-50%)', color: 'var(--text-muted)',
                                }} />
                                <input
                                  value={productSearch}
                                  onChange={e => setProductSearch(e.target.value)}
                                  placeholder="Buscar producto..."
                                  autoFocus
                                  style={{
                                    width: '100%', padding: '8px 10px 8px 32px',
                                    backgroundColor: 'var(--bg-secondary)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px', color: 'var(--text)',
                                    fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif',
                                    outline: 'none',
                                  }}
                                />
                              </div>
                            </div>
                            <div style={{ overflowY: 'auto', maxHeight: '260px' }}>
                              {available.length === 0 ? (
                                <p style={{ padding: '20px', textAlign: 'center', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
                                  {productSearch ? 'Sin resultados' : 'Todos los productos ya están agregados'}
                                </p>
                              ) : (
                                available.map(p => (
                                  <button
                                    key={p.id}
                                    onClick={() => addProduct(s.id, p.id)}
                                    style={{
                                      display: 'flex', alignItems: 'center', gap: '10px',
                                      padding: '10px 14px', width: '100%',
                                      border: 'none', borderBottom: '1px solid var(--border)',
                                      backgroundColor: 'transparent',
                                      cursor: 'pointer', textAlign: 'left',
                                      fontFamily: 'Outfit, sans-serif',
                                      transition: 'background 0.1s ease',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                  >
                                    <div style={{
                                      width: '36px', height: '36px', borderRadius: '8px',
                                      overflow: 'hidden', backgroundColor: 'var(--bg-secondary)',
                                      flexShrink: 0, position: 'relative',
                                    }}>
                                      {p.image_url ? (
                                        <Image src={p.image_url} alt="" fill style={{ objectFit: 'cover' }} />
                                      ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                          <Package size={14} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {p.name}
                                      </p>
                                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        ${p.price.toLocaleString('es-AR')}
                                      </p>
                                    </div>
                                    <Plus size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Product list */}
                      {s.items.length === 0 ? (
                        <p style={{ textAlign: 'center', fontSize: '0.83rem', color: 'var(--text-muted)', padding: '8px 0' }}>
                          Esta sección está vacía. Agregá productos para mostrar en la home.
                        </p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {s.items.map((item, j) => (
                            <div key={item.id} style={{
                              display: 'flex', alignItems: 'center', gap: '10px',
                              padding: '8px 12px',
                              backgroundColor: 'var(--bg-card)',
                              borderRadius: '10px',
                              border: '1px solid var(--border)',
                            }}>
                              <GripVertical size={14} style={{ color: 'var(--border)', flexShrink: 0 }} />

                              {/* Reorder */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flexShrink: 0 }}>
                                <ArrowBtn disabled={j === 0} onClick={() => moveProduct(s.id, item.id, 'up')} title="Subir">
                                  <ChevronUp size={11} />
                                </ArrowBtn>
                                <ArrowBtn disabled={j === s.items.length - 1} onClick={() => moveProduct(s.id, item.id, 'down')} title="Bajar">
                                  <ChevronDown size={11} />
                                </ArrowBtn>
                              </div>

                              {/* Thumbnail */}
                              <div style={{
                                width: '40px', height: '40px', borderRadius: '8px',
                                overflow: 'hidden', backgroundColor: 'var(--bg-secondary)',
                                flexShrink: 0, position: 'relative',
                              }}>
                                {item.product?.image_url ? (
                                  <Image src={item.product.image_url} alt="" fill style={{ objectFit: 'cover' }} />
                                ) : (
                                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package size={16} style={{ color: 'var(--text-muted)' }} />
                                  </div>
                                )}
                              </div>

                              {/* Name + price */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.product?.name || 'Producto eliminado'}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  {item.product ? `$${item.product.price.toLocaleString('es-AR')}` : '—'}
                                </p>
                              </div>

                              {/* Position badge */}
                              <span style={{
                                fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)',
                                backgroundColor: 'var(--bg-secondary)', padding: '2px 8px',
                                borderRadius: '6px', flexShrink: 0,
                              }}>
                                #{j + 1}
                              </span>

                              {/* Remove */}
                              <button onClick={() => removeProduct(item.id)} title="Quitar" style={{
                                width: '28px', height: '28px', borderRadius: '7px',
                                border: '1px solid var(--border)', backgroundColor: 'transparent',
                                cursor: 'pointer', color: 'var(--error)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0, transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f8d7da')}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
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
            width: '100%', maxWidth: '440px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '20px', border: '1px solid var(--border)',
            padding: '28px', zIndex: 201, boxShadow: 'var(--shadow-lg)',
          }} className="animate-scale-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'Lora, serif', fontSize: '1.2rem', color: 'var(--text)' }}>
                {editing ? 'Editar sección' : 'Nueva sección'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Título *
              </label>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Más vendidos"
                autoFocus
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Subtítulo (opcional)
              </label>
              <input value={subtitle} onChange={e => setSubtitle(e.target.value)}
                placeholder="Ej: Los favoritos de nuestros clientes"
                style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
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
      width: '22px', height: '22px', borderRadius: '5px',
      border: '1px solid var(--border)',
      backgroundColor: 'transparent',
      cursor: disabled ? 'default' : 'pointer',
      color: disabled ? 'var(--border)' : 'var(--text-muted)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: disabled ? 0.4 : 1,
      transition: 'all 0.15s ease',
      padding: 0,
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
