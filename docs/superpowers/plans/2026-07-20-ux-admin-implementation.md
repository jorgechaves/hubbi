# UX administrativa: busca, filtros e feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar a administração de usuários, grupos e painéis pesquisável, filtrável e clara quanto ao resultado das ações.

**Architecture:** Parâmetros de busca e filtro ficam na URL e são normalizados por funções puras. As páginas de lista são Server Components que aplicam esses parâmetros nas consultas Supabase; um componente cliente comum controla o formulário e atualiza a URL. Ações administrativas mantêm a validação/autorização no servidor e as telas exibem resultados com toasts e estados pendentes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase, Tailwind, Sonner, Node test runner.

## Global Constraints

- Não incluir busca ou filtros na página de logs.
- Preservar RLS e a autorização obrigatória nas Server Actions existentes.
- Não adicionar dependências de produção.
- Aceitar somente `admin`/`user` para função e `active`/`inactive` para status.
- Usar `searchParams` nas páginas de servidor e `router.replace` apenas ao submeter o formulário de filtros.

---

### Task 1: Normalizar parâmetros de listagem

**Files:**
- Create: `lib/admin/list-query.ts`
- Create: `tests/admin-list-query.test.ts`

**Interfaces:**
- Produces `parseSearch(value: unknown): string`.
- Produces `parseRoleFilter(value: unknown): 'admin' | 'user' | null`.
- Produces `parseStatusFilter(value: unknown): boolean | null`.
- Produces `toSearchPattern(search: string): string | null`.

- [ ] **Step 1: Write the failing tests**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseRoleFilter, parseSearch, parseStatusFilter, toSearchPattern } from '../lib/admin/list-query.ts'

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test --experimental-strip-types tests/admin-list-query.test.ts`

Expected: FAIL because `lib/admin/list-query.ts` does not exist.

- [ ] **Step 3: Implement the parser**

```ts
const MAX_SEARCH_LENGTH = 120

export function parseSearch(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_SEARCH_LENGTH) : ''
}

export function parseRoleFilter(value: unknown): 'admin' | 'user' | null {
  return value === 'admin' || value === 'user' ? value : null
}

export function parseStatusFilter(value: unknown): boolean | null {
  if (value === 'active') return true
  if (value === 'inactive') return false
  return null
}

export function toSearchPattern(search: string): string | null {
  if (!search) return null
  return `%${search.replace(/[%_,.()]/g, '\\$&')}%`
}
```

- [ ] **Step 4: Run the focused tests**

Run: `node --test --experimental-strip-types tests/admin-list-query.test.ts`

Expected: PASS with two tests.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/list-query.ts tests/admin-list-query.test.ts
git commit -m "feat: parse admin list filters"
```

### Task 2: Criar controles reutilizáveis de busca e filtros

**Files:**
- Create: `components/admin/list-filters.tsx`
- Modify: `components/ui/input.tsx`

**Interfaces:**
- Consumes `search`, `role`, and `status` values normalized by Task 1.
- Produces `AdminListFilters({ search, filters }: { search: string; filters: Array<{ name: 'role' | 'status'; label: string; options: Array<{ value: string; label: string }> }> })`.

- [ ] **Step 1: Write the failing test for URL-value construction**

Add to `tests/admin-list-query.test.ts`:

```ts
import { buildListQuery } from '../lib/admin/list-query.ts'

test('builds a compact URL query and drops empty filters', () => {
  assert.equal(buildListQuery({ search: 'Ana', role: 'admin', status: '' }), 'q=Ana&role=admin')
  assert.equal(buildListQuery({ search: ' ', role: '', status: '' }), '')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test --experimental-strip-types tests/admin-list-query.test.ts`

Expected: FAIL because `buildListQuery` is not exported.

- [ ] **Step 3: Add query building and the component**

Add this export to `lib/admin/list-query.ts`:

```ts
export function buildListQuery(values: Record<string, string>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    const normalized = value.trim()
    if (normalized) params.set(key, normalized)
  }
  return params.toString()
}
```

Implement `components/admin/list-filters.tsx` as a client component. It must use `usePathname` and `useRouter`; its form action reads `FormData`, calls `buildListQuery`, and runs `router.replace(query ? `${pathname}?${query}` : pathname)`. Render one labelled `<Input name="q" defaultValue={search} placeholder="Buscar…" />`, native `<select>` controls from `filters`, a submit `<Button>Aplicar</Button>`, and a `Link` labelled `Limpar filtros` only when current values are non-empty. Use `aria-label` for the search input and labels for each select.

