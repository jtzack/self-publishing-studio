import type { VercelRequest, VercelResponse } from '@vercel/node'

const KIT_API_BASE = 'https://api.kit.com/v4'

interface KitSequence {
  id: number
  name: string
  active: boolean
  subscriber_count: number
  email_count: number
  created_at: string
}

interface KitSequenceEmail {
  id: number
  subject: string
  published: boolean
  position: number
  delay_value: number
  delay_unit: string
}

interface KitSubscriber {
  id: number
  email_address: string
  first_name: string | null
  state: string
  created_at: string
  added_at: string
}

interface KitPagination {
  has_next_page: boolean
  end_cursor: string | null
}

async function kitGet<T>(
  apiKey: string,
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const url = new URL(KIT_API_BASE + path)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json', 'X-Kit-Api-Key': apiKey },
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Kit API responded ${res.status} for ${path}: ${body.slice(0, 200)}`)
  }
  return res.json() as Promise<T>
}

function delayLabel(value: number, unit: string): string {
  if (!value) return 'Immediately'
  const singular = value === 1 ? unit.replace(/s$/, '') : unit
  return `${value} ${singular}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.KIT_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'KIT_API_KEY is not set in the environment.' })
    return
  }

  const fromQuery = typeof req.query.sequence === 'string' ? req.query.sequence : ''
  const sequenceIdRaw = fromQuery || process.env.KIT_SEQUENCE_ID
  if (!sequenceIdRaw) {
    res.status(400).json({
      error: 'No sequence configured. Set the KIT_SEQUENCE_ID env var, or pass ?sequence=<id>.',
    })
    return
  }
  const sequenceId = Number(sequenceIdRaw)
  if (!Number.isInteger(sequenceId) || sequenceId <= 0) {
    res.status(400).json({ error: `Invalid sequence id: ${sequenceIdRaw}` })
    return
  }

  const warnings: string[] = []

  try {
    // 1) Locate the sequence (the only source of accurate totals).
    let sequence: KitSequence | undefined
    let cursor: string | null = null
    for (let page = 0; page < 10; page++) {
      const params: Record<string, string> = { per_page: '100' }
      if (cursor) params.after = cursor
      const data = await kitGet<{ sequences: KitSequence[]; pagination: KitPagination }>(
        apiKey,
        '/sequences',
        params,
      )
      sequence = data.sequences.find((s) => s.id === sequenceId)
      if (sequence || !data.pagination?.has_next_page || !data.pagination.end_cursor) break
      cursor = data.pagination.end_cursor
    }
    if (!sequence) {
      res.status(404).json({ error: `Sequence ${sequenceId} was not found in this Kit account.` })
      return
    }

    // 2) Email schedule (best-effort — degrade gracefully if unavailable).
    const emails: KitSequenceEmail[] = []
    try {
      cursor = null
      for (let page = 0; page < 5; page++) {
        const params: Record<string, string> = { per_page: '100' }
        if (cursor) params.after = cursor
        const data = await kitGet<{ emails: KitSequenceEmail[]; pagination: KitPagination }>(
          apiKey,
          `/sequences/${sequenceId}/emails`,
          params,
        )
        emails.push(...data.emails)
        if (!data.pagination?.has_next_page || !data.pagination.end_cursor) break
        cursor = data.pagination.end_cursor
      }
    } catch {
      warnings.push('Could not load the email schedule for this sequence.')
    }

    // 3) Recent subscribers (newest first). Bounded sample — Kit has no total-count
    //    field, and accurate totals already come from sequence.subscriber_count.
    const MAX_PAGES = 10
    const sampled: KitSubscriber[] = []
    let capped = false
    try {
      cursor = null
      for (let page = 0; page < MAX_PAGES; page++) {
        const params: Record<string, string> = { per_page: '100' }
        if (cursor) params.after = cursor
        const data = await kitGet<{ subscribers: KitSubscriber[]; pagination: KitPagination }>(
          apiKey,
          `/sequences/${sequenceId}/subscribers`,
          params,
        )
        sampled.push(...data.subscribers)
        if (!data.pagination?.has_next_page || !data.pagination.end_cursor) break
        cursor = data.pagination.end_cursor
        if (page === MAX_PAGES - 1) capped = true
      }
    } catch {
      warnings.push('Could not load recent subscribers for this sequence.')
    }

    const now = Date.now()
    const DAY = 86_400_000
    let added24h = 0
    let added7d = 0
    let added30d = 0
    const dailyMap = new Map<string, number>()
    for (let i = 13; i >= 0; i--) {
      dailyMap.set(new Date(now - i * DAY).toISOString().slice(0, 10), 0)
    }
    for (const s of sampled) {
      const age = now - new Date(s.added_at).getTime()
      if (age <= DAY) added24h++
      if (age <= 7 * DAY) added7d++
      if (age <= 30 * DAY) added30d++
      const key = s.added_at.slice(0, 10)
      if (dailyMap.has(key)) dailyMap.set(key, (dailyMap.get(key) ?? 0) + 1)
    }

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    res.status(200).json({
      sequence: {
        id: sequence.id,
        name: sequence.name,
        active: sequence.active,
        subscriberCount: sequence.subscriber_count,
        emailCount: sequence.email_count,
        createdAt: sequence.created_at,
      },
      generatedAt: new Date().toISOString(),
      recent: {
        sampleSize: sampled.length,
        capped,
        added24h,
        added7d,
        added30d,
        daily: [...dailyMap.entries()].map(([date, count]) => ({ date, count })),
      },
      emails: emails
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((e) => ({
          position: e.position,
          subject: e.subject,
          published: e.published,
          delay: delayLabel(e.delay_value, e.delay_unit),
        })),
      warnings,
    })
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : 'Failed to load data from Kit.',
    })
  }
}
