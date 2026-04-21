## Parametrização de Produtos DPS: Idade, Capital e Exames Médicos

### Objetivo
Padronizar e centralizar as regras de produtos DPS em frontend e backend:
- Idades mínima/máxima e validação idade + prazo.
- Limites de capital por idade e teto absoluto.
- Exigências de exames por MIP, idade, sexo e produto.
- Inclusão do produto FHE/Poupex.

### Benefícios
- Consistência entre canais (backend como fonte da verdade).
- Redução de retrabalho (remoção de regras hardcoded).
- Evolução rápida por produto, com rastreabilidade.
- Mensagens claras para negócio, subscrição e atendimento.

## Escopo Funcional

### Produtos suportados
- Habitacional
  - Idade: 18–80
  - Capital: até R$ 10.000.000
  - Exames: “default”
- Home Equity
  - Idade: 18–75
  - Capital: até R$ 10.000.000
  - Exames: “default”
- Construcasa
  - Idade: 18–80
  - Capital: até R$ 10.000.000
  - Exames: “default”
- FHE/Poupex
  - Idade mínima: 16
  - Idade máxima: 80 anos e 6 meses (80,5)
  - Regra combinada: idade de entrada + prazo (em anos) ≤ 80,5
  - Limites de capital:
    - 16 até <60 anos: até R$ 3.000.000
    - ≥60 anos: até R$ 500.000
    - Teto absoluto: R$ 3.000.000
  - Exames: catálogo “FHE_POUPEX” (pode incluir USG Abdome já nos mínimos)

### Exames médicos (política base)
- Acionamento por capital MIP:
  - Mínimos (padrão): MIP ≥ R$ 3.000.000 e < R$ 5.000.000
  - Completos: MIP ≥ R$ 5.000.000
- Itens:
  - Mínimos: Exame de Sangue¹, Exame de Urina tipo I, Teste Ergométrico, Ecocardiograma, ECG
  - Completos: todos os mínimos + USG Abdome (Superior, Total e Próstata para homens) e, para ≥50 anos:
    - Homens: + PSA
    - Mulheres: + CA 19-9 + CA 125 + Papanicolau + Ultrassonografia de Mamas
  - Composição do Exame de Sangue¹ (resumo): hemograma; perfil lipídico; função hepática/renal; glicose e HBA1c; bilirrubinas; tireoide (TSH/T4L); inflamatórios; eletrólitos; ácido úrico; insulina; coagulograma (TTP/TP)
- Parametrização por produto: possibilidade de sobrescrever limiares/listas (ex.: FHE/Poupex incluir USG Abdome nos mínimos)

## Mudanças Técnicas

### Backend (fonte da verdade)
- Catálogo central de produtos e regras (idades, capital, exames).
- Endpoints:
  - GET configuração de produtos/exames.
  - GET exames por proposta (considera MIP/idade/sexo/produto).
  - Validação no submit/atualização (idades, idade+prazo, capital).
- Integração com workflow/status para “pendências de exames”.
- Testes unitários e de integração.

### Frontend
- Consumo das regras do backend para UX e mensagens.
- Formulários:
  - Perfil: idade mínima/máxima por produto; idade + prazo.
  - Produto: MIP/DFI ≤ limite por idade e teto do produto.
- Telas de detalhes: exibição dinâmica de exames (por produto/MIP/idade/sexo).
- Compatibilidade preservada para produtos legados.

## Impactos Operacionais
- Subscrição: pendências e listas por produto padronizadas.
- Comercial/Atendimento: mensagens claras de bloqueio/pendência.
- Compliance: catálogo versionado e rastreável.

## Cronograma (inclui backend)
Premissas: 1 dev, 7,5h/dia, 5 dias/semana. Duração: 2 semanas (10 dias úteis, ~75h).

- Dia 1–2 (Backend)
  - Catálogo central (produtos/regras); endpoints de configuração.
  - Serviços de cálculo/validação (idades, idade+prazo, capital) + testes unitários.
- Dia 3–4 (Backend)
  - Regra de exames (MIP/idade/sexo/produto) e endpoint por proposta.
  - Validação no submit/atualização + integração com workflow/status.
  - Testes de integração essenciais.
- Dia 5–6 (Frontend)
  - Integração com APIs para idades/capital; validações nos formulários.
  - Exames e mensagens dinâmicas por produto nas telas de detalhes.
- Dia 7 (E2E manual)
  - Produtos (Habitacional, Home Equity, Construcasa, FHE/Poupex).
  - Bordas: idade 16 e 80,5; idade+prazo; MIP 3M/5M; sexo/idade ≥50.
- Dia 8 (Ajustes/Docs)
  - Correções finas, logs e documentação técnica (dev/operacional).
- Dia 9 (Qualidade/PRs)
  - Testes adicionais, revisão de segurança servidor, PRs FE/BE.
- Dia 10 (UAT/Release)
  - Validação com negócio, ajustes finais e preparação de release.

## Riscos e Mitigações
- Variação de nomes de produto: normalização em catálogo + testes.
- Dados incompletos (idade/sexo): fallback conservador nos exames.
- Regressões: testes dedicados e camada de compatibilidade.
- Mudanças regulatórias: atualização via catálogo versionado.

## Ações Requeridas dos Stakeholders
- Aprovar regras do FHE/Poupex (idades, capital, exames).
- Validar textos/mensagens por produto e limiares de MIP.
- Disponibilizar contato para UAT no Dia 10.
