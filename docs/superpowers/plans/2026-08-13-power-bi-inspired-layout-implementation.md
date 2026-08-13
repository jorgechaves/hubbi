# Power BI Inspired Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar uma linguagem visual inspirada no Power BI ao shell, portal, autenticação e administração do BI Hub sem alterar dados, permissões ou fluxos existentes.

**Architecture:** Centralizar tokens visuais em `app/globals.css`, compartilhar header e rail entre `PortalShell` e `AdminShell`, e manter cada página responsável apenas por seus dados e ações. O dashboard continuará Server Component; somente shell, formulários e controles que já possuem estado permanecerão Client Components.

**Tech Stack:** Next.js 16.2.9 App Router, React 19, TypeScript, Tailwind CSS 4, `lucide-react`, componentes locais base-ui/shadcn e Supabase SSR já existente.

## Global Constraints

- Preservar rotas, permissões, consultas Supabase, Server Actions, proxy de painéis e parâmetros de autenticação.
- Não adicionar dependências de UI, ícones ou estado global.
- O tema claro será o padrão; o toggle de tema escuro continuará disponível.
- `portal_settings.primary_color` continuará sendo aplicado por `--color-primary`.
- Não exibir favoritos, histórico de abertura ou busca global sem dados/ação reais.
- Componentes com estado, eventos ou APIs do browser devem permanecer em arquivos com `'use client'`; páginas de dados devem continuar Server Components quando possível.
- Usar a documentação local de Next.js 16 em `node_modules/next/dist/docs/` para qualquer ajuste de App Router.

---

## File map

- `lib/ui/navigation.ts`: contrato puro dos itens de navegação do portal e do admin.
- `tests/navigation.test.ts`: testes Node do contrato de rotas e estados ativos.
- `components/sidebar/header.tsx`: header compartilhado com branding, breadcrumb/contexto, tema, conta e logout.
- `components/sidebar/app-rail.tsx`: rail/drawer genérico usado pelos shells.
- `components/sidebar/sidebar.tsx`: adaptador de compatibilidade que fornece os itens dos painéis ao rail.
- `components/sidebar/portal-shell.tsx`: composição do shell do usuário.
- `components/sidebar/admin-shell.tsx`: composição do shell administrativo.
- `components/admin/page-header.tsx`: cabeçalhos de páginas administrativas e formulários.
- `app/globals.css`: tokens de cor, superfícies, bordas, foco e base do layout.
- `components/theme-provider.tsx`, `components/theme-toggle.tsx`, `components/ui/button.tsx`, `components/ui/input.tsx`: primitives visuais compartilhados.
- `app/(portal)/dashboard/page.tsx`, `app/(portal)/panel/[id]/page.tsx`, `app/(portal)/panel/[id]/panel-iframe.tsx`, `app/(portal)/account/page.tsx`: telas do portal.
- `app/(auth)/layout.tsx`, `components/auth/auth-shell.tsx`, páginas em `app/(auth)/`: autenticação com o mesmo sistema visual.
- Páginas em `app/(admin)/admin/`: listas, detalhes, formulários, logs e configurações com o mesmo shell e superfícies.

### Task 1: Contrato de navegação e shell compartilhado

**Files:**
- Create: `lib/ui/navigation.ts`
- Test: `tests/navigation.test.ts`
- Create: `components/sidebar/app-rail.tsx`
- Modify: `components/sidebar/header.tsx`
- Modify: `components/sidebar/sidebar.tsx`
- Modify: `components/sidebar/portal-shell.tsx`
- Modify: `components/sidebar/admin-shell.tsx`
- Modify: `app/(portal)/layout.tsx`
- Modify: `app/(admin)/layout.tsx`

**Interfaces:**
- `NavigationEntry = { href: string; label: string; icon: NavigationIcon }`.
- `getPortalNavigation(panels: Array<{ id: string; name: string }>): NavigationEntry[]` retorna Home, os painéis acessíveis e Minha conta.
- `getAdminNavigation(): NavigationEntry[]` retorna Usuários, Grupos, Painéis, Logs de acesso e Configurações.
- `isNavigationEntryActive(pathname: string, href: string): boolean` considera subrotas de edição ativas e não marca `/dashboard` como ativo em qualquer outra rota.

- [ ] **Step 1: Write the failing navigation tests**

```ts
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
```

