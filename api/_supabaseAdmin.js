const DEFAULT_TABLE = 'admin_destinations'
const DEFAULT_BUCKET = 'destination-images'

const categoryValues = new Set([
  'monument',
  'cave',
  'eco_trail',
  'waterfall',
  'monastery',
  'museum',
  'historical',
  'natural',
  'reservoir_lake_view',
  'resort',
])

function getConfig() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ''),
    serviceRoleKey,
    table: process.env.SUPABASE_DESTINATIONS_TABLE || DEFAULT_TABLE,
    bucket: process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET,
  }
}

function supabaseHeaders(config, extra = {}) {
  return {
    apikey: config.serviceRoleKey,
    authorization: `Bearer ${config.serviceRoleKey}`,
    ...extra,
  }
}

export function sendJson(res, status, value) {
  res.status(status).json(value)
}

export function requireAdmin(req) {
  const expected = process.env.ADMIN_PASSWORD
  const provided = req.headers['x-admin-password']

  if (!expected) {
    throw new Error('Missing ADMIN_PASSWORD')
  }

  if (provided !== expected) {
    const error = new Error('Unauthorized')
    error.statusCode = 401
    throw error
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)
}

function extensionFromDataUrl(dataUrl) {
  const match = /^data:image\/([a-z0-9.+-]+);base64,/i.exec(dataUrl)
  if (!match) return null
  const type = match[1].toLowerCase()
  if (type === 'jpeg' || type === 'jpg') return '.jpg'
  if (type === 'png') return '.png'
  if (type === 'webp') return '.webp'
  if (type === 'gif') return '.gif'
  return null
}

function contentTypeFromDataUrl(dataUrl) {
  const match = /^data:(image\/[a-z0-9.+-]+);base64,/i.exec(dataUrl)
  return match?.[1] || 'application/octet-stream'
}

async function parseBody(req) {
  if (typeof req.body === 'string') return JSON.parse(req.body)
  if (req.body && typeof req.body === 'object') return req.body

  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }

  const raw = Buffer.concat(chunks).toString('utf8')
  return raw ? JSON.parse(raw) : {}
}

async function supabaseFetch(path, options = {}) {
  const config = getConfig()
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    ...options,
    headers: supabaseHeaders(config, options.headers),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(details || `Supabase request failed: ${response.status}`)
  }

  if (response.status === 204) return null
  return response.json().catch(() => null)
}

async function uploadImage(config, id, index, value) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('data:image/')) return value

  const ext = extensionFromDataUrl(value)
  if (!ext) return null

  const encoded = value.split(',')[1]
  if (!encoded) return null

  const suffix = index === 0 ? '' : `-${index}`
  const fileName = `${id}${suffix}${ext}`
  const contentType = contentTypeFromDataUrl(value)
  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/${config.bucket}/${fileName}`,
    {
      method: 'POST',
      headers: supabaseHeaders(config, {
        'cache-control': '3600',
        'content-type': contentType,
        'x-upsert': 'true',
      }),
      body: Buffer.from(encoded, 'base64'),
    },
  )

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(details || 'Image upload failed')
  }

  return `${config.supabaseUrl}/storage/v1/object/public/${config.bucket}/${fileName}`
}

async function normalizeEntry(entry) {
  const config = getConfig()
  const regionSlug = String(entry?.regionSlug ?? '').trim()
  const destination = entry?.destination ?? {}
  const name = String(destination.name ?? '').trim()
  const location = String(destination.location ?? '').trim()
  const shortDescription = String(destination.shortDescription ?? '').trim()
  const category = String(destination.category ?? 'natural')

  if (!regionSlug) throw new Error('Missing region')
  if (!name) throw new Error('Missing destination name')
  if (!location) throw new Error('Missing location')
  if (!shortDescription) throw new Error('Missing description')
  if (!categoryValues.has(category)) throw new Error('Invalid category')

  const id = String(destination.id ?? '').trim() || `custom-${slugify(name)}`
  const cleanId = slugify(id) || `custom-${Date.now()}`
  const sourceImages = Array.isArray(destination.images)
    ? destination.images
    : [destination.image].filter(Boolean)
  const savedImages = []

  for (let index = 0; index < sourceImages.length; index += 1) {
    const saved = await uploadImage(config, cleanId, index, sourceImages[index])
    if (saved) savedImages.push(saved)
  }

  if (savedImages.length === 0) {
    throw new Error('At least one image is required')
  }

  const lat = Number(destination.coords?.lat)
  const lng = Number(destination.coords?.lng)

  return {
    regionSlug,
    destination: {
      id: cleanId,
      name,
      category,
      shortDescription,
      location,
      image: savedImages[0],
      images: savedImages,
      mapsUrl: destination.mapsUrl ? String(destination.mapsUrl).trim() : undefined,
      coords:
        Number.isFinite(lat) && Number.isFinite(lng)
          ? { lat, lng }
          : undefined,
    },
  }
}

function rowToEntry(row) {
  return {
    regionSlug: row.region_slug,
    destination: row.destination,
    deleted: row.deleted || undefined,
  }
}

export async function readEntries() {
  const config = getConfig()
  const rows = await supabaseFetch(
    `/rest/v1/${config.table}?select=region_slug,destination,deleted&order=updated_at.desc`,
  )
  return Array.isArray(rows) ? rows.map(rowToEntry) : []
}

export async function saveEntry(rawEntry) {
  const config = getConfig()
  const entry = await normalizeEntry(rawEntry)
  const rows = await supabaseFetch(`/rest/v1/${config.table}?on_conflict=id`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      id: entry.destination.id,
      region_slug: entry.regionSlug,
      destination: entry.destination,
      deleted: false,
      updated_at: new Date().toISOString(),
    }),
  })

  if (!Array.isArray(rows) || rows.length === 0) return entry
  return rowToEntry(rows[0])
}

export async function deleteEntry(id, options = {}) {
  const config = getConfig()
  const cleanId = String(id ?? '').trim()
  if (!cleanId) throw new Error('Missing destination id')

  if (cleanId.startsWith('custom-')) {
    await supabaseFetch(`/rest/v1/${config.table}?id=eq.${encodeURIComponent(cleanId)}`, {
      method: 'DELETE',
      headers: { prefer: 'return=minimal' },
    })
    return null
  }

  const regionSlug = String(options.regionSlug ?? '').trim()
  const name = String(options.name ?? cleanId).trim()

  const rows = await supabaseFetch(`/rest/v1/${config.table}?on_conflict=id`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({
      id: cleanId,
      region_slug: regionSlug,
      deleted: true,
      destination: {
        id: cleanId,
        name,
        category: 'natural',
        shortDescription: '',
        location: '',
        image: '',
      },
      updated_at: new Date().toISOString(),
    }),
  })

  return Array.isArray(rows) && rows[0] ? rowToEntry(rows[0]) : null
}

export async function parseJsonBody(req) {
  return parseBody(req)
}
