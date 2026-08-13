import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const migration = readFileSync(
  new URL('../supabase/migrations/20260721120000_user_account_management.sql', import.meta.url),
  'utf8'
)

test('creates the private schema before creating private account-management objects', () => {
  const schemaIndex = migration.indexOf('create schema if not exists private;')
  const tableIndex = migration.indexOf('create table if not exists private.user_deletion_reservations')

  assert.notEqual(schemaIndex, -1)
  assert.notEqual(tableIndex, -1)
  assert.ok(schemaIndex < tableIndex)
})
