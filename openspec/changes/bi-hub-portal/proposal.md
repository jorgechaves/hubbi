## Why

Equipes de BI precisam de um ponto centralizado para acessar painéis de diferentes ferramentas, com controle de acesso por perfil e sem expor as URLs originais aos usuários. Hoje esse acesso é feito por links avulsos sem segurança ou rastreabilidade.

## What Changes

- Criação do projeto do zero: Next.js 15 + TypeScript + Tailwind CSS hospedado na Vercel
- Autenticação via Supabase (email + senha) com proteção de rotas server-side
- Portal com sidebar lateral e iframe para visualização de painéis de BI
- URLs dos painéis armazenadas no banco e nunca expostas ao frontend
- Painel admin completo para gestão de usuários, grupos, painéis e configurações
- Controle de acesso por grupos/perfis (painéis atribuídos a grupos, usuários atribuídos a grupos)
- Log de acesso registrando quem acessou qual painel e quando
- Identidade visual configurável (nome do portal, logo, cor primária)
- Responsividade básica com sidebar colapsável em mobile

## Capabilities

### New Capabilities

- `user-auth`: Autenticação via Supabase com email/senha, proteção de rotas, sessão server-side e fluxo de reset de senha
- `panel-viewer`: Sidebar lateral com lista de painéis do usuário e iframe para exibição, com URLs ocultas via API route server-side
- `access-control`: Modelo de acesso por grupos/perfis — painéis atribuídos a grupos, usuários atribuídos a grupos, resolvendo painéis disponíveis por interseção
- `admin-panel`: Interface administrativa com CRUD de usuários, grupos e painéis; associações; ordenação de painéis; status ativo/inativo; e painel de boas-vindas por grupo
- `access-logs`: Registro de acesso de usuários a painéis com timestamp, consultável pelo admin
- `portal-branding`: Configuração de identidade visual (nome, logo, cor primária) pelo admin, aplicada globalmente no portal

### Modified Capabilities

## Impact

- **Novo projeto**: nenhuma base de código existente — criação completa do zero
- **Supabase**: novo projeto com tabelas `profiles`, `groups`, `panels`, `group_panels`, `user_groups`, `access_logs`, `portal_settings`; Row Level Security (RLS) habilitado
- **Vercel**: deploy contínuo via GitHub, variáveis de ambiente para Supabase URL e anon/service keys
- **Dependências principais**: `@supabase/ssr`, `@supabase/supabase-js`, `next`, `tailwindcss`, `shadcn/ui`
