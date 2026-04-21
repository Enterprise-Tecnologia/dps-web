# Produto — FHE Poupex / FHE/Poupex

**Tipo interno:** `FHE_POUPEX`

## Nomes reconhecidos no front

- `FHE Poupex`
- `FHE/Poupex`

## Regras (aplicação web)

| Regra | Valor |
|--------|--------|
| Idade mínima | **16** anos |
| Idade máxima (referência `MAX_AGE`) | 80,5 (mensagens de erro citam **80 anos e 6 meses** no limite final) |
| Idade ao fim do contrato | Não ultrapassar **80 anos, 5 meses e 29 dias** |
| Capital | **Por idade:** menor que 60 anos até **R$ 3.000.000**; **60 anos ou mais** até **R$ 500.000**; sem idade informada usa teto absoluto **R$ 3.000.000** (`getMaxCapitalByProduct`) |
| Prazo do financiamento | **1 a 420** meses |
| Tipo de imóvel | Apenas **Imóvel Residencial** |
| DPS de saúde | **26** questões — **mesmo** schema e textos que **Home Equity** (`diseaseNamesHomeEquity`) |
| Teleentrevista | **Não** há limiar em `TELE_INTERVIEW_THRESHOLDS_BY_PRODUCT_TYPE` para este tipo → `getTeleInterviewThresholdByProduct` retorna `undefined` |

## Código

- Constantes: `DPS_PRODUCTS.FHE_POUPEX`, `DPS_CAPITAL_LIMITS.FHE_POUPEX`, `DPS_FINAL_AGE_LIMITS.FHE_POUPEX` — `src/constants/index.ts`
- Formulário saúde: `isFhePoupexProduct` usa o mesmo schema que Home Equity — `dps-health-form.tsx`
- Tipo de imóvel filtrado: `dps-product-form.tsx` (`filteredTipoImovelOptions`)

## Observação

Na ordem de `getProductType`, FHE é avaliado depois de MAG e antes de Construcasa.
