import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// GET /api/members → devuelve todos los miembros
export async function GET() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/members → geocodifica y guarda un miembro nuevo
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nombre, ocupacion, localidad, provincia, comentarios } = body

  if (!nombre || !localidad) {
    return NextResponse.json({ error: 'nombre y localidad son obligatorios' }, { status: 400 })
  }

  // Geocodificar con Nominatim (OpenStreetMap, gratuito)
  const query = encodeURIComponent(`${localidad}, ${provincia ?? ''}, Argentina`)
  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
    { headers: { 'User-Agent': 'MapCampos/1.0' } }
  )
  const geoData = await geoRes.json()

  if (!geoData.length) {
    return NextResponse.json({ error: 'No se pudo geocodificar la localidad' }, { status: 422 })
  }

  const lat = parseFloat(geoData[0].lat)
  const lng = parseFloat(geoData[0].lon)

  const { data, error } = await supabase
    .from('members')
    .insert([{ nombre, ocupacion, localidad, provincia, comentarios, lat, lng }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
