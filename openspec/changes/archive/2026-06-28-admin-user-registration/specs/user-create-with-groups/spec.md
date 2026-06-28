## Capability: user-create-with-groups

Permite ao admin criar um novo usuário e associá-lo a grupos em um único formulário.

## Requirements

- O formulário de novo usuário DEVE exibir a lista de todos os grupos cadastrados
- O admin PODE selecionar zero ou mais grupos antes de submeter
- Ao salvar, o usuário é criado e os grupos são associados atomicamente via `createUser` action
- A UX de seleção de grupos DEVE ser idêntica à do formulário de edição: lista com checkboxes, rolagem máxima de 160px
- Se não houver grupos cadastrados, o campo DEVE exibir mensagem "Nenhum grupo cadastrado"
- A lista de grupos DEVE ser carregada assincronamente ao montar o componente
