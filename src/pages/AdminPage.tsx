import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import { Link } from 'react-router-dom'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { FilterBar } from '../components/FilterBar'
import { SmartImage } from '../components/SmartImage'
import { ALL_CATEGORIES, CATEGORY_LABELS } from '../data/categoryLabels'
import { regions as staticRegions } from '../data/regions'
import { TRAIL_DETAILS } from '../data/trailDetails'
import { ADMIN_PASSWORD_STORAGE_KEY } from '../context/CustomDestinationsProvider'
import { useCustomDestinations } from '../context/customDestinationsContext'
import { useDestinationRatings } from '../hooks/useDestinationRatings'
import { useSiteData } from '../hooks/useSiteData'
import type { Destination, DestinationCategory } from '../types'

type FormState = {
  id: string
  name: string
  regionSlug: string
  category: DestinationCategory
  location: string
  shortDescription: string
  trailSights: string
  trailRoute: string
  trailSuitableFor: string
  mapsUrl: string
  lat: string
  lng: string
  images: string[]
}

const blankForm: FormState = {
  id: '',
  name: '',
  regionSlug: staticRegions[0]?.slug ?? '',
  category: 'natural',
  location: '',
  shortDescription: '',
  trailSights: '',
  trailRoute: '',
  trailSuitableFor: '',
  mapsUrl: '',
  lat: '',
  lng: '',
  images: [],
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 56)

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

function formFromDestination(
  destination: Destination,
  regionSlug: string,
): FormState {
  const trailDetails = destination.trailDetails ?? TRAIL_DETAILS[destination.id]

  return {
    id: destination.id,
    name: destination.name,
    regionSlug,
    category: destination.category,
    location: destination.location,
    shortDescription: destination.shortDescription,
    trailSights: trailDetails?.sights ?? '',
    trailRoute: trailDetails?.route ?? '',
    trailSuitableFor: trailDetails?.suitableFor ?? '',
    mapsUrl: destination.mapsUrl ?? '',
    lat: destination.coords?.lat ? String(destination.coords.lat) : '',
    lng: destination.coords?.lng ? String(destination.coords.lng) : '',
    images: [
      destination.image,
      ...(destination.images ?? []),
    ].filter((image, index, all): image is string => Boolean(image) && all.indexOf(image) === index),
  }
}

function extractCoordsFromMapsUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const atMatch = trimmed.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
  if (atMatch) {
    return { lat: atMatch[1], lng: atMatch[2] }
  }

  try {
    const url = new URL(trimmed)
    const candidates = [
      url.searchParams.get('q'),
      url.searchParams.get('query'),
      url.searchParams.get('ll'),
      url.searchParams.get('center'),
      url.pathname,
    ].filter(Boolean)

    for (const candidate of candidates) {
      const match = candidate?.match(
        /(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/,
      )
      if (match) return { lat: match[1], lng: match[2] }
    }
  } catch {
    const textMatch = trimmed.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/)
    if (textMatch) return { lat: textMatch[1], lng: textMatch[2] }
  }

  return null
}

