## Why

As páginas de admin (`/admin/panels` e `/admin/groups`) usam o componente shadcn `Table` com estilo genérico, inconsistente com o estilo refinado já adotado em `/admin/users`. O dashboard de painéis fica limitado a `max-w-2xl`, desperdiçando espaço horizontal em telas maiores e deixando os cartões empilhados quando poderiam se expandir.

## What Changes

- Tabelas de painéis e grupos no admin migram para o estilo de tabela customizado (mono-brand headers, hover row, ícone de status inline) igual ao de usuários
- Dashboard (`/portal/dashboard`) remove o `max-w-2xl` e passa a usar `max-w-5xl`, permitindo o grid de cartões utilizar até 4 colunas em telas grandes
- Contador de painéis no dashboard recebe visual de stat card mais destacado (número grande em destaque)
- Empty state das tabelas de admin padronizado (mensagem centralizada, sem linha fantasma)

## Capabilities

### New Capabilities

(nenhuma — são refinamentos visuais de telas existentes)

### Modified Capabilities

- `dashboard-panel-cards`: grid passa a suportar até 4 colunas (`xl:grid-cols-4`) e container aumenta para `max-w-5xl`

## Impact

- `app/(admin)/admin/panels/page.tsx` — substitui `<Table>` shadcn por tabela customizada
- `app/(admin)/admin/groups/page.tsx` — substitui `<Table>` shadcn por tabela customizada
- `app/(portal)/dashboard/page.tsx` — ajusta container e grid de cartões
