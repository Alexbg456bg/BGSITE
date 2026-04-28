import crypto from 'node:crypto'

const DEFAULT_DATA_BUCKET = 'admin-data'
const DEFAULT_RATINGS_PATH = 'destination-ratings.json'
const RATE_LIMIT_MS = 60 * 1000
const RECENT_VOTE_TTL_MS = 10 * 60 * 1000

function getConfig() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return {
    supabaseUrl: supabaseUrl.replace(/\/$/, ''),
    serviceRoleKey,
    dataBucket: process.env.SUPABASE_ADMIN_DATA_BUCKET || DEFAULT_DATA_BUCKET,
    ratingsPath: process.env.SUPABASE_RATINGS_DATA_PATH || DEFAULT_RATINGS_PATH,
    rateLimitSecret:
      process.env.RATING_RATE_LIMIT_SECRET || serviceRoleKey.slice(0, 32),
  }
}

function supabaseHeaders(config, extra = {}) {
  return {
    apikey: config.serviceRoleKey,
    authorization: `Bearer ${config.serviceRoleKey}`,
    ...extra,
  }
}

function normalizeState(value) {
  const ratings =
    value && typeof value.ratings === 'object' && !Array.isArray(value.ratings)
      ? value.ratings
      : {}
  const recentVotes =
    value &&
    typeof value.recentVotes === 'object' &&
    !Array.isArray(value.recentVotes)
      ? value.recentVotes
      : {}

  return { ratings, recentVotes }
}

async function readState(config = getConfig()) {
  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/${config.dataBucket}/${config.ratingsPath}`,
    { headers: supabaseHeaders(config) },
  )

  if (response.status === 400 || response.status === 404) {
    return normalizeState(null)
  }

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(details || 'Ratings read failed')
  }

  return normalizeState(await response.json().catch(() => null))
}

async function writeState(state, config = getConfig()) {
  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/${config.dataBucket}/${config.ratingsPath}`,
    {
      method: 'POST',
      headers: supabaseHeaders(config, {
        'content-type': 'application/json; charset=utf-8',
        'x-upsert': 'true',
      }),
      body: JSON.stringify(state, null, 2),
    },
  )

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(details || 'Ratings write failed')
  }
}

function cleanDestinationId(value) {
  const id = String(value ?? '').trim()
  if (!id || id.length > 120 || !/^[a-z0-9-]+$/i.test(id)) {
    throw new Error('Invalid destination id')
  }
  return id
}

function normalizeRatingValue(value) {
  const rating = Number(value)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Invalid rating')
  }
  return rating
}

function getClientHash(req, config) {
  const forwardedFor = String(req.headers['x-forwarded-for'] ?? '')
    .split(',')[0]
    .trim()
  const ip =
    forwardedFor ||
    String(req.headers['x-real-ip'] ?? '') ||
    req.socket?.remoteAddress ||
    'unknown'
  const userAgent = String(req.headers['user-agent'] ?? 'unknown')

  return crypto
    .createHash('sha256')
    .update(`${config.rateLimitSecret}:${ip}:${userAgent}`)
    .digest('hex')
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

function summarizeAll(ratings) {
  return Object.fromEntries(
    Object.entries(ratings).map(([id, value]) => [id, summarizeRating(id, value)]),
  )
}

function pruneRecentVotes(recentVotes, now) {
  return Object.fromEntries(
    Object.entries(recentVotes).filter(
      ([, timestamp]) => now - Number(timestamp) < RECENT_VOTE_TTL_MS,
    ),
  )
}

export async function readRatings() {
  const state = await readState()
  return summarizeAll(state.ratings)
}

export async function saveRating(req, rawBody) {
  const config = getConfig()
  const id = cleanDestinationId(rawBody?.id)
  const rating = normalizeRatingValue(rawBody?.rating)
  const now = Date.now()
  const voterKey = `${id}:${getClientHash(req, config)}`
  const state = await readState(config)
  const recentVotes = pruneRecentVotes(state.recentVotes, now)
  const lastVoteAt = Number(recentVotes[voterKey] ?? 0)

  if (lastVoteAt && now - lastVoteAt < RATE_LIMIT_MS) {
    const retryAfterSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastVoteAt)) / 1000)
    const error = new Error('Please wait before rating again')
    error.statusCode = 429
    error.retryAfterSeconds = retryAfterSeconds
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

  await writeState(
    {
      ratings: nextRatings,
      recentVotes: {
        ...recentVotes,
        [voterKey]: now,
      },
    },
    config,
  )

  return summarizeRating(id, nextRatings[id])
}
