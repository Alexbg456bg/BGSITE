import { access, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')
const targetDir = path.join(repoRoot, 'public', 'images', 'regions')

const wiki = (fileName) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=1600`

const unsplash = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1600&q=82`

const banners = {
  kardzhali: wiki('Perperikon, Top view.jpg'),
  kyustendil: unsplash('photo-1506905925346-21bda4d32df4'),
  lovech: unsplash('photo-1432405972618-c60b0225b8f9'),
  montana: wiki('Lopushanski Monastery.jpg'),
  pazardzhik: wiki('Velingrad Areal Image.jpg'),
  pernik: wiki(
    'Pernik Region - Pernik Municipality - Town of Pernik - Krakra Fortress (21).jpg',
  ),
  pleven: wiki('Pleven-Panorama 2010.jpg'),
  plovdiv: unsplash('photo-1516483638261-f4dbaf036963'),
  razgrad: wiki('Tomb sveshtari2-1-.jpg'),
  ruse: unsplash('photo-1544551763-46a013bb70d5'),
  silistra: wiki('Srebarna Nature Reserve 01.jpg'),
  sliven: wiki('Sliven From Karandila.jpg'),
  smolyan: wiki('Smolyan Lakes 01.jpg'),
  'sofia-grad': wiki('Boulevard Vitosha in Sofia.JPG'),
  'sofia-oblast': wiki('Vitosha seen from the center of Sofia.jpg'),
  'stara-zagora': wiki('Arc at Momini gardi sanctuary Starosel Bulgaria.jpg'),
  targovishte: wiki('Targovishte airview.jpg'),
  haskovo: wiki('Holymother.jpg'),
  shumen: wiki('Madara Rider.jpg'),
  yambol: wiki('Kabile Bulgaria.JPG'),
}

const extByType = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function getExtension(url, contentType) {
  const type = (contentType ?? '').split(';')[0].trim().toLowerCase()
  if (type && extByType[type]) return extByType[type]

  try {
    const parsed = new URL(url)
    const ext = path.extname(parsed.pathname)
    if (ext) return ext
  } catch {}

  return '.jpg'
}

async function exists(filePath) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function downloadWithRetry(url, slug, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'BGSITE region banner downloader/1.0',
      },
    })

    if (response.ok) return response

    if (response.status === 429 || response.status >= 500) {
      await sleep(1500 * attempt)
      continue
    }

    throw new Error(`Failed to download ${slug}: ${response.status}`)
  }

  throw new Error(`Failed to download ${slug}: retry limit reached`)
}

for (const [slug, url] of Object.entries(banners)) {
  await mkdir(targetDir, { recursive: true })
  const existingCandidates = ['.jpg', '.jpeg', '.png', '.webp', '.svg'].map((ext) =>
    path.join(targetDir, `${slug}${ext}`),
  )
  const alreadyThere = await Promise.all(existingCandidates.map(exists))
  if (alreadyThere.some(Boolean)) {
    console.log(`Skipped ${slug} (already downloaded)`)
    continue
  }

  try {
    const response = await downloadWithRetry(url, slug)
    const buffer = Buffer.from(await response.arrayBuffer())
    const extension = getExtension(response.url || url, response.headers.get('content-type'))
    await writeFile(path.join(targetDir, `${slug}${extension}`), buffer)
    console.log(`Downloaded ${slug}${extension}`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
  }
}
