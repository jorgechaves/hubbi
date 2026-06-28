## Context

Projeto novo do zero. Não há base de código existente. O BI Hub é um portal web corporativo que centraliza o acesso a painéis de BI externos via iframe, com autenticação por email/senha e controle de acesso por grupos. O stack escolhido é Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase + Vercel.

## Goals / Non-Goals

**Goals:**
- Autenticação segura com Supabase (email + senha, sessão server-side via cookies httpOnly)
- Controle de acesso por grupos/perfis com RLS no Supabase
- Exibição de painéis de BI em iframe sem expor URLs ao usuário final
- Painel admin completo acessível apenas para usuários com role `admin`
- Log de todos os acessos a painéis (usuário, painel, timestamp)
- Identidade visual configurável (nome, logo, cor primária) pelo admin
- Responsividade básica com sidebar colapsável em mobile
- Deploy na Vercel com integração contínua via GitHub

**Non-Goals:**
- SSO / provedores externos de identidade (Google, Microsoft, SAML)
- Auto-cadastro de usuários (somente admin cria usuários)
- Suporte a painéis que não sejam iframe (embed de componentes React, etc.)
- Sistema de permissões granulares por painel individual (somente por grupo)
- Notificações ou alertas de BI
- Multi-tenant / multi-organização

## Decisions

### D1: Next.js App Router com Supabase SSR

**Decisão:** Usar `@supabase/ssr` com cookies httpOnly gerenciados em middleware Next.js para sessão server-side.

**Rationale:** O App Router permite proteger rotas no servidor (middleware.ts) antes de renderizar qualquer HTML. A sessão é validada no edge, sem expor o token ao JavaScript do cliente. Alternativa (Supabase client-side apenas) exporia o token no localStorage e não protegeria SSR.

**Implementação:**
```
middleware.ts → valida sessão → redireciona /login se não autenticado
app/(auth)/login → página pública
app/(portal)/... → rotas protegidas (layout com check de sessão)
app/(admin)/... → rotas admin (check adicional de role = 'admin')
```

### D2: URLs de painéis ocultas via API Route

**Decisão:** O iframe carrega `/api/panel-proxy/[id]` que responde com um redirect 302 server-side para a URL real, nunca exposta ao cliente JS.

**Rationale:** Armazenar a URL diretamente no `src` do iframe a expõe nas DevTools. A API route valida a sessão e o acesso do usuário ao painel antes de fazer o redirect, impedindo acesso direto por ID. Alternativa (proxy full de conteúdo) quebraria a maioria dos painéis de BI (cookies, scripts, CORS).

**Fluxo:**
```
Cliente → GET /api/panel-proxy/[id]
Server → valida sessão → verifica acesso (user ∈ grupo que tem painel)
       → registra log de acesso
       → Response.redirect(url_do_painel, 302)
```

### D3: Modelo de dados com RLS no Supabase

**Decisão:** Todas as tabelas têm Row Level Security habilitado. A role `admin` é armazenada em `profiles.role` e usada nas policies.

**Schema:**
```sql
profiles        (id, email, name, role: 'admin'|'user', active, avatar_url, created_at)
groups          (id, name, description, welcome_message, created_at)
panels          (id, name, url, description, icon, active, created_at)
group_panels    (group_id, panel_id, display_order)
user_groups     (user_id, group_id)
access_logs     (id, user_id, panel_id, accessed_at)
portal_settings (id, name, logo_url, primary_color, updated_at)
```

**RLS policies:**
- `profiles`: usuário lê apenas o próprio perfil; admin lê todos
- `panels` / `group_panels`: usuário vê apenas painéis dos seus grupos; admin vê todos
- `access_logs`: usuário não lê; admin lê todos
- `portal_settings`: todos leem; apenas admin escreve

### D4: Identidade visual via CSS variables + portal_settings

**Decisão:** A cor primária e o logo são carregados do banco em um Server Component de layout e injetados como CSS custom properties no `<html>`.

**Rationale:** Evita rebuild/redeploy para mudanças de branding. O nome e logo são lidos no layout raiz e passados via contexto para componentes cliente.

### D5: Estrutura de pastas Next.js

```
app/
  (auth)/
    login/page.tsx
    forgot-password/page.tsx
  (portal)/
    layout.tsx          ← sidebar + validação de sessão
    dashboard/page.tsx  ← página inicial com boas-vindas do grupo
    panel/[id]/page.tsx ← iframe via /api/panel-proxy/[id]
  (admin)/
    layout.tsx          ← check role=admin
    users/...
    groups/...
    panels/...
    logs/page.tsx
    settings/page.tsx
  api/
    panel-proxy/[id]/route.ts
components/
  ui/          ← shadcn/ui
  sidebar/
  admin/
lib/
  supabase/    ← client, server, middleware helpers
  db/          ← queries tipadas
```

### D6: shadcn/ui como biblioteca de componentes

**Decisão:** Usar shadcn/ui sobre Radix UI primitives com Tailwind.

**Rationale:** Componentes acessíveis, sem dependência de runtime externa (código copiado para o repo), compatível com App Router sem configuração extra. Alternativa (Material UI, Chakra) teria mais overhead de bundle e conflitos de estilo.

## Risks / Trade-offs

| Risco | Mitigação |
|---|---|
| Painéis de BI bloqueando iframe (X-Frame-Options) | Documentar que as URLs devem ser embed URLs da ferramenta; testar antes de cadastrar |
| Redirect 302 expõe URL no header `Location` ao browser | Aceitável — URL não aparece na UI; usuário precisa de DevTools ativos para ver. Para proteção total, implementar proxy reverso full (fora do escopo v1) |
| RLS mal configurado expondo dados cross-tenant | Cobrir com testes de integração Supabase por role antes do go-live |
| Logo/imagem armazenada como URL externa (pode sair do ar) | v1 usa URL externa; v2 pode usar Supabase Storage |
| `portal_settings` com uma única linha (single-row table) | Garantir via constraint ou trigger que só existe 1 registro |

## Migration Plan

1. Criar projeto Supabase → executar migrations SQL → configurar RLS policies
2. Criar projeto Vercel → conectar repositório GitHub → configurar variáveis de ambiente
3. Deploy inicial com página de login e usuário admin seed
4. Admin configura branding, cria grupos, cadastra painéis, cria usuários
5. Rollback: sem estado local — reverter deploy no Vercel é instantâneo; dados ficam no Supabase

## Open Questions

- O portal terá um domínio customizado (ex: bi.empresa.com) ou subdomínio Vercel padrão?
- Upload de logo ficará em Supabase Storage (v1) ou URL externa informada pelo admin?
- Precisa de paginação nos logs de acesso desde o início ou pode ser implementado após?