- [ ] **Step 2: Run the tests and verify the expected failure**

Run: `node --test tests/navigation.test.ts`

Expected: FAIL because `lib/ui/navigation.ts` does not exist yet.

- [ ] **Step 3: Implement the navigation contract**

```ts
export type NavigationIcon = 'home' | 'panel' | 'account' | 'users' | 'groups' | 'logs' | 'settings'

export type NavigationEntry = {
  href: string
  label: string
  icon: NavigationIcon
}

export function getPortalNavigation(panels: Array<{ id: string; name: string }>): NavigationEntry[] {
  return [
    { href: '/dashboard', label: 'Home', icon: 'home' },
    ...panels.map(panel => ({ href: `/panel/${panel.id}`, label: panel.name, icon: 'panel' as const })),
    { href: '/account', label: 'Minha conta', icon: 'account' },
  ]
}

export function getAdminNavigation(): NavigationEntry[] {
  return [
    { href: '/admin/users', label: 'Usuários', icon: 'users' },
    { href: '/admin/groups', label: 'Grupos', icon: 'groups' },
    { href: '/admin/panels', label: 'Painéis', icon: 'panel' },
    { href: '/admin/logs', label: 'Logs de acesso', icon: 'logs' },
    { href: '/admin/settings', label: 'Configurações', icon: 'settings' },
  ]
}

export function isNavigationEntryActive(pathname: string, href: string): boolean {
  return href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
}
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `node --test tests/navigation.test.ts`

Expected: PASS for both navigation tests.

- [ ] **Step 5: Build the shared rail and header around the tested contract**

Implement `AppRail` with these exact behaviors:

```tsx
type AppRailProps = {
  portalName: string
  entries: NavigationEntry[]
  sectionLabel: string
  open: boolean
  collapsed: boolean
  onClose: () => void
  onToggleCollapse: () => void
}
```

Render a desktop rail with `md:w-[76px]` when collapsed and `md:w-60` when expanded, a mobile overlay/drawer, an active item with both background and left accent, tooltips through `title` in collapsed mode, and a bottom account/theme area. Map icon names to existing `lucide-react` icons; do not pass arbitrary components through the database.

Update `Header` to accept `portalName`, `logoUrl`, `isAdmin`, `contextLabel`, and `onMenuToggle`. Keep the existing logout Server Action, theme toggle, admin link, and account link. Use a 56px header, a compact app-launcher mark, a visible brand link to `/dashboard`, and a context label instead of a non-functional global search field.

Update `PortalShell` to build entries with `getPortalNavigation`, and `AdminShell` to build entries with `getAdminNavigation`. Both shells must render `Header` above `AppRail` and place children in a flexing, independently scrollable main region. Pass `logo_url` from both route layouts so the header uses the configured branding.

- [ ] **Step 6: Run lint and commit the shared shell**

Run: `npm run lint`

Expected: no ESLint errors.

Commit: `git add lib/ui/navigation.ts tests/navigation.test.ts components/sidebar app/'(portal)'/layout.tsx app/'(admin)'/layout.tsx && git commit -m "feat: add shared power bi inspired shell"`

### Task 2: Visual tokens and reusable page primitives

**Files:**
- Modify: `app/globals.css`
- Modify: `components/theme-provider.tsx`
- Modify: `components/theme-toggle.tsx`
- Modify: `components/ui/button.tsx`
- Modify: `components/ui/input.tsx`
- Create: `components/admin/page-header.tsx`
- Modify: `components/admin/list-filters.tsx`

**Interfaces:**
- `AdminPageHeaderProps = { eyebrow?: string; title: string; description?: string; icon?: LucideIcon; action?: React.ReactNode; backHref?: string }`.
- `AdminPageHeader` renders the consistent page title row and either an action or a back link.

- [ ] **Step 1: Add the visual tokens and primitives**

Change the light palette to a Power BI-like neutral surface: `--background: #f6f7f8`, `--card: #ffffff`, `--foreground: #252525`, `--muted: #f0f2f2`, `--muted-foreground: #667070`, and a restrained teal default primary while preserving the `--color-primary` override. Keep the existing dark palette but align its spacing/radius behavior with the new surfaces.

Set `ThemeProvider` to `defaultTheme="light"`. Restyle the theme toggle as a compact icon control with a visible focus ring. Update Button/Input defaults to use 8px/9px heights, 6px radii, restrained borders, and consistent focus rings. Add a `surface` pattern only if a repeated class is needed; otherwise prefer existing Tailwind utilities.

