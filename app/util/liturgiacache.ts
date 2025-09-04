import AsyncStorage from '@react-native-async-storage/async-storage';
import { addMonths } from 'date-fns';

// 🔹 Monta a chave única para um mês
const getMonthKey = (ano: number, mes: number) =>
  `liturgia-${ano}-${mes.toString().padStart(2, '0')}`;

// 🔹 Salva um mês no cache
const saveLiturgiaMonth = async (ano: number, mes: number, dados: any) => {
  const key = getMonthKey(ano, mes);
  await AsyncStorage.setItem(key, JSON.stringify(dados));
};

// 🔹 Carrega um mês do cache
const loadLiturgiaMonth = async (ano: number, mes: number) => {
  const key = getMonthKey(ano, mes);
  const json = await AsyncStorage.getItem(key);
  return json ? JSON.parse(json) : null;
};

// 🔹 Baixa todas as liturgias de um mês e salva
const fetchAndStoreMonth = async (ano: number, mes: number) => {
  let dadosMes: any = {};
  const diasNoMes = new Date(ano, mes, 0).getDate();

  for (let dia = 1; dia <= diasNoMes; dia++) {
    try {
      const response = await fetch(
        `https://liturgia.up.railway.app/?dia=${dia}&mes=${mes
          .toString()
          .padStart(2, '0')}&ano=${ano}`
      );
      const data = await response.json();
      dadosMes[dia] = data;
    } catch (e) {
      console.error(`Erro ao buscar liturgia de ${dia}/${mes}/${ano}:`, e);
    }
  }

  await saveLiturgiaMonth(ano, mes, dadosMes);
  return dadosMes;
};

// 🔹 Inicializa cache (2 meses antes, atual e 2 meses depois)
const initializeLiturgiaCache = async () => {
  const hoje = new Date();
  const meses = [
    addMonths(hoje, -2),
    addMonths(hoje, -1),
    hoje,
    addMonths(hoje, 1),
    addMonths(hoje, 2),
  ];

  for (let mesDate of meses) {
    const ano = mesDate.getFullYear();
    const mes = mesDate.getMonth() + 1;
    const dados = await loadLiturgiaMonth(ano, mes);

    if (!dados) {
      console.log(`📥 Baixando liturgia de ${mes}/${ano}`);
      await fetchAndStoreMonth(ano, mes);
    }
  }

  // Se hoje é dia 1 → remove o mês mais antigo e baixa o novo
  if (hoje.getDate() === 1) {
    const mesAntigo = addMonths(hoje, -3);
    await AsyncStorage.removeItem(
      getMonthKey(mesAntigo.getFullYear(), mesAntigo.getMonth() + 1)
    );

    const mesNovo = addMonths(hoje, 3);
    await fetchAndStoreMonth(mesNovo.getFullYear(), mesNovo.getMonth() + 1);
  }
};

// 🔹 Retorna a liturgia de uma data
const getLiturgiaByDate = async (date: Date) => {
  const ano = date.getFullYear();
  const mes = date.getMonth() + 1;
  const dia = date.getDate();

  let dadosMes = await loadLiturgiaMonth(ano, mes);
  if (!dadosMes) {
    dadosMes = await fetchAndStoreMonth(ano, mes);
  }

  return dadosMes[dia] || null;
};

export {
  initializeLiturgiaCache,
  getLiturgiaByDate,
  fetchAndStoreMonth,
  loadLiturgiaMonth,
};
