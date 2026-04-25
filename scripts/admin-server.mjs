import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const dataFile = path.join(repoRoot, 'src', 'data', 'adminDestinations.json')
const imagesDir = path.join(repoRoot, 'public', 'images', 'destinations')
const port = Number(process.env.ADMIN_PORT ?? 3001)

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

async function readEntries() {
  try {
    const raw = await readFile(dataFile, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeEntries(entries) {
  await writeFile(dataFile, `${JSON.stringify(entries, null, 2)}\n`)
}

function sendJson(res, status, value) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
    'access-control-allow-headers': 'content-type',
  })
  res.end(JSON.stringify(value))
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message })
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0

    req.on('data', (chunk) => {
      size += chunk.length
      if (size > 25 * 1024 * 1024) {
        reject(new Error('Request is too large'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })

    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
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

async function saveImage(id, index, value) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('data:image/')) return value

  const ext = extensionFromDataUrl(value)
  if (!ext) return null

  const encoded = value.split(',')[1]
  if (!encoded) return null

  await mkdir(imagesDir, { recursive: true })
  const suffix = index === 0 ? '' : `-${index}`
  const fileName = `${id}${suffix}${ext}`
  const target = path.join(imagesDir, fileName)
  await writeFile(target, Buffer.from(encoded, 'base64'))
  return `/images/destinations/${fileName}`
}

async function normalizeEntry(entry) {
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
    const saved = await saveImage(cleanId, index, sourceImages[index])
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

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { ok: true })
    return
  }

  const url = new URL(req.url ?? '/', `http://${req.headers.host}`)

  try {
    if (req.method === 'GET' && url.pathname === '/api/admin/destinations') {
      sendJson(res, 200, await readEntries())
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/destinations') {
      const body = await readBody(req)
      const entry = await normalizeEntry(JSON.parse(body))
      const entries = await readEntries()
      const next = [
        entry,
        ...entries.filter((item) => item?.destination?.id !== entry.destination.id),
      ]
      await writeEntries(next)
      sendJson(res, 200, next)
      return
    }

    if (
      req.method === 'DELETE' &&
      url.pathname.startsWith('/api/admin/destinations/')
    ) {
      const id = decodeURIComponent(url.pathname.split('/').pop() ?? '')
      const regionSlug = url.searchParams.get('regionSlug') ?? ''
      const name = url.searchParams.get('name') ?? id
      const entries = await readEntries()
      const withoutEntry = entries.filter((item) => item?.destination?.id !== id)
      const hadSavedEntry = withoutEntry.length !== entries.length
      const shouldRemoveOnly = hadSavedEntry && id.startsWith('custom-')
      const next =
        shouldRemoveOnly || !regionSlug
          ? withoutEntry
          : [
              {
                regionSlug,
                deleted: true,
                destination: {
                  id,
                  name,
                  category: 'natural',
                  shortDescription: '',
                  location: '',
                  image: '',
                },
              },
              ...withoutEntry,
            ]
      await writeEntries(next)
      sendJson(res, 200, next)
      return
    }

    sendError(res, 404, 'Not found')
  } catch (error) {
    sendError(res, 400, error instanceof Error ? error.message : 'Unknown error')
  }
})

server.on('error', (error) => {
  if (error?.code === 'EADDRINUSE') {
    console.log(`Admin server already running at http://localhost:${port}`)
    process.exit(0)
  }

  throw error
})

server.listen(port, () => {
  console.log(`Admin server running at http://localhost:${port}`)
})
