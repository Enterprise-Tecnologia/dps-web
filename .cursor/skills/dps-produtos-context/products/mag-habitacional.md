# Produto — MAG Habitacional / MAG Habitacional BANESE

**Tipo interno:** `MAG_HABITACIONAL` (inclui canal **Banese** pelo nome do produto).

## Nomes reconhecidos no front

- `MAG Habitacional`
- `MAG Habitacional BANESE`

## Regras (aplicação web)

| Regra | Valor |
|--------|--------|
| Idade mínima | 18 anos |
| Idade ao fim do contrato | Não ultrapassar **80 anos, 5 meses e 29 dias** |
| Capital MIP | Máximo **R$ 5.000.000,00** |
| Capital DFI | Máximo **R$ 8.000.000,00** |
| Relação MIP × DFI | Em geral **DFI maior que MIP**; com MIP no **teto** do produto, **DFI pode igualar** o MIP (`validateDfiNotExceedMip` em `dps-product-form.tsx`) |
| Prazo do financiamento | **1 a 240** meses (demais produtos: até 420) |
| Tipo de imóvel | **Imóvel Residencial, Comercial, Misto, Obra** |
| DPS por faixa (MIP + idade) | Ver tabela abaixo — lógica em `getMagHabitacionalDpsMode` (`src/utils/mag-habitacional-dps.ts`) |
| Após envio da DPS (simplificada ou completa) | Se **nenhuma** resposta positiva (`exists`), chama **`postMagHabitacionalAutoApproval`** |

### Modos de DPS (capital = MIP)

| Modo | Condição | Formulário / fluxo |
|------|-----------|-------------------|
| **none** | MIP ≤ R$ 500.000 **e** idade &lt; 71, **ou** MIP ≤ R$ 50.000 **e** idade ≥ 71 | Sem questionário; após cadastro da operação chama **`signProposal`** no principal (`dps-initial-form.tsx`); no fill-out logado, passo `sendingSignature` + `signProposal` se status 10 |
| **simplified** | MIP ≤ R$ 3.000.000 e não se enquadra em **none** | **12** questões — `diseaseNamesMagHabitacionalSimplified` (questionário próprio; códigos 1–12, textos distintos do formulário completo) |
| **full** | MIP **&gt;** R$ 3.000.000 | **31** questões — `diseaseNamesMagHabitacional` |

Fluxo externo (cliente): se **none**, `redirect` para sucesso com `?noDps=1` (`formulario/page.tsx`); formulário usa 12 ou 31 conforme o modo (`external-dps-form.tsx`).
| Restrição AL (Alagoas) | Com **UF = AL**, bairros **bloqueados:** Pinheiro, Bebedouro, Bom Parto, Farot, Ponta Grossa, Mutange, Gruta de Lourdes, Vergel do Lago |
| Exames (listagem) | `getRequiredExamsMagHabitacional`, `MAG_HABITACIONAL_EXAM_RULES` — `src/utils/exam-rules.ts`; UI `mag-habitacional-exams-list.tsx` |
| Teleentrevista | Não há entrada dedicada no mapa `TELE_INTERVIEW_THRESHOLDS_BY_PRODUCT_TYPE` para MAG (comportamento análogo ao FHE no helper) |

## Código

- Constantes: `DPS_PRODUCTS.MAG_HABITACIONAL`, `DPS_CAPITAL_LIMITS.MAG_HABITACIONAL`, `DPS_FINAL_AGE_LIMITS.MAG_HABITACIONAL` — `src/constants/index.ts`
- Formulário saúde: `healthFormMagHabitacional` / `healthFormMagHabitacionalSimplified` — `dps-health-form.tsx` (prop `magHabitacionalDpsMode`)
- Questões: `diseaseNamesMagHabitacional` e `diseaseNamesMagHabitacionalSimplified` — `dps-form.tsx`
- Endereço AL: `dps-initial-form.tsx` (submit + `checkBlockedLocation`)
- Prazo máx. 240: schema `createDpsProductFormWithAge` — `dps-product-form.tsx`
- Edição de operação (prazo máx.): `operation-edit-form.tsx` (240 para MAG)

## Observação

MAG tem prioridade **máxima** na ordem de `getProductType` — qualquer nome que contenha as strings de MAG é classificado como `MAG_HABITACIONAL` antes dos demais tipos.
