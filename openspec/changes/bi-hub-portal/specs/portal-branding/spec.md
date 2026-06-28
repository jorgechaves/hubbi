## ADDED Requirements

### Requirement: Configuração de identidade visual pelo admin
O sistema SHALL permitir que o admin configure nome do portal, URL do logo e cor primária em `/admin/settings`.

#### Scenario: Admin salva configurações de branding
- **WHEN** admin preenche nome, URL do logo e cor primária (hex) e salva
- **THEN** sistema atualiza o único registro em `portal_settings` e as mudanças são refletidas imediatamente no portal sem redeploy

#### Scenario: Cor primária inválida
- **WHEN** admin informa cor primária em formato inválido (não hex)
- **THEN** sistema exibe erro de validação e não salva

#### Scenario: Logo URL inacessível
- **WHEN** URL do logo retorna 404 ou não é uma imagem válida
- **THEN** sistema exibe o nome do portal como fallback em texto

### Requirement: Aplicação global do branding
O sistema SHALL aplicar o branding configurado globalmente em todas as páginas do portal (autenticadas e públicas).

#### Scenario: Nome do portal na aba do browser e header
- **WHEN** qualquer página é carregada
- **THEN** `<title>` usa o nome configurado em `portal_settings.name` e o header exibe o logo ou nome

#### Scenario: Cor primária aplicada via CSS variables
- **WHEN** página é renderizada pelo servidor
- **THEN** layout raiz injeta `--color-primary: [hex]` como CSS custom property no elemento `<html>`, sendo consumido pelos componentes Tailwind via `text-[--color-primary]` e `bg-[--color-primary]`

#### Scenario: Valores padrão antes da configuração inicial
- **WHEN** `portal_settings` não possui registro ou campos estão vazios
- **THEN** sistema usa nome padrão "BI Hub", sem logo (exibe nome em texto) e cor primária `#2563EB` (azul)
