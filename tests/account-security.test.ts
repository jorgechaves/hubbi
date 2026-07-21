import test from 'node:test'
import assert from 'node:assert/strict'

import { assertUserDeletionAllowed } from '../lib/security/account.ts'

test('blocks self deletion and deletion of the last active admin', () => {
  assert.throws(() => assertUserDeletionAllowed({
    targetId: 'u1', currentUserId: 'u1', targetRole: 'user', targetActive: true, activeAdminCount: 2,
  }), /própria conta/)
  assert.throws(() => assertUserDeletionAllowed({
    targetId: 'u2', currentUserId: 'u1', targetRole: 'admin', targetActive: true, activeAdminCount: 1,
  }), /último administrador/)
  assert.doesNotThrow(() => assertUserDeletionAllowed({
    targetId: 'u2', currentUserId: 'u1', targetRole: 'admin', targetActive: true, activeAdminCount: 2,
  }))
})

test('allows deleting an inactive administrator', () => {
  assert.doesNotThrow(() => assertUserDeletionAllowed({
    targetId: 'u2', currentUserId: 'u1', targetRole: 'admin', targetActive: false, activeAdminCount: 1,
  }))
})
