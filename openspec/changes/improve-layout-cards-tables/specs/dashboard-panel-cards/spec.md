## MODIFIED Requirements

### Requirement: Grid de cartões de painéis
O dashboard DEVE exibir os cartões de painéis em um grid responsivo que utilize o espaço disponível até 4 colunas em telas grandes, dentro de um container de até `max-w-5xl`.

#### Scenario: Grid 4 colunas em tela grande
- **WHEN** o usuário acessa o dashboard em tela `xl` (≥1280px)
- **THEN** os cartões de painéis são exibidos em 4 colunas

#### Scenario: Grid adaptativo em telas menores
- **WHEN** o usuário acessa em tela menor que xl
- **THEN** o grid cai para 1 (mobile), 2 (sm) ou 3 (lg) colunas conforme o breakpoint
