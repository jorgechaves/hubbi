# Layout inspirado no Power BI — Design

## Contexto

O BI Hub já possui autenticação, controle de acesso por grupos, branding configurável, navegação de portal, visualização de painéis e área administrativa. As telas usam componentes e estilos consistentes entre si, mas ainda apresentam uma linguagem mais próxima de um dashboard técnico do que de um hub de aplicações de BI.

A referência fornecida é a página inicial do Power BI: header horizontal, navegação lateral compacta, superfícies claras, cards de conteúdo, barra de ferramentas e listas com filtros. O objetivo é adotar essa linguagem visual sem copiar a marca, sem criar funcionalidades que não existem e sem alterar o modelo de dados.

## Objetivos

- Aplicar uma linguagem visual inspirada no Power BI a todas as telas do produto.
- Criar uma base visual compartilhada para portal, administração e autenticação.
- Tornar o dashboard mais próximo de um catálogo de painéis, com destaque visual para os painéis acessíveis.
- Preservar rotas, permissões, consultas Supabase e ações existentes.
- Manter responsividade, navegação por teclado e suporte ao tema escuro.

## Fora de escopo

- Reproduzir literalmente a marca ou os ícones proprietários do Power BI.
- Criar favoritos, histórico de abertura, busca global persistente ou ordenação que não tenham suporte no modelo atual.
- Alterar regras de autenticação, autorização, RLS, URLs dos painéis ou estrutura do Supabase.
- Adicionar dependências de UI ou bibliotecas de ícones.

## Abordagens consideradas

### 1. Sistema visual compartilhado — escolhida

Criar um shell comum para header, navegação e superfícies, mantendo as páginas responsáveis por seus próprios dados. Os shells de portal e administração compartilharão primitives visuais e navegação contextual.

**Vantagens:** consistência entre as telas, menor duplicação e espaço para evolução futura.

**Custo:** exige ajustar os shells existentes e revisar os estilos das páginas administrativas e de autenticação.

### 2. Ajuste independente por tela

Modificar cada página isoladamente, mantendo os shells atuais.

**Vantagem:** menor mudança estrutural imediata.

**Custo:** maior risco de divergência visual e repetição de classes, especialmente entre portal e admin.

### 3. Clone literal da referência

Recriar navegação, filtros e estados do Power BI com maior fidelidade visual.

**Vantagem:** proximidade visual máxima.

**Custo:** introduz controles sem dados reais, aumenta o escopo e pode confundir o usuário sobre capacidades que o BI Hub não oferece.

## Design aprovado

### Linguagem visual

- Tema claro será o padrão, mantendo o toggle de tema escuro já existente.
- Fundo geral neutro e claro, cards brancos, bordas discretas e sombras pequenas.
- Cor primária continuará vindo de `portal_settings.primary_color` via `--color-primary`.
- Tipografia seguirá usando `DM Sans` para conteúdo e `Space Mono` apenas para labels técnicos, status e pequenos metadados.
- Raios, espaçamentos, estados de hover e foco serão padronizados nos componentes existentes e em `app/globals.css`.

### Shell global

O shell será dividido em três responsabilidades:

1. **Header:** marca do portal, link/breadcrumb para Home, controles de tema, acesso administrativo quando aplicável, conta e logout. Buscas permanecerão contextuais nas páginas que já possuem filtros.
2. **Rail/sidebar:** navegação principal com Home, painéis acessíveis, Minha conta e, para administradores, links contextuais de Usuários, Grupos, Painéis, Logs e Configurações.
3. **Área de conteúdo:** região rolável com largura, padding e superfícies coerentes.

No desktop, a navegação terá estado compacto com ícones e tooltips; no mobile, continuará funcionando como drawer. O estado de colapso permanecerá salvo no `localStorage`, respeitando o comportamento atual.

### Dashboard

O dashboard permanecerá um Server Component e continuará usando `getUserPanels()` e `getUserGroupWelcome()`.

