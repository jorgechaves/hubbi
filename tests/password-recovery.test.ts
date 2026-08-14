import test from 'node:test'
import assert from 'node:assert/strict'

import { passwordRecoveryClientOptions } from '../lib/security/password-recovery.ts'

test('manual password recovery exchange disables automatic URL exchange', () => {
  const options = passwordRecoveryClientOptions()

  assert.equal(options.auth?.detectSessionInUrl, false)
  assert.equal(options.isSingleton, false)
})
