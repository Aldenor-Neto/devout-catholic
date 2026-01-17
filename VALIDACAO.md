# Guia de Validação - Liturgia

Este guia ajuda a validar se o código de liturgia está funcionando antes de compilar o APK.

## ✅ Formas de Validar

### 1. **Teste no Emulador (Recomendado)**
O emulador é o ambiente mais próximo do APK real:

```bash
npm run android
# ou
npm run ios
```

**O que verificar:**
- ✅ A tela de liturgia abre sem erros
- ✅ A liturgia do dia atual carrega corretamente
- ✅ Ao selecionar uma data no calendário, a liturgia daquela data carrega
- ✅ Teste com datas após 31/12/2025 (ex: 01/01/2026, 15/01/2026)
- ✅ Verifique os logs no console para erros

### 2. **Validação da API (Script Automatizado)**
Testa se a API está respondendo corretamente:

```bash
npm run validate-liturgia
```

Este script testa:
- ✅ Hoje
- ✅ 31 de dezembro de 2025
- ✅ 1 de janeiro de 2026
- ✅ 15 de janeiro de 2026

**Resultado esperado:** Todos os testes devem passar (100% de sucesso)

### 3. **Verificação de Código (TypeScript/Linter)**
Verifica erros de sintaxe e tipos:

```bash
npm run lint
```

**Resultado esperado:** Nenhum erro de lint

### 4. **Logs de Debug (Runtime)**
Os logs de debug foram adicionados ao código. Para verificar:

1. Execute o app no emulador ou dispositivo
2. Abra a tela de liturgia
3. Selecione uma data no calendário
4. Verifique o arquivo `.cursor/debug.log` para ver o fluxo de execução

**O que procurar nos logs:**
- ✅ `getLiturgiaByDate chamado` - função está sendo chamada
- ✅ `Cache individual verificado` - cache está funcionando
- ✅ `Buscando do servidor` - quando necessário, busca do servidor
- ✅ `Resposta do servidor` - servidor respondeu corretamente
- ✅ `Liturgia recebida` - dados foram recebidos e processados

### 5. **Teste Manual no Emulador**

**Cenários de teste:**

1. **Primeira abertura:**
   - Abra o app
   - Vá para a tela "Liturgia"
   - ✅ Deve carregar a liturgia do dia atual

2. **Seleção de data:**
   - Clique em "Escolher Data"
   - Selecione uma data (ex: 01/01/2026)
   - ✅ Deve carregar a liturgia da data selecionada

3. **Teste com datas futuras:**
   - Selecione 31/12/2025
   - ✅ Deve funcionar
   - Selecione 01/01/2026
   - ✅ Deve funcionar
   - Selecione 15/01/2026
   - ✅ Deve funcionar

4. **Teste offline (cache):**
   - Carregue uma data
   - Feche o app
   - Desative a internet
   - Abra o app novamente
   - Selecione a mesma data
   - ✅ Deve carregar do cache

## 🚨 Sinais de Problema

Se você ver algum destes sinais, há um problema:

- ❌ Tela em branco após carregar
- ❌ Mensagem de erro na tela
- ❌ Loading infinito
- ❌ App crash ao abrir liturgia
- ❌ Erro no console sobre "Network request failed" (sem internet, mas deveria usar cache)
- ❌ Erro sobre "Cannot read property" ou "undefined"

## 📋 Checklist Antes de Compilar APK

Antes de compilar o APK, certifique-se de:

- [ ] `npm run lint` não mostra erros
- [ ] `npm run validate-liturgia` passa todos os testes
- [ ] Testou no emulador e tudo funciona
- [ ] Testou com datas após 31/12/2025
- [ ] Verificou os logs de debug (se necessário)
- [ ] Não há erros no console do emulador

## 🔍 Análise dos Logs de Debug

Os logs estão em `.cursor/debug.log` (formato NDJSON).

**Exemplo de log esperado:**
```json
{"location":"liturgia.tsx:40","message":"useEffect init iniciado",...}
{"location":"liturgiacache.ts:88","message":"getLiturgiaByDate chamado",...}
{"location":"liturgiacache.ts:94","message":"Cache individual verificado",...}
{"location":"liturgiacache.ts:109","message":"Resposta do servidor",...}
{"location":"liturgia.tsx:46","message":"Liturgia de hoje recebida",...}
```

**Se os logs mostram:**
- ✅ Todos os passos executando = Tudo OK
- ❌ Erro em algum passo = Problema identificado

## 💡 Dicas

1. **Sempre teste no emulador primeiro** - é mais rápido que compilar APK
2. **Use o script de validação** - detecta problemas de API rapidamente
3. **Verifique os logs** - mostram exatamente onde está o problema
4. **Teste datas futuras** - especialmente após 31/12/2025

## 🎯 Resultado Esperado

Após todas as validações, você deve ter:
- ✅ Código sem erros de lint
- ✅ API respondendo corretamente
- ✅ Funcionamento perfeito no emulador
- ✅ Logs mostrando fluxo correto
- ✅ Confiança para compilar o APK
