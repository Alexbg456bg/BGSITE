import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import adminDestinations from '../data/adminDestinations.json'
import {
  CustomDestinationsContext,
  type CustomDestinationEntry,
} from './customDestinationsContext'

const ADMIN_API = '/api/admin/destinations'
export const ADMIN_PASSWORD_STORAGE_KEY = 'bg_admin_password'

export function adminPasswordHeaderValue(password: string) {
  return encodeURIComponent(password)
}

function adminHeaders() {
  const password = sessionStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY)

  return {
    'content-type': 'application/json',
    ...(password ? { 'x-admin-password': adminPasswordHeaderValue(password) } : {}),
  }
}

function isCustomDestinationEntry(value: unknown): value is CustomDestinationEntry {
  const entry = value as Partial<CustomDestinationEntry>
  return (
    typeof entry?.regionSlug === 'string' &&
    typeof entry?.destination?.id === 'string' &&
    (entry?.deleted === true || typeof entry?.destination?.name === 'string')
  )
}

function normalizeEntries(value: unknown): CustomDestinationEntry[] {
  return Array.isArray(value) ? value.filter(isCustomDestinationEntry) : []
}

const bundledDestinations = normalizeEntries(adminDestinations)

export function CustomDestinationsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [customDestinations, setCustomDestinations] =
    useState<CustomDestinationEntry[]>(bundledDestinations)

  const reloadCustomDestinations = useCallback(async () => {
    try {
      const response = await fetch(ADMIN_API)
      if (!response.ok) return
      const data = await response.json()
      setCustomDestinations(normalizeEntries(data))
    } catch {
      // The local admin server is optional while browsing the site.
    }
  }, [])

  useEffect(() => {
    void reloadCustomDestinations()
  }, [reloadCustomDestinations])

  const value = useMemo(
    () => ({
      customDestinations,
      saveCustomDestination: async (entry: CustomDestinationEntry) => {
        const response = await fetch(ADMIN_API, {
          method: 'POST',
          headers: adminHeaders(),
          body: JSON.stringify(entry),
        })

        if (!response.ok) {
          const details = await response.json().catch(() => null)
          throw new Error(details?.error ?? 'Admin server save failed')
        }

        const saved = (await response.json()) as CustomDestinationEntry[]
        setCustomDestinations(normalizeEntries(saved))
      },
      removeCustomDestination: async (
        id: string,
        options?: { regionSlug?: string; name?: string },
      ) => {
        const url = new URL(ADMIN_API, window.location.origin)
        url.searchParams.set('id', id)
        if (options?.regionSlug) url.searchParams.set('regionSlug', options.regionSlug)
        if (options?.name) url.searchParams.set('name', options.name)

        const response = await fetch(url.toString(), {
          method: 'DELETE',
          headers: adminHeaders(),
        })

        if (!response.ok) {
          const details = await response.json().catch(() => null)
          throw new Error(details?.error ?? 'Admin server delete failed')
        }

        const saved = (await response.json()) as CustomDestinationEntry[]
        setCustomDestinations(normalizeEntries(saved))
      },
      reloadCustomDestinations,
    }),
    [customDestinations, reloadCustomDestinations],
  )

  return (
    <CustomDestinationsContext.Provider value={value}>
      {children}
    </CustomDestinationsContext.Provider>
  )
}
