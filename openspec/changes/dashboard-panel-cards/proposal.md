## Why

O dashboard pós-login exibe apenas uma saudação e mensagem de boas-vindas do grupo, mas o usuário não tem visibilidade imediata de quantos painéis tem acesso nem um atalho direto para acessá-los sem navegar pela sidebar. Adicionar cartões no dashboard melhora a orientação e reduz cliques.

## What Changes

- Exibir um cartão de resumo com a contagem total de painéis disponíveis para o usuário
- Exibir um grid de cartões, um por painel acessível, com nome, descrição (se houver), ícone e link direto para `/panel/{id}`
- Manter a saudação e mensagem de boas-vindas do grupo existentes acima dos cartões

## Capabilities

### New Capabilities

- `dashboard-panel-cards`: Grid de cartões de painéis e contador no dashboard do usuário

### Modified Capabilities

(nenhuma)

## Impact

- `app/(portal)/dashboard/page.tsx` — único arquivo modificado
- Reutiliza `getUserPanels()` já existente em `lib/db/panels.ts`
- Nenhuma mudança em banco de dados, API ou outros componentes