export function AdminPage() {
  const { allDestinations, regionByDestinationId } = useSiteData()
  const {
    customDestinations,
    saveCustomDestination,
    removeCustomDestination,
    reloadCustomDestinations,
  } = useCustomDestinations()
  const { ratings } = useDestinationRatings()
  const [form, setForm] = useState<FormState>(blankForm)
  const [status, setStatus] = useState('')
  const [isReloading, setIsReloading] = useState(false)
  const [analytics, setAnalytics] = useState({ today: 0, week: 0 })
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<DestinationCategory | 'all'>('all')
  const [regionFilter, setRegionFilter] = useState<string | 'all'>('all')
  const [adminPassword, setAdminPassword] = useState(() =>
    sessionStorage.getItem(ADMIN_PASSWORD_STORAGE_KEY) ?? '',
  )
  const [passwordInput, setPasswordInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const customIds = useMemo(
    () => new Set(customDestinations.map((entry) => entry.destination.id)),
    [customDestinations],
  )
  const activeCustomCount = useMemo(
    () => customDestinations.filter((entry) => !entry.deleted).length,
    [customDestinations],
  )
  const hiddenCount = useMemo(
    () => customDestinations.filter((entry) => entry.deleted).length,
    [customDestinations],
  )

  const filteredDestinations = useMemo(() => {
    const value = query.trim().toLowerCase()
    return allDestinations.filter((destination) => {
      const region = regionByDestinationId.get(destination.id)

      if (categoryFilter !== 'all' && destination.category !== categoryFilter) {
        return false
      }

      if (regionFilter !== 'all' && region?.slug !== regionFilter) {
        return false
      }

      if (!value) return true

      return [
        destination.name,
        destination.location,
        destination.shortDescription,
        CATEGORY_LABELS[destination.category],
        region?.name,
      ]
        .join(' ')
        .toLowerCase()
        .includes(value)
    })
  }, [allDestinations, categoryFilter, query, regionByDestinationId, regionFilter])

  const selectedRegion = staticRegions.find(
    (region) => region.slug === form.regionSlug,
  )
  const selectedDestinationUrl = form.id ? `/destination/${form.id}` : ''
  const formChecks = useMemo(
    () => [
      {
        label: 'Име, локация и описание',
        ok: Boolean(
          form.name.trim() &&
            form.location.trim() &&
            form.shortDescription.trim(),
        ),
      },
      {
        label: 'Описание поне 90 символа',
        ok: form.shortDescription.trim().length >= 90,
      },
      {
        label: 'Подробни секции',
        ok: Boolean(
          form.trailSights.trim() &&
            form.trailRoute.trim() &&
            form.trailSuitableFor.trim(),
        ),
      },
      {
        label: 'Поне една снимка',
        ok: form.images.length > 0,
      },
      {
        label: 'Галерия с 2+ снимки',
        ok: form.images.length >= 2,
      },
      {
        label: 'Google Maps линк',
        ok: Boolean(form.mapsUrl.trim()),
      },
      {
        label: 'Координати за картата',
        ok: Boolean(form.lat.trim() && form.lng.trim()),
      },
    ],
    [
      form.images.length,
      form.lat,
      form.lng,
      form.location,
      form.mapsUrl,
      form.name,
      form.shortDescription,
      form.trailRoute,
      form.trailSights,
      form.trailSuitableFor,
    ],
  )

  useEffect(() => {
    if (!adminPassword) return

    async function loadAnalytics() {
      try {
        const response = await fetch('/api/analytics', {
          headers: { 'x-admin-password': adminPassword },
        })
        if (!response.ok) return
        const data = await response.json()
        setAnalytics({
          today: Number(data?.today ?? 0),
          week: Number(data?.week ?? 0),
        })
      } catch {
        // Analytics are optional in local/static environments.
      }
    }

    void loadAnalytics()
  }, [adminPassword])

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const startNew = () => {
    setForm(blankForm)
    setStatus('')
  }

  const startEdit = (destination: Destination) => {
    const region = regionByDestinationId.get(destination.id)
    setForm(formFromDestination(destination, region?.slug ?? blankForm.regionSlug))
    setStatus('')
  }

  const onImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return
    const images = await Promise.all(files.map(readFileAsDataUrl))
    setForm((current) => ({
      ...current,
      images: [...current.images, ...images.filter(Boolean)],
    }))
    event.currentTarget.value = ''
  }

  const onMapsUrlChange = (value: string) => {
    const coords = extractCoordsFromMapsUrl(value)
    setForm((current) => ({
      ...current,
      mapsUrl: value,
      lat: coords?.lat ?? current.lat,
      lng: coords?.lng ?? current.lng,
    }))
  }

  const onUnlock = (event: FormEvent) => {
    event.preventDefault()
    const value = passwordInput.trim()
    if (!value) {
      setStatus('Въведи админ паролата.')
      return
    }

    sessionStorage.setItem(ADMIN_PASSWORD_STORAGE_KEY, value)
    setAdminPassword(value)
    setPasswordInput('')
    setStatus('')
  }

  const onLock = () => {
    sessionStorage.removeItem(ADMIN_PASSWORD_STORAGE_KEY)
    setAdminPassword('')
    setPasswordInput('')
    setStatus('')
  }

  const onReload = async () => {
    setIsReloading(true)
    setStatus('Презареждане от API...')
    try {
      await reloadCustomDestinations()
      const response = await fetch('/api/analytics', {
        headers: { 'x-admin-password': adminPassword },
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics({
          today: Number(data?.today ?? 0),
          week: Number(data?.week ?? 0),
        })
      }
      setStatus('Данните са презаредени.')
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Неуспешно презареждане: ${error.message}`
          : 'Неуспешно презареждане.',
      )
    } finally {
      setIsReloading(false)
    }
  }

  const copyDestinationId = async () => {
    if (!form.id) return

    await navigator.clipboard?.writeText(form.id)
    setStatus('ID-то е копирано.')
  }

  const removeImage = (index: number) => {
    const removed = form.images[index]
    setForm((current) => ({
      ...current,
      images: current.images.filter((_, imageIndex) => imageIndex !== index),
    }))
    setStatus(
      removed
        ? 'Снимката е махната от списъка. Натисни „Запиши“, за да се приложи в сайта.'
        : '',
    )
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    setForm((current) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.images.length) return current

      const images = [...current.images]
      const selected = images[index]
      images[index] = images[nextIndex]
      images[nextIndex] = selected

      return { ...current, images }
    })
  }

  const makePrimaryImage = (index: number) => {
    setForm((current) => {
      if (index === 0) return current
      const images = [...current.images]
      const [selected] = images.splice(index, 1)
      return { ...current, images: [selected, ...images] }
    })
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setStatus('Записване...')

    if (!form.name.trim() || !form.location.trim() || !form.shortDescription.trim()) {
      setStatus('Попълни име, локация и описание.')
      return
    }

    if (form.images.length === 0) {
      setStatus('Добави поне една снимка.')
      return
    }

    const lat = Number(form.lat)
    const lng = Number(form.lng)
    const id = form.id || `custom-${slugify(form.name) || Date.now()}`
    const trailDetails = {
      sights: form.trailSights.trim(),
      route: form.trailRoute.trim(),
      suitableFor: form.trailSuitableFor.trim(),
    }
    const hasTrailDetails = Boolean(
      trailDetails.sights || trailDetails.route || trailDetails.suitableFor,
    )

    try {
      await saveCustomDestination({
        regionSlug: form.regionSlug,
        destination: {
          id,
          name: form.name.trim(),
          category: form.category,
          location: form.location.trim(),
          shortDescription: form.shortDescription.trim(),
          trailDetails: hasTrailDetails ? trailDetails : undefined,
          image: form.images[0],
          images: form.images,
          mapsUrl: form.mapsUrl.trim() || undefined,
          coords:
            Number.isFinite(lat) && Number.isFinite(lng)
              ? { lat, lng }
              : undefined,
        },
      })
      setStatus('Записано във файловете на проекта.')
      setForm((current) => ({ ...current, id }))
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Неуспешен запис: ${error.message}`
          : 'Провери админ паролата и Supabase настройките.',
      )
    }
  }

  const onDelete = async () => {
    if (!form.id) {
      setStatus('Първо избери дестинация от списъка.')
      return
    }

    try {
      await removeCustomDestination(form.id, {
        regionSlug: form.regionSlug,
        name: form.name,
      })
      setStatus('Дестинацията е изтрита/скрита от сайта.')
      startNew()
    } catch (error) {
      setStatus(
        error instanceof Error
          ? `Неуспешно изтриване: ${error.message}`
          : 'Провери админ паролата и Supabase настройките.',
      )
    }
  }

  if (!adminPassword) {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-5rem)] max-w-md items-center px-4 py-12">
        <form
          onSubmit={onUnlock}
          className="w-full rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"
        >
          <Breadcrumbs items={[{ label: 'Начало', to: '/' }, { label: 'Админ' }]} />
          <h1 className="mt-4 font-display text-3xl font-semibold text-[var(--forest-deep)]">
            Админ достъп
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Въведи паролата, за да редактираш дестинациите.
          </p>
          <label className="mt-5 block text-sm font-medium text-[var(--ink)]">
            Парола
            <input
              value={passwordInput}
              onChange={(event) => setPasswordInput(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--forest)]"
            />
          </label>
          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)]"
          >
            Влез
          </button>
          {status && <p className="mt-3 text-sm text-[var(--muted)]">{status}</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="pb-20">
      <section className="border-b border-[var(--border)] bg-[var(--surface-2)] py-8 md:py-10">
        <div className="mx-auto max-w-6xl px-4">
          <Breadcrumbs items={[{ label: 'Начало', to: '/' }, { label: 'Админ' }]} />
          <h1 className="mt-4 font-display text-3xl font-semibold text-[var(--forest-deep)] md:text-4xl">
            Редакция на дестинации
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
            Промените се записват през защитения онлайн API и се показват в сайта без локален admin server.
          </p>
          <button
            type="button"
            onClick={onLock}
            className="mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
          >
            Изход
          </button>
          <button
            type="button"
            onClick={onReload}
            disabled={isReloading}
            className="ml-3 mt-4 rounded-xl border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)] disabled:opacity-60"
          >
            Презареди данните
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">
              Общо места
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-[var(--forest-deep)]">
              {allDestinations.length}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {activeCustomCount} добавени/редактирани
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">
              Посетители днес
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-[var(--forest-deep)]">
              {analytics.today}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">уникални за деня</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">
              Посетители 7 дни
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-[var(--forest-deep)]">
              {analytics.week}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">уникални за седмицата</p>
          </div>
          <div className="rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">
              Оценки
            </p>
            <p className="mt-2 font-display text-3xl font-semibold text-[var(--forest-deep)]">
              {ratings.reduce((sum, rating) => sum + rating.count, 0)}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {hiddenCount} скрити места
            </p>
          </div>
        </div>

      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-[var(--forest-deep)]">
                Дестинации
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {allDestinations.length} общо
              </p>
            </div>
            <button
              type="button"
              onClick={startNew}
              className="rounded-xl bg-[var(--forest)] px-3 py-2 text-xs font-semibold text-white"
            >
              Нова
            </button>
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Търси по име, категория или област..."
            className="mt-4 w-full rounded-xl border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--forest)]"
          />

          <div className="mt-4">
            <FilterBar
              category={categoryFilter}
              onCategoryChange={setCategoryFilter}
              regionSlug={regionFilter}
              onRegionChange={setRegionFilter}
            />
          </div>

          <div className="mt-4 max-h-[680px] space-y-2 overflow-auto pr-1">
            {filteredDestinations.map((destination) => {
              const region = regionByDestinationId.get(destination.id)
              const edited = customIds.has(destination.id)
              return (
                <button
                  key={destination.id}
                  type="button"
                  onClick={() => startEdit(destination)}
                  className="flex w-full gap-3 rounded-xl border border-[var(--border)] p-2 text-left transition hover:border-[var(--forest)] hover:bg-[var(--surface-2)]"
                >
                  <SmartImage
                    src={destination.image}
                    alt={destination.name}
                    className="h-14 w-16 shrink-0 rounded-lg"
                    imgClassName="object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-1 block text-sm font-semibold text-[var(--ink)]">
                      {destination.name}
                    </span>
                    <span className="line-clamp-1 text-xs text-[var(--muted)]">
                      {region?.name}
                    </span>
                    {edited && (
                      <span className="mt-1 inline-block rounded-full bg-[var(--forest)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--forest)]">
                        редактирано
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </aside>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-[var(--border)] bg-white p-5 shadow-sm md:p-6"
        >
          <div className="mb-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--forest-deep)]">
                  Проверка на записа
                </h2>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Бърз списък с неща, които правят дестинацията по-пълна.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedDestinationUrl && (
                  <Link
                    to={selectedDestinationUrl}
                    className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
                  >
                    Преглед
                  </Link>
                )}
                {form.id && (
                  <button
                    type="button"
                    onClick={copyDestinationId}
                    className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ink-soft)] transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
                  >
                    Копирай ID
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {formChecks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm"
                >
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                      check.ok
                        ? 'bg-[var(--forest)] text-white'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {check.ok ? '✓' : '!'}
                  </span>
                  <span className="text-[var(--ink-soft)]">{check.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-[var(--ink)]">
              Име
              <input
                value={form.name}
                onChange={(event) => setField('name', event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--forest)]"
              />
            </label>

            <label className="block text-sm font-medium text-[var(--ink)]">
              Област
              <select
                value={form.regionSlug}
                onChange={(event) => setField('regionSlug', event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--forest)]"
              >
                {staticRegions.map((region) => (
                  <option key={region.slug} value={region.slug}>
                    {region.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-[var(--ink)]">
              Категория
              <select
                value={form.category}
                onChange={(event) =>
                  setField('category', event.target.value as DestinationCategory)
                }
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--forest)]"
              >
                {ALL_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm font-medium text-[var(--ink)]">
              Локация
              <input
                value={form.location}
                onChange={(event) => setField('location', event.target.value)}
                placeholder={selectedRegion?.name}
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--forest)]"
              />
            </label>
          </div>

          <label className="mt-4 block text-sm font-medium text-[var(--ink)]">
            Описание
            <textarea
              value={form.shortDescription}
              onChange={(event) => setField('shortDescription', event.target.value)}
              rows={5}
              className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--forest)]"
            />
          </label>

          <section className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
            <div>
              <h3 className="font-display text-xl font-semibold text-[var(--forest-deep)]">
                Подробно описание
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
                Тези полета се показват като отделни карти в страницата на
                дестинацията.
              </p>
            </div>
            <div className="mt-4 grid gap-4">
              <label className="block text-sm font-medium text-[var(--ink)]">
                Какво ще видиш
                <textarea
                  value={form.trailSights}
                  onChange={(event) => setField('trailSights', event.target.value)}
                  rows={3}
                  placeholder="Борови гори, мостчета, гледки, езера..."
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--forest)]"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--ink)]">
                Каква е пътеката
                <textarea
                  value={form.trailRoute}
                  onChange={(event) => setField('trailRoute', event.target.value)}
                  rows={3}
                  placeholder="Откъде тръгва, какъв е теренът, колко е трудна..."
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--forest)]"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--ink)]">
                Подходящо за
                <textarea
                  value={form.trailSuitableFor}
                  onChange={(event) =>
                    setField('trailSuitableFor', event.target.value)
                  }
                  rows={3}
                  placeholder="Семейства, начинаещи, целодневен преход..."
                  className="mt-1 w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2 outline-none focus:border-[var(--forest)]"
                />
              </label>
            </div>
          </section>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block text-sm font-medium text-[var(--ink)]">
              Google Maps линк
              <input
                value={form.mapsUrl}
                onChange={(event) => onMapsUrlChange(event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--forest)]"
              />
            </label>
            <label className="block text-sm font-medium text-[var(--ink)]">
              Latitude
              <input
                value={form.lat}
                onChange={(event) => setField('lat', event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--forest)]"
              />
            </label>
            <label className="block text-sm font-medium text-[var(--ink)]">
              Longitude
              <input
                value={form.lng}
                onChange={(event) => setField('lng', event.target.value)}
                className="mt-1 w-full rounded-xl border border-[var(--border)] px-3 py-2 outline-none focus:border-[var(--forest)]"
              />
            </label>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--ink)]">
                Снимки
                <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                  {form.images.length} бр.
                </span>
              </p>
              {form.images.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setForm((current) => ({ ...current, images: [] }))
                    setStatus(
                      'Всички снимки са махнати от списъка. Добави поне една нова, за да можеш да запишеш.',
                    )
                  }}
                  className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Изчисти всички
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onImagesChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 rounded-xl border border-[var(--forest)] bg-white px-4 py-2 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--mist)]"
            >
              Добави снимки
            </button>
            <p className="mt-2 text-xs text-[var(--muted)]">
              Можеш да добавяш няколко снимки наведнъж. Първата е основната. След махане на снимки натисни „Запиши“.
            </p>
          </div>

          {form.images.length > 0 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {form.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-2)]"
                >
                  <div className="relative">
                    <SmartImage
                      src={image}
                      alt={`Снимка ${index + 1}`}
                      className="h-32 w-full"
                      imgClassName="object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-semibold text-[var(--forest-deep)] shadow-sm">
                        основна
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-lg font-semibold text-red-600 shadow-sm transition hover:bg-red-50"
                      aria-label="Изтрий снимката"
                      title="Изтрий снимката"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => makePrimaryImage(index)}
                      disabled={index === 0}
                      className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--ink-soft)] disabled:opacity-45"
                    >
                      Основна
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                      className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--ink-soft)] disabled:opacity-45"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === form.images.length - 1}
                      className="rounded-lg border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--ink-soft)] disabled:opacity-45"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"
                    >
                      Изтрий
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-[var(--forest)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)]"
            >
              Запиши
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Изтрий дестинацията
            </button>
            {status && <p className="text-sm text-[var(--muted)]">{status}</p>}
          </div>
        </form>
      </div>
    </div>
  )
}

