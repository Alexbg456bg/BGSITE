import {
  deleteEntry,
  parseJsonBody,
  readEntries,
  requireAdmin,
  saveEntry,
  sendJson,
} from '../_supabaseAdmin.js'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '25mb',
    },
  },
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      sendJson(res, 200, await readEntries())
      return
    }

    if (req.method === 'POST') {
      requireAdmin(req)
      await saveEntry(await parseJsonBody(req))
      sendJson(res, 200, await readEntries())
      return
    }

    if (req.method === 'DELETE') {
      requireAdmin(req)
      const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
      await deleteEntry(id, {
        regionSlug: req.query.regionSlug,
        name: req.query.name,
      })
      sendJson(res, 200, await readEntries())
      return
    }

    res.setHeader('allow', 'GET, POST, DELETE')
    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    sendJson(res, error.statusCode || 400, {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
