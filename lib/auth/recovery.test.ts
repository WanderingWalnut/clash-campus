import assert from 'node:assert/strict'
import test from 'node:test'
import { hasRecentRecovery } from './recovery.ts'

const claims = { sub: 'student', session_id: 'session', amr: [{ method: 'recovery', timestamp: 1000 }] }
test('accepts recent verified recovery claims for the same student', () => {
  assert.equal(hasRecentRecovery(claims, 'student', 1100), true)
})
test('rejects ordinary login, forged UUID proof, stale recovery and wrong identity', () => {
  assert.equal(hasRecentRecovery({ ...claims, amr: [{ method: 'password', timestamp: 1000 }] }, 'student', 1100), false)
  assert.equal(hasRecentRecovery(undefined, 'student', 1100), false)
  assert.equal(hasRecentRecovery({ ...claims, amr: [null, 'recovery', {}] }, 'student', 1100), false)
  assert.equal(hasRecentRecovery({ sub: 'student' }, 'student', 1100), false)
  assert.equal(hasRecentRecovery(claims, 'other', 1100), false)
  assert.equal(hasRecentRecovery(claims, 'student', 1600), false)
  assert.equal(hasRecentRecovery(claims, 'student', 999), false)
  assert.equal(hasRecentRecovery({ ...claims, session_id: '' }, 'student', 1100), false)
})
