import { createServer } from 'node:http'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const dataFile = path.join(repoRoot, 'src', 'data', 'adminDestinations.json')
const ratingsFile = path.join(repoRoot, 'src', 'data', 'destinationRatings.json')
const analyticsFile = path.join(repoRoot, 'src', 'data', 'siteAnalytics.json')
const imagesDir = path.join(repoRoot, 'public', 'images', 'destinations')
const port = Number(process.env.ADMIN_PORT ?? 3001)
const ratingCooldownMs = 60 * 1000

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

async function readRatingState() {
  try {
    const raw = await readFile(ratingsFile, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      ratings:
        parsed && typeof parsed.ratings === 'object' && !Array.isArray(parsed.ratings)
          ? parsed.ratings
          : {},
      votedVisitors:
        parsed &&
        typeof parsed.votedVisitors === 'object' &&
        !Array.isArray(parsed.votedVisitors)
          ? parsed.votedVisitors
          : parsed &&
              typeof parsed.recentVotes === 'object' &&
              !Array.isArray(parsed.recentVotes)
            ? parsed.recentVotes
          : {},
      lastRatingByVisitor:
        parsed &&
        typeof parsed.lastRatingByVisitor === 'object' &&
        !Array.isArray(parsed.lastRatingByVisitor)
          ? parsed.lastRatingByVisitor
          : {},
    }
  } catch {
    return { ratings: {}, votedVisitors: {}, lastRatingByVisitor: {} }
  }
}

async function writeRatingState(state) {
  await writeFile(ratingsFile, `${JSON.stringify(state, null, 2)}\n`)
}

function analyticsDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sofia',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function previousAnalyticsDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index)
    return analyticsDayKey(date)
  })
}

async function readAnalyticsState() {
  try {
    const raw = await readFile(analyticsFile, 'utf8')
    const parsed = JSON.parse(raw)
    return {
      days:
        parsed && typeof parsed.days === 'object' && !Array.isArray(parsed.days)
          ? parsed.days
          : {},
    }
  } catch {
    return { days: {} }
  }
}

async function writeAnalyticsState(state) {
  await writeFile(analyticsFile, `${JSON.stringify(state, null, 2)}\n`)
}

function summarizeAnalytics(days) {
  const todayKey = analyticsDayKey()
  const weekKeys = previousAnalyticsDays(7)
  const weeklyVisitors = new Set()

  for (const key of weekKeys) {
    const visitors = Array.isArray(days[key]) ? days[key] : []
    visitors.forEach((visitor) => weeklyVisitors.add(visitor))
  }

  return {
    today: Array.isArray(days[todayKey]) ? days[todayKey].length : 0,
    week: weeklyVisitors.size,
    todayKey,
  }
}

