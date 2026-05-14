# Map Campos 🌾

Mapa interactivo de la red agropecuaria. Leaflet + OpenStreetMap + Supabase + Next.js 14.

## Stack

- **Next.js 14** (App Router)
- **Leaflet** + `leaflet.markercluster` para el mapa con clustering
- **Supabase** (Postgres) para almacenar miembros
- **Nominatim** (OpenStreetMap) para geocodificación gratuita
- **Tailwind CSS**
- Deploy en **Vercel**

## Setup

### 1. Supabase — crear tabla

En el SQL Editor de tu proyecto Supabase, ejecutá:

```sql
create table members (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  nombre text not null,
  ocupacion text,
  localidad text not null,
  provincia text,
  comentarios text,
  lat double precision,
  lng double precision
);

-- Habilitar lectura pública (la app no tiene auth de usuarios)
alter table members enable row level security;

create policy "Lectura pública" on members
  for select using (true);

create policy "Insert público" on members
  for insert with check (true);
```

### 2. Variables de entorno

Copiá `.env.local.example` a `.env.local` y completá:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
APP_PASSWORD=tu_contraseña_secreta
```

Las claves están en Supabase → Settings → API.

### 3. Desarrollo local

```bash
npm install
npm run dev
```

### 4. Deploy en Vercel

1. Importar el repo desde vercel.com/new
2. En **Environment Variables** agregar las 3 variables del `.env.local`
3. Deploy automático

## Estructura

```
app/
  page.tsx          ← Mapa principal con buscador y login gate
  sumarme/page.tsx  ← Formulario de alta
  api/
    auth/route.ts   ← Verificación de contraseña
    members/route.ts← GET (listar) y POST (crear + geocodificar)
components/
  MapView.tsx       ← Mapa Leaflet (client-only, dynamic import)
  LoginGate.tsx     ← Pantalla de contraseña
lib/
  supabase.ts       ← Cliente Supabase + tipos
```
