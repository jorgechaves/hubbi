## Context

`app/(admin)/admin/users/new/page.tsx` é um Client Component que já submete via server action `createUser`. A action aceita `group_ids[]` mas o form atual não os inclui. O formulário de edição (`/admin/users/[id]/page.tsx`) já tem seleção de grupos idêntica ao que precisamos — é o modelo a seguir.

## Goals / Non-Goals

**Goals**
- Adicionar seleção de grupos ao formulário de criação com UX idêntica à edição

**Non-Goals**
- Criar novos server actions (o `createUser` já suporta group_ids)
- Alterações no banco de dados ou RLS
- Convites por email (fluxo separado)

## Decisions

**Carregar grupos via Supabase browser client no useEffect**
Mesma abordagem do formulário de edição. Alternativa seria Server Component passando grupos como prop, mas requer refatoração maior sem benefício real para uma lista pequena.

## Risks / Trade-offs

- [Race condition entre submit e load de grupos] → improvável; se grupos não carregarem antes do submit, `group_ids` será vazio — aceitável pois o admin pode editar depois
