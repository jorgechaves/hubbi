## 1. Formulário de novo usuário com seleção de grupos

- [x] 1.1 Em `app/(admin)/admin/users/new/page.tsx`, adicionar estado `groups: Group[]` e `selectedGroups: string[]`
- [x] 1.2 Adicionar `useEffect` que carrega grupos via `createClient().from('groups').select('id,name').order('name')`
- [x] 1.3 Adicionar campo de seleção de grupos ao formulário (checkboxes com scroll, igual ao de edição)
- [x] 1.4 No `handleSubmit`, iterar `selectedGroups` e fazer `formData.append('group_ids', gid)` para cada um antes de chamar `createUser`
- [x] 1.5 Exibir mensagem "Nenhum grupo cadastrado" quando a lista estiver vazia
