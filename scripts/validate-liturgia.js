/**
 * Script de validação para verificar se o código de liturgia está funcionando
 * Execute com: node scripts/validate-liturgia.js
 */

const https = require('https');

// Testa se a API está respondendo
function testAPI(date) {
  return new Promise((resolve, reject) => {
    const dia = date.getDate();
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    
    const url = `https://liturgia.up.railway.app/?dia=${dia}&mes=${mes}&ano=${ano}`;
    
    console.log(`\n📡 Testando: ${dia}/${mes}/${ano}`);
    console.log(`   URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const hasData = json && Object.keys(json).length > 0;
          
          if (hasData) {
            console.log(`   ✅ Sucesso - Dados recebidos (${Object.keys(json).length} campos)`);
            resolve({ success: true, data: json });
          } else {
            console.log(`   ⚠️  Aviso - Resposta vazia`);
            resolve({ success: false, data: null });
          }
        } catch (e) {
          console.log(`   ❌ Erro - JSON inválido: ${e.message}`);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.log(`   ❌ Erro de conexão: ${err.message}`);
      reject(err);
    });
  });
}

// Testa várias datas
async function runTests() {
  console.log('🧪 Iniciando validação da API de Liturgia\n');
  console.log('=' .repeat(50));
  
  const dates = [
    new Date(), // Hoje
    new Date(2025, 11, 31), // 31 de dezembro de 2025
    new Date(2026, 0, 1), // 1 de janeiro de 2026
    new Date(2026, 0, 15), // 15 de janeiro de 2026
  ];
  
  let successCount = 0;
  let failCount = 0;
  
  for (const date of dates) {
    try {
      const result = await testAPI(date);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      // Pequeno delay entre requisições
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      failCount++;
      console.error(`   ❌ Falha: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Resultados:`);
  console.log(`   ✅ Sucessos: ${successCount}`);
  console.log(`   ❌ Falhas: ${failCount}`);
  console.log(`   📈 Taxa de sucesso: ${((successCount / dates.length) * 100).toFixed(1)}%`);
  
  if (failCount === 0) {
    console.log('\n✅ Todos os testes passaram! O código deve funcionar no APK.');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Verifique a conexão ou a API.');
  }
}

runTests().catch(console.error);
