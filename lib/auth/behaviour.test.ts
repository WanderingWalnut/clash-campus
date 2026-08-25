import assert from 'node:assert/strict'
import test from 'node:test'
import {
  getAccountDestination,
  getLoginPath,
  getSafeNextPath,
  isValidEmailSyntax,
  normalizeEmail,
  validatePasswordMatch,
  validatePasswordStrength,
} from './behaviour.ts'

test('normalizes and validates email syntax', () => {
  assert.equal(normalizeEmail('  Student@UCalgary.CA '), 'student@ucalgary.ca')
  assert.equal(isValidEmailSyntax('student@ucalgary.ca'), true)
  assert.equal(isValidEmailSyntax('student@localhost'), false)
  assert.equal(isValidEmailSyntax('student @ucalgary.ca'), false)
})

test('uses the same password rules for signup and recovery', () => {
  assert.equal(validatePasswordStrength('1234567').isValid, false)
  assert.equal(validatePasswordStrength('12345678').isValid, true)
  assert.equal(validatePasswordMatch('12345678', '87654321').isValid, false)
  assert.equal(validatePasswordMatch('12345678', '12345678').isValid, true)
})

test('accepts only local return destinations', () => {
  assert.equal(getSafeNextPath('/profile?tab=stats'), '/profile?tab=stats')
  assert.equal(getSafeNextPath('https://example.com'), null)
  assert.equal(getSafeNextPath('javascript:alert(1)'), null)
  assert.equal(getSafeNextPath('//example.com'), null)
  assert.equal(getSafeNextPath('/\\example.com'), null)
  assert.equal(getSafeNextPath('/login'), null)
  assert.equal(getSafeNextPath('/signup?next=/login'), null)
})

test('uses a safe requested path before the account-state default', () => {
  assert.equal(getAccountDestination(false), '/verify')
  assert.equal(getAccountDestination(true), '/rankings')
  assert.equal(getAccountDestination(false, '/profile'), '/profile')
  assert.equal(getAccountDestination(true, '//example.com'), '/rankings')
})

test('preserves a private local path through login', () => {
  assert.equal(getLoginPath('/profile', '?tab=stats'), '/login?next=%2Fprofile%3Ftab%3Dstats')
  assert.equal(getLoginPath('//example.com'), '/login')
})
