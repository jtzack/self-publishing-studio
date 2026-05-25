import './index.css'
import { useCallback, useEffect, useState } from 'react'

interface SequenceData {
  sequence: {
    id: number
    name: string
    active: boolean
    subscriberCount: number
    emailCount: number
    createdAt: string
  }
  generatedAt: string
  recent: {
    sampleSize: number
    capped: boolean
    added24h: number
    added7d: number
    added30d: number
    daily: { date: string; count: number }[]
  }
  emails: { position: number; subject: string; published: boolean; delay: string }[]
  recentSubscribers: { email: string; state: string; addedAt: string }[]
  warnings: string[]
}

const numberFmt = new Intl.NumberFormat('en-US')

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function stateColor(state: string): string {
  switch (state) {
    case 'active':
      return 'text-butter-500'
    case 'completed':
      return 'text-ink-300'
    default:
      return 'text-rust-400'
  }
}

function KpiCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-ink-800 border border-ink-700 rounded-[4px] p-6 flex flex-col">
      <p className="font-sans text-[11px] font-bold uppercase tracking-caps text-ink-300 mb-3">{label}</p>
      <p className="font-display font-black text-butter-500 leading-none" style={{ fontSize: 'clamp(34px, 4vw, 52px)' }}>
        {value}
      </p>
      {hint && <p className="font-sans text-[12px] text-ink-400 mt-3 leading-snug">{hint}</p>}
    </div>
  )
}

