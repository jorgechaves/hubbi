import test from 'node:test'
import assert from 'node:assert/strict'

import {
  ActionError,
  getOptionalString,
  getOptionalPassword,
  getRequiredString,
  parseBoolean,
  parseHttpUrl,
  parseRole,
  parseUuidList,
  sanitizeRedirectPath,
} from '../lib/security/forms.ts'

test('sanitizeRedirectPath accepts only internal absolute paths', () => {
  assert.equal(sanitizeRedirectPath('/dashboard'), '/dashboard')
  assert.equal(sanitizeRedirectPath('/panel/123?tab=main'), '/panel/123?tab=main')
  assert.equal(sanitizeRedirectPath('https://evil.example'), '/dashboard')
  assert.equal(sanitizeRedirectPath('//evil.example'), '/dashboard')
  assert.equal(sanitizeRedirectPath('dashboard'), '/dashboard')
  assert.equal(sanitizeRedirectPath('/\nadmin'), '/dashboard')
})

test('parseRole only accepts supported profile roles', () => {
  assert.equal(parseRole('admin'), 'admin')
  assert.equal(parseRole('user'), 'user')
  assert.equal(parseRole(null), 'user')
  assert.throws(() => parseRole('owner'), ActionError)
})

test('parseUuidList removes duplicates and rejects invalid UUIDs', () => {
  const one = '11111111-1111-4111-8111-111111111111'
  const two = '22222222-2222-4222-8222-222222222222'

  assert.deepEqual(parseUuidList([one, one, two], 'Grupos'), [one, two])
  assert.throws(() => parseUuidList(['not-a-uuid'], 'Grupos'), /Grupos/)
})

test('parseHttpUrl accepts http and https only', () => {
  assert.equal(parseHttpUrl('https://example.com/panel', 'URL'), 'https://example.com/panel')
  assert.equal(parseHttpUrl('http://localhost:3001/panel', 'URL'), 'http://localhost:3001/panel')
  assert.equal(parseHttpUrl('', 'Logo', { optional: true }), null)
  assert.throws(() => parseHttpUrl('javascript:alert(1)', 'URL'), /URL/)
})

test('string helpers trim values and enforce required/max length', () => {
  const formData = new FormData()
  formData.set('name', '  BI Hub  ')
  formData.set('empty', '   ')
  formData.set('long', 'abcdef')

  assert.equal(getRequiredString(formData, 'name', 'Nome'), 'BI Hub')
  assert.equal(getOptionalString(formData, 'empty', 'Descrição'), null)
  assert.throws(() => getRequiredString(formData, 'empty', 'Nome'), /Nome/)
  assert.throws(() => getRequiredString(formData, 'long', 'Longo', { max: 3 }), /Longo/)
})

test('parseBoolean handles select values explicitly', () => {
  assert.equal(parseBoolean('true', 'Status'), true)
  assert.equal(parseBoolean('false', 'Status'), false)
  assert.throws(() => parseBoolean('yes', 'Status'), /Status/)
})

test('accepts an empty temporary password and validates a confirmed one', () => {
  const empty = new FormData()
  assert.equal(getOptionalPassword(empty), null)

  const valid = new FormData()
  valid.set('temporary_password', 'nova-senha-8')
  valid.set('password_confirmation', 'nova-senha-8')
  assert.equal(getOptionalPassword(valid), 'nova-senha-8')
})

test('rejects short or mismatched temporary passwords', () => {
  const short = new FormData()
  short.set('temporary_password', 'curta')
  short.set('password_confirmation', 'curta')
  assert.throws(() => getOptionalPassword(short), /mínimo 8/)

  const mismatch = new FormData()
  mismatch.set('temporary_password', 'senha-segura')
  mismatch.set('password_confirmation', 'outra-senha')
  assert.throws(() => getOptionalPassword(mismatch), /não coincidem/)
})