async function recordVisit(req, body) {
  const todayKey = analyticsDayKey()
  const ip =
    String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'local'
  const userAgent = String(req.headers['user-agent'] ?? 'unknown')
  const visitorId = String(body?.visitorId ?? '').slice(0, 120)
  const visitorKey = Buffer.from(`${visitorId}:${ip}:${userAgent}`).toString('base64')
  const state = await readAnalyticsState()
  const visitors = new Set(
    Array.isArray(state.days[todayKey]) ? state.days[todayKey] : [],
  )
  visitors.add(visitorKey)

  const keepKeys = new Set(previousAnalyticsDays(60))
  const days = Object.fromEntries(
    Object.entries(state.days).filter(([key]) => keepKeys.has(key)),
  )
  days[todayKey] = Array.from(visitors)
  await writeAnalyticsState({ days })

  return summarizeAnalytics(days)
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

function summarizeRating(id, value) {
  const total = Number(value?.total ?? 0)
  const count = Number(value?.count ?? 0)

  return {
    id,
    total: Number.isFinite(total) && total > 0 ? total : 0,
    count: Number.isFinite(count) && count > 0 ? count : 0,
    average:
      Number.isFinite(total) && Number.isFinite(count) && count > 0
        ? Math.round((total / count) * 10) / 10
        : 0,
  }
}

function summarizeRatings(ratings) {
  return Object.fromEntries(
    Object.entries(ratings).map(([id, value]) => [id, summarizeRating(id, value)]),
  )
}

function getLastRatingAtForVisitor(state, visitorHash) {
  const saved = Number(state.lastRatingByVisitor[visitorHash] ?? 0)
  const fromDestinationVotes = Object.entries(state.votedVisitors).reduce(
    (latest, [key, timestamp]) =>
      key.endsWith(`:${visitorHash}`) ? Math.max(latest, Number(timestamp) || 0) : latest,
    0,
  )

  return Math.max(saved, fromDestinationVotes)
}

async function saveRating(req, body) {
  const id = String(body?.id ?? '').trim()
  const rating = Number(body?.rating)

  if (!id || id.length > 120 || !/^[a-z0-9-]+$/i.test(id)) {
    throw new Error('Invalid destination id')
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Invalid rating')
  }

  const now = Date.now()
  const ip =
    String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'local'
  const userAgent = String(req.headers['user-agent'] ?? 'unknown')
  const visitorHash = Buffer.from(`${ip}:${userAgent}`).toString('base64')
  const voterKey = `${id}:${visitorHash}`
  const state = await readRatingState()
  const hasAlreadyVoted = Boolean(state.votedVisitors[voterKey])
  const lastRatingAt = getLastRatingAtForVisitor(state, visitorHash)

  if (hasAlreadyVoted) {
    const error = new Error('You have already rated this destination')
    error.statusCode = 409
    error.code = 'already_rated'
    throw error
  }

  if (lastRatingAt && now - lastRatingAt < ratingCooldownMs) {
    const error = new Error('Please wait before rating another destination')
    error.statusCode = 429
    error.code = 'rating_cooldown'
    error.retryAfterSeconds = Math.ceil(
      (ratingCooldownMs - (now - lastRatingAt)) / 1000,
    )
    throw error
  }

  const current = summarizeRating(id, state.ratings[id])
  const nextRatings = {
    ...state.ratings,
    [id]: {
      total: current.total + rating,
      count: current.count + 1,
    },
  }

  await writeRatingState({
    ratings: nextRatings,
    votedVisitors: {
      ...state.votedVisitors,
      [voterKey]: now,
    },
    lastRatingByVisitor: {
      ...state.lastRatingByVisitor,
      [visitorHash]: now,
    },
  })

  return summarizeRating(id, nextRatings[id])
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

async function saveImage(id, index, value, version) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('data:image/')) return value

  const ext = extensionFromDataUrl(value)
  if (!ext) return null

  const encoded = value.split(',')[1]
  if (!encoded) return null

  await mkdir(imagesDir, { recursive: true })
  const suffix = index === 0 ? `-${version}` : `-${version}-${index}`
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
  const trailSights = String(destination.trailDetails?.sights ?? '').trim()
  const trailRoute = String(destination.trailDetails?.route ?? '').trim()
  const trailSuitableFor = String(
    destination.trailDetails?.suitableFor ?? '',
  ).trim()
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
  const imageVersion = Date.now()

  for (let index = 0; index < sourceImages.length; index += 1) {
    const saved = await saveImage(cleanId, index, sourceImages[index], imageVersion)
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
      trailDetails:
        trailSights || trailRoute || trailSuitableFor
          ? {
              sights: trailSights,
              route: trailRoute,
              suitableFor: trailSuitableFor,
            }
          : undefined,
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

    if (req.method === 'GET' && url.pathname === '/api/ratings') {
      const state = await readRatingState()
      sendJson(res, 200, summarizeRatings(state.ratings))
      return
    }

    if (req.method === 'GET' && url.pathname === '/api/analytics') {
      const state = await readAnalyticsState()
      sendJson(res, 200, summarizeAnalytics(state.days))
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/analytics') {
      const body = await readBody(req)
      sendJson(res, 200, await recordVisit(req, JSON.parse(body || '{}')))
      return
    }

    if (req.method === 'POST' && url.pathname === '/api/ratings') {
      const body = await readBody(req)
      sendJson(res, 200, await saveRating(req, JSON.parse(body)))
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
    sendJson(res, error.statusCode || 400, {
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error.code,
      retryAfterSeconds: error.retryAfterSeconds,
    })
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
