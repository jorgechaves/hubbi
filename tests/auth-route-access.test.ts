import test from 'node:test'
import assert from 'node:assert/strict'

import { shouldRedirectAuthenticatedUser } from '../lib/supabase/route-access.ts'

test('keeps password recovery routes reachable with an existing session', () => {
  assert.equal(shouldRedirectAuthenticatedUser('/login'), true)
  assert.equal(shouldRedirectAuthenticatedUser('/forgot-password'), false)
  assert.equal(shouldRedirectAuthenticatedUser('/reset-password'), false)
})