- [ ] **Step 4: Run the focused tests**

Run: `node --test --experimental-strip-types tests/admin-list-query.test.ts`

Expected: PASS with three tests.

- [ ] **Step 5: Commit**

```bash
git add lib/admin/list-query.ts tests/admin-list-query.test.ts components/admin/list-filters.tsx
git commit -m "feat: add reusable admin list filters"
```

### Task 3: Filtrar usuários e grupos no servidor

**Files:**
- Modify: `app/(admin)/admin/users/page.tsx`
- Modify: `app/(admin)/admin/groups/page.tsx`

**Interfaces:**
- Consumes Task 1 parsers and Task 2 `AdminListFilters`.
- Produces server-rendered lists that honour `?q=`, `?role=`, and `?status=`.

- [ ] **Step 1: Re-run the list-query tests before integrating them**

Run: `node --test --experimental-strip-types tests/admin-list-query.test.ts`

Expected: PASS. Task 1 already specifies and tests the shared `toSearchPattern` behavior, so this task must not add a test that passes before the implementation starts.

- [ ] **Step 2: Implement server-side filtering**

Change both pages to accept `searchParams: Promise<{ q?: string; role?: string; status?: string }>` and await it. In users, start with `service.from('profiles').select(...).order(...)`; when `pattern` exists, chain `.or(`name.ilike.${pattern},email.ilike.${pattern}`)`, then `.eq('role', role)` and `.eq('active', status)` only when parsed values are non-null. In groups, chain `.or(`name.ilike.${pattern},description.ilike.${pattern}`)` only when `pattern` exists. Place `AdminListFilters` between the header and table, with the specified filter options. Change the empty-state text to `Nenhum resultado para os filtros aplicados.` when any parameter is active; otherwise retain the existing empty text.

- [ ] **Step 3: Run tests and static checks**

Run: `node --test --experimental-strip-types tests/admin-list-query.test.ts && npm run lint`

Expected: PASS and exit code 0.

- [ ] **Step 4: Commit**

```bash
git add app/'(admin)'/admin/users/page.tsx app/'(admin)'/admin/groups/page.tsx tests/admin-list-query.test.ts
git commit -m "feat: filter admin users and groups"
```

### Task 4: Filtrar painéis e confirmar alteração de status

**Files:**
- Create: `app/(admin)/admin/panels/panel-status-toggle.tsx`
- Modify: `app/(admin)/admin/panels/page.tsx`
- Modify: `app/actions/admin.ts`

**Interfaces:**
- Consumes `togglePanelStatus(panelId: string, active: boolean)`.
- Produces `{ success: true } | { error: string }` from `togglePanelStatus`.
- Produces `PanelStatusToggle({ id, active }: { id: string; active: boolean })`.

- [ ] **Step 1: Add a failing action-result test**

Add `tests/admin-action-results.test.ts`:

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { isActionSuccess } from '../lib/admin/action-result.ts'

