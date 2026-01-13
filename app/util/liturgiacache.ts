import AsyncStorage from '@react-native-async-storage/async-storage';

// 🔹 Monta a chave única para uma data específica
const getDateKey = (ano: number, mes: number, dia: number) =>
  `liturgia-${ano}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

// 🔹 Salva uma liturgia individual no cache
const saveLiturgiaDate = async (ano: number, mes: number, dia: number, dados: any) => {
  const key = getDateKey(ano, mes, dia);
  await AsyncStorage.setItem(key, JSON.stringify(dados));
};

// 🔹 Carrega uma liturgia individual do cache
const loadLiturgiaDate = async (ano: number, mes: number, dia: number) => {
  const key = getDateKey(ano, mes, dia);
  const json = await AsyncStorage.getItem(key);
  return json ? JSON.parse(json) : null;
};

// 🔹 Mantém compatibilidade com código antigo (deprecated)
const getMonthKey = (ano: number, mes: number) =>
  `liturgia-${ano}-${mes.toString().padStart(2, '0')}`;

const saveLiturgiaMonth = async (ano: number, mes: number, dados: any) => {
  const key = getMonthKey(ano, mes);
  await AsyncStorage.setItem(key, JSON.stringify(dados));
};

const loadLiturgiaMonth = async (ano: number, mes: number) => {
  const key = getMonthKey(ano, mes);
  const json = await AsyncStorage.getItem(key);
  return json ? JSON.parse(json) : null;
};

// 🔹 Cria um fetch com timeout (compatível com React Native)
const fetchWithTimeout = async (url: string, timeout: number = 30000): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout: A requisição demorou muito para responder. Verifique sua conexão com a internet.'));
    }, timeout);

    fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        clearTimeout(timeoutId);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        if (error.message.includes('Timeout')) {
          reject(error);
        } else if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
          reject(new Error('Erro de conexão. Verifique sua conexão com a internet.'));
        } else {
          reject(error);
        }
      });
  });
};

// 🔹 Baixa uma liturgia específica e salva no cache
const fetchAndStoreDate = async (ano: number, mes: number, dia: number) => {
  try {
    const url = `https://liturgia.up.railway.app/?dia=${dia}&mes=${mes
      .toString()
      .padStart(2, '0')}&ano=${ano}`;
    
    console.log(`📡 Buscando liturgia de ${dia}/${mes}/${ano}...`);
    
    const response = await fetchWithTimeout(url, 30000);
    const data = await response.json();
    
    if (data && Object.keys(data).length > 0) {
      await saveLiturgiaDate(ano, mes, dia, data);
      console.log(`✅ Liturgia de ${dia}/${mes}/${ano} carregada e salva com sucesso`);
      return data;
    } else {
      console.warn(`⚠️ Dados vazios para ${dia}/${mes}/${ano}`);
      return null;
    }
  } catch (e: any) {
    console.error(`❌ Erro ao buscar liturgia de ${dia}/${mes}/${ano}:`, e.message || e);
    throw e;
  }
};

// 🔹 Baixa todas as liturgias de um mês e salva (mantido para compatibilidade, mas não usado mais)
const fetchAndStoreMonth = async (ano: number, mes: number) => {
  let dadosMes: any = {};
  const diasNoMes = new Date(ano, mes, 0).getDate();

  for (let dia = 1; dia <= diasNoMes; dia++) {
    try {
      const url = `https://liturgia.up.railway.app/?dia=${dia}&mes=${mes
        .toString()
        .padStart(2, '0')}&ano=${ano}`;
      
      console.log(`📡 Buscando liturgia de ${dia}/${mes}/${ano}...`);
      
      const response = await fetchWithTimeout(url, 30000);
      const data = await response.json();
      
      if (data && Object.keys(data).length > 0) {
        dadosMes[dia] = data;
        await saveLiturgiaDate(ano, mes, dia, data); // Salva individual também
        console.log(`✅ Liturgia de ${dia}/${mes}/${ano} carregada com sucesso`);
      } else {
        console.warn(`⚠️ Dados vazios para ${dia}/${mes}/${ano}`);
      }
    } catch (e: any) {
      console.error(`❌ Erro ao buscar liturgia de ${dia}/${mes}/${ano}:`, e.message || e);
      // Continua para o próximo dia mesmo se houver erro
    }
  }

  if (Object.keys(dadosMes).length > 0) {
    await saveLiturgiaMonth(ano, mes, dadosMes);
  }
  return dadosMes;
};

// 🔹 Inicializa cache - apenas garante que o sistema está pronto (não carrega meses inteiros)
const initializeLiturgiaCache = async () => {
  // Não faz mais preload de meses inteiros - apenas inicializa o sistema
  console.log('✅ Sistema de cache de liturgia inicializado (carregamento sob demanda)');
};

// 🔹 Retorna a liturgia de uma data (carrega apenas a data solicitada)
const getLiturgiaByDate = async (date: Date) => {
  const ano = date.getFullYear();
  const mes = date.getMonth() + 1;
  const dia = date.getDate();

  try {
    // Primeiro tenta carregar do cache individual
    let liturgia = await loadLiturgiaDate(ano, mes, dia);
    
    if (!liturgia) {
      // Se não encontrou no cache individual, tenta no cache antigo (compatibilidade)
      const dadosMes = await loadLiturgiaMonth(ano, mes);
      if (dadosMes && dadosMes[dia]) {
        liturgia = dadosMes[dia];
        // Migra para cache individual
        await saveLiturgiaDate(ano, mes, dia, liturgia);
      }
    }

    // Se ainda não encontrou, busca do servidor
    if (!liturgia) {
      console.log(`📥 Cache não encontrado, buscando do servidor...`);
      liturgia = await fetchAndStoreDate(ano, mes, dia);
    }

    if (!liturgia) {
      console.warn(`⚠️ Liturgia não encontrada para ${dia}/${mes}/${ano}`);
    }
    return liturgia;
  } catch (error: any) {
    console.error(`❌ Erro ao obter liturgia de ${dia}/${mes}/${ano}:`, error.message || error);
    throw error;
  }
};

export {
  initializeLiturgiaCache,
  getLiturgiaByDate,
  fetchAndStoreMonth,
  loadLiturgiaMonth,
  fetchAndStoreDate,
};
