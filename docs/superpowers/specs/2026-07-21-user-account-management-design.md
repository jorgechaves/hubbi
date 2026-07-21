# Gestão de contas de usuários

## Objetivo

Adicionar exclusão segura de usuários para administradores e permitir que cada usuário altere a própria senha pelo menu lateral do portal.

## Exclusão administrativa

A lista de usuários e a tela de edição terão uma ação `Excluir usuário`. A interface pede confirmação explícita exibindo nome e e-mail e mostra feedback de sucesso ou erro.

A Server Action exigirá administrador autenticado, validará o UUID e consultará o usuário alvo antes da exclusão. Ela recusará:

- excluir a própria conta;
- excluir o último administrador ativo;
- excluir sem confirmação válida no servidor.

Antes da exclusão, as sessões do usuário serão encerradas. Em seguida, a conta será removida pela API administrativa do Supabase Auth usando a chave de serviço somente no servidor. O perfil e associações relacionadas serão removidos pelos `ON DELETE CASCADE` existentes. A ação revalidará a lista de usuários.

## Minha conta

O menu lateral do portal receberá `Minha conta`, acessível a usuários comuns e administradores. A nova página exibirá os dados básicos disponíveis do usuário e um formulário de troca de senha.

O formulário exigirá senha atual, nova senha e confirmação. A nova senha terá no mínimo oito caracteres. O servidor verificará a senha atual por autenticação no Supabase antes de chamar `auth.updateUser` para alterar a senha. Senhas não serão incluídas em logs, URLs ou toasts.

Após uma alteração bem-sucedida, sessões antigas poderão ser encerradas conforme a política do Supabase; a sessão usada pelo usuário deverá continuar funcional ou a interface deverá encaminhar para o login com mensagem clara.

## Feedback e segurança

Os botões ficam desabilitados durante o processamento. Erros de validação são exibidos no formulário e erros de operação em toast. A autorização permanece nas Server Actions; esconder botões não é considerado controle de acesso.

Não será criado novo campo de banco, migration ou política RLS. A alteração usa as tabelas e funções de autenticação existentes.

## Critérios de aceite

1. Um admin pode excluir um usuário diferente de si após confirmação.
2. A própria conta e o último admin ativo não podem ser excluídos.
3. A exclusão encerra sessões e remove o usuário do Auth e da lista de perfis.
4. Usuários encontram `Minha conta` no menu lateral do portal.
5. A troca de senha exige senha atual, nova senha válida e confirmação idêntica.
6. Usuários não autorizados não conseguem executar as ações mesmo chamando a Server Action diretamente.
7. Testes, lint e build passam.