test('recognizes only explicit action success responses', () => {
  assert.equal(isActionSuccess({ success: true }), true)
  assert.equal(isActionSuccess({}), false)
  assert.equal(isActionSuccess({ error: 'Falhou' }), false)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test --experimental-strip-types tests/admin-action-results.test.ts`

Expected: FAIL because `lib/admin/action-result.ts` does not exist.

- [ ] **Step 3: Implement server filtering and status feedback**

Create `lib/admin/action-result.ts`:

```ts
export type ActionResult = { success: true } | { error: string }

export function isActionSuccess(result: unknown): result is { success: true } {
  return typeof result === 'object' && result !== null && 'success' in result && result.success === true
}
```

Make `PanelsPage` a Server Component that accepts and normalizes `searchParams`, queries `panels` with the same `q` and `status` rules as Task 3, and renders `AdminListFilters`. Move only the interactive status button into `PanelStatusToggle`; it uses `useTransition`, calls the Server Action, displays `toast.success('Painel ativado.')` or `toast.success('Painel desativado.')`, displays `toast.error(result.error)` on failure, and calls `router.refresh()` after success. Return `{ success: true }` explicitly at the end of `togglePanelStatus`.

- [ ] **Step 4: Run focused tests and static checks**

Run: `node --test --experimental-strip-types tests/admin-action-results.test.ts tests/admin-list-query.test.ts && npm run lint`

Expected: PASS and exit code 0.

- [ ] **Step 5: Commit**

```bash
git add app/'(admin)'/admin/panels/page.tsx app/'(admin)'/admin/panels/panel-status-toggle.tsx app/actions/admin.ts lib/admin/action-result.ts tests/admin-action-results.test.ts
git commit -m "feat: filter panels and confirm status changes"
```

### Task 5: Unificar feedback de formulários e exclusão

**Files:**
- Create: `components/admin/action-feedback.ts`
- Modify: `app/(admin)/admin/users/new/page.tsx`
- Modify: `app/(admin)/admin/users/[id]/page.tsx`
- Modify: `app/(admin)/admin/groups/new/page.tsx`
- Modify: `app/(admin)/admin/groups/[id]/page.tsx`
- Modify: `app/(admin)/admin/groups/delete-group-button.tsx`
- Modify: `app/(admin)/admin/panels/new/page.tsx`
- Modify: `app/(admin)/admin/panels/[id]/page.tsx`
- Modify: `app/(admin)/admin/settings/page.tsx`

**Interfaces:**
- Consumes `ActionResult` from Task 4.
- Produces `notifyActionResult(result: ActionResult, successMessage: string): boolean`, which emits a Sonner toast and returns whether the action succeeded.

- [ ] **Step 1: Write the failing test**

Extend `tests/admin-action-results.test.ts` with the pure message selector exported by the component module:

```ts
import { actionFeedbackMessage } from '../components/admin/action-feedback.ts'

test('selects success and error feedback messages', () => {
  assert.equal(actionFeedbackMessage({ success: true }, 'Grupo salvo.'), 'Grupo salvo.')
  assert.equal(actionFeedbackMessage({ error: 'Sem permissão.' }, 'Grupo salvo.'), 'Sem permissão.')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test --experimental-strip-types tests/admin-action-results.test.ts`

Expected: FAIL because `actionFeedbackMessage` is not exported.

- [ ] **Step 3: Implement consistent UI feedback**

Create `components/admin/action-feedback.ts` as a client-safe module exporting `actionFeedbackMessage` and `notifyActionResult`; `notifyActionResult` calls `toast.success` for `{ success: true }`, `toast.error` for `{ error }`, and returns a boolean. Update each listed form handler to clear inline error before submitting, disable its save button while pending, call `notifyActionResult`, and only navigate/refresh after success. Use these success messages exactly: `Usuário criado.`, `Usuário atualizado.`, `Grupo criado.`, `Grupo atualizado.`, `Grupo excluído.`, `Painel criado.`, `Painel atualizado.`, and `Configurações salvas.` Replace the browser `alert` in `DeleteGroupButton` with `toast.error`.

- [ ] **Step 4: Run focused tests and full checks**

Run: `node --test --experimental-strip-types tests/admin-action-results.test.ts tests/admin-list-query.test.ts tests/security-forms.test.ts && npm run lint && npm run build`

Expected: all tests pass, lint exits 0, and Next.js production build completes.

- [ ] **Step 5: Commit**

```bash
git add components/admin/action-feedback.ts app/'(admin)'/admin/users app/'(admin)'/admin/groups app/'(admin)'/admin/panels app/'(admin)'/admin/settings/page.tsx tests/admin-action-results.test.ts
git commit -m "feat: standardize admin action feedback"
```

### Task 6: Documentar a operação administrativa

**Files:**
- Modify: `README.md`

**Interfaces:**
- Documents the final routes and query parameters delivered by Tasks 2–5.

- [ ] **Step 1: Add the documentation section**

Append `## Administração` to `README.md` with a table containing `/admin/users` (`q`, `role`, `status`), `/admin/groups` (`q`), and `/admin/panels` (`q`, `status`). State that `role` accepts `admin` or `user`, `status` accepts `active` or `inactive`, filters persist in the URL, and logs are not filtered in this release. State that administrative mutations show success/error toasts and disabled buttons during processing.

- [ ] **Step 2: Verify documentation and project checks**

Run: `rg -n "Administração|/admin/users|/admin/groups|/admin/panels" README.md && npm run lint && npm run build`

Expected: all three route names are printed, lint exits 0, and build completes.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: explain admin filters and feedback"
```

## Self-review

- Spec coverage: Tasks 1–4 implement URL-backed search and filters for users, groups, and panels; Task 5 covers success, error, and pending feedback; Task 6 documents operations; logs are explicitly excluded.
- Placeholder scan: no deferred implementation steps remain.
- Type consistency: Task 1 defines list-query parsing used in Tasks 2–4; Task 4 defines `ActionResult` consumed in Task 5.
