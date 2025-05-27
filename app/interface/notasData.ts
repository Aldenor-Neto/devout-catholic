import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'anotacoes';

export interface Anotacao {
  id: string;
  titulo: string;
  descricao: string;
  dataCriacao: string;
}

export const adicionarNota = async (novaNota: Anotacao) => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const anotacoes = stored ? JSON.parse(stored) : [];
    anotacoes.push(novaNota);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(anotacoes));
  } catch (error) {
    throw new Error('Erro ao adicionar nota');
  }
};

export const buscarNotaPorId = async (id: string): Promise<Anotacao | undefined> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const anotacoes: Anotacao[] = stored ? JSON.parse(stored) : [];
    return anotacoes.find(anotacao => anotacao.id === id);
  } catch (error) {
    throw new Error('Erro ao buscar nota');
  }
};

export const atualizarNota = async (notaAtualizada: Anotacao) => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    const anotacoes: Anotacao[] = stored ? JSON.parse(stored) : [];

    const novasAnotacoes = anotacoes.map(anotacao =>
      anotacao.id === notaAtualizada.id ? notaAtualizada : anotacao
    );

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novasAnotacoes));
  } catch (error) {
    throw new Error('Erro ao atualizar nota');
  }
};
