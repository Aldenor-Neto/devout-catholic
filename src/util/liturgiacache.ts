import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ============================================================
 * Constantes de segurança
 * ============================================================
 */
const CACHE_DAYS = 7;                 // janela deslizante
const MAX_CACHE_SIZE = 200 * 1024;    // 200 KB por dia (proteção de APK)

/**
 * ============================================================
 * Helpers de data e chave
 * ============================================================
 */
const getDateKey = (ano: number, mes: number, dia: number) =>
  `liturgia-${ano}-${mes.toString().padStart(2, '0')}-${dia
    .toString()
    .padStart(2, '0')}`;

const dateToParts = (date: Date) => ({
  ano: date.getFullYear(),
  mes: date.getMonth() + 1,
  dia: date.getDate(),
});

/**
 * ============================================================
 * Cache — salvar (com size guard)
 * ============================================================
 */
const saveLiturgiaDate = async (
  ano: number,
  mes: number,
  dia: number,
  dados: any
) => {
  try {
    const json = JSON.stringify(dados);

    // Proteção contra objetos grandes demais
    if (json.length > MAX_CACHE_SIZE) {
      console.warn('Liturgia grande demais, não cacheada');
      return;
    }

    await AsyncStorage.setItem(getDateKey(ano, mes, dia), json);
  } catch (e) {
    console.warn('Erro ao salvar liturgia no cache:', e);
  }
};

/**
 * ============================================================
 * Cache — carregar
 * ============================================================
 */
const loadLiturgiaDate = async (
  ano: number,
  mes: number,
  dia: number
) => {
  try {
    const raw = await AsyncStorage.getItem(getDateKey(ano, mes, dia));
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Erro ao ler liturgia do cache:', e);
    return null;
  }
};

/**
 * ============================================================
 * Limpeza automática (mantém apenas os últimos 7 dias)
 * ============================================================
 */
const cleanOldCache = async (baseDate: Date) => {
  try {
    const validKeys = new Set<string>();

    for (let i = 0; i < CACHE_DAYS; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const { ano, mes, dia } = dateToParts(d);
      validKeys.add(getDateKey(ano, mes, dia));
    }

    const allKeys = await AsyncStorage.getAllKeys();

    for (const key of allKeys) {
      if (key.startsWith('liturgia-') && !validKeys.has(key)) {
        await AsyncStorage.removeItem(key);
      }
    }
  } catch (e) {
    console.warn('Erro ao limpar cache antigo:', e);
  }
};

/**
 * ============================================================
 * Fetch + cache (1 dia por vez)
 * ============================================================
 */
const fetchAndStoreDate = async (
  ano: number,
  mes: number,
  dia: number
) => {
  try {
    const url = `https://liturgia.up.railway.app/?dia=${dia}&mes=${mes
      .toString()
      .padStart(2, '0')}&ano=${ano}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();

    if (data && Object.keys(data).length > 0) {
      await saveLiturgiaDate(ano, mes, dia, data);
      return data;
    }

    return null;
  } catch (e) {
    console.error(`Erro ao buscar liturgia de ${dia}/${mes}/${ano}:`, e);
    return null;
  }
};

/**
 * ============================================================
 * API pública — usada pelas telas
 * ============================================================
 */
const getLiturgiaByDate = async (date: Date) => {
  const { ano, mes, dia } = dateToParts(date);

  // 1️⃣ tenta cache
  const cached = await loadLiturgiaDate(ano, mes, dia);
  if (cached) return cached;

  // 2️⃣ limpeza controlada
  await cleanOldCache(date);

  // 3️⃣ fetch + cache
  return await fetchAndStoreDate(ano, mes, dia);
};

/**
 * ============================================================
 * Inicialização (mantida por compatibilidade)
 * ============================================================
 */
const initializeLiturgiaCache = async () => {
  // intencionalmente vazio
};

/**
 * ============================================================
 * Exports
 * ============================================================
 */
export {
  getLiturgiaByDate,
  initializeLiturgiaCache,
};
