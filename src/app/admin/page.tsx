'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/admin/productos')
    } catch {
      setError('Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* Background */}
      <Image
        src="/bosque.jpg"
        alt=""
        fill
        style={{ objectFit: 'cover', objectPosition: 'center' }}
        quality={90}
        priority
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(5,14,8,0.82) 0%, rgba(8,20,12,0.90) 100%)',
      }} />

      {/* Back link */}
      <Link href="/" style={{
        position: 'absolute', top: '28px', left: '32px',
        color: 'rgba(255,255,255,0.45)', fontSize: '0.82rem',
        textDecoration: 'none', letterSpacing: '0.02em',
        zIndex: 10,
        transition: 'color 0.2s',
      }}>
        ← Volver al sitio
      </Link>

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: '400px',
        margin: '0 24px',
        backgroundColor: 'rgba(15, 22, 17, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '44px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>

        {/* Logo + title */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <Image
            src="/logo-white.svg"
            alt="Cocina Oculta"
            width={48}
            height={53}
            style={{ margin: '0 auto 18px', display: 'block' }}
          />
          <h1 style={{
            fontFamily: 'Lora, serif',
            fontSize: '1.6rem', fontWeight: 700,
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '0.01em',
          }}>
            Panel Admin
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.82rem', marginTop: '5px' }}>
            Cocina Oculta · Puertos Escobar
          </p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', marginBottom: '7px',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%', padding: '12px 14px',
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '11px',
                color: 'rgba(255,255,255,0.88)', fontSize: '0.9rem',
                outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{
              display: 'block', fontSize: '0.75rem', fontWeight: 600,
              color: 'rgba(255,255,255,0.4)', marginBottom: '7px',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: '100%', padding: '12px 42px 12px 14px',
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '11px',
                  color: 'rgba(255,255,255,0.88)', fontSize: '0.9rem',
                  outline: 'none', fontFamily: 'Inter, sans-serif',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute', right: '13px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.35)',
                  padding: 0, display: 'flex',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p style={{
              color: '#fc8181', fontSize: '0.83rem',
              marginBottom: '16px', textAlign: 'center',
            }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              backgroundColor: loading ? 'rgba(74,173,114,0.4)' : '#4AAD72',
              color: 'white',
              border: 'none', borderRadius: '12px',
              fontSize: '0.93rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.02em',
              transition: 'background-color 0.2s',
            }}
          >
            <LogIn size={15} />
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
