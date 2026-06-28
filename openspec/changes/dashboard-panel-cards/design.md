## Context

`app/(portal)/dashboard/page.tsx` é um Server Component que já busca o perfil e a welcome message do grupo. `getUserPanels()` em `lib/db/panels.ts` retorna os painéis ativos acessíveis ao usuário logado — já é chamada no layout do portal para popular a sidebar.

## Goals / Non-Goals

**Goals**
- Adicionar contador e grid de cartões de painéis ao dashboard sem refatorações maiores

**Non-Goals**
- Caching compartilhado entre layout e dashboard (aceitável buscar duas vezes por ora)
- Paginação (usuários típicos têm poucos painéis)
- Prévia do painel inline

## Decisions

**Chamar `getUserPanels()` diretamente no dashboard page**
Mais simples que passar props pelo layout. O Next.js deduplica automaticamente fetch requests idênticos via React cache quando `createClient` usa o mesmo contexto de request.

**Grid responsivo com `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`**
Adapta bem a diferentes quantidades de painéis e tamanhos de tela.

**Cartão de contador separado do grid**
Dá destaque visual ao número total antes de mostrar os itens individuais; consistente com dashboards de BI.

## Risks / Trade-offs

- [Dupla chamada ao banco] → Impacto mínimo; painéis por usuário são poucos e a query é simples
