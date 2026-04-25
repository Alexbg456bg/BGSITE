import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const publicDir = path.join(repoRoot, 'public', 'images', 'destinations')
const dataFile = path.join(repoRoot, 'src', 'data', 'localDestinationImages.ts')
const destinationsFile = path.join(repoRoot, 'src', 'data', 'destinationsByRegion.ts')

const WIKI_SEARCH_PREFIX = 'wiki-search:'

const contentTypeExtension = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
} 

const wikiCommonsSearchUrl = (query) =>
  `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query,
  )}&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=1600&format=json&origin=*`

const wikiCommonsFileUrl = (fileName) =>
  `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(
    fileName,
  )}&prop=imageinfo&iiprop=url&iiurlwidth=1600&format=json&origin=*`

const wikiPageImageSearchUrl = (host, query) =>
  `https://${host}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query,
  )}&gsrlimit=3&prop=pageimages&piprop=thumbnail|original&pithumbsize=1600&format=json&origin=*`

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function resolveWikiSearchToken(src) {
  const query = src.slice(WIKI_SEARCH_PREFIX.length).trim()
  if (!query) return null

  try {
    const commonsResp = await fetch(wikiCommonsSearchUrl(query))
    if (commonsResp.ok) {
      const commonsJson = await commonsResp.json()
      const pages = commonsJson.query?.pages ?? {}
      for (const page of Object.values(pages)) {
        const firstImage = page?.imageinfo?.[0]
        const firstUrl = firstImage?.thumburl ?? firstImage?.url
        if (typeof firstUrl === 'string') return firstUrl
      }
    }
  } catch {}

  const titleCandidate = query.replace(/\s+Bulgaria$/i, '').trim()
  for (const host of ['bg', 'en']) {
    try {
      const resp = await fetch(wikiPageImageSearchUrl(host, titleCandidate))
      if (!resp.ok) continue
      const json = await resp.json()
      const pages = json.query?.pages ?? {}
      for (const page of Object.values(pages)) {
        const source = page?.thumbnail?.source ?? page?.original?.source
        if (typeof source === 'string') return source
      }
    } catch {}
  }

  return null
}

async function loadDestinationsBySlug() {
  const source = await readFile(destinationsFile, 'utf8')
  const normalized = source
    .replace(/import type\s+\{\s*Destination\s*\}\s+from\s+'\.\.\/types'\s*\r?\n/, '')
    .replace(
      /import\s+\{\s*LOCAL_DESTINATION_IMAGES\s*\}\s+from\s+'\.\/localDestinationImages'\s*\r?\n/,
      "const LOCAL_DESTINATION_IMAGES = {}\n",
    )

  const transpiled = ts.transpileModule(normalized, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText

  const dataUrl = `data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`
  const mod = await import(dataUrl)
  return mod.DESTINATIONS_BY_SLUG
}

function extensionFromUrl(url, contentType) {
  if (contentType) {
    const cleanType = contentType.split(';')[0].trim().toLowerCase()
    if (cleanType in contentTypeExtension) {
      return contentTypeExtension[cleanType]
    }
  }

  try {
    const pathname = new URL(url).pathname.toLowerCase()
    const ext = path.extname(pathname)
    if (ext) return ext
  } catch {}

  return '.jpg'
}

async function resolveSource(src) {
  if (!src) return null
  if (src.startsWith(WIKI_SEARCH_PREFIX)) return resolveWikiSearchToken(src)
  if (src.includes('commons.wikimedia.org/wiki/Special:FilePath/')) {
    try {
      const parsed = new URL(src)
      const fileName = decodeURIComponent(parsed.pathname.split('/Special:FilePath/')[1] ?? '')
      if (fileName) {
        const response = await fetch(wikiCommonsFileUrl(fileName))
        if (response.ok) {
          const json = await response.json()
          const pages = json.query?.pages ?? {}
          for (const page of Object.values(pages)) {
            const info = page?.imageinfo?.[0]
            const url = info?.thumburl ?? info?.url
            if (typeof url === 'string') return url
          }
        }
      }
    } catch {}
  }
  if (/^https?:\/\//.test(src)) return src
  return null
}

async function downloadBinary(url, retries = 5) {
  let lastError = null

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'BGSITE image downloader/1.0',
      },
    })

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer()
      return {
        buffer: Buffer.from(arrayBuffer),
        contentType: response.headers.get('content-type') ?? '',
        finalUrl: response.url || url,
      }
    }

    lastError = new Error(`Failed to fetch ${url}: ${response.status}`)
    if (response.status === 429 || response.status >= 500) {
      await sleep(1500 * attempt)
      continue
    }

    throw lastError
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`)
}

function uniqueSources(destination) {
  return [destination.image].filter(Boolean)
}

function toPosixRelative(...parts) {
  return `/${parts.join('/')}`.replace(/\\/g, '/')
}

async function main() {
  const DESTINATIONS_BY_SLUG = await loadDestinationsBySlug()
  const destinations = Object.values(DESTINATIONS_BY_SLUG).flat()
  const manifest = {}
  const unresolved = []

  await mkdir(publicDir, { recursive: true })
  const existingFiles = await readdir(publicDir).catch(() => [])

  for (const fileName of existingFiles) {
    const ext = path.extname(fileName)
    const id = path.basename(fileName, ext)
    if (!/-\d+$/.test(id)) {
      manifest[id] = {
        image: toPosixRelative('images', 'destinations', fileName),
      }
    }
  }

  for (const destination of destinations) {
    if (manifest[destination.id]?.image) {
      continue
    }

    const downloadedPaths = []
    const sources = uniqueSources(destination)

    for (let index = 0; index < sources.length; index += 1) {
      const source = sources[index]
      const resolvedUrl = await resolveSource(source)
      if (!resolvedUrl) continue

      try {
        const file = await downloadBinary(resolvedUrl)
        const ext = extensionFromUrl(file.finalUrl, file.contentType)
        const fileName = index === 0 ? `${destination.id}${ext}` : `${destination.id}-${index}${ext}`
        const targetPath = path.join(publicDir, fileName)
        await writeFile(targetPath, file.buffer)
        downloadedPaths.push(toPosixRelative('images', 'destinations', fileName))
        await sleep(250)
      } catch (error) {
        console.error(`Download failed for ${destination.id} from ${resolvedUrl}`)
        console.error(error instanceof Error ? error.message : String(error))
      }
    }

    if (downloadedPaths.length > 0) {
      manifest[destination.id] = {
        image: downloadedPaths[0],
        ...(downloadedPaths.length > 1 ? { images: downloadedPaths } : {}),
      }
    } else {
      unresolved.push(destination.id)
    }

    const fileContents = `import type { Destination } from '../types'\n\n` +
      `type DestinationImageOverride = Pick<Destination, 'image' | 'images'>\n\n` +
      `export const LOCAL_DESTINATION_IMAGES: Record<string, DestinationImageOverride> = ${JSON.stringify(
        manifest,
        null,
        2,
      )} as const\n`

    await writeFile(dataFile, fileContents)
  }

  console.log(`Downloaded images for ${Object.keys(manifest).length} destinations.`)
  if (unresolved.length > 0) {
    console.log(`Unresolved destinations (${unresolved.length}): ${unresolved.join(', ')}`)
  }
}

await main()
