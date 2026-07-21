# UX administrativa: busca, filtros e feedback

## Objetivo

Reduzir o tempo para localizar e administrar usuários, grupos e painéis. O escopo não inclui a tela de logs nesta etapa.

## Escopo funcional

As listagens administrativas de usuários, grupos e painéis terão filtros refletidos na URL.

- Usuários: busca por nome ou e-mail; filtros por função (`admin` ou `user`) e situação (`ativo` ou `inativo`).
- Grupos: busca por nome ou descrição.
- Painéis: busca por nome ou descrição; filtro por situação (`ativo` ou `inativo`).

Cada página preservará seus filtros ao recarregar, poderá ser compartilhada por URL e exibirá uma ação para limpar filtros. A busca será submetida pelo formulário e não fará solicitações a cada tecla.

## Arquitetura

As páginas continuarão sendo Server Components. Elas receberão `searchParams`, normalizarão valores aceitos e aplicarão os filtros nas consultas Supabase. Um componente de controles de filtros, no cliente, atualizará a query string com `router.replace`, preservando a rota atual.

As consultas usam correspondência case-insensitive para texto. Filtros não reconhecidos serão ignorados. O estado vazio distinguirá entre uma lista ainda sem registros e uma busca sem resultados.

## Feedback de ações

As ações de criar, editar, ativar/desativar e excluir apresentarão feedback por toast.

- Êxito: mensagem curta que confirma a operação e atualiza a listagem quando necessário.
- Falha: mensagem retornada pela Server Action, sem navegação ou atualização que esconda o erro.
- Processamento: os botões ficam desabilitados enquanto a ação está pendente e recebem um rótulo de carregamento.

Os avisos inline que já existem poderão permanecer como complemento nos formulários, mas o toast será a confirmação consistente entre telas.

## Componentes e limites

- Um componente reutilizável de busca e filtros concentra a sincronização com a URL.
- As páginas definem os campos de filtro permitidos e continuam responsáveis pela consulta e pela renderização da tabela.
- Uma pequena camada de normalização mantém parâmetros inválidos fora das consultas.
- As Server Actions permanecem responsáveis por autorização e validação; a UX não substitui essas verificações.

## Documentação operacional

Será adicionado um guia no README explicando os filtros disponíveis, o comportamento das URLs e as mensagens de sucesso/erro.

## Critérios de aceite

1. Usuários, grupos e painéis podem ser encontrados pela busca definida no escopo.
2. Os filtros de usuários e painéis restringem os resultados corretamente.
3. A URL representa busca e filtros e os restaura após recarregar.
4. Criar, editar, excluir e alterar situação mostram feedback de êxito ou falha.
5. Logs não recebe busca ou filtro nesta entrega.
6. Lint e build passam.
