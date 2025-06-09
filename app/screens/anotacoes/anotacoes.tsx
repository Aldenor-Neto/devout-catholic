import React, { useEffect, useState } from 'react';
import { TextInput } from 'react-native';
import {
  Platform,
  View,
  Text,
  StyleSheet,
  Button,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import Header from '../../../components/header';

const notasData = require('../../../assets/data/notas.json');

interface Anotacao {
  id: number;
  titulo: string;
  descricao: string;
  dataCriacao: string;
}

const STORAGE_KEY = 'anotacoes';

export default function Anotacoes() {
  const [anotacoes, setAnotacoes] = useState<Anotacao[]>([]);
  const [busca, setBusca] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchLocalNotas = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const dados = stored ? JSON.parse(stored) : notasData;
        const dadosOrdenados = [...dados].sort((a, b) =>
          a.titulo.localeCompare(b.titulo)
        );
        setAnotacoes(dadosOrdenados);
      } catch (error) {
        Alert.alert('Erro ao carregar anotações');
      }
    };

    fetchLocalNotas();
  }, []);

  // Salva as anotações no AsyncStorage
  const salvarAnotacoes = async (novasAnotacoes: Anotacao[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(novasAnotacoes));
    } catch (error) {
      Alert.alert('Erro ao salvar alterações');
    }
  };

  const handleVisualizar = (anotacao: Anotacao) => {
    router.push({
      pathname: '/screens/anotacoes/visualizarNota',
      params: {
        titulo: anotacao.titulo,
        descricao: anotacao.descricao,
        dataCriacao: anotacao.dataCriacao,
      },
    });
  };

  const handleEditar = (id: number) => {
    router.push({
      pathname: '/screens/anotacoes/editarNota',
      params: { id },
    });
  };

  const handleExcluir = (id: number) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Deseja excluir a anotação?');
      if (!confirm) return;
      excluirAnotacao(id);
    } else {
      Alert.alert(
        'Confirmar Exclusão',
        'Deseja excluir a anotação?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'OK',
            onPress: () => excluirAnotacao(id),
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const excluirAnotacao = (id: number) => {
    const atualizadas = anotacoes.filter(a => a.id !== id);
    setAnotacoes(atualizadas);
    salvarAnotacoes(atualizadas);
    if (Platform.OS === 'web') {
      alert('Anotação excluída com sucesso!');
    } else {
      Alert.alert('Sucesso', 'Anotação excluída com sucesso!');
    }
  };

  const handleCriarNota = () => {
    router.push('/screens/anotacoes/criarNota');
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.header}>
        <Text style={styles.subtitle}>Minhas Anotações</Text>
        <Button title="Home" onPress={() => router.push('/')} />
      </View>

      <TextInput
        style={styles.inputBusca}
        placeholder="Buscar por título..."
        placeholderTextColor="#888"
        value={busca}
        onChangeText={setBusca}
      />

      <ScrollView style={styles.scrollArea}>
        {anotacoes.length === 0 ? (
          <Text style={styles.mensagem}>Lista de anotações vazia.</Text>
        ) : (
          anotacoes
            .filter(anotacao =>
              anotacao.titulo.toLowerCase().includes(busca.toLowerCase())
            )
            .sort((a, b) => a.titulo.localeCompare(b.titulo))
            .map(anotacao => (
              <View key={anotacao.id} style={styles.anotacaoContainer}>
                <Text style={styles.anotacaoTitulo}>{anotacao.titulo}</Text>
                <View style={styles.botoesContainer}>
                  <Button
                    title="Visualizar"
                    onPress={() => handleVisualizar(anotacao)}
                    color="#1e90ff"
                  />
                  <Button
                    title="Editar"
                    onPress={() => handleEditar(anotacao.id)}
                    color="#ffa500"
                  />
                  <Button
                    title="Excluir"
                    onPress={() => handleExcluir(anotacao.id)}
                    color="#ff4d4d"
                  />
                </View>
              </View>
            ))
        )}
      </ScrollView>

      <View style={styles.rodape}>
        <Button title="Criar Nota" color="#1e90ff" onPress={handleCriarNota} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#121212', // fundo escuro
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF', // texto claro
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    color: '#CCCCCC', // texto um pouco mais suave
  },
  scrollArea: {
    flex: 1,
    marginBottom: 20,
  },
  mensagem: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 32,
    color: '#AAAAAA', // texto secundário
  },
  anotacaoContainer: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#444', // borda mais escura
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#1E1E1E', // fundo do cartão escuro
  },
  anotacaoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FFFFFF', // título claro
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rodape: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#333', // borda do rodapé escura
  },
    inputBusca: {
    backgroundColor: '#1E1E1E',
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    marginBottom: 10,
    fontSize: 16,
  },
});
