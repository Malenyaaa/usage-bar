import type { Register, SessionRateLimit, SessionContextUsage } from 'claude-code'

type Texts = {
  labels: Record<string, string>
  days: string[]
  resets: string
  resetsIn: string
  hours: string
  minutes: string
  full: string
  lasts: string
  context: string
  noReading: string
}

const TEXTS: Record<'en' | 'de', Texts> = {
  en: {
    labels: { five_hour: '5h', seven_day: 'Week', spend_limit: 'Budget' },
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    resets: 'resets',
    resetsIn: 'resets in',
    hours: 'h',
    minutes: 'm',
    full: 'full at this pace',
    lasts: 'lasts until reset at this pace',
    context: 'Context',
    noReading: 'Limits: no reading yet (arrives with the first response)',
  },
  de: {
    labels: { five_hour: '5 Std', seven_day: 'Woche', spend_limit: 'Budget' },
    days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    resets: 'neu',
    resetsIn: 'neu in',
    hours: ' Std',
    minutes: ' min',
    full: 'bei dem Tempo voll',
    lasts: 'reicht bei dem Tempo bis zum Reset',
    context: 'Kontext',
    noReading: 'Kontingent: noch keine Angabe (kommt mit der ersten Antwort)',
  },
}

/** Pace is measured over this window; older readings are dropped. */
const PACE_WINDOW_MS = 30 * 60_000
/** A forecast needs at least this much history, so one jump doesn't extrapolate wildly. */
const PACE_MIN_SPAN_MS = 5 * 60_000
/** Below this the window is far from full, so the forecast would only add noise. */
const FORECAST_FROM = 50

const pad = (n: number) => String(n).padStart(2, '0')
const clock = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

function bar(percent: number): string {
  const full = Math.max(0, Math.min(10, Math.round(percent / 10)))
  return '█'.repeat(full) + '░'.repeat(10 - full)
}

function parse(iso: string | undefined): number | undefined {
  if (!iso) return undefined
  const ms = new Date(iso).getTime()
  return isNaN(ms) ? undefined : ms
}

function duration(t: Texts, ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 60_000))
  const h = Math.floor(total / 60)
  const m = total % 60
  return h > 0 ? `${h}${t.hours} ${m}${t.minutes}` : `${m}${t.minutes}`
}

/** The weekly window says on which day; the 5-hour one counts down. */
function resets(t: Texts, l: SessionRateLimit, now: number): string {
  const at = parse(l.resetsAt)
  if (at === undefined) return ''
  if (l.kind === 'five_hour') return ` · ${t.resetsIn} ${duration(t, at - now)}`
  const d = new Date(at)
  return ` · ${t.resets} ${t.days[d.getDay()]} ${clock(d)}`
}

type Sample = { at: number; percent: number }
type Track = { resetsAt?: string; samples: Sample[] }

/** Readings per window kind, for the pace forecast. Starts over on a reload. */
const tracks = new Map<string, Track>()

function record(limits: SessionRateLimit[], now: number): void {
  for (const l of limits) {
    let tr = tracks.get(l.kind)
    const last = tr?.samples[tr.samples.length - 1]
    // A new window (or a drop) makes the old readings meaningless.
    if (!tr || tr.resetsAt !== l.resetsAt || (last && l.percentUsed < last.percent)) {
      tr = { resetsAt: l.resetsAt, samples: [] }
      tracks.set(l.kind, tr)
    }
    tr.samples.push({ at: now, percent: l.percentUsed })
  }
}

/** Whether the window lasts until it resets at the pace of the last half hour, or when it fills. */
function forecast(t: Texts, l: SessionRateLimit, now: number): string {
  if (l.kind !== 'five_hour') return ''
  const tr = tracks.get(l.kind)
  if (!tr) return ''
  tr.samples = tr.samples.filter(s => now - s.at <= PACE_WINDOW_MS)
  const first = tr.samples[0]
  if (!first || now - first.at < PACE_MIN_SPAN_MS) return ''
  if (l.percentUsed < FORECAST_FROM || l.percentUsed >= 100) return ''
  const rise = l.percentUsed - first.percent
  if (rise <= 0) return ` · ${t.lasts}`
  const fullAt = now + ((100 - l.percentUsed) * (now - first.at)) / rise
  const resetAt = parse(l.resetsAt)
  if (resetAt !== undefined && fullAt >= resetAt) return ` · ${t.lasts}`
  return ` · ${t.full} ${clock(new Date(fullAt))}`
}

/**
 * The 5-hour window first, then the week and the context.
 */
function line(t: Texts, limits: SessionRateLimit[], context: SessionContextUsage, now: number): string {
  const part = (l: SessionRateLimit) =>
    `${(t.labels[l.kind] ?? l.kind)} ${bar(l.percentUsed)} ${l.percentUsed}%${resets(t, l, now)}${forecast(t, l, now)}`
  const first = limits.filter(l => l.kind === 'five_hour').map(part)
  const rest = limits.filter(l => l.kind !== 'five_hour').map(part)
  if (limits.length === 0) rest.push(t.noReading)
  if (context.percent !== undefined) rest.push(`${t.context} ${context.percent}%`)
  // The status line draws a line break as nothing, so everything stays on one line.
  return [...first, ...rest].join('   |   ')
}

export const register: Register = (on, options) => {
  const t = options.language === 'de' ? TEXTS.de : TEXTS.en
  tracks.clear()
  let latest: { limits: SessionRateLimit[]; context: SessionContextUsage } | undefined

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const u = await $.session.usage()
    const now = await $.clock.now()
    latest = { limits: u.rateLimits, context: u.context }
    record(u.rateLimits, now)
    $.ui.status(line(t, u.rateLimits, u.context, now))
    // Keeps the countdown and forecast current while no response comes in.
    $.clock.every(60_000, async () => {
      if (latest) $.ui.status(line(t, latest.limits, latest.context, await $.clock.now()))
    })
    return r
  })

  on('session.measure', async ($, e, next) => {
    const now = await $.clock.now()
    latest = { limits: e.rateLimits, context: e.context }
    record(e.rateLimits, now)
    $.ui.status(line(t, e.rateLimits, e.context, now))
    return next(e)
  })
}
