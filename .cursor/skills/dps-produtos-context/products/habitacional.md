# Produto — Habitacional (HDI Habitacional)

**Tipo interno:** `HABITACIONAL` (fallback quando o nome não casa com MAG, FHE, Construcasa ou Home Equity).

## Nomes reconhecidos no front

- `Habitacional`
- `HDI Habitacional`

## Regras (aplicação web)

| Regra | Valor |
|--------|--------|
| Idade mínima | 18 anos |
| Idade máxima (referência `MAX_AGE`) | 80 anos |
| Idade ao fim do contrato | Não ultrapassar **79 anos, 11 meses e 29 dias** |
| Capital (MIP / DFI) | Até **R$ 10.000.000,00** cada (conforme validação) |
| Prazo do financiamento | **1 a 420** meses |
| Tipo de imóvel | Todas as opções **exceto** “Obra” |
| DPS de saúde | **25** questões — `diseaseNamesHabitacional` (Sim/Não + descrição se Sim) |
| Teleentrevista | Capital de **representatividade** acima de **R$ 3.000.000** — calculado como `proposalData.capitalMIP × (percentageParticipation / 100)` do participante em evidência (`TELE_INTERVIEW_THRESHOLDS_BY_PRODUCT_TYPE.HABITACIONAL`) |

## Código

- Constantes: `DPS_PRODUCTS.HABITACIONAL`, `DPS_FINAL_AGE_LIMITS.HABITACIONAL`, `DPS_CAPITAL_LIMITS.HABITACIONAL` — `src/constants/index.ts`
- Formulário saúde padrão: `healthForm` / `productYelumNovo` — `dps-health-form.tsx`
- Questões: `diseaseNamesHabitacional` — `dps-form.tsx`

## Observação

Configuração vinda da API (`ProductConfiguration`) pode alterar limites via funções em `src/utils/product-validation.ts` quando o catálogo de produtos estiver preenchido.
