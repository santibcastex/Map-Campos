'use client'

import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import LoginGate from '@/components/LoginGate'
import type { Member } from '@/lib/supabase'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

export default function HomePage() {
  const [authed, setAuthed] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('mc_auth') === '1') setAuthed(true)
  }, [])

  useEffect(() => {
    if (!authed) return
    fetch('/api/members')
      .then(r => r.json())
      .then(data => { setMembers(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [authed])

  const filtered = useMemo(() => {
    if (!query) return members
    const q = query.toLowerCase()
    return members.filter(m =>
      m.nombre?.toLowerCase().includes(q) ||
      m.ocupacion?.toLowerCase().includes(q) ||
      m.localidad?.toLowerCase().includes(q) ||
      m.comentarios?.toLowerCase().includes(q)
    )
  }, [members, query])

  const localidades = useMemo(
    () => new Set(members.map(m => m.localidad?.toLowerCase())).size,
    [members]
  )

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur h-14 flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <div className="leading-tight">
            <div className="font-semibold text-emerald-900">Map Campos</div>
            <div className="text-[11px] text-stone-500">
              {loading ? '...' : `${members.length} miembros · ${localidades} localidades`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sumarme"
            className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 transition"
          >
            Sumarme al mapa
          </Link>
          <button
            onClick={() => { localStorage.removeItem('mc_auth'); setAuthed(false) }}
            className="text-xs text-stone-500 hover:text-stone-800 px-2 py-1"
          >
            Salir
          </button>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="absolute top-3 left-3 right-3 md:right-auto md:w-80 z-[1000] pointer-events-none">
          <div className="pointer-events-auto bg-white/95 backdrop-blur rounded-xl shadow-lg border border-stone-200 p-3">
            <input
              type="text"
              placeholder="Buscar por nombre, ocupación, localidad..."
              className="w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            <div className="mt-1.5 text-xs text-stone-500">
              {loading ? 'Cargando...' : `${filtered.length} resultados`}
            </div>
          </div>
        </div>

        <div className="absolute inset-0">
          {loading ? (
            <div className="h-full flex items-center justify-center text-stone-400 text-sm">
              Cargando mapa...
            </div>
          ) : (
            <MapView members={filtered} />
          )}
        </div>
      </main>
    </div>
  )
}
