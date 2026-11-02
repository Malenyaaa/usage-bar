import { expect, test } from 'claude-code/testing'

const USAGE = {
  startedAt: 0,
  context: { tokens: 74000, window: 200000, percent: 37 },
  rateLimits: [
    { kind: 'five_hour', percentUsed: 23, resetsAt: '2026-11-02T14:30:00' },
    { kind: 'seven_day', percentUsed: 41, resetsAt: '2026-11-09T09:00:00' },
  ],
}


test('English line', { options: { language: 'en' } }, async ($, on) => {
  let text: string | undefined
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.usage', () => ({ value: USAGE }))
  on('ui.status', (_, e) => { text = e.text; return { value: undefined } })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(text).toBe('5h ██░░░░░░░░ 23% · resets 14:30   |   Week ████░░░░░░ 41% · resets Mon 09:00   |   Context 37%')
})

test('German line', { options: { language: 'de' } }, async ($, on) => {
  let text: string | undefined
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.usage', () => ({ value: USAGE }))
  on('ui.status', (_, e) => { text = e.text; return { value: undefined } })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(text).toBe('5 Std ██░░░░░░░░ 23% · neu 14:30   |   Woche ████░░░░░░ 41% · neu Mo 09:00   |   Kontext 37%')
})

test('no reading yet, default language', async ($, on) => {
  let text: string | undefined
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.usage', () => ({ value: { startedAt: 0, context: { window: 200000 }, rateLimits: [] } }))
  on('ui.status', (_, e) => { text = e.text; return { value: undefined } })
  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  expect(text).toBe('Limits: no reading yet (arrives with the first response)')
})
