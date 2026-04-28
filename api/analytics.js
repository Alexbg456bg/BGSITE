import { recordVisit, readAnalytics } from './_analyticsStore.js'
import { parseJsonBody, requireAdmin, sendJson } from './_supabaseAdmin.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      sendJson(res, 200, await recordVisit(req, await parseJsonBody(req)))
      return
    }

    if (req.method === 'GET') {
      requireAdmin(req)
      sendJson(res, 200, await readAnalytics())
      return
    }

    res.setHeader('allow', 'GET, POST')
    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    sendJson(res, error.statusCode || 400, {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
