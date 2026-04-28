import crypto from 'node:crypto'

const DEFAULT_DATA_BUCKET = 'admin-data'
const DEFAULT_RATINGS_PATH = 'destination-ratings.json'
const RATING_COOLDOWN_MS = 60 * 1000

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
  const votedVisitors =
    value &&
    typeof value.votedVisitors === 'object' &&
    !Array.isArray(value.votedVisitors)
      ? value.votedVisitors
      : value &&
          typeof value.recentVotes === 'object' &&
          !Array.isArray(value.recentVotes)
        ? value.recentVotes
      : {}
  const lastRatingByVisitor =
    value &&
    typeof value.lastRatingByVisitor === 'object' &&
    !Array.isArray(value.lastRatingByVisitor)
      ? value.lastRatingByVisitor
      : {}

  return { ratings, votedVisitors, lastRatingByVisitor }
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

function getLastRatingAtForVisitor(state, visitorHash) {
  const saved = Number(state.lastRatingByVisitor[visitorHash] ?? 0)
  const fromDestinationVotes = Object.entries(state.votedVisitors).reduce(
    (latest, [key, timestamp]) =>
      key.endsWith(`:${visitorHash}`) ? Math.max(latest, Number(timestamp) || 0) : latest,
    0,
  )

  return Math.max(saved, fromDestinationVotes)
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
  const visitorHash = getClientHash(req, config)
  const voterKey = `${id}:${visitorHash}`
  const state = await readState(config)
  const hasAlreadyVoted = Boolean(state.votedVisitors[voterKey])
  const lastRatingAt = getLastRatingAtForVisitor(state, visitorHash)

  if (hasAlreadyVoted) {
    const error = new Error('You have already rated this destination')
    error.statusCode = 409
    error.code = 'already_rated'
    throw error
  }

  if (lastRatingAt && now - lastRatingAt < RATING_COOLDOWN_MS) {
    const error = new Error('Please wait before rating another destination')
    error.statusCode = 429
    error.code = 'rating_cooldown'
    error.retryAfterSeconds = Math.ceil(
      (RATING_COOLDOWN_MS - (now - lastRatingAt)) / 1000,
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

  await writeState(
    {
      ratings: nextRatings,
      votedVisitors: {
        ...state.votedVisitors,
        [voterKey]: now,
      },
      lastRatingByVisitor: {
        ...state.lastRatingByVisitor,
        [visitorHash]: now,
      },
    },
    config,
  )

  return summarizeRating(id, nextRatings[id])
}
