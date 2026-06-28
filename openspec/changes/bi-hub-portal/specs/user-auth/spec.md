## ADDED Requirements

### Requirement: Login com email e senha
O sistema SHALL autenticar usuários via email e senha usando Supabase Auth. Rotas protegidas MUST redirecionar para `/login` quando não há sessão válida.

#### Scenario: Login bem-sucedido
- **WHEN** usuário submete email e senha válidos no formulário de login
- **THEN** sistema cria sessão via cookie httpOnly e redireciona para `/dashboard`

#### Scenario: Credenciais inválidas
- **WHEN** usuário submete email ou senha incorretos
- **THEN** sistema exibe mensagem de erro "Email ou senha inválidos" sem revelar qual campo está errado

#### Scenario: Usuário inativo tenta login
- **WHEN** usuário com `profiles.active = false` tenta fazer login
- **THEN** sistema exibe mensagem "Conta desativada. Contate o administrador." e não cria sessão

#### Scenario: Acesso a rota protegida sem sessão
- **WHEN** usuário não autenticado acessa qualquer rota em `/(portal)` ou `/(admin)`
- **THEN** middleware redireciona para `/login` preservando a URL de destino como query param

#### Scenario: Usuário já autenticado acessa login
- **WHEN** usuário com sessão válida acessa `/login`
- **THEN** sistema redireciona para `/dashboard`

### Requirement: Logout
O sistema SHALL encerrar a sessão do usuário e limpar cookies ao fazer logout.

#### Scenario: Logout bem-sucedido
- **WHEN** usuário clica em "Sair" na interface
- **THEN** sistema invalida sessão no Supabase, limpa cookies e redireciona para `/login`

### Requirement: Reset de senha
O sistema SHALL permitir que usuários solicitem reset de senha via email.

#### Scenario: Solicitação de reset
- **WHEN** usuário submete email na página "Esqueci minha senha"
- **THEN** sistema envia email de reset via Supabase Auth (sem confirmar se email existe)

#### Scenario: Redefinição de senha via link
- **WHEN** usuário acessa o link de reset e submete nova senha válida (mínimo 8 caracteres)
- **THEN** sistema atualiza senha e redireciona para `/login` com mensagem de sucesso

#### Scenario: Link de reset expirado
- **WHEN** usuário acessa link de reset após expiração (padrão Supabase: 1 hora)
- **THEN** sistema exibe mensagem de erro e oferece link para solicitar novo reset

### Requirement: Proteção de rotas admin
O sistema SHALL verificar a role do usuário antes de renderizar qualquer rota sob `/(admin)`.

#### Scenario: Usuário sem role admin acessa rota admin
- **WHEN** usuário autenticado com `profiles.role = 'user'` acessa `/admin/*`
- **THEN** sistema redireciona para `/dashboard` com mensagem de acesso negado

#### Scenario: Admin acessa área administrativa
- **WHEN** usuário com `profiles.role = 'admin'` acessa `/admin/*`
- **THEN** sistema renderiza a interface administrativa normalmente