Implement `AdminPageHeader` with the following shape:

```tsx
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function AdminPageHeader({ eyebrow = 'Administração', title, description, icon: Icon, action, backHref }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        {backHref ? (
          <Link href={backHref} aria-label="Voltar" className="mt-0.5 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
        {Icon ? <Icon className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden="true" /> : null}
        <div>
          <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
```

Replace the ad-hoc filter wrapper with a responsive toolbar: labels remain visible, inputs use the shared `Input`, filter selects have the same border/focus treatment, and “Limpar filtros” remains a real link.

- [ ] **Step 2: Verify the primitives**

Run: `npm run lint`

Expected: no errors. Confirm no `useRef()`/async API or App Router deprecation warnings are introduced.

### Task 3: Restyle portal dashboard, panel viewer, and account

**Files:**
- Modify: `app/(portal)/dashboard/page.tsx`
- Modify: `app/(portal)/panel/[id]/page.tsx`
- Modify: `app/(portal)/panel/[id]/panel-iframe.tsx`
- Modify: `app/(portal)/account/page.tsx`

**Interfaces:**
- Keep `DashboardPage()` async and continue calling `getUserGroupWelcome(user!.id)` and `getUserPanels()`.
- Keep `PanelPage({ params: Promise<{ id: string }> })` and `/api/panel-proxy/${panelId}` unchanged.
- Keep `AccountPage` form fields and `changeOwnPassword` call unchanged.

- [ ] **Step 1: Replace dashboard presentation without changing its data contract**

Use a responsive page frame such as:

```tsx
<div className="min-h-full bg-background p-4 sm:p-6 lg:p-8">
  <div className="mx-auto max-w-[1440px] space-y-8">
    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">Dashboard</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Olá, {firstName}.</h1>
        <p className="mt-2 text-sm text-muted-foreground">{panels.length} painéis disponíveis para você.</p>
      </div>
      <a href="#available-panels" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/85">Explorar painéis</a>
    </section>
    {welcomeMessage ? <section className="rounded-lg border border-border bg-card px-5 py-4 text-sm leading-6 text-foreground shadow-sm">{welcomeMessage}</section> : null}
    <section id="available-panels" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono-brand uppercase tracking-[0.18em] text-muted-foreground">Catálogo</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">Seus painéis</h2>
        </div>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{panels.length} disponíveis</span>
      </div>
    </section>
  </div>
</div>
```

Render each accessible panel as a clickable card with an accent thumbnail, configured emoji/icon or `BarChart2` fallback, name, description and “Abrir painel”. Use a horizontally scrollable row on small screens and an adaptive four-column layout on wide screens. Render a second compact table/list from the same `panels` array with columns “Nome”, “Descrição” and “Ação”; do not add fake opened-at, favorite or location values. Keep the existing count and empty state semantics.

- [ ] **Step 2: Restyle panel viewer and iframe states**

Use a 56px toolbar with back/home link, `panel.name`, and a bordered content region that fills the remaining height. Keep the iframe `src`, title, sandbox and callbacks unchanged. Apply the new card/background tokens to loading and error states and ensure the iframe region can scroll independently when the embedded report needs it.

- [ ] **Step 3: Restyle account form**

Use `AdminPageHeader`-like hierarchy with eyebrow `Conta`, a descriptive subtitle, and a responsive card form. Keep all three password fields, error message, pending text, toast, reset behavior and `changeOwnPassword` action intact.

- [ ] **Step 4: Run lint**

Run: `npm run lint`

Expected: no errors.

### Task 4: Apply the visual system to authentication

**Files:**
- Create: `app/(auth)/layout.tsx`
- Create: `components/auth/auth-shell.tsx`
- Modify: `app/(auth)/login/page.tsx`
- Modify: `app/(auth)/forgot-password/page.tsx`
- Modify: `app/(auth)/reset-password/page.tsx`
- Modify: `app/(auth)/reset-password/reset-password-client.tsx`

**Interfaces:**
- `AuthShell({ portalName, logoUrl, children })` only changes presentation; it does not own auth state.
- `LoginForm`, `forgotPassword`, `ResetPasswordClient`, and `resetPassword` retain their existing props, fields, Server Actions and query-string behavior.