- Cabeçalho de página com nome do portal, saudação e ação primária para explorar os painéis disponíveis; a criação de painéis continuará restrita às ações administrativas existentes.
- Mensagem de boas-vindas continuará acima dos conteúdos.
- Cards horizontais destacados representarão os painéis disponíveis ao usuário, usando ícone configurado ou fallback de gráfico.
- Abaixo dos cards, uma seção de lista exibirá os mesmos painéis em formato compacto e responsivo, sem afirmar dados de histórico ou abertura recente que não estejam persistidos.
- Cada card e item da lista continuará navegando para `/panel/{id}`.
- Estado vazio terá tratamento visual equivalente ao restante do sistema.

### Visualização de painéis

- Toolbar superior compacta com breadcrumb, nome do painel e ações de navegação existentes.
- Iframe continuará ocupando a área útil restante, sem alterar o proxy ou a validação de acesso.
- O estado de carregamento e falha do iframe continuará sendo exibido com os novos tokens visuais.

### Conta e administração

- Páginas de conta e configurações usarão cabeçalho de seção, descrição curta e cards de formulário.
- Listagens administrativas usarão toolbar de filtros, tabela com cabeçalho técnico, status por ponto de cor, hover de linha e estados vazios padronizados.
- A navegação de admin usará o mesmo header/rail visual do portal, mantendo a diferenciação contextual “Administração”.
- Formulários e botões continuarão usando os componentes UI existentes, com ajustes de variantes/classes quando necessário.

### Autenticação

- Login, recuperação e redefinição de senha compartilharão a mesma identidade visual clara, superfícies, estados de erro/sucesso e marca do portal.
- A tela de login manterá uma composição dividida em telas largas, mas com tratamento visual mais próximo do hub de aplicações; em telas menores seguirá como formulário centralizado.
- Fluxos, Server Actions e parâmetros de redirecionamento não serão alterados.

## Arquitetura de componentes

- Reutilizar `PortalShell` e `AdminShell` como pontos de entrada, extraindo apenas primitives compartilhadas quando houver responsabilidade comum real.
- Evoluir `Header`, `Sidebar` e `ThemeToggle` para o novo sistema visual, preservando suas interfaces funcionais ou ajustando-as de forma explícita.
- Manter páginas de dados como Server Components sempre que não precisarem de estado/event handlers; componentes interativos continuarão marcados com `'use client'`.
- Usar `next/link`, `next/image` e ícones existentes de `lucide-react`; não adicionar biblioteca de ícones.
- Preferir classes Tailwind já disponíveis e tokens em `app/globals.css`, evitando CSS específico espalhado pelas páginas.

## Dados e comportamento

- Nenhuma consulta ou mutação de Supabase será alterada para esta entrega.
- O dashboard só exibirá informações disponíveis em `Panel`: `id`, `name`, `description`, `icon` e `active`.
- Controles visuais sem comportamento de produto não serão apresentados como ações reais; links e botões existentes devem continuar funcionais.
- Permissões, logout, mudança de senha, filtros administrativos, toggle de status e paginação de logs devem permanecer funcionando.

## Responsividade e acessibilidade

- Layout desktop será otimizado para áreas largas, com conteúdo ocupando o espaço disponível sem largura fixa excessiva.
- Em telas menores, rail vira drawer, cards quebram em uma coluna e tabelas podem rolar horizontalmente.
- Estados ativos terão mais de uma indicação visual quando necessário: cor, contraste e ícone/posição.
- Controles de navegação manterão `aria-label`, `title` ou texto visível; foco visível e contraste deverão ser preservados.
- Imagens continuarão usando `next/image` quando aplicável.

## Verificação

- Executar lint e build da aplicação.
- Verificar rotas públicas de login, recuperação e redefinição.
- Verificar dashboard, abertura de painel, conta e todas as rotas administrativas com sessão apropriada.
- Conferir visualmente desktop e mobile no servidor local, incluindo sidebar compacta, drawer, cards, tabelas, formulários e modo escuro.
- Confirmar que não houve alteração funcional nas consultas e ações existentes.

## Critérios de aceitação

- Todas as telas do portal e do admin compartilham header, navegação, superfícies e tokens coerentes.
- O dashboard visualmente se aproxima da referência fornecida: header de hub, navegação lateral, cards e lista de conteúdo.
- Login e fluxos de recuperação seguem a mesma linguagem visual sem perder seus estados e ações.
- Acesso a painéis, logout, filtros, formulários, toggle de status e paginação continuam operacionais.
- A aplicação passa em lint/build e permanece utilizável em desktop, mobile e tema escuro.
