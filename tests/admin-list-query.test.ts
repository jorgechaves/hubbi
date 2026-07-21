import test from 'node:test'
import assert from 'node:assert/strict'

import { buildListQuery, parseRoleFilter, parseSearch, parseStatusFilter, toSearchPattern } from '../lib/admin/list-query.ts'

test('parses only supported list filter values', () => {
  assert.equal(parseRoleFilter('admin'), 'admin')
  assert.equal(parseRoleFilter('owner'), null)
  assert.equal(parseStatusFilter('active'), true)
  assert.equal(parseStatusFilter('inactive'), false)
  assert.equal(parseStatusFilter('all'), null)
})

test('trims searches and escapes PostgREST wildcard syntax', () => {
  assert.equal(parseSearch('  Receita  '), 'Receita')
  assert.equal(parseSearch(['x']), '')
  assert.equal(toSearchPattern('100%_done'), '%100\\%\\_done%')
  assert.equal(toSearchPattern(''), null)
})

test('builds a compact URL query and drops empty filters', () => {
  assert.equal(buildListQuery({ q: 'Ana', role: 'admin', status: '' }), 'q=Ana&role=admin')
  assert.equal(buildListQuery({ q: ' ', role: '', status: '' }), '')
})
