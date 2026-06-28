## ADDED Requirements

### Requirement: Registro automático de acesso a painéis
O sistema SHALL registrar um log toda vez que um usuário acessa um painel, capturando usuário, painel e timestamp.

#### Scenario: Acesso a painel registrado
- **WHEN** API route `/api/panel-proxy/[id]` processa requisição autenticada com acesso válido
- **THEN** sistema insere registro em `access_logs` com `user_id`, `panel_id` e `accessed_at = now()` antes de fazer o redirect

#### Scenario: Tentativa de acesso sem permissão não é registrada
- **WHEN** usuário tenta acessar painel ao qual não tem permissão
- **THEN** sistema retorna 403 sem inserir registro em `access_logs`

### Requirement: Visualização de logs pelo admin
O sistema SHALL exibir os logs de acesso para o admin em `/admin/logs` com filtros e paginação.

#### Scenario: Listagem de logs com filtros
- **WHEN** admin acessa `/admin/logs` com filtros opcionais por usuário, painel ou período
- **THEN** sistema exibe tabela paginada (50 registros por página) com colunas: usuário, painel, data/hora, ordenada por `accessed_at DESC`

#### Scenario: Usuários não têm acesso aos logs
- **WHEN** usuário com role `user` tenta acessar `/admin/logs` ou consulta `access_logs` via Supabase client
- **THEN** sistema retorna 403 / RLS bloqueia a query retornando 0 registros
