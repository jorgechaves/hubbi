## 1. Infraestrutura e Setup

- [x] 1.1 Criar projeto Next.js 15 com TypeScript e Tailwind CSS (`npx create-next-app@latest`)
- [x] 1.2 Instalar dependências: `@supabase/ssr`, `@supabase/supabase-js`, `shadcn/ui`
- [x] 1.3 Configurar variáveis de ambiente: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] 1.4 Inicializar shadcn/ui e adicionar componentes base (Button, Input, Table, Dialog, Toast)
- [x] 1.5 Criar estrutura de pastas: `app/(auth)`, `app/(portal)`, `app/(admin)`, `app/api`, `components/ui`, `lib/supabase`, `lib/db`

## 2. Banco de Dados Supabase

- [x] 2.1 Criar tabela `profiles` (id, email, name, role, active, avatar_url, created_at)
- [x] 2.2 Criar tabela `groups` (id, name, description, welcome_message, created_at)
- [x] 2.3 Criar tabela `panels` (id, name, url, description, icon, active, created_at)
- [x] 2.4 Criar tabela `group_panels` (group_id, panel_id, display_order) com chave primária composta
- [x] 2.5 Criar tabela `user_groups` (user_id, group_id) com chave primária composta
- [x] 2.6 Criar tabela `access_logs` (id, user_id, panel_id, accessed_at)
- [x] 2.7 Criar tabela `portal_settings` (id, name, logo_url, primary_color, updated_at) com constraint de única linha
- [x] 2.8 Criar trigger para inserir registro em `profiles` ao criar usuário no Supabase Auth
- [x] 2.9 Configurar RLS em `profiles`: usuário lê próprio perfil; admin lê e escreve todos
- [x] 2.10 Configurar RLS em `panels` e `group_panels`: usuário vê apenas painéis dos seus grupos; admin acessa tudo
- [x] 2.11 Configurar RLS em `groups` e `user_groups`: usuário lê grupos próprios; admin acessa tudo
- [x] 2.12 Configurar RLS em `access_logs`: usuário sem acesso de leitura; admin lê tudo; service role insere
- [x] 2.13 Configurar RLS em `portal_settings`: todos leem; apenas admin escreve
- [x] 2.14 Inserir registro padrão em `portal_settings` (nome: "BI Hub", cor: "#2563EB")

## 3. Autenticação e Middleware

- [x] 3.1 Criar helpers Supabase: `lib/supabase/client.ts` (browser), `lib/supabase/server.ts` (server components), `lib/supabase/middleware.ts`
- [x] 3.2 Implementar `proxy.ts` na raiz do Next.js para validar sessão e redirecionar rotas protegidas (Next.js 16: proxy.ts)
- [x] 3.3 Adicionar check de role `admin` no middleware para rotas `/(admin)`
- [x] 3.4 Criar página `/login` com formulário de email e senha (validação client-side + erro de credenciais)
- [x] 3.5 Implementar Server Action de login usando `@supabase/ssr`
- [x] 3.6 Implementar Server Action de logout (invalidar sessão + limpar cookies)
- [x] 3.7 Criar página `/forgot-password` com formulário de email
- [x] 3.8 Criar página `/reset-password` para redefinição via token do link de email
- [x] 3.9 Implementar verificação de `profiles.active` no fluxo de login (bloquear usuários inativos)

## 4. Layout do Portal (Usuário)

- [x] 4.1 Criar `app/(portal)/layout.tsx` com sidebar lateral e área de conteúdo principal
- [x] 4.2 Implementar componente `Sidebar` com lista de painéis do usuário (busca via server component)
- [x] 4.3 Adicionar comportamento de collapse da sidebar em mobile (hamburguer menu)
- [x] 4.4 Criar componente de header com nome do portal, logo e botão de logout
- [x] 4.5 Criar página `/dashboard` exibindo mensagem de boas-vindas do grupo do usuário
- [x] 4.6 Criar página `/panel/[id]` com iframe carregando `/api/panel-proxy/[id]`
- [x] 4.7 Adicionar loading state e erro de iframe inacessível na página do painel

