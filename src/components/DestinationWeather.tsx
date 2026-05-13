import { useEffect, useMemo, useState } from 'react'
import type { Destination } from '../types'
import { useI18n } from '../i18n/LanguageContext'

type WeatherCurrent = {
  time: string
  temperature_2m: number
  apparent_temperature: number
  precipitation: number
  weather_code: number
  wind_speed_10m: number
  relative_humidity_2m: number
  is_day: number
}

type WeatherResponse = {
  current?: Partial<WeatherCurrent>
  current_units?: Record<string, string>
  daily?: {
    time?: string[]
    weather_code?: number[]
    temperature_2m_max?: number[]
    temperature_2m_min?: number[]
    precipitation_sum?: number[]
  }
  daily_units?: Record<string, string>
}

type CachedWeather = {
  savedAt: number
  data: WeatherResponse
}

type Props = {
  destination: Destination
}

const CACHE_TTL_MS = 30 * 60 * 1000

const weatherLabel = (code: number, language: 'bg' | 'en') => {
  if (code === 0) return language === 'en' ? 'Clear sky' : 'Ясно'
  if ([1, 2, 3].includes(code)) {
    return language === 'en' ? 'Partly cloudy' : 'Променлива облачност'
  }
  if ([45, 48].includes(code)) return language === 'en' ? 'Fog' : 'Мъгла'
  if ([51, 53, 55, 56, 57].includes(code)) {
    return language === 'en' ? 'Drizzle' : 'Ръмеж'
  }
  if ([61, 63, 65, 66, 67].includes(code)) {
    return language === 'en' ? 'Rain' : 'Дъжд'
  }
  if ([71, 73, 75, 77].includes(code)) return language === 'en' ? 'Snow' : 'Сняг'
  if ([80, 81, 82].includes(code)) {
    return language === 'en' ? 'Rain showers' : 'Превалявания'
  }
  if ([85, 86].includes(code)) {
    return language === 'en' ? 'Snow showers' : 'Снежни превалявания'
  }
  if ([95, 96, 99].includes(code)) {
    return language === 'en' ? 'Thunderstorm' : 'Гръмотевична буря'
  }
  return language === 'en' ? 'Weather' : 'Време'
}

const weatherIcon = (code: number, isDay?: number) => {
  if (code === 0) return isDay ? '☀' : '☾'
  if ([1, 2, 3].includes(code)) return '☁'
  if ([45, 48].includes(code)) return '≋'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄'
  if ([95, 96, 99].includes(code)) return '⚡'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return '☂'
  }
  return '○'
}

const formatNumber = (value: unknown, suffix = '') => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return `${Math.round(value)}${suffix}`
}

const formatPrecipitation = (value: unknown, unit = 'mm') => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return `${value.toFixed(value > 0 && value < 1 ? 1 : 0)} ${unit}`
}

function readCache(key: string): WeatherResponse | null {
  try {
    const cached = JSON.parse(localStorage.getItem(key) ?? '') as CachedWeather
    if (!cached?.savedAt || Date.now() - cached.savedAt > CACHE_TTL_MS) return null
    return cached.data
  } catch {
    return null
  }
}

function writeCache(key: string, data: WeatherResponse) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }))
  } catch {
    // Cache is optional; the widget still works without storage.
  }
}

