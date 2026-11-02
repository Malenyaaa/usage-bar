import { expect, test } from 'claude-code/testing'

const USAGE = {
  startedAt: 0,
  context: { tokens: 74000, window: 200000, percent: 37 },
  rateLimits: [
    { kind: 'five_hour', percentUsed: 23, resetsAt: '2026-11-02T14:30:00' },
    { kind: 'seven_day', percentUsed: 41, resetsAt: '2026-11-09T09:00:00' },
  ],
}

const NOON = new Date('2026-11-02T12:00:00').getTime()
const MIN = 60_000

type On = Parameters<Parameters<typeof test>[2]>[1]

/** Mocks the engine beneath the mod; returns a getter for the status text and a clock setter. */
function engine(on: On, usage: unknown = USAGE) {
  let text: string | undefined
  let now = NOON
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.usage', () => ({ value: usage }))
  on('session.measure', (_, e) => ({ changed: e.changed }))
  on('clock.now', () => ({ value: now }))
  on('clock.every', () => ({ deny: 'no timers in tests' }))
  on('ui.status', (_, e) => { text = e.text; return { value: undefined } })
  return { text: () => text, at: (ms: number) => { now = ms } }
}

const five = (percentUsed: number) => ({
  context: { window: 200000 },
  rateLimits: [{ kind: 'five_hour', percentUsed, resetsAt: '2026-11-02T14:30:00' }],
  changed: ['rateLimits' as const],
})

test('English line', { options: { language: 'en' } }, async ($, on) => {
  const m = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(m.text()).toBe('5h ██░░░░░░░░ 23% · resets in 2h 30m   |   Week ████░░░░░░ 41% · resets Mon 09:00   |   Context 37%')
})

test('German line', { options: { language: 'de' } }, async ($, on) => {
  const m = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(m.text()).toBe('5 Std ██░░░░░░░░ 23% · neu in 2 Std 30 min   |   Woche ████░░░░░░ 41% · neu Mo 09:00   |   Kontext 37%')
})

test('no reading yet, default language', async ($, on) => {
  const m = engine(on, { startedAt: 0, context: { window: 200000 }, rateLimits: [] })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(m.text()).toBe('Limits: no reading yet (arrives with the first response)')
})

test('countdown under an hour shows minutes only', async ($, on) => {
  const m = engine(on, { startedAt: 0, context: { window: 200000 }, rateLimits: [] })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  m.at(NOON + 125 * MIN)
  await $.session.measure(five(50))
  expect(m.text()).toBe('5h █████░░░░░ 50% · resets in 25m')
})

test('fast pace forecasts when the window fills', { options: { language: 'de' } }, async ($, on) => {
  const m = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  m.at(NOON + 10 * MIN)
  await $.session.measure(five(33)) // 10 points in 10 min: 67 left -> 67 min
  expect(m.text()).toBe('5 Std ███░░░░░░░ 33% · neu in 2 Std 20 min · bei dem Tempo voll 13:17')
})

test('slow pace shows no forecast', async ($, on) => {
  const m = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  m.at(NOON + 20 * MIN)
  await $.session.measure(five(25)) // 2 points in 20 min: full long after reset
  expect(m.text()).toBe('5h ███░░░░░░░ 25% · resets in 2h 10m')
})

test('no forecast from too short a history', async ($, on) => {
  const m = engine(on)
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  m.at(NOON + 2 * MIN)
  await $.session.measure(five(30))
  expect(m.text()).toBe('5h ███░░░░░░░ 30% · resets in 2h 28m')
})
