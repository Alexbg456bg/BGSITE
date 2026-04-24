import type { FeatureCollection, Geometry, Position } from 'geojson'

const ROUND_DIGITS = 6

let cachedGeoJson: FeatureCollection | null = null
let geoJsonRequest: Promise<FeatureCollection> | null = null

function roundCoord(value: number) {
  const factor = 10 ** ROUND_DIGITS
  return Math.round(value * factor) / factor
}

function samePoint(a: Position, b: Position) {
  return a[0] === b[0] && a[1] === b[1]
}

function simplifyRing(ring: Position[]) {
  if (ring.length <= 4) {
    return ring.map(([lng, lat]) => [roundCoord(lng), roundCoord(lat)])
  }

  const simplified: Position[] = []

  for (const point of ring) {
    const rounded: Position = [roundCoord(point[0]), roundCoord(point[1])]
    const last = simplified.at(-1)

    if (!last || !samePoint(last, rounded)) {
      simplified.push(rounded)
    }
  }

  const first = simplified[0]
  const last = simplified.at(-1)
  if (first && last && !samePoint(first, last)) {
    simplified.push([first[0], first[1]])
  }

  if (simplified.length < 4) {
    return ring.map(([lng, lat]) => [roundCoord(lng), roundCoord(lat)])
  }

  return simplified
}

function simplifyGeometry(geometry: Geometry): Geometry {
  if (geometry.type === 'Polygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((ring) => simplifyRing(ring)),
    }
  }

  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: geometry.coordinates.map((polygon) =>
        polygon.map((ring) => simplifyRing(ring)),
      ),
    }
  }

  return geometry
}

function simplifyFeatureCollection(data: FeatureCollection): FeatureCollection {
  try {
    return {
      ...data,
      features: data.features.map((feature) => ({
        ...feature,
        geometry: feature.geometry ? simplifyGeometry(feature.geometry) : feature.geometry,
      })),
    }
  } catch {
    return data
  }
}

export function loadBulgariaGeoJson() {
  if (cachedGeoJson) {
    return Promise.resolve(cachedGeoJson)
  }

  geoJsonRequest ??= fetch('/data/bulgaria-oblasti.geojson')
    .then((r) => {
      if (!r.ok) throw new Error('HTTP')
      return r.json() as Promise<FeatureCollection>
    })
    .then((data) => {
      const simplified = simplifyFeatureCollection(data)
      cachedGeoJson = simplified
      return simplified
    })

  return geoJsonRequest
}
