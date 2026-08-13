import test from 'node:test'
import assert from 'node:assert/strict'

import { resolveSiteUrl } from '../lib/security/site-url.ts'

test('prefers the configured site URL and removes trailing slashes', () => {
  assert.equal(resolveSiteUrl({ configuredUrl: 'https://hubbi-omega.vercel.app/' }), 'https://hubbi-omega.vercel.app')
})

test('uses the request origin when the configured URL is empty', () => {
  assert.equal(resolveSiteUrl({ configuredUrl: '  ', origin: 'https://hubbi-omega.vercel.app' }), 'https://hubbi-omega.vercel.app')
})

test('builds a forwarded HTTPS origin when no configured URL exists', () => {
  assert.equal(resolveSiteUrl({ forwardedHost: 'hubbi-omega.vercel.app', forwardedProto: 'https' }), 'https://hubbi-omega.vercel.app')
})

test('falls back to localhost for local development without request metadata', () => {
  assert.equal(resolveSiteUrl({}), 'http://localhost:3000')
})
