import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getAdminNavigation,
  getPortalNavigation,
  isNavigationEntryActive,
} from '../lib/ui/navigation.ts'

test('builds portal navigation from the accessible panels', () => {
  const entries = getPortalNavigation([
    { id: 'sales', name: 'Vendas' },
    { id: 'ops', name: 'Operações' },
  ])

  assert.deepEqual(entries.map(entry => entry.href), [
    '/dashboard',
    '/panel/sales',
    '/panel/ops',
    '/account',
  ])
  assert.equal(entries[1].label, 'Vendas')
})

test('keeps admin parent navigation active on nested pages', () => {
  const panels = getAdminNavigation().find(entry => entry.href === '/admin/panels')

  assert.ok(panels)
  assert.equal(isNavigationEntryActive('/admin/panels', panels.href), true)
  assert.equal(isNavigationEntryActive('/admin/panels/123', panels.href), true)
  assert.equal(isNavigationEntryActive('/admin/groups', panels.href), false)
})
