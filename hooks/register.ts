import type { Register, SessionRateLimit, SessionContextUsage } from 'claude-code'

const LABELS: Record<string, string> = { five_hour: '5h', seven_day: 'Week', spend_limit: 'Budget' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const pad = (n: number) => String(n).padStart(2, '0')

function bar(percent: number): string {
  const full = Math.max(0, Math.min(10, Math.round(percent / 10)))
  return '█'.repeat(full) + '░'.repeat(10 - full)
}

function resets(iso: string | undefined, withDay: boolean): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  return withDay ? ` · resets ${DAYS[d.getDay()]} ${time}` : ` · resets ${time}`
}

function line(limits: SessionRateLimit[], context: SessionContextUsage): string {
  const parts = limits.map(l =>
    `${LABELS[l.kind] ?? l.kind} ${bar(l.percentUsed)} ${l.percentUsed}%${resets(l.resetsAt, l.kind !== 'five_hour')}`,
  )
  if (parts.length === 0) parts.push('Limits: no reading yet (arrives with the first response)')
  if (context.percent !== undefined) parts.push(`Context ${context.percent}%`)
  return parts.join('   |   ')
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const r = await next(e)
    const u = await $.session.usage()
    $.ui.status(line(u.rateLimits, u.context))
    return r
  })

  on('session.measure', ($, e, next) => {
    $.ui.status(line(e.rateLimits, e.context))
    return next(e)
  })
}
