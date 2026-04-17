'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Heart, Leaf, ShieldCheck, Sparkles, MessageCircle, Beef, Bone, Salad, Cherry } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import ProductCard from '@/components/store/ProductCard'

const HERO_IMAGES = [
  '/barf-corgi.png',
  '/barf-pack.jpg',
]

export default function BarfPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImg, setCurrentImg] = useState(0)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products').select('*')
        .eq('is_available', true)
        .eq('category', 'barf-perros')
        .order('name')
      setProducts(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImg(prev => (prev + 1) % HERO_IMAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '88vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Slideshow background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {HERO_IMAGES.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt="BARF comida natural para perros"
              fill
              style={{
                objectFit: 'cover', objectPosition: 'center',
                opacity: currentImg === i ? 1 : 0,
                transition: 'opacity 1.2s ease-in-out',
              }}
              priority={i === 0}
              quality={90}
            />
          ))}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(5,12,8,0.88) 0%, rgba(5,12,8,0.60) 45%, rgba(5,12,8,0.25) 100%)',
          }} />
        </div>

        <div style={{
          maxWidth: '1200px', margin: '0 auto',
          padding: 'clamp(48px, 8vh, 90px) 24px',
          position: 'relative', zIndex: 1, width: '100%',
        }}>
          <div className="barf-hero-grid" style={{
            display: 'grid', gridTemplateColumns: '1.2fr 1fr',
            gap: '80px', alignItems: 'center',
          }}>

            {/* Left — text */}
            <div className="animate-fade-in">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '20px', padding: '5px 14px', marginBottom: '24px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
              }}>
                <Leaf size={13} style={{ color: '#7DBA9B' }} />
                <span style={{ color: '#A8D5BA', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.06em' }}>
                  100% natural · Sin conservantes
                </span>
              </div>

              <h1 style={{
                fontFamily: 'Lora, serif',
                fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
                fontWeight: 700, color: '#F5F0E8',
                lineHeight: 1.05, marginBottom: '20px',
                textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}>
                Alimento crudo,{' '}
                <em style={{ color: '#7DBA9B', fontStyle: 'italic' }}>biológicamente apropiado</em>
              </h1>

              <p style={{
                fontSize: '1.05rem', color: 'rgba(235,235,225,0.82)',
                lineHeight: 1.75, marginBottom: '32px', maxWidth: '460px',
              }}>
                La dieta BARF devuelve a tu perro la nutrición que la naturaleza diseñó.
                Ingredientes crudos, frescos, sin procesamiento industrial.
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
                  Comprar ahora <ArrowRight size={15} />
                </Link>
                <a href="https://wa.me/5491153447998?text=Hola!%20Quiero%20consultar%20por%20el%20BARF%20Mix" target="_blank" rel="noopener noreferrer" style={{
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

              {/* Stats */}
              <div style={{
                display: 'flex', gap: '0',
                borderTop: '1px solid rgba(255,255,255,0.15)',
                paddingTop: '28px',
              }}>
                {[
                  { value: '100% crudo', label: 'Sin cocción' },
                  { value: '500g', label: 'Por porción' },
                  { value: '$20.000', label: 'BARF Mix Completo' },
                ].map(({ value, label }, i) => (
                  <div key={i} style={{
                    flex: 1, paddingRight: '20px',
                    borderRight: i < 2 ? '1px solid rgba(255,255,255,0.15)' : 'none',
                    paddingLeft: i > 0 ? '20px' : '0',
                  }}>
                    <p style={{
                      fontFamily: 'Lora, serif',
                      fontSize: '1.1rem', fontWeight: 700,
                      color: '#F5F0E8', lineHeight: 1.1, marginBottom: '3px',
                    }}>{value}</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.4 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating cards like homepage */}
            <div className="barf-hero-visual" style={{
              position: 'relative', display: 'flex',
              alignItems: 'center', justifyContent: 'center', height: '480px',
            }}>
              {/* Central logo */}
              <div style={{
                position: 'absolute',
                width: '220px', height: '220px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(45,122,79,0.25) 0%, transparent 70%)',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }} className="animate-float">
                <Image src="/barf-logo.png" alt="BARF" width={130} height={130} style={{ objectFit: 'contain' }} />
              </div>

              {[
                { top: '40px', left: '0', label: 'BARF Mix 500g', sub: '$20.000', delay: '0.5s', dur: '5s' },
                { top: '80px', right: '0', label: '100% natural', sub: 'Sin conservantes', delay: '1s', dur: '4.5s', accent: true },
                { bottom: '80px', left: '10px', label: 'Sellado al vacío', sub: 'Frescura garantizada', delay: '0.2s', dur: '5.5s' },
                { bottom: '50px', right: '10px', label: 'Envíos locales', sub: 'Tigre · San Isidro · Escobar', delay: '1.5s', dur: '4s' },
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
                  <p style={{ fontFamily: 'Lora, serif', fontSize: '0.98rem', fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{label}</p>
                  <p style={{ fontSize: '0.7rem', color: accent ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)', marginTop: '3px' }}>{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROPORTIONS ── */}
      <section style={{
        padding: '80px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <svg viewBox="0 0 200 300" style={{ position: 'absolute', left: '-40px', top: '0', height: '100%', opacity: 0.04, pointerEvents: 'none', color: 'var(--accent)' }} fill="currentColor">
          <path d="M160 10 C180 60, 200 120, 140 180 C100 220, 40 230, 20 290 C60 250, 80 200, 100 160 C120 120, 130 70, 160 10Z" />
        </svg>
        <svg viewBox="0 0 200 300" style={{ position: 'absolute', right: '-30px', bottom: '0', height: '80%', opacity: 0.03, pointerEvents: 'none', color: 'var(--accent)', transform: 'scaleX(-1)' }} fill="currentColor">
          <path d="M160 10 C180 60, 200 120, 140 180 C100 220, 40 230, 20 290 C60 250, 80 200, 100 160 C120 120, 130 70, 160 10Z" />
        </svg>
        <div style={{
          position: 'absolute', top: '-80px', right: '15%',
          width: '250px', height: '250px', borderRadius: '50%',
          border: '1px solid var(--border)', opacity: 0.4,
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Composición
            </span>
            <h2 style={{
              fontFamily: 'Lora, serif',
              fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 700,
              color: 'var(--text)', marginTop: '6px',
            }}>
              Qué lleva nuestro BARF Mix
            </h2>
            <p style={{ color: 'var(--text-muted)', marginTop: '12px', maxWidth: '540px', margin: '12px auto 0', lineHeight: 1.7 }}>
              Cada porción de 500g está balanceada para ofrecer la nutrición completa que tu perro necesita.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            {[
              { pct: '50%', label: 'Carne de res', icon: <Beef size={24} /> },
              { pct: '20%', label: 'Menudos de pollo', icon: <Bone size={24} /> },
              { pct: '20%', label: 'Verduras frescas', icon: <Salad size={24} /> },
              { pct: '10%', label: 'Frutas de estación', icon: <Cherry size={24} /> },
            ].map(({ pct, label, icon }) => (
              <div key={label} style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px', padding: '28px 24px',
                textAlign: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(-4px)'
                el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  backgroundColor: 'var(--accent-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', color: 'var(--accent)',
                }}>
                  {icon}
                </div>
                <p style={{
                  fontFamily: 'Lora, serif',
                  fontSize: '2.2rem', fontWeight: 700, color: 'var(--accent)',
                  lineHeight: 1,
                }}>{pct}</p>
                <p style={{
                  fontSize: '0.88rem', fontWeight: 600,
                  color: 'var(--text)', marginTop: '8px',
                }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS + DOGS ── */}
      <section style={{
        padding: '80px 24px',
        position: 'relative', overflow: 'hidden',
        background: `
          radial-gradient(ellipse 600px 400px at 10% 30%, rgba(45,122,79,0.06) 0%, transparent 100%),
          radial-gradient(ellipse 500px 500px at 90% 70%, rgba(45,122,79,0.05) 0%, transparent 100%),
          var(--bg)
        `,
      }}>
        {/* Decorative shapes */}
        <div style={{
          position: 'absolute', top: '60px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          border: '1px solid var(--border)', opacity: 0.5,
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-60px',
          width: '200px', height: '200px', borderRadius: '50%',
          backgroundColor: 'var(--accent)', opacity: 0.03,
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="barf-benefits-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '60px', alignItems: 'center',
          }}>
            {/* Images */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{
                borderRadius: '18px', overflow: 'hidden',
                position: 'relative', height: '280px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.10)',
              }}>
                <Image src="/barf-dog-2.jpg" alt="Perro saludable con dieta BARF" fill style={{ objectFit: 'cover' }} />
              </div>
              <div style={{
                borderRadius: '18px', overflow: 'hidden',
                position: 'relative', height: '280px', marginTop: '40px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.10)',
              }}>
                <Image src="/barf-dog-3.jpg" alt="Cachorros jugando" fill style={{ objectFit: 'cover' }} />
              </div>
            </div>

            {/* Benefits */}
            <div>
              <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Beneficios
              </span>
              <h2 style={{
                fontFamily: 'Lora, serif',
                fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700,
                color: 'var(--text)', margin: '10px 0 24px',
              }}>
                Por qué elegir BARF
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {[
                  { icon: <Heart size={18} />, title: 'Salud digestiva', desc: 'Alimento crudo que respeta el sistema digestivo canino, reduciendo alergias e inflamación.' },
                  { icon: <Sparkles size={18} />, title: 'Pelaje brillante', desc: 'Los ácidos grasos naturales mejoran la piel y el pelo desde la primera semana.' },
                  { icon: <Leaf size={18} />, title: 'Sin procesamiento', desc: 'Nada de harinas, conservantes ni aditivos. Solo ingredientes frescos que podés reconocer.' },
                  { icon: <ShieldCheck size={18} />, title: 'Proteína de calidad', desc: 'Carne y menudos de proveedores locales, seleccionados para consumo animal premium.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      backgroundColor: 'var(--accent-light)',
                      border: '1px solid var(--accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--accent)', flexShrink: 0,
                    }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem', marginBottom: '4px' }}>{title}</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.87rem', lineHeight: 1.6 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRODUCT FROM DB ── */}
      {!loading && products.length > 0 && (
        <section style={{
          padding: '80px 24px',
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '44px' }}>
              <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                Productos BARF
              </span>
              <h2 style={{
                fontFamily: 'Lora, serif',
                fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 700,
                color: 'var(--text)', marginTop: '6px',
              }}>
                Comprá directo
              </h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '24px',
            }} className="stagger-children">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
        background: `
          radial-gradient(ellipse 800px 400px at 50% 50%, rgba(45,122,79,0.07) 0%, transparent 100%),
          var(--bg)
        `,
      }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '500px', height: '500px', borderRadius: '50%',
          border: '1px dashed var(--border)', opacity: 0.4,
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <Image src="/barf-logo.png" alt="BARF" width={80} height={80} style={{ objectFit: 'contain', margin: '0 auto 20px' }} />
          <h2 style={{
            fontFamily: 'Lora, serif',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700,
            color: 'var(--text)', marginBottom: '16px',
          }}>
            Dale a tu perro la comida que merece
          </h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '28px' }}>
            Hacemos envíos a Tigre, San Isidro y Escobar.
            Pedí tu BARF Mix Completo por WhatsApp o compralo desde la tienda.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/tienda" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 28px',
              backgroundColor: 'var(--accent)', color: 'white',
              borderRadius: '10px', textDecoration: 'none',
              fontWeight: 600, fontSize: '0.92rem',
              boxShadow: '0 4px 20px rgba(45,122,79,0.4)',
            }}>
              Ir a la tienda <ArrowRight size={15} />
            </Link>
            <a href="https://wa.me/5491153447998?text=Hola!%20Quiero%20pedir%20BARF%20Mix%20Completo" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 24px',
              backgroundColor: '#25D366', color: 'white',
              borderRadius: '10px', textDecoration: 'none',
              fontWeight: 600, fontSize: '0.92rem',
            }}>
              <MessageCircle size={15} /> Pedir por WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
