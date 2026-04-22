import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const META_PATH = path.join(ROOT, 'src', 'data', 'oblastiMeta.ts')
const OUT_PATH = path.join(ROOT, 'public', 'data', 'bulgaria-oblasti.geojson')
const USER_AGENT = 'BGSiteBoundarySync/1.0 (dev@local.test)'

const OVERPASS_QUERY = `
[out:json][timeout:180];
area["name"="България"]["admin_level"="2"]->.bg;
(
  relation(area.bg)["boundary"="administrative"]["admin_level"="4"];
);
out geom;
`

function parseMeta(text) {
  const out = []
  const re = /slug:\s*'([^']+)'\s*,\s*name:\s*'([^']+)'/g
  for (const m of text.matchAll(re)) {
    out.push({ slug: m[1], name: m[2] })
  }
  return out
}

function pointsEqual(a, b) {
  return a[0] === b[0] && a[1] === b[1]
}

function ringSignedArea(ring) {
  let s = 0
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i]
    const [x2, y2] = ring[i + 1]
    s += x1 * y2 - x2 * y1
  }
  return s / 2
}

function closeRing(ring) {
  if (ring.length < 2) return ring
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) return ring
  return [...ring, first]
}

// D3 geo projection expects spherical clockwise exterior rings.
function orientRingForD3(ring, clockwise) {
  const closed = closeRing(ring)
  const isCCW = ringSignedArea(closed) > 0
  const wantCCW = !clockwise
  if (isCCW === wantCCW) return closed
  return [...closed].reverse()
}

function stitchRings(segments) {
  const remaining = segments
    .map((seg) => seg.slice())
    .filter((seg) => seg.length >= 2)
  const rings = []

  while (remaining.length) {
    let ring = remaining.shift()
    if (!ring) break
    let progressed = true

    while (progressed) {
      progressed = false
      const end = ring[ring.length - 1]

      for (let i = 0; i < remaining.length; i += 1) {
        const seg = remaining[i]
        const first = seg[0]
        const last = seg[seg.length - 1]

        if (pointsEqual(first, end)) {
          ring = ring.concat(seg.slice(1))
          remaining.splice(i, 1)
          progressed = true
          break
        }

        if (pointsEqual(last, end)) {
          ring = ring.concat(seg.slice(0, -1).reverse())
          remaining.splice(i, 1)
          progressed = true
          break
        }
      }
    }

    if (!pointsEqual(ring[0], ring[ring.length - 1])) {
      ring.push(ring[0])
    }

    if (ring.length >= 4) rings.push(ring)
  }

  return rings
}

function relationToGeometry(rel) {
  const outers = rel.members
    .filter((m) => m.type === 'way' && m.role === 'outer' && Array.isArray(m.geometry))
    .map((m) => m.geometry.map((p) => [p.lon, p.lat]))

  const inners = rel.members
    .filter((m) => m.type === 'way' && m.role === 'inner' && Array.isArray(m.geometry))
    .map((m) => m.geometry.map((p) => [p.lon, p.lat]))

  const outerRings = stitchRings(outers)
  const innerRings = stitchRings(inners)

  if (outerRings.length === 0) return null

  if (outerRings.length === 1) {
    const orientedOuter = orientRingForD3(outerRings[0], true)
    const orientedInners = innerRings.map((ring) => orientRingForD3(ring, false))
    return {
      type: 'Polygon',
      coordinates: [orientedOuter, ...orientedInners],
    }
  }

  // Keep multi-part regions; assign no holes to avoid expensive polygon containment.
  return {
    type: 'MultiPolygon',
    coordinates: outerRings.map((ring) => [orientRingForD3(ring, true)]),
  }
}

async function fetchOverpass() {
  const body = new URLSearchParams({ data: OVERPASS_QUERY })
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'User-Agent': USER_AGENT,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Accept: 'application/json',
    },
    body,
  })
  if (!res.ok) {
    throw new Error(`Overpass request failed: ${res.status}`)
  }
  return res.json()
}

function buildSlugLookup(meta) {
  const byName = new Map(meta.map((m) => [m.name, m.slug]))
  byName.set('Софийска', 'sofia-oblast')
  byName.set('София-град', 'sofia-grad')
  return byName
}

async function main() {
  const metaText = await readFile(META_PATH, 'utf8')
  const meta = parseMeta(metaText)
  if (meta.length !== 28) {
    throw new Error(`Expected 28 regions in meta, got ${meta.length}`)
  }

  const slugByName = buildSlugLookup(meta)
  const data = await fetchOverpass()
  const relations = (data.elements ?? []).filter((e) => e.type === 'relation')

  const features = []
  const missing = []

  for (const rel of relations) {
    const nameBg = rel.tags?.name
    if (!nameBg) continue
    const slug = slugByName.get(nameBg)
    if (!slug) {
      missing.push(nameBg)
      continue
    }

    const geometry = relationToGeometry(rel)
    if (!geometry) continue

    features.push({
      type: 'Feature',
      properties: {
        slug,
        nameBg,
        name: nameBg,
      },
      geometry,
    })
  }

  if (missing.length > 0) {
    console.warn(`Unmapped region names: ${missing.join(', ')}`)
  }

  const bySlug = new Map(features.map((f) => [f.properties.slug, f]))
  const orderedFeatures = []
  for (const m of meta) {
    const feature = bySlug.get(m.slug)
    if (!feature) {
      throw new Error(`Missing boundary for slug: ${m.slug}`)
    }
    orderedFeatures.push(feature)
  }

  const fc = {
    type: 'FeatureCollection',
    features: orderedFeatures,
  }

  await writeFile(OUT_PATH, `${JSON.stringify(fc)}\n`, 'utf8')
  console.log(`Wrote ${OUT_PATH} with ${orderedFeatures.length} oblast boundaries`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
