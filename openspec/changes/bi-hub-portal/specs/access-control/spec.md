## ADDED Requirements

### Requirement: Modelo de acesso por grupos
O sistema SHALL controlar o acesso a painéis por meio de grupos — painéis são atribuídos a grupos e usuários pertencem a grupos. Um usuário vê a união de todos os painéis dos grupos aos quais pertence.

#### Scenario: Usuário em múltiplos grupos
- **WHEN** usuário pertence aos grupos A e B, onde A tem painéis [P1, P2] e B tem painéis [P2, P3]
- **THEN** usuário vê painéis [P1, P2, P3] sem duplicatas, ordenados por display_order

#### Scenario: Usuário sem grupos
- **WHEN** usuário não está associado a nenhum grupo
- **THEN** usuário não vê nenhum painel disponível

#### Scenario: Remoção de usuário de grupo revoga acesso imediato
- **WHEN** admin remove usuário de um grupo
- **THEN** na próxima requisição do usuário, os painéis desse grupo não são mais exibidos (sem cache de sessão de permissões)

### Requirement: Row Level Security no Supabase
O sistema SHALL usar RLS para garantir que usuários acessem apenas dados autorizados, independente de bugs no código da aplicação.

#### Scenario: Usuário consulta painéis diretamente via API Supabase
- **WHEN** usuário autenticado faz query direta em `panels` ou `group_panels` via Supabase client
- **THEN** RLS retorna apenas os painéis dos grupos do usuário

#### Scenario: Usuário tenta ler dados de outros usuários em profiles
- **WHEN** usuário autenticado faz query em `profiles` sem filtro
- **THEN** RLS retorna apenas o próprio perfil do usuário

#### Scenario: Admin acessa todos os dados
- **WHEN** usuário com `profiles.role = 'admin'` faz query em qualquer tabela
- **THEN** RLS permite leitura e escrita em todos os registros

### Requirement: Roles de usuário
O sistema SHALL suportar duas roles: `admin` e `user`. A role é armazenada em `profiles.role` e usada para controle de acesso na aplicação e nas policies RLS.

#### Scenario: Criação de usuário com role padrão
- **WHEN** admin cria novo usuário sem especificar role
- **THEN** usuário é criado com `profiles.role = 'user'`

#### Scenario: Promoção a admin
- **WHEN** admin altera `profiles.role` de um usuário para `'admin'`
- **THEN** usuário passa a ter acesso à área administrativa e às policies RLS de admin
