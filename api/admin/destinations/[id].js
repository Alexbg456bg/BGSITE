import {
  deleteEntry,
  readEntries,
  requireAdmin,
  sendJson,
} from '../../_supabaseAdmin.js'

export default async function handler(req, res) {
  try {
    if (req.method !== 'DELETE') {
      res.setHeader('allow', 'DELETE')
      sendJson(res, 405, { error: 'Method not allowed' })
      return
    }

    requireAdmin(req)
    const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id
    await deleteEntry(id, {
      regionSlug: req.query.regionSlug,
      name: req.query.name,
    })
    sendJson(res, 200, await readEntries())
  } catch (error) {
    sendJson(res, error.statusCode || 400, {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
