## Why

O formulário de criação de usuário no Admin (`/admin/users/new`) existe mas não inclui seleção de grupos, obrigando o admin a fazer dois passos: criar o usuário e depois editar para associar grupos. A server action `createUser` já suporta `group_ids`, então basta completar o formulário.

## What Changes

- Adicionar seleção de grupos ao formulário `/admin/users/new`
- Carregar lista de grupos disponíveis via Supabase client ao montar o componente
- Enviar `group_ids` selecionados junto com o formData no submit
- Manter UX consistente com o formulário de edição (`/admin/users/[id]`)

## Capabilities

### New Capabilities

- `user-create-with-groups`: Criação de usuário com atribuição de grupos em um único passo

### Modified Capabilities

- (nenhuma — apenas completar UI existente, sem mudança de requisitos de outras specs)

## Impact

- `app/(admin)/admin/users/new/page.tsx` — único arquivo modificado
- Nenhuma mudança em server actions, banco de dados ou outros componentes
