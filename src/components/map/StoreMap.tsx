'use client'

import { useEffect, useRef } from 'react'
import { useTheme } from '@/components/layout/ThemeProvider'

const LAT = -34.344513
const LNG = -58.726230

export default function StoreMap() {
  const { theme } = useTheme()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<unknown>(null)
  const tileLayerRef = useRef<unknown>(null)

  // Init map once
  useEffect(() => {
    if (typeof window === 'undefined' || mapInstanceRef.current) return

    async function initMap() {
      const L = (await import('leaflet')).default

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      })

      if (!mapRef.current) return

      // Clear any stale Leaflet state left by Fast Refresh
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(mapRef.current as any)._leaflet_id = undefined

      const map = L.map(mapRef.current, {
        zoomControl: false,
        scrollWheelZoom: false,
        attributionControl: false,
        dragging: true,
      }).setView([LAT, LNG], 15)

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      const tileUrl = isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

      const tileLayer = L.tileLayer(tileUrl, { maxZoom: 19 })
      tileLayer.addTo(map)
      tileLayerRef.current = tileLayer

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      const customIcon = L.divIcon({
        html: `
          <div style="
            width: 48px; height: 48px;
            background: #2D7A4F;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 4px 20px rgba(45,122,79,0.5);
            display: flex; align-items: center; justify-content: center;
          ">
            <svg style="transform:rotate(45deg)" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
        `,
        className: '',
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -52],
      })

      L.marker([LAT, LNG], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:'DM Sans',sans-serif; padding:6px 2px; min-width:160px;">
            <strong style="font-size:0.9rem;">Cocina Oculta</strong><br>
            <span style="color:#6B7269; font-size:0.78rem; line-height:1.5; display:block; margin-top:4px;">
              Av. del Navegante 1600<br>Puertos Escobar, Buenos Aires
            </span>
          </div>
        `)
        .openPopup()

      mapInstanceRef.current = map
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        ;(mapInstanceRef.current as { remove: () => void }).remove()
        mapInstanceRef.current = null
        tileLayerRef.current = null
      }
    }
  }, [])

  // Swap tile layer when theme changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return

    async function swapTiles() {
      const L = (await import('leaflet')).default
      const map = mapInstanceRef.current as { removeLayer: (l: unknown) => void; addLayer: (l: unknown) => void }

      map.removeLayer(tileLayerRef.current)

      const tileUrl = theme === 'dark'
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

      const newTile = L.tileLayer(tileUrl, { maxZoom: 19 })
      ;(newTile as unknown as { addTo: (m: unknown) => void }).addTo(mapInstanceRef.current)
      tileLayerRef.current = newTile
    }

    swapTiles()
  }, [theme])

  return (
    <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
      <div ref={mapRef} style={{ height: '420px', width: '100%' }} />
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '20px',
        border: '2px solid var(--border)', pointerEvents: 'none',
      }} />
    </div>
  )
}
