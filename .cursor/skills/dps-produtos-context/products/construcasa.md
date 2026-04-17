# Produto — Construcasa / HDI Construcasa

**Tipo interno:** `CONSTRUCASA`

## Nomes reconhecidos no front

- `Construcasa`
- `HDI Construcasa`

## Regras (aplicação web)

| Regra | Valor |
|--------|--------|
| Idade mínima | 18 anos |
| Idade máxima (referência `MAX_AGE`) | 80 anos |
| Idade ao fim do contrato | Não ultrapassar **79 anos, 11 meses e 29 dias** |
| Capital | Até **R$ 10.000.000,00** |
| Prazo do financiamento | **1 a 420** meses |
| Tipo de imóvel | Todas as opções **exceto** “Obra” |
| DPS de saúde | **25** questões — mesmo conjunto que **Habitacional** (`diseaseNamesHabitacional`) |
| Teleentrevista | Capital acima de **R$ 3.000.000** (`CONSTRUCASA`) |

## Código

- Constantes: `DPS_PRODUCTS.CONSTRUCASA`, `DPS_FINAL_AGE_LIMITS.CONSTRUCASA` — `src/constants/index.ts`
- Formulário saúde: cai no fluxo **padrão** (`healthForm` / `productYelumNovo`), não em Home Equity — `dps-health-form.tsx`
- Questões: `diseaseNamesHabitacional` — `dps-form.tsx`

## Observação

Na classificação `getProductType`, Construcasa é testado **antes** do fallback Habitacional; nomes devem bater com as strings configuradas.
