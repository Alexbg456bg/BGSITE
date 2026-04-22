import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_PATH = path.join(ROOT, 'src', 'data', 'destinationsByRegion.ts')
const OUT_PATH = path.join(ROOT, 'src', 'data', 'geocodedCoords.ts')

const RATE_LIMIT_MS = 1200
const USER_AGENT = 'BGSiteMapFix/1.0 (dev@local.test)'

function parseDestinations(source) {
  const out = []
  const re =
    /id:\s*'([^']+)'[\s\S]*?mapsUrl:\s*'https:\/\/maps\.google\.com\/\?q=([^']+)'/g
  for (const m of source.matchAll(re)) {
    out.push({
      id: m[1],
      query: decodeURIComponent(m[2].replace(/\+/g, ' ')),
    })
  }
  return out
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function geocode(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', '1')
  url.searchParams.set('q', `${query}, Bulgaria`)

  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  })

  if (!res.ok) return null
  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null

  const lat = Number(data[0].lat)
  const lng = Number(data[0].lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

function toTs(mapping) {
  const lines = []
  lines.push('// Auto-generated from Google Maps place queries.')
  lines.push('// Source: scripts/geocode-google-maps.mjs')
  lines.push('export const GEOCODED_COORDS: Record<string, { lat: number; lng: number }> = {')
  for (const [id, c] of Object.entries(mapping).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    lines.push(`  '${id}': { lat: ${c.lat.toFixed(6)}, lng: ${c.lng.toFixed(6)} },`)
  }
  lines.push('}')
  lines.push('')
  return lines.join('\n')
}

async function main() {
  const text = await readFile(DATA_PATH, 'utf8')
  const items = parseDestinations(text)

  if (items.length === 0) {
    throw new Error('No destinations found with mapsUrl in destinationsByRegion.ts')
  }

  const mapping = {}
  let ok = 0
  let fail = 0

  for (const item of items) {
    const coords = await geocode(item.query)
    if (coords) {
      mapping[item.id] = coords
      ok += 1
      process.stdout.write(`ok   ${item.id}\n`)
    } else {
      fail += 1
      process.stdout.write(`fail ${item.id}\n`)
    }
    await sleep(RATE_LIMIT_MS)
  }

  await writeFile(OUT_PATH, toTs(mapping), 'utf8')
  process.stdout.write(`\nDone. ${ok} geocoded, ${fail} failed.\n`)
  process.stdout.write(`Wrote ${OUT_PATH}\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

