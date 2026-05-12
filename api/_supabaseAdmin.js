const DEFAULT_IMAGE_BUCKET = 'destination-images'
const DEFAULT_DATA_BUCKET = 'admin-data'
const DEFAULT_MANIFEST_PATH = 'admin-destinations.json'
const DEFAULT_GITHUB_SYNC_PATH = 'src/data/adminDestinations.json'

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
    imageBucket: process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_IMAGE_BUCKET,
    dataBucket:
      process.env.SUPABASE_ADMIN_DATA_BUCKET || DEFAULT_DATA_BUCKET,
    manifestPath:
      process.env.SUPABASE_ADMIN_DATA_PATH || DEFAULT_MANIFEST_PATH,
    githubToken: process.env.GITHUB_SYNC_TOKEN || '',
    githubRepoOwner: process.env.GITHUB_REPO_OWNER || '',
    githubRepoName: process.env.GITHUB_REPO_NAME || '',
    githubBranch: process.env.GITHUB_SYNC_BRANCH || 'main',
    githubSyncPath:
      process.env.GITHUB_SYNC_PATH || DEFAULT_GITHUB_SYNC_PATH,
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
  const rawProvided = req.headers['x-admin-password']
  let provided = rawProvided

  if (typeof rawProvided === 'string') {
    try {
      provided = decodeURIComponent(rawProvided)
    } catch {
      provided = rawProvided
    }
  }

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

async function supabaseFetchText(path, options = {}) {
  const config = getConfig()
  const response = await fetch(`${config.supabaseUrl}${path}`, {
    ...options,
    headers: supabaseHeaders(config, options.headers),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    const error = new Error(details || `Supabase request failed: ${response.status}`)
    error.statusCode = response.status
    throw error
  }

  return response.text()
}

async function uploadImage(config, id, index, value, version) {
  if (typeof value !== 'string') return null
  if (!value.startsWith('data:image/')) return value

  const ext = extensionFromDataUrl(value)
  if (!ext) return null

  const encoded = value.split(',')[1]
  if (!encoded) return null

  const suffix = index === 0 ? `-${version}` : `-${version}-${index}`
  const fileName = `${id}${suffix}${ext}`
  const contentType = contentTypeFromDataUrl(value)
  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/${config.imageBucket}/${fileName}`,
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

  return `${config.supabaseUrl}/storage/v1/object/public/${config.imageBucket}/${fileName}`
}

async function normalizeEntry(entry) {
  const config = getConfig()
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
    const saved = await uploadImage(
      config,
      cleanId,
      index,
      sourceImages[index],
      imageVersion,
    )
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

function rowToEntry(row) {
  return row
}

async function readManifest() {
  const config = getConfig()

  try {
    const raw = await supabaseFetchText(
      `/storage/v1/object/${config.dataBucket}/${config.manifestPath}`,
    )
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(rowToEntry) : []
  } catch (error) {
    if (error?.statusCode === 400 || error?.statusCode === 404) {
      return []
    }

    throw error
  }
}

async function writeManifest(entries) {
  const config = getConfig()
  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/${config.dataBucket}/${config.manifestPath}`,
    {
      method: 'POST',
      headers: supabaseHeaders(config, {
        'content-type': 'application/json; charset=utf-8',
        'x-upsert': 'true',
      }),
      body: JSON.stringify(entries, null, 2),
    },
  )

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(details || 'Admin manifest upload failed')
  }

  await syncGitHubFile(entries, config)
}

async function syncGitHubFile(entries, config = getConfig()) {
  if (
    !config.githubToken ||
    !config.githubRepoOwner ||
    !config.githubRepoName
  ) {
    return
  }

  const path = config.githubSyncPath
  const baseUrl = `https://api.github.com/repos/${config.githubRepoOwner}/${config.githubRepoName}/contents/${path}`
  const refQuery = `?ref=${encodeURIComponent(config.githubBranch)}`
  let sha

  const existing = await fetch(`${baseUrl}${refQuery}`, {
    headers: {
      authorization: `Bearer ${config.githubToken}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'bgsite-admin-sync',
    },
  })

  if (existing.ok) {
    const details = await existing.json()
    sha = details?.sha
  } else if (existing.status !== 404) {
    const details = await existing.text().catch(() => '')
    throw new Error(details || 'GitHub sync read failed')
  }

  const content = `${JSON.stringify(entries, null, 2)}\n`
  const response = await fetch(baseUrl, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${config.githubToken}`,
      accept: 'application/vnd.github+json',
      'content-type': 'application/json',
      'user-agent': 'bgsite-admin-sync',
    },
    body: JSON.stringify({
      message: `Sync admin destinations (${entries.length} entries)`,
      content: Buffer.from(content, 'utf8').toString('base64'),
      branch: config.githubBranch,
      ...(sha ? { sha } : {}),
    }),
  })

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(details || 'GitHub sync write failed')
  }
}

export async function readEntries() {
  return readManifest()
}

export async function saveEntry(rawEntry) {
  const entry = await normalizeEntry(rawEntry)
  const entries = await readManifest()
  const next = [
    entry,
    ...entries.filter((item) => item?.destination?.id !== entry.destination.id),
  ]
  await writeManifest(next)
  return entry
}

export async function deleteEntry(id, options = {}) {
  const cleanId = String(id ?? '').trim()
  if (!cleanId) throw new Error('Missing destination id')

  const entries = await readManifest()
  const withoutEntry = entries.filter((item) => item?.destination?.id !== cleanId)

  if (cleanId.startsWith('custom-')) {
    await writeManifest(withoutEntry)
    return null
  }

  const regionSlug = String(options.regionSlug ?? '').trim()
  const name = String(options.name ?? cleanId).trim()

  const deletedEntry = {
    regionSlug,
    deleted: true,
    destination: {
      id: cleanId,
      name,
      category: 'natural',
      shortDescription: '',
      location: '',
      image: '',
    },
  }

  await writeManifest([deletedEntry, ...withoutEntry])
  return deletedEntry
}

export async function parseJsonBody(req) {
  return parseBody(req)
}
