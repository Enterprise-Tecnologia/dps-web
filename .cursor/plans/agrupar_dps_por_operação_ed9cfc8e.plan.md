---
name: Agrupar DPS por Operação
overview: Adicionar uma visão “Operações” (agrupada por ContractNumber) lado a lado com a visão atual por participações (Proposal), incluindo status agregado por RiskStatus e uma tela de participantes da operação, com exigência de canal para ADMIN.
todos:
  - id: ops-status-helper
    content: Criar helper de agregação (groupBy contractNumber + computeOperationStatus por RiskStatus) e tipos de DTO/linha
    status: completed
  - id: ops-table-component
    content: Implementar OperationDataTable (colunas de operação, badge de status agregado, ação de abrir participantes)
    status: completed
    dependencies:
      - ops-status-helper
  - id: dashboard-toggle-view
    content: Adicionar suporte a view=participacoes|operacoes no /dashboard/table, com abas e preservação de filtros/links
    status: completed
    dependencies:
      - ops-table-component
  - id: operation-participants-page
    content: Criar página /dps/operation/[operationNumber] consumindo getParticipantsByOperation e exibindo lista de participantes com links para detalhes
    status: completed
  - id: admin-channel-required
    content: Forçar seleção de canal para ADMIN quando currentChannel não existir (SalesChannelModal required + abertura automática) e preservar view na busca do TopBar
    status: completed
    dependencies:
      - dashboard-toggle-view
---

# Ajuste do frontend para agrupar DPS por Operação

## Objetivo

- Exibir uma nova visão de lista **por Operação** (`contractNumber`/`operationNumber`) sem remover a visão atual **por Participação** (Proposal).
- Calcular no frontend o **status agregado da operação** usando `RiskStatus` conforme a documentação.
- Fornecer drill-down para uma tela **“Participantes da operação”** baseada em `GET /api/v1/proposal/participants/{operationNumber}`.
- Para **ADMIN**, garantir que exista **canal selecionado** antes de navegar/consultar dados sensíveis a canal.

## Estado atual (descoberto no código)

- A listagem principal usa `getProposals()` (`v1/Proposal/all`) e renderiza linhas por **proposal** em `[src/app/(logged-area)/dashboard/table/page.tsx](src/app/\(logged-area)/dashboard/table/page.tsx)` com a tabela `[src/app/(logged-area)/components/dps-data-table.tsx](src/app/\(logged-area)/components/dps-data-table.tsx)`.
- Já existe `getParticipantsByOperation()` em `[src/app/(logged-area)/dps/actions.ts](src/app/\(logged-area)/dps/actions.ts)`.
- A tela de detalhe por proposal (`/dps/details/[uid]`) já busca participantes por `contractNumber` e exibe um accordion.

## Decisões de UX (confirmadas)

- Manter **duas visões** via toggle/abas: **Participações** e **Operações**.
- Na visão **Operações**, **não** exibir colunas de **Status MIP/DFI** (mostrar apenas status agregado do processo e informações básicas).

## Fluxo de dados proposto

```mermaid
flowchart TD
  dashboardTablePage[DashboardTablePage] --> getProposals[getProposals v1/Proposal/all]
  getProposals --> proposals[Lista_de_Proposals]
  dashboardTablePage --> viewSwitch{view}
  viewSwitch -->|participacoes| proposalsTable[DpsDataTable_por_Proposal]
  viewSwitch -->|operacoes| groupByContract[groupBy(contractNumber)]
  groupByContract --> operationRows[Linhas_de_Operacao]
  operationRows --> operationsTable[OperationDataTable]
  operationsTable --> operationDetails[/dps/operation/{operationNumber}/]
  operationDetails --> getParticipants[getParticipantsByOperation v1/Proposal/participants/{operation}]
```



## Regras de status agregado (Operação)

Implementar um helper puro (sem UI) com a regra do documento:

- **Em andamento** se existir algum `RiskStatus` indefinido/null **ou** algum `RiskStatus == "REVIEW"`.
- **Aprovado** se todos `RiskStatus == "APPROVED"`.
- **Reprovado** se todos já terminaram (sem null/REVIEW) e existir pelo menos 1 `RiskStatus != "APPROVED"`.

Observação prática para o código atual:

- Tratar `RiskStatus` como string opcional (há valores adicionais no sistema, ex.: `REOPENED`); a regra pode considerar `REOPENED` como **Em andamento** (porque não é conclusão) para evitar “Reprovado” prematuro.

## Mudanças planejadas (arquivos)

- **Adicionar visão Operações no dashboard table**
- Atualizar `[src/app/(logged-area)/dashboard/table/page.tsx](src/app/\(logged-area)/dashboard/table/page.tsx) `para aceitar `searchParams.view` (`participacoes|operacoes`) e renderizar abas.
- Ajustar `[src/app/(logged-area)/dashboard/table/search-filter.tsx](src/app/\(logged-area)/dashboard/table/search-filter.tsx) `para **preservar** `view` nos redirects de busca.
- **Nova tabela para Operações**
- Criar `[src/app/(logged-area)/components/operations-data-table.tsx](src/app/\(logged-area)/components/operations-data-table.tsx)` com colunas sugeridas:
    - Dt Cadastro (min created do grupo)
    - Nº Operação (`contractNumber`)
    - Participantes (count do grupo na página)
    - Status (badge derivado do agregado)
    - Ações (abrir tela “Participantes da operação”)
- **Tela “Participantes da operação”**
- Criar rota `[src/app/(logged-area)/dps/operation/[operationNumber]/page.tsx](src/app/(logged-area)/dps/operation/[operationNumber]/page.tsx)`:
    - Buscar sessão/token.
    - Chamar `getParticipantsByOperation(token, operationNumber)`.
    - Renderizar lista com links para `/dps/details/{participantUid}`.
    - (Opcional no primeiro corte) Se o endpoint não retornar `status/dfiStatus`, manter a abordagem atual: enriquecer cada participante com `getProposalByUid()`.
- **ADMIN: canal obrigatório**
- Atualizar `[src/app/(logged-area)/components/top-bar-account-section.tsx](src/app/\(logged-area)/components/top-bar-account-section.tsx)` para:
    - Se `role == admin` e `currentChannel == null`, abrir `SalesChannelModal` como `required={true}` automaticamente (useEffect) até selecionar.
- Atualizar `[src/app/(logged-area)/components/top-bar.tsx](src/app/\(logged-area)/components/top-bar.tsx) `para preservar `view` atual nos `router.push` (busca por CPF/operação).

## Limitação conhecida (e mitigação)

Como não existe endpoint dedicado para “listar operações”, a visão Operações será derivada de `v1/Proposal/all`.

- Isso significa que a paginação continua baseada em **proposals**, então uma operação pode “espalhar” entre páginas.
- Mitigação imediata: quando o usuário filtrar por **Número de Operação**, o resultado fica naturalmente completo (todas as proposals daquele `contractNumber` tendem a vir juntas).
- Follow-up recomendado (backend): endpoint de listagem por `ContractProcess`/operações paginadas.

## Critérios de aceite

- Usuário consegue alternar entre **Participações** e **Operações** na tela `/dashboard/table`.
- Em **Operações**, cada linha representa um `contractNumber` e o **status agregado** segue as regras do documento.
- Clicar na operação abre a tela **Participantes da operação**, que lista todas as participações e permite navegar para o detalhe individual.