- [ ] **Step 1: Create the shared auth shell**

Make `app/(auth)/layout.tsx` load `getPortalSettings()` on the server and pass `name`/`logo_url` to `AuthShell`. Render a split layout on `lg` screens: a brand/description panel with subtle grid, and a white/neutral form surface. On smaller screens, render only the centered form surface with the portal mark.

- [ ] **Step 2: Move auth pages onto the shell**

Remove duplicated full-screen background/card wrappers from the four auth flows. Keep the login split-panel copy and all form fields, but use the configured portal name instead of the hard-coded `HUBBI` label when available. Make success/error states use shared success/destructive surfaces and ensure all links remain keyboard reachable.

- [ ] **Step 3: Verify auth behavior and lint**

Run: `npm run lint`

Expected: no errors. Use `curl -I http://localhost:3000/login`, `/forgot-password`, and `/reset-password` while unauthenticated and confirm the pages respond without changing redirect behavior.

### Task 5: Apply the visual system to every admin screen

**Files:**
- Modify: `app/(admin)/admin/users/page.tsx`
- Modify: `app/(admin)/admin/users/new/page.tsx`
- Modify: `app/(admin)/admin/users/[id]/page.tsx`
- Modify: `app/(admin)/admin/groups/page.tsx`
- Modify: `app/(admin)/admin/groups/new/page.tsx`
- Modify: `app/(admin)/admin/groups/[id]/page.tsx`
- Modify: `app/(admin)/admin/panels/page.tsx`
- Modify: `app/(admin)/admin/panels/new/page.tsx`
- Modify: `app/(admin)/admin/panels/[id]/page.tsx`
- Modify: `app/(admin)/admin/logs/page.tsx`
- Modify: `app/(admin)/admin/settings/page.tsx`

**Interfaces:**
- Keep all Supabase queries, `searchParams` promises, form field names, event handlers, Server Actions and toast/error messages.
- Replace only layout/classes and repeated headings with `AdminPageHeader`.

- [ ] **Step 1: Update list screens**

Use `AdminPageHeader` with real create links, the filter toolbar below it, and a white bordered table surface. Preserve the native table behavior in users/groups/panels, and migrate logs from the generic table to the same visual pattern. Headers use uppercase mono metadata, rows use subtle borders and hover, status remains a colored dot plus text, and empty states remain centered.

- [ ] **Step 2: Update create/edit forms**

Apply the same page frame and `AdminPageHeader` with a real back link to all user/group/panel create/edit screens. Use `max-w-3xl` for single forms and keep the panel edit two-column layout on wide screens. Restyle checkboxes, select panels, preview iframe, error surfaces and action rows while retaining all field names and actions.

- [ ] **Step 3: Update settings**

Use the page header and form card for portal name, logo URL and primary color. Keep loading state, default fallback, color input and `updatePortalSettings` untouched.

- [ ] **Step 4: Run existing tests and lint**

Run: `node --test tests/*.test.ts`

Expected: all existing security/list/account tests pass.

Run: `npm run lint`

Expected: no ESLint errors.

### Task 6: End-to-end verification and handoff

**Files:**
- No new source files; inspect all modified files and generated `.next` output only.

- [ ] **Step 1: Run the production build**

Run: `npm run build`

Expected: Next.js completes the production build without TypeScript, route, or lint failures.

- [ ] **Step 2: Verify the local server**

Start or reuse `npm run dev`, then check:

```bash
curl -I http://localhost:3000/login
curl -I http://localhost:3000/forgot-password
curl -I http://localhost:3000/reset-password
```

Expected: public auth pages respond successfully; protected routes continue redirecting to `/login` when unauthenticated.

- [ ] **Step 3: Perform visual checks**

With a valid session, inspect desktop and mobile widths for `/dashboard`, `/panel/{id}`, `/account`, `/admin/users`, `/admin/groups`, `/admin/panels`, `/admin/logs` and `/admin/settings`. Confirm the shared header/rail, active navigation, compact drawer, cards, tables, form surfaces, focus states and light/dark themes. Confirm no horizontal overflow except intentional table/card scrolling.

- [ ] **Step 4: Review the diff and commit the implementation**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors and only files belonging to this feature are staged. Commit with `git commit -m "feat: refresh app layout with power bi inspired visuals"` after reviewing the final diff.
