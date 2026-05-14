'use client'

import { useEffect, useRef } from 'react'
import type { Member } from '@/lib/supabase'

interface Props {
  members: Member[]
}

export default function MapView({ members }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    Promise.all([
      import('leaflet'),
      import('leaflet.markercluster'),
      import('leaflet/dist/leaflet.css' as any).catch(() => {}),
    ]).then(([L]) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, {
        center: [-36, -62],
        zoom: 5,
        zoomControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      const cluster = (L as any).markerClusterGroup({
        iconCreateFunction: (c: any) => {
          const count = c.getChildCount()
          return L.divIcon({
            html: `<div class="cluster-icon">${count}</div>`,
            className: '',
            iconSize: L.point(40, 40),
          })
        },
      })

      members.forEach((m) => {
        if (!m.lat || !m.lng) return
        const marker = L.marker([m.lat, m.lng])
        marker.bindPopup(`
          <div style="min-width:160px">
            <p style="font-weight:600;font-size:14px;margin:0 0 4px">${m.nombre}</p>
            <p style="font-size:12px;color:#555;margin:0 0 2px">${m.ocupacion}</p>
            <p style="font-size:12px;color:#15803d;margin:0">${m.localidad}${m.provincia ? ', ' + m.provincia : ''}</p>
            ${m.comentarios ? `<p style="font-size:11px;color:#666;margin:6px 0 0;border-top:1px solid #eee;padding-top:4px">${m.comentarios}</p>` : ''}
          </div>
        `)
        cluster.addLayer(marker)
      })

      map.addLayer(cluster)
      mapInstanceRef.current = map
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [members])

  return (
    <>
      <style>{`
        .cluster-icon {
          width: 40px; height: 40px;
          background: #15803d;
          border: 3px solid rgba(255,255,255,0.6);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 14px;
        }
      `}</style>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </>
  )
}