export function DestinationWeather({ destination }: Props) {
  const { language } = useI18n()
  const [data, setData] = useState<WeatherResponse | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  )

  if (destination.weather?.enabled === false) return null

  const coords = destination.weather?.coords ?? destination.coords
  const weatherQuery =
    destination.weather?.query?.trim() ||
    destination.location ||
    destination.name
  const cacheKey = coords
    ? `weather:${coords.lat.toFixed(3)}:${coords.lng.toFixed(3)}`
    : ''

  const forecastUrl = useMemo(() => {
    return `https://www.google.com/search?q=${encodeURIComponent(
      `weather ${weatherQuery} Bulgaria`,
    )}`
  }, [weatherQuery])

  useEffect(() => {
    if (!coords) return

    const cached = readCache(cacheKey)
    if (cached) {
      setData(cached)
      setStatus('ready')
      return
    }

    const controller = new AbortController()
    const url = new URL('https://api.open-meteo.com/v1/forecast')
    url.searchParams.set('latitude', String(coords.lat))
    url.searchParams.set('longitude', String(coords.lng))
    url.searchParams.set(
      'current',
      [
        'temperature_2m',
        'apparent_temperature',
        'precipitation',
        'weather_code',
        'wind_speed_10m',
        'relative_humidity_2m',
        'is_day',
      ].join(','),
    )
    url.searchParams.set(
      'daily',
      [
        'weather_code',
        'temperature_2m_max',
        'temperature_2m_min',
        'precipitation_sum',
      ].join(','),
    )
    url.searchParams.set('timezone', 'auto')
    url.searchParams.set('forecast_days', '3')

    setStatus('loading')
    fetch(url, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Weather request failed')
        return response.json() as Promise<WeatherResponse>
      })
      .then((nextData) => {
        writeCache(cacheKey, nextData)
        setData(nextData)
        setStatus('ready')
      })
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setStatus('error')
      })

    return () => controller.abort()
  }, [cacheKey, coords])

  const current = data?.current
  const units = data?.current_units ?? {}
  const dailyUnits = data?.daily_units ?? {}
  const forecastDays = useMemo(() => {
    const daily = data?.daily
    if (!daily?.time?.length) return []

    return daily.time.slice(0, 3).map((time, index) => ({
      time,
      code: daily.weather_code?.[index] ?? 0,
      max: daily.temperature_2m_max?.[index],
      min: daily.temperature_2m_min?.[index],
      precipitation: daily.precipitation_sum?.[index],
    }))
  }, [data?.daily])
  const title = language === 'en' ? 'Weather now' : 'Времето сега'
  const detailsLabel =
    language === 'en' ? 'Google weather' : 'Google време'
  const forecastTitle =
    language === 'en' ? 'Next 3 days' : 'Следващите 3 дни'

  if (!coords) {
    return (
      <section className="mt-5 rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-4 py-4 shadow-sm md:mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
              {title}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {language === 'en'
                ? 'No coordinates are available for this place.'
                : 'Няма координати за това място.'}
            </p>
          </div>
          <a
            href={forecastUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[var(--forest)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--forest-deep)]"
          >
            {detailsLabel}
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-[var(--mobile-panel-border)] bg-[linear-gradient(135deg,var(--mobile-panel-bg),rgba(23,35,31,0.82))] shadow-sm md:mt-6">
      <div className="relative p-4 md:p-5">
        <div
          className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[radial-gradient(circle,rgba(79,140,171,0.18),transparent_68%)]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest)]">
              {title}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {status === 'ready' && current?.time
                ? `${language === 'en' ? 'Updated' : 'Обновено'} ${new Intl.DateTimeFormat(
                    language === 'en' ? 'en-GB' : 'bg-BG',
                    { hour: '2-digit', minute: '2-digit' },
                  ).format(new Date(current.time))}`
                : language === 'en'
                  ? 'Live forecast for this location'
                  : 'Жива прогноза за тази локация'}
            </p>
          </div>
          <a
            href={forecastUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit items-center justify-center rounded-xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-3 py-2 text-xs font-semibold text-[var(--forest-deep)] shadow-sm transition hover:border-[var(--forest)] hover:text-[var(--forest)]"
          >
            {detailsLabel}
          </a>
        </div>

        {status === 'loading' || status === 'idle' ? (
            <div className="mt-5 grid gap-3 md:grid-cols-[1.1fr_1.4fr]">
            <div className="h-28 animate-pulse rounded-2xl bg-[var(--mobile-panel-bg)]" />
              <div className="grid grid-cols-3 gap-2">
              <div className="h-28 animate-pulse rounded-2xl bg-[var(--mobile-panel-bg)]" />
              <div className="h-28 animate-pulse rounded-2xl bg-[var(--mobile-panel-bg)]" />
              <div className="h-28 animate-pulse rounded-2xl bg-[var(--mobile-panel-bg)]" />
              </div>
            <div className="h-32 animate-pulse rounded-2xl bg-[var(--mobile-panel-bg)] md:col-span-2" />
          </div>
        ) : status === 'error' || !current ? (
          <div className="mt-5 rounded-2xl border border-dashed border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-4 py-5 text-sm text-[var(--muted)]">
            {language === 'en'
              ? 'The weather could not be loaded right now. Use the forecast link for more details.'
              : 'Времето не може да се зареди в момента. Използвай линка за подробна прогноза.'}
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <div className="grid gap-3 md:grid-cols-[1.1fr_1.4fr]">
              <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] p-4 shadow-[0_14px_32px_rgba(15,61,46,0.06)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-display text-5xl font-semibold leading-none text-[var(--forest-deep)]">
                      {formatNumber(
                        current.temperature_2m,
                        units.temperature_2m ?? '°C',
                      )}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
                      {weatherLabel(current.weather_code ?? 0, language)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {language === 'en' ? 'Feels like' : 'Усеща се като'}{' '}
                      {formatNumber(
                        current.apparent_temperature,
                        units.apparent_temperature ?? '°C',
                      )}
                    </p>
                  </div>
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--forest)] text-4xl text-white shadow-[0_16px_32px_rgba(15,61,46,0.18)]">
                    {weatherIcon(current.weather_code ?? 0, current.is_day)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <WeatherMetric
                  label={language === 'en' ? 'Rain' : 'Валеж'}
                  value={formatPrecipitation(
                    current.precipitation,
                    units.precipitation ?? 'mm',
                  )}
                />
                <WeatherMetric
                  label={language === 'en' ? 'Wind' : 'Вятър'}
                  value={formatNumber(
                    current.wind_speed_10m,
                    ` ${units.wind_speed_10m ?? 'km/h'}`,
                  )}
                />
                <WeatherMetric
                  label={language === 'en' ? 'Humidity' : 'Влажност'}
                  value={formatNumber(
                    current.relative_humidity_2m,
                    units.relative_humidity_2m ?? '%',
                  )}
                />
              </div>
            </div>

            {forecastDays.length > 0 && (
              <div className="rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] p-3 shadow-[0_14px_32px_rgba(15,61,46,0.05)] md:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest)]">
                    {forecastTitle}
                  </p>
                  <p className="text-[11px] font-medium text-[var(--muted)]">
                    {language === 'en' ? 'Min / Max' : 'Мин / Макс'}
                  </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {forecastDays.map((day, index) => (
                    <ForecastDay
                      key={day.time}
                      day={day}
                      index={index}
                      language={language}
                      tempUnit={dailyUnits.temperature_2m_max ?? '°C'}
                      precipitationUnit={dailyUnits.precipitation_sum ?? 'mm'}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function ForecastDay({
  day,
  index,
  language,
  tempUnit,
  precipitationUnit,
}: {
  day: {
    time: string
    code: number
    max?: number
    min?: number
    precipitation?: number
  }
  index: number
  language: 'bg' | 'en'
  tempUnit: string
  precipitationUnit: string
}) {
  const label =
    index === 0
      ? language === 'en'
        ? 'Today'
        : 'Днес'
      : new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'bg-BG', {
          weekday: 'short',
          day: '2-digit',
          month: '2-digit',
        }).format(new Date(day.time))

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-3 py-3 sm:block sm:min-h-36">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--footer-icon-chip-bg)] text-2xl text-[var(--forest-deep)] sm:mb-3">
        {weatherIcon(day.code, 1)}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-[var(--ink)] sm:truncate">{label}</p>
        <p className="mt-0.5 text-xs text-[var(--muted)] sm:line-clamp-2">
          {weatherLabel(day.code, language)}
        </p>
      </div>
      <div className="text-right sm:mt-3 sm:text-left">
        <p className="font-display text-lg font-semibold leading-tight text-[var(--forest-deep)]">
          {formatNumber(day.min, tempUnit)} / {formatNumber(day.max, tempUnit)}
        </p>
        <p className="mt-1 text-[11px] font-medium text-[var(--muted)]">
          {formatPrecipitation(day.precipitation, precipitationUnit)}
        </p>
      </div>
    </div>
  )
}

function WeatherMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-h-24 rounded-2xl border border-[var(--mobile-panel-border)] bg-[var(--mobile-panel-bg)] px-3 py-4 shadow-[0_14px_32px_rgba(15,61,46,0.05)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--forest)]">
        {label}
      </p>
      <p className="mt-3 font-display text-xl font-semibold leading-tight text-[var(--forest-deep)] md:text-2xl">
        {value}
      </p>
    </div>
  )
}
