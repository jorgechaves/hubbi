## ADDED Requirements

### Requirement: Sidebar de navegação com painéis do usuário
O sistema SHALL exibir na sidebar lateral apenas os painéis que o usuário tem permissão de acessar, derivados dos grupos aos quais pertence.

#### Scenario: Usuário com painéis disponíveis
- **WHEN** usuário autenticado acessa qualquer rota em `/(portal)`
- **THEN** sidebar exibe lista de painéis ordenados por `group_panels.display_order` com nome e ícone de cada painel

#### Scenario: Usuário sem painéis atribuídos
- **WHEN** usuário não pertence a nenhum grupo ou os grupos não têm painéis ativos
- **THEN** sidebar exibe mensagem "Nenhum painel disponível. Contate o administrador."

#### Scenario: Sidebar colapsável em mobile
- **WHEN** viewport é menor que 768px
- **THEN** sidebar fica oculta por padrão com botão hamburguer para abrir/fechar como overlay

### Requirement: Exibição de painel via iframe
O sistema SHALL carregar o painel de BI selecionado em um iframe que ocupa toda a área de conteúdo principal.

#### Scenario: Usuário seleciona painel na sidebar
- **WHEN** usuário clica em um painel na sidebar
- **THEN** iframe é carregado com src apontando para `/api/panel-proxy/[id]` e o painel selecionado é destacado na sidebar

#### Scenario: Painel inativo
- **WHEN** painel tem `panels.active = false`
- **THEN** painel não aparece na sidebar e não pode ser acessado diretamente via URL

#### Scenario: Usuário tenta acessar painel sem permissão via URL direta
- **WHEN** usuário acessa `/panel/[id]` de um painel ao qual não tem acesso
- **THEN** sistema exibe página de erro 403 "Acesso negado"

### Requirement: API route para proxy de URL do painel
O sistema SHALL servir um redirect server-side para a URL do painel sem expor a URL ao JavaScript do cliente.

#### Scenario: Requisição autenticada com acesso válido
- **WHEN** servidor recebe GET `/api/panel-proxy/[id]` com sessão válida e usuário tem acesso ao painel
- **THEN** servidor registra log de acesso e responde com redirect 302 para a URL cadastrada

#### Scenario: Requisição sem sessão
- **WHEN** servidor recebe GET `/api/panel-proxy/[id]` sem cookie de sessão válido
- **THEN** servidor responde com 401 Unauthorized

#### Scenario: Requisição para painel sem permissão
- **WHEN** servidor recebe GET `/api/panel-proxy/[id]` com sessão válida mas usuário não tem acesso ao painel
- **THEN** servidor responde com 403 Forbidden

### Requirement: Página de boas-vindas por grupo
O sistema SHALL exibir uma mensagem de boas-vindas personalizada ao grupo do usuário na página `/dashboard`.

#### Scenario: Grupo com mensagem de boas-vindas configurada
- **WHEN** usuário acessa `/dashboard`
- **THEN** sistema exibe a `groups.welcome_message` do grupo primário do usuário (primeiro grupo por ordem de criação)

#### Scenario: Grupo sem mensagem de boas-vindas
- **WHEN** grupo não tem `welcome_message` configurada
- **THEN** sistema exibe mensagem padrão "Bem-vindo ao BI Hub, [nome do usuário]."
