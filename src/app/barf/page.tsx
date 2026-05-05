'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowRight, Heart, Leaf, ShieldCheck, Sparkles, MessageCircle, Beef, Bone, Salad, Cherry, PawPrint, ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { useCartStore } from '@/store/cart'

const HERO_IMAGES = [
  '/barf-corgi.png',
  '/barf-pack.jpg',
]

export default function BarfPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImg, setCurrentImg] = useState(0)
  const { addItem, updateQuantity, openCart, items } = useCartStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-brand', 'barf')
    return () => { document.documentElement.removeAttribute('data-brand') }
  }, [])

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
            background: 'linear-gradient(to right, rgba(15,13,8,0.90) 0%, rgba(15,13,8,0.65) 45%, rgba(15,13,8,0.30) 100%)',
          }} />
          {/* Subtle bottom fade — only visible in dark mode */}
          <div className="hero-bottom-fade" style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(to bottom, transparent 0%, var(--bg) 100%)',
            zIndex: 1, opacity: 0,
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
                border: '1px solid rgba(191,155,80,0.35)',
                borderRadius: '20px', padding: '5px 14px', marginBottom: '24px',
                backgroundColor: 'rgba(191,155,80,0.10)',
                backdropFilter: 'blur(8px)',
              }}>
                <PawPrint size={13} style={{ color: '#D4AE5E' }} />
                <span style={{ color: '#D4AE5E', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.06em' }}>
                  100% natural · Sin conservantes
                </span>
              </div>

              <h1 style={{
                fontFamily: 'Lora, serif',
                fontSize: 'clamp(2.6rem, 5vw, 4.2rem)',
                fontWeight: 700, color: '#F5EFE0',
                lineHeight: 1.05, marginBottom: '20px',
                textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}>
                Alimento crudo,{' '}
                <em style={{ color: '#D4AE5E', fontStyle: 'italic' }}>biológicamente apropiado</em>
              </h1>

              <p style={{
                fontSize: '1.05rem', color: 'rgba(235,230,215,0.80)',
                lineHeight: 1.75, marginBottom: '32px', maxWidth: '460px',
              }}>
                La dieta BARF devuelve a tu perro la nutrición que la naturaleza diseñó.
                Ingredientes crudos, frescos, sin procesamiento industrial.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '48px' }}>
                <Link href="#productos" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 28px',
                  background: 'linear-gradient(135deg, #BF9B50 0%, #A67C36 100%)',
                  color: 'white',
                  borderRadius: '10px', textDecoration: 'none',
                  fontWeight: 600, fontSize: '0.92rem',
                  boxShadow: '0 4px 20px rgba(191,155,80,0.4)',
                }}>
                  Comprar ahora <ArrowRight size={15} />
                </Link>
                <a href="https://wa.me/5491153447998?text=Hola!%20Quiero%20consultar%20por%20el%20BARF%20Mix" target="_blank" rel="noopener noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 24px',
                  backgroundColor: 'rgba(255,255,255,0.10)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.20)',
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
                borderTop: '1px solid rgba(191,155,80,0.20)',
                paddingTop: '28px',
              }}>
                {[
                  { value: '100% crudo', label: 'Sin cocción' },
                  { value: 'Desde 5u', label: 'Compra mínima' },
                  { value: '$9.000/u', label: 'BARF Mix 500g' },
                ].map(({ value, label }, i) => (
                  <div key={i} style={{
                    flex: 1, paddingRight: '20px',
                    borderRight: i < 2 ? '1px solid rgba(191,155,80,0.20)' : 'none',
                    paddingLeft: i > 0 ? '20px' : '0',
                  }}>
                    <p style={{
                      fontFamily: 'Lora, serif',
                      fontSize: '1.1rem', fontWeight: 700,
                      color: '#F5EFE0', lineHeight: 1.1, marginBottom: '3px',
                    }}>{value}</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(212,174,94,0.55)', lineHeight: 1.4 }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating cards */}
            <div className="barf-hero-visual" style={{
              position: 'relative', display: 'flex',
              alignItems: 'center', justifyContent: 'center', height: '480px',
            }}>
              {/* Central logo */}
              <div style={{
                position: 'absolute',
                width: '220px', height: '220px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(191,155,80,0.20) 0%, transparent 70%)',
                border: '1px solid rgba(191,155,80,0.20)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }} className="animate-float">
                <Image src="/barf-logo.png" alt="BARF" width={130} height={130} style={{ objectFit: 'contain' }} />
              </div>

              {[
                { top: '40px', left: '0', label: 'Desde $9.000/u', sub: 'Mínimo 5 unidades', delay: '0.5s', dur: '5s' },
                { top: '80px', right: '0', label: '100% natural', sub: 'Sin conservantes', delay: '1s', dur: '4.5s', accent: true },
                { bottom: '80px', left: '10px', label: 'Cajas de 10 y 15', sub: 'Mejor precio por volumen', delay: '0.2s', dur: '5.5s' },
                { bottom: '50px', right: '10px', label: 'Envíos', sub: 'Capital · San Isidro · Nordelta · Escobar', delay: '1.5s', dur: '4s' },
              ].map(({ top, left, right, bottom, label, sub, delay, dur, accent }, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top, left, right, bottom,
                  backgroundColor: accent ? 'rgba(191,155,80,0.85)' : 'rgba(15,13,8,0.75)',
                  border: accent ? 'none' : '1px solid rgba(191,155,80,0.15)',
                  borderRadius: '14px', padding: '12px 16px',
                  backdropFilter: 'blur(12px)',
                  boxShadow: accent ? '0 8px 24px rgba(191,155,80,0.3)' : '0 4px 20px rgba(0,0,0,0.3)',
                  animation: `float ${dur} ease-in-out infinite`,
                  animationDelay: delay,
                  maxWidth: '170px',
                }}>
                  <p style={{ fontFamily: 'Lora, serif', fontSize: '0.98rem', fontWeight: 600, color: 'white', lineHeight: 1.2 }}>{label}</p>
                  <p style={{ fontSize: '0.7rem', color: accent ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.5)', marginTop: '3px' }}>{sub}</p>
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

      {/* ── PRICING ── */}
      <section style={{
        padding: '80px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="barf-pricing-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1.4fr',
            gap: '48px', alignItems: 'center',
          }}>
            {/* Product image */}
            <div style={{
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              aspectRatio: '4/5',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.10)',
            }}>
              <Image
                src="/barf-product-1.jpg"
                alt="BARF Mix Completo 500g"
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div style={{
                position: 'absolute', bottom: '16px', left: '16px', right: '16px',
                backgroundColor: 'rgba(15,13,8,0.80)',
                backdropFilter: 'blur(8px)',
                borderRadius: '12px',
                padding: '12px 16px',
              }}>
                <p style={{ color: '#F5EFE0', fontSize: '0.9rem', fontWeight: 600 }}>BARF Mix Completo</p>
                <p style={{ color: 'rgba(212,174,94,0.8)', fontSize: '0.75rem' }}>500g · Sellado al vacío</p>
              </div>
            </div>

            {/* Packs */}
            <div>
              <div style={{ marginBottom: '32px' }}>
                <span style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  Precios
                </span>
                <h2 style={{
                  fontFamily: 'Lora, serif',
                  fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', fontWeight: 700,
                  color: 'var(--text)', marginTop: '6px',
                }}>
                  Elegí tu pack
                </h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.7 }}>
                  Cada unidad es un BARF Mix Completo de 500g sellado al vacío. Mejor precio a mayor cantidad.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { units: 5, price: 9000, label: 'Compra mínima', total: 45000 },
              { units: 10, price: 8000, label: 'Caja de 10', total: 80000, featured: true },
              { units: 15, price: 7000, label: 'Caja de 15', total: 105000 },
            ].map(({ units, price, label, total, featured }) => {
              const barfProduct = products[0]
              const inCart = barfProduct ? items.find(i => i.product.id === barfProduct.id) : null

              const handleBuyPack = () => {
                if (!barfProduct) return
                if (!inCart) addItem(barfProduct)
                updateQuantity(barfProduct.id, units)
                openCart()
              }

              return (
                <div key={units} style={{
                  backgroundColor: 'var(--bg-card)',
                  border: featured ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '32px 28px',
                  textAlign: 'center',
                  position: 'relative',
                  boxShadow: featured ? '0 8px 32px rgba(191,155,80,0.15)' : '0 4px 16px rgba(0,0,0,0.06)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.transform = 'translateY(0)'
                }}>
                  {featured && (
                    <div style={{
                      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: 'var(--accent)', color: 'white',
                      padding: '3px 14px', borderRadius: '20px',
                      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
                    }}>
                      Más elegido
                    </div>
                  )}
                  <p style={{
                    fontFamily: 'Lora, serif',
                    fontSize: '0.9rem', fontWeight: 600,
                    color: 'var(--text-muted)', marginBottom: '8px',
                  }}>{label}</p>
                  <p style={{
                    fontFamily: 'Lora, serif',
                    fontSize: '2.6rem', fontWeight: 700,
                    color: 'var(--accent)', lineHeight: 1,
                  }}>
                    {units}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>u</span>
                  </p>
                  <p style={{
                    fontSize: '1.3rem', fontWeight: 700,
                    color: 'var(--text)', margin: '12px 0 4px',
                  }}>
                    ${price.toLocaleString('es-AR')}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>/u</span>
                  </p>
                  <p style={{
                    fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px',
                  }}>
                    Total: ${total.toLocaleString('es-AR')}
                  </p>
                  <button
                    onClick={handleBuyPack}
                    disabled={!barfProduct}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '11px 22px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: featured ? 'var(--accent)' : 'var(--accent-light)',
                      color: featured ? 'white' : 'var(--accent)',
                      cursor: barfProduct ? 'pointer' : 'not-allowed',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      transition: 'background 0.2s ease, transform 0.15s ease',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={e => {
                      const btn = e.currentTarget as HTMLButtonElement
                      btn.style.backgroundColor = 'var(--accent)'
                      btn.style.color = 'white'
                      btn.style.transform = 'scale(1.03)'
                    }}
                    onMouseLeave={e => {
                      const btn = e.currentTarget as HTMLButtonElement
                      btn.style.backgroundColor = featured ? 'var(--accent)' : 'var(--accent-light)'
                      btn.style.color = featured ? 'white' : 'var(--accent)'
                      btn.style.transform = 'scale(1)'
                    }}
                  >
                    <ShoppingCart size={15} />
                    Comprar {units}u
                  </button>
                </div>
              )
            })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENEFITS + DOGS ── */}
      <section style={{
        padding: '80px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
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


      {/* ── CTA ── */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        position: 'relative', overflow: 'hidden',
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
            Envíos a Capital, San Isidro, Nordelta y Escobar.
            Pedí tu BARF Mix Completo por WhatsApp o compralo desde la tienda.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
