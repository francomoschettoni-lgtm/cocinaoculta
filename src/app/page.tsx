import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Clock, Leaf, MapPin, Package, MessageCircle, Phone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import ProductCard from '@/components/store/ProductCard'
import StoreMap from '@/components/map/StoreMapClient'
import InstagramSection from '@/components/home/InstagramSection'

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const { data } = await supabase
      .from('products').select('*')
      .eq('is_available', true).eq('is_featured', true)
      .order('created_at', { ascending: false }).limit(4)
    return data || []
  } catch { return [] }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts()

  return (
    <div>

      {/* ── HERO ─────────────────────────────────────── */}
      <section style={{ minHeight: '92vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* Forest background image */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src="/bosque.jpg"
            alt="Bosque Cocina Oculta"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            priority
            quality={95}
          />
          {/* Dark overlay — stronger at bottom, lighter at top for image visibility */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(5,12,8,0.92) 0%, rgba(5,12,8,0.82) 50%, rgba(5,12,8,0.70) 100%)',
          }} />
        </div>

        {/* Content */}
        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: 'clamp(48px, 8vh, 90px) 24px',
          position: 'relative', zIndex: 1, width: '100%',
        }}>
          <div className="hero-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px', alignItems: 'center',
          }}>

            {/* ── Left text ── */}
            <div className="animate-fade-in">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '20px', padding: '5px 14px', marginBottom: '28px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
              }}>
                <Leaf size={13} style={{ color: '#7DBA9B' }} />
                <span style={{ color: '#A8D5BA', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.06em' }}>
                  Sin conservantes · Ingredientes frescos
                </span>
              </div>

              <h1 style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)',
                fontWeight: 700, color: '#F5F0E8',
                lineHeight: 1.05, marginBottom: '22px',
                letterSpacing: '-0.01em',
                textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}>
                La cocina de casa,{' '}
                <em style={{ color: '#7DBA9B', fontStyle: 'italic' }}>lista para vos</em>
              </h1>

              <p style={{
                fontSize: '1.05rem', color: 'rgba(235,235,225,0.82)',
                lineHeight: 1.75, marginBottom: '36px', maxWidth: '440px',
              }}>
                Preparamos platos caseros al vacío con ingredientes frescos.
                Calentar en microondas o agua hirviendo y listo.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <Link href="/tienda" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px',
                  backgroundColor: '#2D7A4F', color: 'white',
                  borderRadius: '10px', textDecoration: 'none',
                  fontWeight: 600, fontSize: '0.92rem',
                  boxShadow: '0 4px 20px rgba(45,122,79,0.5)',
                }}>
                  Ver productos <ArrowRight size={15} />
                </Link>
                <a href="https://wa.me/5491153447998" target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 24px',
                  backgroundColor: 'rgba(255,255,255,0.12)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '10px', textDecoration: 'none',
                  fontWeight: 500, fontSize: '0.92rem',
                  backdropFilter: 'blur(8px)',
                }}>
                  <MessageCircle size={15} /> Escribinos
                </a>
              </div>

              {/* Stats strip */}
              <div style={{
                display: 'flex', gap: '0',
                borderTop: '1px solid rgba(255,255,255,0.15)',
                paddingTop: '28px',
              }}>
                {[
                  { value: 'Al vacío', label: 'Sellado artesanal' },
                  { value: '3 zonas', label: 'Tigre · San Isidro · Escobar' },
                  { value: 'Sin aditivos', label: 'Comida real' },
                ].map(({ value, label }, i) => (
                  <div key={i} style={{
                    flex: 1,
                    paddingRight: '20px',
                    borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                    paddingLeft: i > 0 ? '20px' : '0',
                  }}>
                    <p style={{
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1.1rem', fontWeight: 700,
                      color: '#F5F0E8', lineHeight: 1.1, marginBottom: '3px',
                    }}>{value}</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right floating visual ── */}
            <div className="hero-visual" style={{
              position: 'relative', display: 'flex',
              alignItems: 'center', justifyContent: 'center', height: '480px',
            }}>
              {/* Central circle */}
              <div style={{
                position: 'absolute',
                width: '200px', height: '200px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(45,122,79,0.25) 0%, transparent 70%)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }} className="animate-float">
                <Image src="/logo-white.svg" alt="Cocina Oculta" width={80} height={88} />
              </div>

              {[
                { top: '48px', left: '0', label: 'Listo en minutos', sub: 'Microondas o agua', delay: '0.5s', dur: '5s' },
                { top: '72px', right: '0', label: '100% casero', sub: 'Sin conservantes', delay: '1s', dur: '4.5s', accent: true },
                { bottom: '80px', left: '10px', label: 'Sellado al vacío', sub: 'Frescura garantizada', delay: '0.2s', dur: '5.5s' },
                { bottom: '60px', right: '10px', label: 'Puertos Escobar', sub: 'Envíos a tu zona', delay: '1.5s', dur: '4s' },
              ].map(({ top, left, right, bottom, label, sub, delay, dur, accent }, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top, left, right, bottom,
                  backgroundColor: accent ? '#2D7A4F' : 'rgba(15,25,18,0.75)',
                  border: accent ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '14px', padding: '12px 16px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: accent ? '0 8px 24px rgba(45,122,79,0.4)' : '0 4px 20px rgba(0,0,0,0.3)',
                  animation: `float ${dur} ease-in-out infinite`,
                  animationDelay: delay,
                  maxWidth: '170px',
                }}>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '0.98rem', fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{label}</p>
                  <p style={{ fontSize: '0.7rem', color: accent ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)', marginTop: '3px' }}>{sub}</p>
                </div>
              ))}

              {/* Dot grids */}
              {[{ top: '160px', left: '30px' }, { bottom: '160px', right: '30px' }].map((pos, i) => (
                <div key={i} style={{
                  position: 'absolute', ...pos,
                  display: 'grid', gridTemplateColumns: 'repeat(4, 6px)', gap: '6px', opacity: 0.2,
                }}>
                  {Array.from({ length: 16 }).map((_, j) => (
                    <div key={j} style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#7DBA9B' }} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features strip ───────────────────────────── */}
      <section style={{
        backgroundColor: 'var(--bg-secondary)',
        padding: '52px 24px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
            {[
              { icon: <Clock size={20} />, title: 'Listo en minutos', desc: 'Microondas o agua hirviendo' },
              { icon: <Package size={20} />, title: 'Sellado al vacío', desc: 'Frescura garantizada' },
              { icon: <Leaf size={20} />, title: 'Sin conservantes', desc: 'Solo ingredientes frescos' },
              { icon: <MapPin size={20} />, title: 'Envíos locales', desc: 'Tigre, San Isidro, Escobar' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', gap: '10px', padding: '22px 16px',
                borderRadius: '14px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)',
              }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                  {icon}
                </div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>{title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured products ────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ padding: '80px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '44px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Destacados</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', marginTop: '6px' }}>
                Nuestros favoritos
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }} className="stagger-children">
              {featured.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
            <div style={{ marginTop: '36px' }}>
              <Link href="/tienda" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 26px', border: '1px solid var(--accent)', color: 'var(--accent)',
                borderRadius: '10px', textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem',
              }}>
                Ver toda la tienda <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── About ────────────────────────────────────── */}
      <section id="nosotros" style={{ padding: '80px 24px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 200 300" style={{ position: 'absolute', right: '-40px', top: '0', height: '100%', opacity: 0.04, pointerEvents: 'none', color: 'var(--accent)' }} fill="currentColor">
          <path d="M160 10 C180 60, 200 120, 140 180 C100 220, 40 230, 20 290 C60 250, 80 200, 100 160 C120 120, 130 70, 160 10Z" />
        </svg>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Nuestra historia</span>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 700, color: 'var(--text)', margin: '10px 0 20px' }}>
            Cocina hecha con intención
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.85, fontSize: '1rem', marginBottom: '16px' }}>
            Cocina Oculta nació en Puertos Escobar con una idea simple: hacer que la buena comida casera sea accesible para todos, sin importar el tiempo disponible.
          </p>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.85, fontSize: '1rem' }}>
            Sellamos al vacío cada preparación para conservar todos los sabores y nutrientes. Sin aditivos, sin conservantes. Solo comida real, lista para vos.
          </p>
        </div>
      </section>

      {/* ── Instagram ────────────────────────────────── */}
      <InstagramSection />

      {/* ── Map & Contact ─────────────────────────────── */}
      <section id="contacto" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="map-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '60px', alignItems: 'center' }}>

            {/* Info left */}
            <div>
              <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Dónde estamos</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, color: 'var(--text)', margin: '10px 0 22px' }}>
                Puertos Escobar
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '28px' }}>
                {[
                  { icon: <MapPin size={14} />, label: 'Dirección', text: 'Av. del Navegante 1600' },
                  { icon: <MapPin size={14} />, label: 'Localidad', text: 'Puertos Escobar, Buenos Aires' },
                  { icon: <Phone size={14} />, label: 'Teléfono', text: '+54 9 11 5344-7998' },
                ].map(({ icon, label, text }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600, marginBottom: '2px' }}>{label}</p>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}>{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: '28px' }}>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Zonas de envío</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[{ z: 'Tigre', p: '$2.000' }, { z: 'San Isidro', p: '$3.000' }, { z: 'Escobar', p: '$1.000' }].map(({ z, p }) => (
                    <span key={z} style={{
                      padding: '5px 12px', backgroundColor: 'var(--accent-light)', color: 'var(--accent)',
                      borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500, border: '1px solid var(--accent)',
                    }}>
                      {z} · {p}
                    </span>
                  ))}
                </div>
              </div>

              <a href="https://wa.me/5491153447998" target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 22px', backgroundColor: '#25D366', color: 'white',
                borderRadius: '10px', textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
              }}>
                <MessageCircle size={14} /> Contactar por WhatsApp
              </a>
            </div>

            {/* Map */}
            <StoreMap />
          </div>
        </div>
      </section>

    </div>
  )
}
