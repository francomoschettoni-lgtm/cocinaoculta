'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminNav from '@/components/admin/AdminNav'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Star, StarOff,
  Upload, X, Check, AlertCircle, Package,
} from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'platos-principales', label: 'Platos Principales' },
  { value: 'nueces-pecan', label: 'Nueces Pecan' },
  { value: 'guarniciones', label: 'Guarniciones' },
  { value: 'salsas', label: 'Salsas' },
]

const EMPTY_FORM = {
  name: '', description: '', price: '',
  category: 'platos-principales', weight: '',
  preparation: '', is_available: true, is_featured: false,
  image_url: '',
}

export default function ProductosAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('category').order('name')
    setProducts(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview('')
    setShowModal(true)
  }

  function openEdit(p: Product) {
    setEditing(p)
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      category: p.category,
      weight: p.weight || '',
      preparation: p.preparation || '',
      is_available: p.is_available,
      is_featured: p.is_featured,
      image_url: p.image_url || '',
    })
    setImageFile(null)
    setImagePreview(p.image_url || '')
    setShowModal(true)
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage(file: File): Promise<string | null> {
    setUploadingImage(true)
    try {
      const ext = file.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('products').upload(fileName, file, { upsert: true })
      if (error) throw error
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      return data.publicUrl
    } catch {
      toast.error('Error al subir imagen')
      return null
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSave() {
    if (!form.name || !form.price) {
      toast.error('Nombre y precio son requeridos')
      return
    }
    setSaving(true)
    try {
      let imageUrl = form.image_url
      if (imageFile) {
        const uploaded = await uploadImage(imageFile)
        if (!uploaded) { setSaving(false); return }
        imageUrl = uploaded
      }

      const payload = {
        name: form.name,
        description: form.description || null,
        price: parseFloat(form.price),
        category: form.category,
        weight: form.weight || null,
        preparation: form.preparation || null,
        is_available: form.is_available,
        is_featured: form.is_featured,
        image_url: imageUrl || null,
      }

      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id)
        if (error) throw error
        toast.success('Producto actualizado')
      } else {
        const { error } = await supabase.from('products').insert(payload)
        if (error) throw error
        toast.success('Producto creado')
      }

      setShowModal(false)
      loadProducts()
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function toggleAvailable(p: Product) {
    const { error } = await supabase.from('products').update({ is_available: !p.is_available }).eq('id', p.id)
    if (error) { toast.error('Error'); return }
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_available: !p.is_available } : x))
    toast.success(p.is_available ? 'Producto ocultado' : 'Producto visible')
  }

  async function toggleFeatured(p: Product) {
    const { error } = await supabase.from('products').update({ is_featured: !p.is_featured }).eq('id', p.id)
    if (error) { toast.error('Error'); return }
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_featured: !p.is_featured } : x))
    toast.success(p.is_featured ? 'Quitado de destacados' : 'Marcado como destacado')
  }

  async function handleDelete(p: Product) {
    if (!confirm(`¿Eliminar "${p.name}"? Esta acción no se puede deshacer.`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) { toast.error('Error al eliminar'); return }
    setProducts(prev => prev.filter(x => x.id !== p.id))
    toast.success('Producto eliminado')
  }

  return (
    <AdminGuard>
      <AdminNav />
      <div style={{ flex: 1, padding: '32px', backgroundColor: 'var(--bg)', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)' }}>
              Productos
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
              {products.length} productos · {products.filter(p => p.is_available).length} activos
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
            <Plus size={16} /> Nuevo producto
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: '64px', borderRadius: '12px' }} className="skeleton" />
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
                  {['Producto', 'Categoría', 'Precio', 'Estado', 'Acciones'].map(h => (
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
                {products.map((p, i) => (
                  <tr key={p.id} style={{
                    borderTop: '1px solid var(--border)',
                    backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                    opacity: p.is_available ? 1 : 0.6,
                  }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '44px', height: '44px',
                          borderRadius: '8px', overflow: 'hidden',
                          backgroundColor: 'var(--bg-secondary)',
                          flexShrink: 0, position: 'relative',
                        }}>
                          {p.image_url ? (
                            <Image src={p.image_url} alt={p.name} fill style={{ objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Package size={18} style={{ color: 'var(--text-muted)' }} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>
                            {p.name}
                            {p.is_featured && <Star size={12} style={{ color: 'var(--accent)', display: 'inline', marginLeft: '6px' }} />}
                          </p>
                          {p.weight && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.weight}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px',
                        backgroundColor: 'var(--accent-light)',
                        color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        {CATEGORIES.find(c => c.value === p.category)?.label || p.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9rem' }}>
                        {formatPrice(p.price)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: '12px',
                        fontSize: '0.75rem', fontWeight: 600,
                        backgroundColor: p.is_available ? '#d4edda' : '#f8d7da',
                        color: p.is_available ? '#155724' : '#721c24',
                      }}>
                        {p.is_available ? 'Activo' : 'Oculto'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <ActionBtn onClick={() => openEdit(p)} title="Editar" color="var(--accent)">
                          <Pencil size={14} />
                        </ActionBtn>
                        <ActionBtn onClick={() => toggleAvailable(p)} title={p.is_available ? 'Ocultar' : 'Mostrar'} color="var(--text-muted)">
                          {p.is_available ? <EyeOff size={14} /> : <Eye size={14} />}
                        </ActionBtn>
                        <ActionBtn onClick={() => toggleFeatured(p)} title={p.is_featured ? 'Quitar destacado' : 'Destacar'} color="var(--text-muted)">
                          {p.is_featured ? <StarOff size={14} /> : <Star size={14} />}
                        </ActionBtn>
                        <ActionBtn onClick={() => handleDelete(p)} title="Eliminar" color="var(--error)">
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
        <>
          <div onClick={() => setShowModal(false)} style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 200, backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}>
          <div onClick={e => e.stopPropagation()} style={{
            width: '100%', maxWidth: '560px',
            maxHeight: '90vh', overflowY: 'auto',
            backgroundColor: 'var(--bg-card)',
            borderRadius: '20px', border: '1px solid var(--border)',
            padding: '28px',
            zIndex: 201, boxShadow: 'var(--shadow-lg)',
          }} className="animate-scale-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.2rem', color: 'var(--text)' }}>
                {editing ? 'Editar producto' : 'Nuevo producto'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)',
              }}>
                <X size={20} />
              </button>
            </div>

            {/* Image upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Imagen del producto
              </label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  width: '100%', height: '160px',
                  border: '2px dashed var(--border)',
                  borderRadius: '12px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: '8px', cursor: 'pointer',
                  backgroundColor: 'var(--bg-secondary)',
                  overflow: 'hidden', position: 'relative',
                  transition: 'border-color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'}
              >
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill style={{ objectFit: 'cover' }} />
                ) : (
                  <>
                    <Upload size={24} style={{ color: 'var(--text-muted)' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Click para subir imagen
                    </p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} style={{ display: 'none' }} />
              {imagePreview && (
                <button onClick={() => { setImagePreview(''); setImageFile(null); setForm(f => ({ ...f, image_url: '' })) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)', fontSize: '0.8rem', marginTop: '6px' }}>
                  Quitar imagen
                </button>
              )}
            </div>

            {/* Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormLabel>Nombre *</FormLabel>
                <FormInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
              </div>
              <div>
                <FormLabel>Precio (ARS) *</FormLabel>
                <FormInput value={form.price} onChange={v => setForm(f => ({ ...f, price: v }))} type="number" />
              </div>
              <div>
                <FormLabel>Peso / Cantidad</FormLabel>
                <FormInput value={form.weight} onChange={v => setForm(f => ({ ...f, weight: v }))} placeholder="ej: 500g" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormLabel>Categoría</FormLabel>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormLabel>Descripción</FormLabel>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none', resize: 'vertical' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <FormLabel>Instrucciones de preparación</FormLabel>
                <FormInput value={form.preparation} onChange={v => setForm(f => ({ ...f, preparation: v }))} placeholder="Ej: Calentar 5 min en microondas" />
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <Toggle
                label="Visible en tienda"
                checked={form.is_available}
                onChange={v => setForm(f => ({ ...f, is_available: v }))}
              />
              <Toggle
                label="Destacado"
                checked={form.is_featured}
                onChange={v => setForm(f => ({ ...f, is_featured: v }))}
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
              <button onClick={handleSave} disabled={saving || uploadingImage} style={{
                padding: '11px 24px', backgroundColor: saving ? 'var(--border)' : 'var(--accent)',
                color: saving ? 'var(--text-muted)' : 'white',
                border: 'none', borderRadius: '10px', cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                {saving ? 'Guardando...' : <><Check size={15} /> {editing ? 'Guardar cambios' : 'Crear producto'}</>}
              </button>
            </div>
          </div>
          </div>
        </>
      )}
    </AdminGuard>
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

function FormLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{
      display: 'block', fontSize: '0.78rem', fontWeight: 600,
      color: 'var(--text-muted)', marginBottom: '5px',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {children}
    </label>
  )
}

function FormInput({ value, onChange, type = 'text', placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ width: '100%', padding: '10px 12px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif', outline: 'none' }} />
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 14px', borderRadius: '10px',
      border: `1px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
      backgroundColor: checked ? 'var(--accent-light)' : 'transparent',
      cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
    }}>
      <span style={{ fontSize: '0.85rem', color: checked ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 500 }}>
        {label}
      </span>
      <div style={{
        width: '36px', height: '20px', borderRadius: '10px',
        backgroundColor: checked ? 'var(--accent)' : 'var(--border)',
        position: 'relative', transition: 'background 0.2s ease',
      }}>
        <div style={{
          position: 'absolute', top: '2px',
          left: checked ? '18px' : '2px',
          width: '16px', height: '16px',
          borderRadius: '50%', backgroundColor: 'white',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </div>
    </button>
  )
}
