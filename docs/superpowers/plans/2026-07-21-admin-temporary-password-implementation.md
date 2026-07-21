# Admin Temporary Password Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que administradores definam uma senha temporária para um usuário existente pela tela de edição.

**Architecture:** A validação da senha temporária fica em uma função pura no módulo de formulários para permitir testes sem Supabase. A Server Action existente valida autorização, atualiza o perfil e, quando há senha temporária, chama `auth.admin.updateUser` exclusivamente no servidor. A tela cliente revela a seção de senha apenas sob demanda e mostra feedback específico conforme o resultado.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Supabase Auth Admin API, Sonner, Node test runner.

## Global Constraints

- Somente um administrador ativo e autenticado pode alterar a senha de outro usuário.
- A senha precisa ter no mínimo oito caracteres e confirmação idêntica.
- A chave de serviço permanece somente no servidor.
- Senhas não aparecem em logs, URLs ou toasts.
- Não enviar e-mail, criar link de recuperação ou alterar RLS.

---

### Task 1: Validar senha temporária opcional

**Files:**
- Modify: `lib/security/forms.ts`
- Modify: `tests/security-forms.test.ts`

**Interfaces:**
- Produces `getOptionalPassword(formData: FormData): string | null`.
- Throws `ActionError` when a supplied password has fewer than eight characters or differs from `password_confirmation`.

- [ ] **Step 1: Write the failing tests**

```ts
import { getOptionalPassword } from '../lib/security/forms.ts'

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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test --experimental-strip-types tests/security-forms.test.ts`

Expected: FAIL because `getOptionalPassword` is not exported.

- [ ] **Step 3: Implement the validator**

```ts
export function getOptionalPassword(formData: FormData): string | null {
  const password = getOptionalString(formData, 'temporary_password', 'Senha temporária', { max: 256 })
  if (password === null) return null
  const confirmation = getRequiredString(formData, 'password_confirmation', 'Confirmação de senha', { max: 256 })
  if (password.length < 8) throw new ActionError('A senha temporária deve ter no mínimo 8 caracteres.')
  if (password !== confirmation) throw new ActionError('As senhas não coincidem.')
  return password
}
```

- [ ] **Step 4: Run the focused tests**

Run: `node --test --experimental-strip-types tests/security-forms.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/security/forms.ts tests/security-forms.test.ts
git commit -m "feat: validate optional temporary passwords"
```

### Task 2: Atualizar senha via Server Action administrativa

**Files:**
- Modify: `app/actions/admin.ts`

**Interfaces:**
- Consumes `getOptionalPassword(formData)` from Task 1.
- Changes `updateUser(userId, formData)` return value to `{ success: true; passwordChanged: boolean } | { error: string }`.

- [ ] **Step 1: Extend input parsing**

Inside `updateUser`, add `temporaryPassword: getOptionalPassword(formData)` to the existing `parseInput` object. Preserve `requireAdmin`, UUID parsing and all profile/group validations.

- [ ] **Step 2: Call the privileged API only when needed**

After the existing profile and group updates succeed, add:

```ts
if (temporaryPassword) {
  const { error: passwordError } = await service.auth.admin.updateUserById(safeUserId, {
    password: temporaryPassword,
  })
  if (passwordError) return { error: passwordError.message }
}

revalidatePath('/admin/users')
return { success: true, passwordChanged: Boolean(temporaryPassword) }
```

Use the same service-role client already created by `getServiceClient`; do not create a browser client or log the password.

- [ ] **Step 3: Run tests and static checks**

Run: `node --test --experimental-strip-types tests/security-forms.test.ts && npm run lint`

Expected: PASS and exit code 0.

- [ ] **Step 4: Commit**

```bash
git add app/actions/admin.ts
git commit -m "feat: allow admins to reset user passwords"
```

### Task 3: Adicionar seção recolhível à edição de usuário

**Files:**
- Modify: `app/(admin)/admin/users/[id]/page.tsx`

**Interfaces:**
- Consumes `updateUser` result with optional `passwordChanged`.
- Produces a form section toggled by local boolean state `showPasswordReset`.

- [ ] **Step 1: Add local state and reset controls**

Import `KeyRound` from `lucide-react`. Create `const [showPasswordReset, setShowPasswordReset] = useState(false)`. Between the groups field and inline error, render a bordered section with a button labelled `Redefinir senha temporária`; it toggles the state. When open, render two `<Input type="password">` controls named `temporary_password` and `password_confirmation`, each with `minLength={8}`, `autoComplete="new-password"`, and `required`.

- [ ] **Step 2: Handle feedback without exposing the password**

In `handleSubmit`, preserve the existing error behavior. On success, use `toast.success(result.passwordChanged ? 'Usuário atualizado. Senha temporária redefinida.' : 'Usuário atualizado.')` before navigating. Do not include form values in errors or toast messages.

- [ ] **Step 3: Verify browser behavior and automated checks**

Run: `node --test --experimental-strip-types tests/security-forms.test.ts && npm run lint && npm run build`

Expected: all tests pass, lint exits 0, and the production build completes. In the browser, open `/admin/users/<id>`, verify the reset controls start hidden, open them, try mismatched values, then save matching values.

- [ ] **Step 4: Commit**

```bash
git add app/'(admin)'/admin/users/'[id]'/page.tsx
git commit -m "feat: add temporary password reset controls"
```

## Self-review

- Spec coverage: Task 1 handles password validation, Task 2 confines the Supabase admin call to the server, and Task 3 implements the approved interface and feedback.
- Scope: no e-mail reset, recovery link, RLS or schema migration is included.
- Type consistency: `temporaryPassword` is `string | null`; `passwordChanged` is always boolean on successful action results.
