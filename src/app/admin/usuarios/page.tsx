'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminGuard from '@/components/admin/AdminGuard'
import AdminNav from '@/components/admin/AdminNav'
import { UserPlus, Trash2, CheckCircle, Clock, Mail } from 'lucide-react'
import toast from 'react-hot-toast'

interface AdminUser {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  confirmed: boolean
}

async function getAuthHeader() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ? `Bearer ${session.access_token}` : ''
}

export default function UsuariosAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  useEffect(() => { loadUsers() }, [])

  async function loadUsers() {
    setLoading(true)
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/admin/users', { headers: { authorization: auth } })
      if (!res.ok) throw new Error()
      setUsers(await res.json())
    } catch {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: auth },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`Invitación enviada a ${inviteEmail}`)
      setInviteEmail('')
      loadUsers()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al invitar usuario')
    } finally {
      setInviting(false)
    }
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`¿Eliminar el acceso de ${user.email}? Esta acción no se puede deshacer.`)) return
    try {
      const auth = await getAuthHeader()
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', authorization: auth },
        body: JSON.stringify({ userId: user.id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Usuario eliminado')
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch {
      toast.error('Error al eliminar usuario')
    }
  }

  function formatDate(s: string | null) {
    if (!s) return '—'
    return new Date(s).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AdminGuard>
      <AdminNav />
      <div style={{ flex: 1, padding: '32px', backgroundColor: 'var(--bg)', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: '1.7rem', fontWeight: 700, color: 'var(--text)' }}>
            Usuarios
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            Administradores con acceso al panel
          </p>
        </div>

        {/* Invite form */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          padding: '24px',
          marginBottom: '28px',
        }}>
          <h2 style={{
            fontFamily: 'Lora, serif',
            fontSize: '1.1rem', fontWeight: 600,
            color: 'var(--text)', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <UserPlus size={18} style={{ color: 'var(--accent)' }} />
            Invitar nuevo administrador
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px', lineHeight: 1.6 }}>
            Se le enviará un email con un link para que cree su contraseña y pueda acceder al panel.
          </p>
          <form onSubmit={handleInvite} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <Mail size={15} style={{
                position: 'absolute', left: '12px', top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                required
                style={{
                  width: '100%', padding: '11px 14px 11px 36px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  color: 'var(--text)', fontSize: '0.9rem',
                  outline: 'none', fontFamily: 'Inter, sans-serif',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={inviting}
              style={{
                padding: '11px 22px',
                backgroundColor: inviting ? 'var(--border)' : 'var(--accent)',
                color: inviting ? 'var(--text-muted)' : 'white',
                border: 'none', borderRadius: '10px',
                fontWeight: 600, fontSize: '0.9rem',
                cursor: inviting ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '7px',
                fontFamily: 'Inter, sans-serif',
                flexShrink: 0,
              }}
            >
              <UserPlus size={15} />
              {inviting ? 'Enviando...' : 'Enviar invitación'}
            </button>
          </form>
        </div>

        {/* Users list */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-secondary)',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
              {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '64px', margin: '1px 0' }} className="skeleton" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No hay usuarios registrados
            </div>
          ) : (
            users.map((user, i) => (
              <div
                key={user.id}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 20px', gap: '16px', flexWrap: 'wrap',
                  borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  backgroundColor: i % 2 === 0 ? 'transparent' : 'var(--bg-secondary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    backgroundColor: 'var(--accent-light)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--accent)', fontFamily: 'Lora, serif',
                    fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                  }}>
                    {user.email[0].toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Último acceso: {formatDate(user.last_sign_in_at)}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                    backgroundColor: user.confirmed ? '#d4edda' : '#fff3cd',
                    color: user.confirmed ? '#155724' : '#856404',
                  }}>
                    {user.confirmed
                      ? <><CheckCircle size={12} /> Confirmado</>
                      : <><Clock size={12} /> Invitación pendiente</>
                    }
                  </span>

                  <button
                    onClick={() => handleDelete(user)}
                    title="Eliminar acceso"
                    style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      border: '1px solid var(--border)', backgroundColor: 'transparent',
                      cursor: 'pointer', color: 'var(--error)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-secondary)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminGuard>
  )
}
