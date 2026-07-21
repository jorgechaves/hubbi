# User Account Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar exclusão administrativa protegida e alteração da própria senha em Minha conta.

**Architecture:** Regras sensíveis de validação ficam em funções puras testáveis. A exclusão usa uma Server Action protegida por `requireAdmin` e a API administrativa do Supabase; a alteração de senha usa uma Server Action autenticada que verifica a senha atual antes de chamar `auth.updateUser`. A UI terá um botão de exclusão com confirmação e uma página cliente de senha ligada ao menu lateral do portal.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Auth Admin API, `@supabase/ssr`, Sonner, Node test runner.

## Global Constraints

- Bloquear a exclusão da própria conta.
- Bloquear a exclusão do último administrador ativo.
- Encerrar as sessões do usuário antes de excluí-lo.
- Exigir senha atual, nova senha e confirmação para a troca própria.
- A nova senha deve ter no mínimo oito caracteres.
- Não enviar senhas para logs, URLs ou toasts.
- Não criar migration, tabela ou policy RLS nova.

---

### Task 1: Regras puras de conta e senha

**Files:**
- Modify: `lib/security/forms.ts`
- Create: `lib/security/account.ts`
- Modify: `tests/security-forms.test.ts`
- Create: `tests/account-security.test.ts`

**Interfaces:**
- Produces `getPasswordChangeInput(formData: FormData): { currentPassword: string; newPassword: string }`.
- Produces `assertUserDeletionAllowed(input: { targetId: string; currentUserId: string; targetRole: string; targetActive: boolean; activeAdminCount: number }): void`.

- [ ] **Step 1: Write failing tests**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { getPasswordChangeInput } from '../lib/security/forms.ts'
import { assertUserDeletionAllowed } from '../lib/security/account.ts'

test('requires current password, matching new password, and minimum length', () => {
  const form = new FormData()
  form.set('current_password', 'atual-segura')
  form.set('new_password', 'nova-segura')
  form.set('password_confirmation', 'nova-segura')
  assert.deepEqual(getPasswordChangeInput(form), { currentPassword: 'atual-segura', newPassword: 'nova-segura' })

  const mismatch = new FormData(form)
  mismatch.set('password_confirmation', 'outra')
  assert.throws(() => getPasswordChangeInput(mismatch), /não coincidem/)
})

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
```

- [ ] **Step 2: Run focused tests to verify failure**

Run: `node --test --experimental-strip-types tests/security-forms.test.ts tests/account-security.test.ts`

Expected: FAIL because the new exports do not exist.

- [ ] **Step 3: Implement the smallest validators**

Add to `lib/security/forms.ts`:

```ts
export function getPasswordChangeInput(formData: FormData) {
  const currentPassword = getRequiredString(formData, 'current_password', 'Senha atual', { max: 256 })
  const newPassword = getRequiredString(formData, 'new_password', 'Nova senha', { max: 256 })
  const confirmation = getRequiredString(formData, 'password_confirmation', 'Confirmação de senha', { max: 256 })
  if (newPassword.length < 8) throw new ActionError('A nova senha deve ter no mínimo 8 caracteres.')
  if (newPassword !== confirmation) throw new ActionError('As senhas não coincidem.')
  return { currentPassword, newPassword }
}
```

Create `lib/security/account.ts`:

```ts
import { ActionError } from './forms'

export function assertUserDeletionAllowed(input: {
  targetId: string
  currentUserId: string
  targetRole: string
  targetActive: boolean
  activeAdminCount: number
}) {
  if (input.targetId === input.currentUserId) throw new ActionError('Você não pode excluir a própria conta.')
  if (input.targetRole === 'admin' && input.targetActive && input.activeAdminCount <= 1) {
    throw new ActionError('Não é possível excluir o último administrador ativo.')
  }
}
```

- [ ] **Step 4: Run tests to verify green**

Run: `node --test --experimental-strip-types tests/security-forms.test.ts tests/account-security.test.ts`

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add lib/security/forms.ts lib/security/account.ts tests/security-forms.test.ts tests/account-security.test.ts
git commit -m "feat: add account security validation"
```

### Task 2: Exclusão administrativa protegida

**Files:**
- Modify: `app/actions/admin.ts`
- Create: `app/(admin)/admin/users/delete-user-button.tsx`
- Modify: `app/(admin)/admin/users/page.tsx`

**Interfaces:**
- Produces `deleteUser(userId: string): Promise<{ success: true } | { error: string }>`.
- Produces `DeleteUserButton({ userId, name, email }: { userId: string; name: string; email: string })`.

- [ ] **Step 1: Write the Server Action guard test seam**

Keep the policy logic in `assertUserDeletionAllowed` from Task 1 and add one test case proving an inactive admin can be deleted without consuming the last-active-admin guard:

```ts
test('allows deleting an inactive administrator', () => {
  assert.doesNotThrow(() => assertUserDeletionAllowed({
    targetId: 'u2', currentUserId: 'u1', targetRole: 'admin', targetActive: false, activeAdminCount: 1,
  }))
})
```

