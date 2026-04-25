import { useMemo } from 'react'
import {
  regions as staticRegions,
} from '../data/regions'
import { useCustomDestinations } from '../context/customDestinationsContext'
import type { Destination, Region } from '../types'

export function useSiteData() {
  const { customDestinations } = useCustomDestinations()

  return useMemo(() => {
    const customByRegion = new Map<string, Destination[]>()
    const customById = new Map<string, Destination>()
    const deletedIds = new Set<string>()

    for (const entry of customDestinations) {
      if (entry.deleted) {
        deletedIds.add(entry.destination.id)
        continue
      }
      const list = customByRegion.get(entry.regionSlug) ?? []
      list.push(entry.destination)
      customByRegion.set(entry.regionSlug, list)
      customById.set(entry.destination.id, entry.destination)
    }

    const regions = staticRegions.map((region) => {
      const custom = customByRegion.get(region.slug) ?? []
      const customIds = new Set(custom.map((destination) => destination.id))
      const staticDestinations = region.destinations
        .filter(
          (destination) =>
            !customIds.has(destination.id) && !deletedIds.has(destination.id),
        )
        .map((destination) => customById.get(destination.id) ?? destination)

      if (custom.length === 0) {
        return {
          ...region,
          destinations: staticDestinations,
        }
      }

      return {
        ...region,
        destinations: [...custom, ...staticDestinations],
      }
    })

    const regionBySlug = new Map(regions.map((region) => [region.slug, region] as const))
    const destinationWithRegionById = new Map<
      string,
      { destination: Destination; region: Region }
    >()
    const regionByDestinationId = new Map<string, Region>()
    const destinationIdsByRegionSlug = new Map<string, Set<string>>()

    for (const region of regions) {
      const ids = destinationIdsByRegionSlug.get(region.slug) ?? new Set<string>()
      for (const destination of region.destinations) {
        destinationWithRegionById.set(destination.id, { destination, region })
        regionByDestinationId.set(destination.id, region)
        ids.add(destination.id)
      }
      destinationIdsByRegionSlug.set(region.slug, ids)
    }

    const allDestinations = regions.flatMap((region) => region.destinations)

    return {
      regions,
      regionBySlug,
      regionByDestinationId,
      destinationIdsByRegionSlug,
      allDestinations,
      getRegionBySlug: (slug: string): Region | undefined => regionBySlug.get(slug),
      getDestinationWithRegion: (
        id: string,
      ): { destination: Destination; region: Region } | undefined =>
        destinationWithRegionById.get(id),
    }
  }, [customDestinations])
}
