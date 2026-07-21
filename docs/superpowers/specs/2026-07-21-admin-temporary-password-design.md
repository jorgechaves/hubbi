# Redefinição de senha temporária por administrador

## Objetivo

Permitir que um administrador autorizado defina uma nova senha temporária para um usuário pela tela de edição em `Admin > Usuários`.

## Experiência

A edição do usuário terá uma seção recolhível chamada `Redefinir senha temporária`. Ela começa fechada. Ao abri-la, o administrador informa `Nova senha temporária` e `Confirmar nova senha`.

As duas entradas passam a ser obrigatórias quando a seção estiver aberta. A senha deve ter ao menos oito caracteres e precisa coincidir com a confirmação. A senha não será carregada novamente, exibida em mensagens ou registrada em logs da aplicação.

## Fluxo e segurança

A atualização usa a Server Action de administração existente. Ela já exige uma sessão válida, perfil ativo e função `admin`; a alteração seguirá a mesma regra.

Se não houver senha temporária no formulário, a ação preserva o comportamento atual de atualizar nome, função, status e grupos. Se houver senha, a ação valida tamanho e confirmação no servidor e chama `auth.admin.updateUser(userId, { password })` usando a chave de serviço somente no ambiente de servidor. A chave não é enviada ao navegador.

O fluxo não envia e-mail, não cria link de recuperação e não altera as políticas RLS.

## Feedback

Enquanto o envio estiver em andamento, o botão de salvar fica desabilitado. Um erro de validação ou da API é exibido no formulário e em toast. Ao concluir, a tela mostra `Usuário atualizado. Senha temporária redefinida.` quando houve troca de senha; caso contrário, mantém `Usuário atualizado.`

## Testes e aceite

1. A ação rejeita senha temporária com menos de oito caracteres.
2. A ação não tenta alterar senha quando o campo está vazio.
3. A ação usa a API administrativa apenas após validar autorização e entrada.
4. A interface exige confirmação idêntica antes do envio.
5. Lint, testes existentes e build passam.
