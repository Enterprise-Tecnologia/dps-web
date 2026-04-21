# Referência — regras DPS (índice)

Fonte de verdade no código: `src/constants/index.ts`, formulários em `src/app/(logged-area)/dps/fill-out/components/`.

## Classificação (`getProductType`)

Correspondência por **substring** case-insensitive no nome do produto. Ordem de teste:

1. `MAG_HABITACIONAL`
2. `FHE_POUPEX`
3. `CONSTRUCASA`
4. `HOME_EQUITY`
5. Caso contrário: `HABITACIONAL`

## Um arquivo por produto

| Produto | Documento |
|---------|-----------|
| Habitacional / HDI Habitacional | [products/habitacional.md](products/habitacional.md) |
| HDI Home Equity / Home Equity | [products/home-equity.md](products/home-equity.md) |
| Construcasa / HDI Construcasa | [products/construcasa.md](products/construcasa.md) |
| FHE Poupex / FHE/Poupex | [products/fhe-poupex.md](products/fhe-poupex.md) |
| MAG Habitacional / MAG Habitacional BANESE | [products/mag-habitacional.md](products/mag-habitacional.md) |

## Transversal

- **Idade final:** `calculateFinalAge` + `validateFinalAgeLimit` em `src/constants/index.ts`.
- **Capital com API:** `validateCapitalLimitConfig` / `getMaxCapitalByProductConfig` em `src/utils/product-validation.ts` quando existir `ProductConfiguration`.
- **Mensagens:** `getFinalAgeErrorMessage`, `getCapitalErrorMessage` em `constants/index.ts`.

## Manutenção

Alterações de regra: revisar `constants/index.ts`, `dps-product-form.tsx`, `dps-initial-form.tsx`, `dps-health-form.tsx`, `dps-form.tsx`, `exam-rules.ts`, `product-validation.ts`.
