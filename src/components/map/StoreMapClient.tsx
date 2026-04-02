'use client'

import dynamic from 'next/dynamic'

const StoreMap = dynamic(() => import('./StoreMap'), {
  ssr: false,
  loading: () => (
    <div style={{
      height: '400px', borderRadius: '20px',
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-muted)', fontSize: '0.9rem',
    }}>
      Cargando mapa...
    </div>
  ),
})

export default function StoreMapClient() {
  return <StoreMap />
}
