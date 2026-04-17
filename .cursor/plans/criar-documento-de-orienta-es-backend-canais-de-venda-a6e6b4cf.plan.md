<!-- a6e6b4cf-1e3b-47b9-b988-a0fe597c2119 f0ae27f8-fb69-473a-808d-1274dfb96d0a -->
# Migração para Produtos Parametrizados do Backend

## Objetivo

Substituir as constantes hardcoded (`DPS_PRODUCTS`, `DPS_CAPITAL_LIMITS`, etc.) por dados dinâmicos carregados do backend através do campo `configuration` nos produtos.

## Estrutura do Plano

### Fase 1: Tipos TypeScript e Estrutura de Dados

- Criar tipos TypeScript para `Product` e `ProductConfiguration`
- Atualizar tipo de retorno de `getProductList()` em `src/app/(logged-area)/dps/actions.ts`
- Garantir compatibilidade com estrutura do backend

### Fase 2: Funções Utilitárias Baseadas em Configuração

- Criar `src/utils/product-config.ts` com helpers para buscar configuração
- Criar `src/utils/product-validation.ts` com funções de validação baseadas em config
- Implementar funções: `getProductTypeFromConfig`, `getMaxAgeByProductConfig`, `getMinAgeByProductConfig`, `getMaxCapitalByProductConfig`, `validateFinalAgeLimitConfig`

### Fase 3: Context Provider para Produtos

- Criar `src/contexts/products-context.tsx` com `ProductsProvider` e `useProducts()` hook
- Implementar cache e loading states
- Adicionar função `refreshProducts()`

### Fase 4: Atualizar Componentes

- Atualizar `dps-product-form.tsx` para usar configurações do backend
- Atualizar `dps-profile-form.tsx` para usar configurações do backend
- Atualizar `dps-initial-form.tsx` para usar contexto de produtos
- Atualizar `dps/fill-out/form/page.tsx` para passar produtos

### Fase 5: Integração e Fallback

- Adicionar `ProductsProvider` no layout principal
- Implementar fallback para produtos sem configuração (usar constantes antigas)
- Criar funções híbridas que tentam config primeiro, depois constantes
- Atualizar todas as chamadas de funções utilitárias

### Fase 6: Testes e Validação

- Testar todos os produtos (Habitacional, Home Equity, Construcasa, FHE Poupex)
- Validar idades mínimas/máximas
- Validar limites de capital (fixo e variável)
- Validar idade final (idade + prazo)
- Testar fallback quando produto não tem configuração

## Arquivos Principais a Modificar

1. `src/app/(logged-area)/dps/actions.ts` - Atualizar tipos e `getProductList()`
2. `src/types/product.ts` (NOVO) - Tipos TypeScript
3. `src/utils/product-config.ts` (NOVO) - Helpers de configuração
4. `src/utils/product-validation.ts` (NOVO) - Funções de validação
5. `src/contexts/products-context.tsx` (NOVO) - Context Provider
6. `src/app/(logged-area)/layout.tsx` - Adicionar ProductsProvider
7. `src/app/(logged-area)/dps/fill-out/components/dps-product-form.tsx` - Atualizar validações
8. `src/app/(logged-area)/dps/fill-out/components/dps-profile-form.tsx` - Atualizar validações
9. `src/app/(logged-area)/dps/fill-out/components/dps-initial-form.tsx` - Usar contexto
10. `src/app/(logged-area)/dps/fill-out/form/page.tsx` - Passar produtos

## Considerações Importantes

- **Compatibilidade**: Manter constantes como fallback para produtos sem configuração
- **Performance**: Cachear produtos no contexto para evitar múltiplas chamadas
- **Loading States**: Tratar estados de carregamento adequadamente
- **Erros**: Tratar quando backend não retornar configuração
- **Validações**: Garantir que todas as validações funcionem com a nova estrutura

### To-dos

- [ ] Criar tipos TypeScript para Product e ProductConfiguration em src/types/product.ts
- [ ] Atualizar getProductList() em src/app/(logged-area)/dps/actions.ts para retornar Product[] com configuration
- [ ] Criar src/utils/product-config.ts com helpers para buscar configuração de produtos
- [ ] Criar src/utils/product-validation.ts com funções de validação baseadas em configuração
- [ ] Criar src/contexts/products-context.tsx com ProductsProvider e useProducts() hook
- [ ] Adicionar ProductsProvider no layout principal src/app/(logged-area)/layout.tsx
- [ ] Atualizar dps-product-form.tsx para usar configurações do backend ao invés de constantes
- [ ] Atualizar dps-profile-form.tsx para usar configurações do backend ao invés de constantes
- [ ] Atualizar dps-initial-form.tsx para usar contexto de produtos
- [ ] Atualizar src/app/(logged-area)/dps/fill-out/form/page.tsx para passar produtos para componentes
- [ ] Implementar fallback para produtos sem configuração usando constantes antigas
- [ ] Testar todos os produtos e validações para garantir funcionamento correto