## 5. API Route de Proxy de Painéis

- [x] 5.1 Criar `app/api/panel-proxy/[id]/route.ts` com validação de sessão server-side
- [x] 5.2 Implementar verificação de acesso: checar se usuário tem o painel via seus grupos
- [x] 5.3 Inserir registro em `access_logs` antes de responder
- [x] 5.4 Retornar redirect 302 para URL do painel (ou 401/403 conforme caso)

## 6. Branding Global

- [x] 6.1 Criar `lib/db/portal-settings.ts` com query de `portal_settings`
- [x] 6.2 Carregar `portal_settings` no layout raiz (`app/layout.tsx`) via server component
- [x] 6.3 Injetar CSS custom property `--color-primary` no elemento `<html>` via style tag inline
- [x] 6.4 Configurar Tailwind para usar `var(--color-primary)` como cor primária
- [x] 6.5 Exibir logo (img) ou nome (texto) no header conforme `logo_url` disponível
- [x] 6.6 Atualizar `<title>` e `<meta og:title>` com nome do portal via `generateMetadata`

## 7. Painel Admin — Usuários

- [x] 7.1 Criar `app/(admin)/layout.tsx` com navegação admin (sidebar ou topbar com links para seções)
- [x] 7.2 Criar página `/admin/users` com tabela paginada de usuários (nome, email, role, grupos, status)
- [x] 7.3 Criar página `/admin/users/new` com formulário (nome, email, senha temporária, role, grupos)
- [x] 7.4 Implementar Server Action de criação de usuário via Supabase Admin API (`service_role`)
- [x] 7.5 Criar página `/admin/users/[id]/edit` com formulário de edição (nome, role, grupos, status)
- [x] 7.6 Implementar Server Action de desativação de usuário (definir `active = false` + revogar sessões)

## 8. Painel Admin — Grupos

- [x] 8.1 Criar página `/admin/groups` com lista de grupos (nome, contagem de usuários e painéis)
- [x] 8.2 Criar página `/admin/groups/new` com formulário (nome, descrição, mensagem de boas-vindas)
- [x] 8.3 Criar página `/admin/groups/[id]/edit` com formulário de edição e lista de painéis associados
- [x] 8.4 Implementar drag-and-drop para reordenação de painéis no grupo (atualiza `display_order`)
- [x] 8.5 Implementar exclusão de grupo com confirmação quando há usuários associados

## 9. Painel Admin — Painéis

- [x] 9.1 Criar página `/admin/panels` com tabela de painéis (nome, status, grupos associados) e toggle de status rápido
- [x] 9.2 Criar página `/admin/panels/new` com formulário (nome, URL, descrição, ícone, status)
- [x] 9.3 Criar página `/admin/panels/[id]/edit` com formulário de edição e botão "Testar URL" (iframe de prévia)
- [x] 9.4 Implementar associação de painel a grupos na tela de edição do painel

## 10. Painel Admin — Logs e Configurações

- [x] 10.1 Criar página `/admin/logs` com tabela paginada (usuário, painel, data/hora) e filtros por usuário/painel/período
- [x] 10.2 Criar página `/admin/settings` com formulário de branding (nome, logo URL, cor primária com color picker)
- [x] 10.3 Implementar Server Action de atualização de `portal_settings` com validação de cor hex

## 11. Qualidade e Deploy

- [ ] 11.1 Configurar projeto na Vercel conectando ao repositório GitHub
- [ ] 11.2 Configurar variáveis de ambiente na Vercel (Supabase URL, anon key, service role key)
- [ ] 11.3 Verificar proteção de rotas: testar acesso sem sessão, com sessão user para rotas admin
- [ ] 11.4 Testar fluxo completo: login → ver painel → log registrado → logout
- [ ] 11.5 Testar responsividade mobile (sidebar collapse, iframe em tela cheia)
- [ ] 11.6 Criar usuário admin seed inicial via Supabase Dashboard para primeiro acesso
