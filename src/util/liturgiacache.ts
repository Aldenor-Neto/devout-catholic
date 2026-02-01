import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ============================================================
 * Configurações
 * ============================================================
 */
const CACHE_DAYS = 7;
const MAX_CACHE_SIZE = 200 * 1024; // 200 KB
const META_KEY = 'liturgia-week-meta';

/**
 * ============================================================
 * Helpers de data
 * ============================================================
 */
const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const getDayKey = (date: Date) =>
  `liturgia-${formatDate(date)}`;

const dateToParts = (date: Date) => ({
  ano: date.getFullYear(),
  mes: date.getMonth() + 1,
  dia: date.getDate(),
});

/**
 * ============================================================
 * Cache helpers
 * ============================================================
 */
const saveLiturgiaDay = async (date: Date, data: any) => {
  try {
    const json = JSON.stringify(data);
    if (json.length > MAX_CACHE_SIZE) return;
    await AsyncStorage.setItem(getDayKey(date), json);
  } catch {}
};

const loadLiturgiaDay = async (date: Date) => {
  try {
    const raw = await AsyncStorage.getItem(getDayKey(date));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearLiturgiaCache = async () => {
  const keys = await AsyncStorage.getAllKeys();
  const toRemove = keys.filter(
    k => k.startsWith('liturgia-') || k === META_KEY
  );
  if (toRemove.length > 0) {
    await AsyncStorage.multiRemove(toRemove);
  }
};

/**
 * ============================================================
 * Controle da semana cacheada
 * ============================================================
 */
const isDateInCachedWeek = (date: Date, meta: any) => {
  if (!meta?.start || !meta?.end) return false;
  const target = formatDate(date);
  return target >= meta.start && target <= meta.end;
};

/**
 * ============================================================
 * Fetch de UM dia (usado pelo calendário)
 * ============================================================
 */
const fetchSingleDay = async (date: Date) => {
  const { ano, mes, dia } = dateToParts(date);

  try {
    const url = `https://liturgia.up.railway.app/?dia=${dia}&mes=${mes
      .toString()
      .padStart(2, '0')}&ano=${ano}`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data && Object.keys(data).length > 0) {
      await saveLiturgiaDay(date, data);
      return data;
    }
  } catch {}

  return null;
};

/**
 * ============================================================
 * Fetch + cache de UMA SEMANA (somente para o dia atual)
 * ============================================================
 */
const fetchAndStoreWeek = async (startDate: Date) => {
  const start = formatDate(startDate);
  const endDate = addDays(startDate, CACHE_DAYS - 1);
  const end = formatDate(endDate);

  // regra: só limpa ANTES porque estamos conscientemente
  // substituindo a semana ativa
  await clearLiturgiaCache();

  for (let i = 0; i < CACHE_DAYS; i++) {
    const date = addDays(startDate, i);
    await fetchSingleDay(date);
  }

  await AsyncStorage.setItem(
    META_KEY,
    JSON.stringify({ start, end })
  );
};

/**
 * ============================================================
 * API pública
 * ============================================================
 */
const getLiturgiaByDate = async (date: Date) => {
  const today = new Date();
  const isToday =
    formatDate(date) === formatDate(today);

  // 1️⃣ Se já existe o dia no cache, retorna direto
  const cached = await loadLiturgiaDay(date);
  if (cached) return cached;

  // 2️⃣ Se NÃO é hoje (calendário)
  // → não mexe na semana
  if (!isToday) {
    return await fetchSingleDay(date);
  }

  // 3️⃣ Se é HOJE, controla a semana
  const metaRaw = await AsyncStorage.getItem(META_KEY);
  const meta = metaRaw ? JSON.parse(metaRaw) : null;

  if (!isDateInCachedWeek(date, meta)) {
    await fetchAndStoreWeek(date);
  }

  return await loadLiturgiaDay(date);
};

/**
 * ============================================================
 * Inicialização (mantida por compatibilidade)
 * ============================================================
 */
const initializeLiturgiaCache = async () => {
  // propositalmente vazio
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
