'use client'

import { useState } from 'react'
import Link from 'next/link'

// Actualizar con el handle real de Instagram
const IG_HANDLE = 'copuertos'
const IG_URL = `https://www.instagram.com/${IG_HANDLE}/`

const IgIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const POSTS = [
  { id: 1, url: 'https://www.instagram.com/p/DRCj_H0DX2q/', tag: 'Cocina Oculta' },
  { id: 2, url: 'https://www.instagram.com/p/DOJAOHpERs_/', tag: 'Recetas caseras' },
  { id: 3, url: 'https://www.instagram.com/p/DOE1S25iRtT/', tag: 'Sellado al vacío' },
  { id: 4, url: 'https://www.instagram.com/p/DLfyIOHyJtR/', tag: 'Ingredientes frescos' },
  { id: 5, url: 'https://www.instagram.com/p/DMq9qy1JEgk/', tag: 'Cocina de autor' },
  { id: 6, url: 'https://www.instagram.com/p/DK-Xk3KSiAl/', tag: 'Proceso artesanal' },
]

function PostCard({ post }: { post: typeof POSTS[0] }) {
  const [hovered, setHovered] = useState(false)
  const embedUrl = post.url + 'embed'

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'block',
        aspectRatio: '1 / 1',
        borderRadius: '14px',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        textDecoration: 'none',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 50px rgba(0,0,0,0.14), 0 8px 20px rgba(0,0,0,0.08)'
          : '0 4px 16px rgba(0,0,0,0.06)',
      }}
    >
      <iframe
        src={embedUrl}
        style={{
          width: '100%', height: '100%', border: 'none',
          pointerEvents: 'none',
          transform: 'scale(1.5)',
          transformOrigin: 'top center',
        }}
        loading="lazy"
        title={post.tag}
      />

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.55)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '8px',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}>
        <div style={{
          width: '44px', height: '44px',
          borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white',
        }}>
          <IgIcon />
        </div>
        <span style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '0.75rem',
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}>
          Ver en Instagram
        </span>
      </div>

      {/* Tag bottom left */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '12px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        borderRadius: '8px',
        padding: '4px 10px',
        opacity: hovered ? 0 : 1,
        transition: 'opacity 0.2s ease',
      }}>
        <span style={{
          color: 'rgba(255,255,255,0.75)',
          fontSize: '0.7rem',
          fontWeight: 500,
          letterSpacing: '0.03em',
        }}>
          {post.tag}
        </span>
      </div>
    </a>
  )
}

export default function InstagramSection() {
  return (
    <section style={{
      padding: '90px 24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          marginBottom: '44px', flexWrap: 'wrap', gap: '20px',
        }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              marginBottom: '12px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '9px',
                background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', flexShrink: 0,
              }}>
                <IgIcon />
              </div>
              <span style={{
                color: 'var(--text-muted)', fontSize: '0.8rem',
                fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Instagram
              </span>
            </div>

            <h2 style={{
              fontFamily: 'Lora, serif',
              fontSize: 'clamp(1.9rem, 3.5vw, 2.7rem)',
              fontWeight: 700, color: 'var(--text)',
              lineHeight: 1.1, margin: 0,
            }}>
              Seguinos en{' '}
              <span style={{
                background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                @{IG_HANDLE}
              </span>
            </h2>
          </div>

          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 22px',
              background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
              color: 'white', borderRadius: '12px',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
              boxShadow: '0 4px 20px rgba(253,29,29,0.25)',
              flexShrink: 0,
            }}
          >
            <IgIcon />
            Seguir
          </a>
        </div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
        }} className="instagram-grid">
          {POSTS.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '28px',
          textAlign: 'center',
        }}>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--text-muted)', fontSize: '0.85rem',
              textDecoration: 'none', fontWeight: 500,
              letterSpacing: '0.02em',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'}
          >
            Ver todos los posts en instagram.com/{IG_HANDLE} →
          </a>
        </div>
      </div>
    </section>
  )
}
