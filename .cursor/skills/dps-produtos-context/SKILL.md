---
name: dps-produtos-context
description: >-
  Contexto de regras de negócio dos produtos DPS no dps-web: idade, capital MIP/DFI,
  prazo, tipo de imóvel, DPS de saúde (quantidade de questões), teleentrevista, MAG
  (Banese, AL, exames, autoaprovação). USE FOR: implementar ou revisar fill-out,
  validações, constantes, produto MAG/FHE/Home Equity; explicar diferenças entre
  produtos; alinhar backend com front. DO NOT USE FOR: regras fora do escopo DPS
  ou APIs não mapeadas neste repositório.
---

# DPS — contexto de produtos (dps-web)

## Quando usar

Leia esta skill ao trabalhar em `fill-out`, `constants`, validação de capital/idade, formulário de saúde ou detalhes de proposta MAG.

## Fluxo rápido

1. **Classificação do produto** vem do **nome** retornado pela API: `getProductType` em `src/constants/index.ts` testa nesta ordem — **MAG Habitacional → FHE Poupex → Construcasa → Home Equity → Habitacional (default)**.
2. **Limites numéricos** (idade, capital, prazo) estão em `DPS_PRODUCTS`, `DPS_FINAL_AGE_LIMITS`, `DPS_CAPITAL_LIMITS` no mesmo arquivo.
3. **Validação híbrida** com catálogo de produtos da API: `src/utils/product-validation.ts` (`*Config`, `*Hybrid`) pode **sobrescrever** constantes quando houver `ProductConfiguration`.

## Onde está no código

| Área | Arquivo principal |
|------|-------------------|
| Constantes e helpers | `src/constants/index.ts` |
| Prazo, MIP/DFI, tipo imóvel | `src/app/(logged-area)/dps/fill-out/components/dps-product-form.tsx` |
| Idade final, endereço MAG/AL | `dps-initial-form.tsx` |
| Schema DPS saúde | `dps-health-form.tsx`, questões em `dps-form.tsx` |
| Exames MAG | `src/utils/exam-rules.ts`, UI `mag-habitacional-exams-list.tsx` |
| Teleentrevista (limiar) | `getTeleInterviewThresholdByProduct` + uso em `details-present.tsx` — o capital avaliado é o de **representatividade** do participante: `capitalMIP × (percentageParticipation / 100)` |

## Regra de ouro

Antes de alterar uma regra, confira **constantes** e o fluxo **hybrid** com produtos da API — evitar divergência entre telas e backend.

## Documentação completa

- **Índice + regras transversais:** [reference.md](reference.md)
- **Um markdown por produto** em [products/](products/):
  - [habitacional.md](products/habitacional.md)
  - [home-equity.md](products/home-equity.md)
  - [construcasa.md](products/construcasa.md)
  - [fhe-poupex.md](products/fhe-poupex.md)
  - [mag-habitacional.md](products/mag-habitacional.md)
