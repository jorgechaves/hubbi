## ADDED Requirements

### Requirement: CRUD de usuários
O sistema SHALL permitir que admins criem, editem, desativem e listem usuários.

#### Scenario: Criação de usuário
- **WHEN** admin preenche nome, email, senha temporária e role em `/admin/users/new` e submete
- **THEN** sistema cria usuário no Supabase Auth e registro em `profiles`, exibindo confirmação de sucesso

#### Scenario: Edição de usuário
- **WHEN** admin edita nome, role ou grupos de um usuário existente
- **THEN** sistema atualiza `profiles` e `user_groups` refletindo as mudanças imediatamente

#### Scenario: Desativação de usuário
- **WHEN** admin marca usuário como inativo
- **THEN** sistema define `profiles.active = false` e encerra sessões ativas do usuário via Supabase Admin API

#### Scenario: Listagem de usuários com filtro
- **WHEN** admin acessa `/admin/users`
- **THEN** sistema exibe tabela paginada com nome, email, role, grupos e status (ativo/inativo) de todos os usuários

### Requirement: CRUD de grupos/perfis
O sistema SHALL permitir que admins criem, editem, excluam e listem grupos.

#### Scenario: Criação de grupo
- **WHEN** admin preenche nome, descrição e mensagem de boas-vindas e submete
- **THEN** sistema cria registro em `groups` e exibe confirmação

#### Scenario: Exclusão de grupo com usuários associados
- **WHEN** admin tenta excluir grupo que possui usuários em `user_groups`
- **THEN** sistema exibe confirmação solicitando remoção das associações antes de prosseguir

#### Scenario: Listagem de grupos
- **WHEN** admin acessa `/admin/groups`
- **THEN** sistema exibe lista de grupos com contagem de usuários e painéis associados

### Requirement: CRUD de painéis
O sistema SHALL permitir que admins criem, editem, excluam e listem painéis de BI.

#### Scenario: Criação de painel
- **WHEN** admin preenche nome, URL, descrição, ícone e status em `/admin/panels/new` e submete
- **THEN** sistema cria registro em `panels` sem exibir a URL para usuários não-admin

#### Scenario: Edição de painel com prévia
- **WHEN** admin edita um painel e clica em "Testar URL"
- **THEN** sistema exibe um iframe de prévia com a URL para validação pelo admin

#### Scenario: Ativação/desativação de painel
- **WHEN** admin altera `panels.active`
- **THEN** painel some imediatamente da sidebar dos usuários (ou aparece) sem necessidade de logout

#### Scenario: Listagem de painéis
- **WHEN** admin acessa `/admin/panels`
- **THEN** sistema exibe tabela com nome, descrição, status e grupos associados de todos os painéis

### Requirement: Associação painéis → grupos e usuários → grupos
O sistema SHALL permitir que admins associem painéis a grupos e usuários a grupos com controle de ordenação.

#### Scenario: Associar painel a grupo com ordenação
- **WHEN** admin adiciona painel a um grupo e define `display_order`
- **THEN** sistema insere registro em `group_panels` e painel aparece na posição correta na sidebar dos usuários do grupo

#### Scenario: Reordenar painéis de um grupo
- **WHEN** admin arrasta painéis na lista de um grupo para reordenar
- **THEN** sistema atualiza `group_panels.display_order` e sidebar reflete nova ordem

#### Scenario: Associar usuário a grupo
- **WHEN** admin seleciona grupos para um usuário na tela de edição
- **THEN** sistema atualiza `user_groups` e usuário passa a ver os painéis dos novos grupos

### Requirement: Status ativo/inativo por painel
O sistema SHALL suportar ativação e desativação individual de painéis sem exclusão.

#### Scenario: Painel inativo não aparece para usuários
- **WHEN** `panels.active = false`
- **THEN** painel não é retornado nas queries de painéis do usuário e não pode ser acessado via API proxy

#### Scenario: Toggle rápido de status na listagem
- **WHEN** admin usa o toggle de status na tabela de painéis
- **THEN** sistema atualiza `panels.active` sem navegar para a página de edição

### Requirement: Painel de boas-vindas customizável por grupo
O sistema SHALL permitir que o admin configure uma mensagem de boas-vindas para cada grupo.

#### Scenario: Admin configura mensagem de boas-vindas
- **WHEN** admin edita um grupo e preenche o campo `welcome_message` com texto (suporta markdown básico)
- **THEN** sistema salva a mensagem e ela é exibida no dashboard dos usuários do grupo
