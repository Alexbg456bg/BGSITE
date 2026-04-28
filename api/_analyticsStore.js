import crypto from 'node:crypto'

const DEFAULT_DATA_BUCKET = 'admin-data'
const DEFAULT_ANALYTICS_PATH = 'site-analytics.json'

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
    analyticsPath:
      process.env.SUPABASE_ANALYTICS_DATA_PATH || DEFAULT_ANALYTICS_PATH,
    analyticsSecret:
      process.env.ANALYTICS_HASH_SECRET || serviceRoleKey.slice(0, 32),
  }
}

function supabaseHeaders(config, extra = {}) {
  return {
    apikey: config.serviceRoleKey,
    authorization: `Bearer ${config.serviceRoleKey}`,
    ...extra,
  }
}

function dayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Sofia',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function previousDayKeys(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - index)
    return dayKey(date)
  })
}

function normalizeState(value) {
  const days =
    value && typeof value.days === 'object' && !Array.isArray(value.days)
      ? value.days
      : {}

  return { days }
}

async function readState(config = getConfig()) {
  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/${config.dataBucket}/${config.analyticsPath}`,
    { headers: supabaseHeaders(config) },
  )

  if (response.status === 400 || response.status === 404) {
    return normalizeState(null)
  }

  if (!response.ok) {
    const details = await response.text().catch(() => '')
    throw new Error(details || 'Analytics read failed')
  }

  return normalizeState(await response.json().catch(() => null))
}

async function writeState(state, config = getConfig()) {
  const response = await fetch(
    `${config.supabaseUrl}/storage/v1/object/${config.dataBucket}/${config.analyticsPath}`,
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
    throw new Error(details || 'Analytics write failed')
  }
}

function visitorHash(req, body, config) {
  const forwardedFor = String(req.headers['x-forwarded-for'] ?? '')
    .split(',')[0]
    .trim()
  const ip =
    forwardedFor ||
    String(req.headers['x-real-ip'] ?? '') ||
    req.socket?.remoteAddress ||
    'unknown'
  const userAgent = String(req.headers['user-agent'] ?? 'unknown')
  const visitorId = String(body?.visitorId ?? '').slice(0, 120)

  return crypto
    .createHash('sha256')
    .update(`${config.analyticsSecret}:${visitorId}:${ip}:${userAgent}`)
    .digest('hex')
}

function summarize(days) {
  const todayKey = dayKey()
  const weekKeys = previousDayKeys(7)
  const today = Array.isArray(days[todayKey]) ? days[todayKey].length : 0
  const weeklyVisitors = new Set()

  for (const key of weekKeys) {
    const visitors = Array.isArray(days[key]) ? days[key] : []
    visitors.forEach((visitor) => weeklyVisitors.add(visitor))
  }

  return {
    today,
    week: weeklyVisitors.size,
    todayKey,
  }
}

export async function readAnalytics() {
  const state = await readState()
  return summarize(state.days)
}

export async function recordVisit(req, body) {
  const config = getConfig()
  const state = await readState(config)
  const key = dayKey()
  const visitors = new Set(Array.isArray(state.days[key]) ? state.days[key] : [])
  visitors.add(visitorHash(req, body, config))

  const keepKeys = new Set(previousDayKeys(60))
  const days = Object.fromEntries(
    Object.entries(state.days).filter(([entryKey]) => keepKeys.has(entryKey)),
  )
  days[key] = Array.from(visitors)

  await writeState({ days }, config)
  return summarize(days)
}
