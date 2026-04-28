import { readRatings, saveRating } from './_ratingsStore.js'
import { parseJsonBody, sendJson } from './_supabaseAdmin.js'

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      sendJson(res, 200, await readRatings())
      return
    }

    if (req.method === 'POST') {
      sendJson(res, 200, await saveRating(req, await parseJsonBody(req)))
      return
    }

    res.setHeader('allow', 'GET, POST')
    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (error) {
    sendJson(res, error.statusCode || 400, {
      error: error instanceof Error ? error.message : 'Unknown error',
      retryAfterSeconds: error.retryAfterSeconds,
    })
  }
}
