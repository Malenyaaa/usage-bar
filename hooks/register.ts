import type { Register, SessionRateLimit, SessionContextUsage } from 'claude-code'

type Texts = {
  labels: Record<string, string>
  days: string[]
  resets: string
  context: string
  noReading: string
}

const TEXTS: Record<'en' | 'de', Texts> = {
  en: {
    labels: { five_hour: '5h', seven_day: 'Week', spend_limit: 'Budget' },
    days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    resets: 'resets',
    context: 'Context',
    noReading: 'Limits: no reading yet (arrives with the first response)',
  },
  de: {
    labels: { five_hour: '5 Std', seven_day: 'Woche', spend_limit: 'Budget' },
    days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
    resets: 'neu',
    context: 'Kontext',
    noReading: 'Kontingent: noch keine Angabe (kommt mit der ersten Antwort)',
  },
}

const pad = (n: number) => String(n).padStart(2, '0')

function bar(percent: number): string {
  const full = Math.max(0, Math.min(10, Math.round(percent / 10)))
  return '█'.repeat(full) + '░'.repeat(10 - full)
}

function resets(t: Texts, iso: string | undefined, withDay: boolean): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return withDay ? ` · ${t.resets} ${t.days[d.getDay()]} ${time}` : ` · ${t.resets} ${time}`
}

function line(t: Texts, limits: SessionRateLimit[], context: SessionContextUsage): string {
  const parts = limits.map(l =>
    `${t.labels[l.kind] ?? l.kind} ${bar(l.percentUsed)} ${l.percentUsed}%${resets(t, l.resetsAt, l.kind !== 'five_hour')}`,
  )
  if (parts.length === 0) parts.push(t.noReading)
  if (context.percent !== undefined) parts.push(`${t.context} ${context.percent}%`)
  return parts.join('   |   ')
}

export const register: Register = (on, options) => {
  const t = options.language === 'de' ? TEXTS.de : TEXTS.en

  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const u = await $.session.usage()
    $.ui.status(line(t, u.rateLimits, u.context))
    return r
  })

  on('session.measure', ($, e, next) => {
    $.ui.status(line(t, e.rateLimits, e.context))
    return next(e)
  })
}
