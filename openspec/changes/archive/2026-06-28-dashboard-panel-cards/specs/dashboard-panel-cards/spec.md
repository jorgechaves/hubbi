## Capability: dashboard-panel-cards

Exibe no dashboard um resumo visual dos painéis disponíveis para o usuário logado.

## Requirements

- O dashboard DEVE exibir um cartão de contador com o total de painéis acessíveis ("X painéis disponíveis")
- O dashboard DEVE exibir um grid de cartões, um por painel, abaixo do contador
- Cada cartão de painel DEVE exibir: ícone (emoji ou BarChart2 como fallback), nome e descrição (se houver)
- Cada cartão DEVE ser clicável e navegar para `/panel/{id}`
- Se o usuário não tiver painéis, DEVE exibir mensagem informativa em vez do grid
- Os dados de painéis DEVEM ser obtidos via `getUserPanels()` no Server Component
- A saudação e mensagem de boas-vindas do grupo DEVEM permanecer acima dos novos cartões