- [ ] **Step 2: Run the test before the action change**

Run: `node --test --experimental-strip-types tests/account-security.test.ts`

Expected: PASS; this locks the deletion rule before wiring Supabase.

- [ ] **Step 3: Implement the protected action**

Add `deleteUser` to `app/actions/admin.ts`. It must call `requireAdmin`, parse `userId` with `parseUuid`, reject the current admin with `assertUserDeletionAllowed`, load the target profile with `service.from('profiles').select('id, role, active').eq('id', safeUserId).single()`, count active admins with `.select('id', { count: 'exact', head: true }).eq('role', 'admin').eq('active', true)`, call `service.auth.admin.signOut(safeUserId, 'global')`, then call `service.auth.admin.deleteUser(safeUserId)`. Return clear errors through `actionErrorMessage`, revalidate `/admin/users`, and never expose the service key.

- [ ] **Step 4: Add confirmation UI and list action**

Create a client `DeleteUserButton` using `confirm` with `Excluir ${name} (${email})?`, `useTransition`, `deleteUser`, `toast.error`, `toast.success('Usuário excluído.')`, and `router.refresh()`. Disable the button while pending and use a trash icon with an accessible label. Add it to the final cell of each user row. Keep the edit link intact.

- [ ] **Step 5: Run checks**

Run: `node --test --experimental-strip-types tests/security-forms.test.ts tests/account-security.test.ts && npm run lint`

Expected: all tests and lint pass.

- [ ] **Step 6: Commit**

```bash
git add app/actions/admin.ts app/'(admin)'/admin/users/page.tsx app/'(admin)'/admin/users/delete-user-button.tsx tests/account-security.test.ts
git commit -m "feat: add protected admin user deletion"
```

### Task 3: Alteração de senha em Minha conta

**Files:**
- Modify: `app/actions/auth.ts`
- Create: `app/(portal)/account/page.tsx`
- Modify: `components/sidebar/sidebar.tsx`

**Interfaces:**
- Produces `changeOwnPassword(formData: FormData): Promise<{ success: true } | { error: string }>`.
- Adds navigation item `/account` labelled `Minha conta`.

- [ ] **Step 1: Write the action validation tests**

Add to `tests/account-security.test.ts` the valid and invalid `getPasswordChangeInput` cases from Task 1, keeping password data out of assertion messages.

- [ ] **Step 2: Run the tests to verify the contract**

Run: `node --test --experimental-strip-types tests/account-security.test.ts`

Expected: PASS before wiring the Supabase action.

- [ ] **Step 3: Implement the authenticated action**

In `app/actions/auth.ts`, add `changeOwnPassword`. Create the server Supabase client, call `auth.getUser()`, parse `getPasswordChangeInput`, reject missing session, then verify the current password with `supabase.auth.signInWithPassword({ email: user.email!, password: currentPassword })`. On verification failure return `Senha atual incorreta.` without forwarding the Supabase error. Call `supabase.auth.updateUser({ password: newPassword })`; on failure return `Não foi possível alterar a senha.`; on success return `{ success: true }`. Never log any password.

- [ ] **Step 4: Add the account page**

Create `app/(portal)/account/page.tsx` as a client page with a form containing `current_password`, `new_password`, and `password_confirmation`, all `type="password"`, `autoComplete="current-password"`/`new-password`, and a minimum length of eight for new password fields. Use `useTransition`, show inline errors, toast success `Senha alterada com sucesso.` and clear the form after success. Disable the submit button while pending.

- [ ] **Step 5: Add the portal navigation item**

In `components/sidebar/sidebar.tsx`, import `UserCircle` and render a `NavItem` for `/account` labelled `Minha conta` near the bottom of the navigation, with active state based on `pathname === '/account'`, preserving collapsed/mobile behavior.

- [ ] **Step 6: Run full verification**

Run: `node --test --experimental-strip-types tests/security-forms.test.ts tests/admin-list-query.test.ts tests/account-security.test.ts && npm run lint && npm run build && git diff --check`

Expected: all tests pass, lint exits 0, and the production build completes.

- [ ] **Step 7: Commit**

```bash
git add app/actions/auth.ts app/'(portal)'/account/page.tsx components/sidebar/sidebar.tsx tests/account-security.test.ts
git commit -m "feat: add self-service password changes"
```

## Self-review

- Spec coverage: Task 1 covers pure validation and deletion guards, Task 2 covers admin deletion/session cleanup/UI, and Task 3 covers authenticated password changes/menu access/UI.
- Security coverage: `requireAdmin`, service-role calls only on the server, self-deletion/last-admin guards, current-password verification, and no password logging are explicit.
- Scope: no schema migration, e-mail flow, or RLS change is included.
- Type consistency: `deleteUser` and `changeOwnPassword` both return explicit success/error unions; their UI consumers handle both branches.
