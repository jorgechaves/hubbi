## Context

Três páginas precisam de ajuste visual:
1. `app/(admin)/admin/panels/page.tsx` e `app/(admin)/admin/groups/page.tsx` usam `<Table>` do shadcn com estilo padrão (headers em caixa normal, sem mono-brand, sem dot de status)
2. `app/(portal)/dashboard/page.tsx` usa `max-w-2xl` como container — limita o grid de cartões a larguras pequenas, desperdiçando espaço em telas maiores

O estilo de referência já existe em `app/(admin)/admin/users/page.tsx`: tabela `<table>` nativa com headers `font-mono-brand uppercase tracking-[0.15em] text-muted-foreground/50`, hover row `hover:bg-muted/50`, border entre linhas.

## Goals / Non-Goals

**Goals:**
- Uniformizar o estilo das tabelas de admin (panels, groups) com a de users
- Ampliar container do dashboard para `max-w-5xl` e grid para `xl:grid-cols-4`
- Padronizar empty state das tabelas (mensagem centrada)

**Non-Goals:**
- Adicionar sorting/filtering às tabelas
- Criar componente de tabela reutilizável compartilhado (copia direta do padrão)
- Alterar funcionalidade ou dados exibidos

## Decisions

**Copiar o padrão da tabela de users em vez de criar componente compartilhado**
Evita refatoração desnecessária. Três tabelas é o limite onde copiar ainda é mais rápido que extrair e testar um componente genérico.

**`max-w-5xl` no dashboard**
Cobre monitores comuns de 1440px sem desperdiçar demais em 4K. O layout do portal tem sidebar colapsável, então o espaço útil em collapsed chega perto de 1300px — `max-w-5xl` (1024px) usa bem esse espaço.

## Risks / Trade-offs

- [Duplicação do estilo de tabela] → Aceitável por ora; se uma 4ª tabela aparecer, extrai componente então