function DailyChart({ daily }: { daily: { date: string; count: number }[] }) {
  const max = Math.max(1, ...daily.map((d) => d.count))
  return (
    <div className="bg-ink-800 border border-ink-700 rounded-[4px] p-6">
      <p className="font-sans text-[11px] font-bold uppercase tracking-caps text-ink-300 mb-5">
        New subscribers &mdash; last 14 days
      </p>
      <div className="flex items-end gap-1.5 h-[160px]">
        {daily.map((d) => {
          const day = d.date.slice(8, 10)
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full" title={`${d.date}: ${d.count}`}>
              <span className="font-mono text-[10px] text-ink-300 mb-1 tabular-nums">{d.count || ''}</span>
              <div
                className="w-full bg-butter-500 rounded-[2px] transition-[height] duration-300 min-h-[2px]"
                style={{ height: `${(d.count / max) * 100}%` }}
              />
              <span className="font-mono text-[10px] text-ink-400 mt-1.5 tabular-nums">{day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState<SequenceData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const sequence = new URLSearchParams(window.location.search).get('sequence')
      const res = await fetch(`/api/kit-sequence${sequence ? `?sequence=${encodeURIComponent(sequence)}` : ''}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`)
      setData(json as SequenceData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <main className="min-h-screen bg-ink-900 px-5 md:px-8 py-8 md:py-12">
      <div className="max-w-container mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-10 pb-6 border-b border-ink-700">
          <div className="flex items-center gap-3">
            <img src="/images/sps/bookshelf-mark.svg" alt="" className="w-7 h-7" />
            <span className="font-sans text-[12px] font-bold uppercase tracking-caps text-ink-200">
              Kit Sequence Dashboard
            </span>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="font-sans text-[12px] font-bold uppercase tracking-caps text-ink-900 bg-butter-500 hover:bg-butter-400 disabled:opacity-50 px-4 py-2 rounded-[3px] transition-colors"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {loading && !data && (
          <p className="font-serif text-[18px] text-ink-200">Loading sequence data…</p>
        )}

        {error && (
          <div className="bg-ink-800 border border-rust-500 rounded-[4px] p-6">
            <p className="font-sans text-[12px] font-bold uppercase tracking-caps text-rust-400 mb-2">
              Couldn&rsquo;t load Kit data
            </p>
            <p className="font-serif text-[16px] text-paper-200 leading-relaxed">{error}</p>
            <p className="font-sans text-[13px] text-ink-300 mt-4">
              Make sure <code className="text-butter-500">KIT_API_KEY</code> and{' '}
              <code className="text-butter-500">KIT_SEQUENCE_ID</code> are set in your Vercel environment, then
              redeploy.
            </p>
          </div>
        )}

        {data && (
          <>
            {/* Sequence header */}
            <div className="mb-8">
              <p className="font-sans text-[12px] font-bold uppercase tracking-caps text-butter-500 mb-2">
                Sequence #{data.sequence.id}
              </p>
              <h1
                className="font-display font-black uppercase text-paper-100 tracking-display leading-display"
                style={{ fontSize: 'clamp(30px, 4.5vw, 60px)' }}
              >
                {data.sequence.name}
              </h1>
              <div className="flex items-center gap-3 mt-3">
                <span
                  className={`inline-flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-caps px-3 py-1 rounded-full ${
                    data.sequence.active ? 'bg-butter-500 text-ink-900' : 'bg-ink-700 text-ink-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${data.sequence.active ? 'bg-ink-900' : 'bg-ink-400'}`} />
                  {data.sequence.active ? 'Active' : 'Paused'}
                </span>
                <span className="font-sans text-[12px] text-ink-300">
                  Created {new Date(data.sequence.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </span>
              </div>
            </div>

            {data.warnings.length > 0 && (
              <div className="bg-ink-800 border border-rust-400/50 rounded-[4px] p-4 mb-6">
                {data.warnings.map((w) => (
                  <p key={w} className="font-sans text-[13px] text-rust-400">
                    {w}
                  </p>
                ))}
              </div>
            )}

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard label="Subscribers in sequence" value={numberFmt.format(data.sequence.subscriberCount)} />
              <KpiCard label="Emails in sequence" value={numberFmt.format(data.sequence.emailCount)} />
              <KpiCard
                label="New · last 24h"
                value={numberFmt.format(data.recent.added24h)}
                hint={data.recent.capped ? `Within ${numberFmt.format(data.recent.sampleSize)} most recent` : undefined}
              />
              <KpiCard
                label="New · last 7 days"
                value={numberFmt.format(data.recent.added7d)}
                hint={data.recent.capped ? `Within ${numberFmt.format(data.recent.sampleSize)} most recent` : undefined}
              />
            </div>

            {/* Chart */}
            <div className="mb-8">
              <DailyChart daily={data.recent.daily} />
            </div>

            {/* Two columns: email schedule + recent subscribers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {/* Email schedule */}
              <div className="bg-ink-800 border border-ink-700 rounded-[4px] p-6">
                <p className="font-sans text-[11px] font-bold uppercase tracking-caps text-ink-300 mb-5">
                  Email schedule
                </p>
                {data.emails.length === 0 ? (
                  <p className="font-serif text-[15px] text-ink-300">No emails found.</p>
                ) : (
                  <div className="flex flex-col gap-px bg-ink-700 rounded-[3px] overflow-hidden">
                    {data.emails.map((e) => (
                      <div key={e.position} className="bg-ink-800 px-4 py-3 flex items-start gap-3">
                        <span className="font-display font-black text-[18px] text-butter-500 leading-none w-7 flex-shrink-0 tabular-nums">
                          {e.position + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-sans text-[14px] text-paper-100 leading-snug truncate">{e.subject}</p>
                          <p className="font-mono text-[11px] text-ink-300 mt-1">
                            {e.delay}
                            {!e.published && <span className="text-rust-400"> · draft</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent subscribers */}
              <div className="bg-ink-800 border border-ink-700 rounded-[4px] p-6">
                <p className="font-sans text-[11px] font-bold uppercase tracking-caps text-ink-300 mb-1">
                  Recent subscribers
                </p>
                <p className="font-sans text-[11px] text-ink-400 mb-5">Emails masked for privacy</p>
                {data.recentSubscribers.length === 0 ? (
                  <p className="font-serif text-[15px] text-ink-300">No subscribers found.</p>
                ) : (
                  <div className="flex flex-col gap-px bg-ink-700 rounded-[3px] overflow-hidden">
                    {data.recentSubscribers.map((s, i) => (
                      <div key={i} className="bg-ink-800 px-4 py-2.5 flex items-center justify-between gap-3">
                        <span className="font-mono text-[13px] text-paper-200 truncate">{s.email}</span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className={`font-sans text-[11px] font-bold uppercase tracking-caps ${stateColor(s.state)}`}>
                            {s.state}
                          </span>
                          <span className="font-mono text-[11px] text-ink-400 tabular-nums">
                            {formatDateTime(s.addedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <p className="font-sans text-[12px] text-ink-400">
              Data from Kit · cached up to 5 min · generated {formatDateTime(data.generatedAt)}
            </p>
          </>
        )}
      </div>
    </main>
  )
}
