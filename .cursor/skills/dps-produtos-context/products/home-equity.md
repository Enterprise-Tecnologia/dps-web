# Produto — HDI Home Equity / Home Equity

**Tipo interno:** `HOME_EQUITY`

## Nomes reconhecidos no front

- `HDI Home Equity`
- `Home Equity`

## Regras (aplicação web)

| Regra | Valor |
|--------|--------|
| Idade mínima | 18 anos |
| Idade máxima (referência `MAX_AGE`) | 80 anos e 5 meses |
| Idade ao fim do contrato | Não ultrapassar **80 anos, 5 meses e 29 dias** |
| Capital | Até **R$ 10.000.000,00** |
| Prazo do financiamento | **1 a 420** meses |
| Tipo de imóvel | Todas as opções **exceto** “Obra” |
| DPS de saúde | **26** questões — `diseaseNamesHomeEquity` |
| Teleentrevista | Capital acima de **R$ 3.000.000** (`HOME_EQUITY`) |

## Código

- Constantes: `DPS_PRODUCTS.HOME_EQUITY`, `DPS_FINAL_AGE_LIMITS.HOME_EQUITY` — `src/constants/index.ts`
- Formulário saúde: `healthFormHomeEquity` / `productHdiHomeEquity` — `dps-health-form.tsx`
- Questões: `diseaseNamesHomeEquity` — `dps-form.tsx`
- Seleção de schema: `getSchema()` usa Home Equity quando `isHomeEquityProduct(productName)` — `dps-health-form.tsx`

## Observação

O conjunto de 26 perguntas é compartilhado com **FHE Poupex** (mesmo schema e labels).
