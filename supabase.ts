'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PROVINCIAS = [
  'Buenos Aires','Ciudad Autónoma de Buenos Aires','Catamarca','Chaco','Chubut',
  'Córdoba','Corrientes','Entre Ríos','Formosa','Jujuy','La Pampa','La Rioja',
  'Mendoza','Misiones','Neuquén','Río Negro','Salta','San Juan','San Luis',
  'Santa Cruz','Santa Fe','Santiago del Estero','Tierra del Fuego','Tucumán',
]

export default function SumarPage() {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)
  const [form, setForm] = useState({
    nombre: '', ocupacion: '', localidad: '', provincia: 'Buenos Aires', comentarios: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('mc_auth') !== '1') router.push('/')
    else setAuthed(true)
  }, [router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push('/'), 2000)
    } else {
      const data = await res.json()
      setError(data.error || 'Error al guardar. Verificá la localidad.')
    }
    setLoading(false)
  }

  if (!authed) return null

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="text-4xl mb-4">📍</div>
          <h2 className="text-xl font-semibold text-emerald-900 mb-2">¡Punto grabado!</h2>
          <p className="text-stone-500 text-sm">Redirigiendo al mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Topbar */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white/90 backdrop-blur h-14 flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌾</span>
          <div className="font-semibold text-emerald-900">Map Campos</div>
        </div>
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-800">
          ← Volver al mapa
        </Link>
      </header>

      {/* Formulario */}
      <main className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold text-stone-900 mb-1">Sumate a la red</h1>
        <p className="text-stone-500 text-sm mb-8">
          Completá tus datos y aparecés como punto en el mapa.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Nombre completo *
            </label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Santiago Baca Castex"
              required
              className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Ocupación *</label>
            <input
              name="ocupacion"
              value={form.ocupacion}
              onChange={handleChange}
              placeholder="Ing. Agrónomo / Productor"
              required
              className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Localidad *</label>
              <input
                name="localidad"
                value={form.localidad}
                onChange={handleChange}
                placeholder="Pilar"
                required
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Provincia</label>
              <select
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
                className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 bg-white"
              >
                {PROVINCIAS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Comentarios <span className="text-stone-400 font-normal">(actividad, cultivos, rubros...)</span>
            </label>
            <textarea
              name="comentarios"
              value={form.comentarios}
              onChange={handleChange}
              rows={3}
              placeholder="Soja, maíz, ganadería ciclo completo..."
              className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-700 text-white rounded-full py-3 text-sm font-medium hover:bg-emerald-800 transition disabled:opacity-50 mt-2"
          >
            {loading ? 'Geocodificando y guardando...' : 'Grabar mi punto en el mapa →'}
          </button>
        </form>
      </main>
    </div>
  )
}
