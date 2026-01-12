import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/header';

import motivacionalData from '../../assets/data/motivacional.json';

export default function MeditacoesScreen() {
  const [meditacao, setMeditacao] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Escolher aleatória sem repetição
  const escolherMeditacao = async () => {
    let usadosRaw = await AsyncStorage.getItem("motivacionaisUsados");
    let usados: number[] = usadosRaw ? JSON.parse(usadosRaw) : [];

    // Reinicia ciclo se todas já foram usadas
    if (usados.length >= motivacionalData.length) {
      usados = [];
    }

    // Filtra disponíveis
    const disponiveis = motivacionalData
      .map((item, idx) => ({ ...item, idx }))
      .filter((item) => !usados.includes(item.idx));

    // Escolhe aleatória
    const randomIndex = Math.floor(Math.random() * disponiveis.length);
    const escolhido = disponiveis[randomIndex];

    // Atualiza histórico
    usados.push(escolhido.idx);
    await AsyncStorage.setItem("motivacionaisUsados", JSON.stringify(usados));

    return escolhido;
  };

  // Recuperar ou gerar a meditação do dia
  const getMeditacaoDoDia = async () => {
    const hoje = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const salvo = await AsyncStorage.getItem("motivacionalHoje");
    if (salvo) {
      const { data, meditacao } = JSON.parse(salvo);
      if (data === hoje) {
        return meditacao; // já existe para hoje
      }
    }

    // se não existe ou é de outro dia → escolhe nova
    const nova = await escolherMeditacao();
    await AsyncStorage.setItem("motivacionalHoje", JSON.stringify({ data: hoje, meditacao: nova }));
    return nova;
  };

  // Botão: gera nova e redefine como meditação do dia
  const handleGerarMeditacao = async () => {
    setLoading(true);
    setTimeout(async () => {
      const hoje = new Date().toISOString().split("T")[0];
      const nova = await escolherMeditacao();
      await AsyncStorage.setItem("motivacionalHoje", JSON.stringify({ data: hoje, meditacao: nova }));
      setMeditacao(nova);
      setLoading(false);
    }, 300);
  };

  // Carregar automaticamente na abertura da tela
  useEffect(() => {
    async function carregar() {
      const med = await getMeditacaoDoDia();
      setMeditacao(med);
    }
    carregar();
  }, []);

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.navButtonsContainer}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/')}>
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/screens/anotacoes/criarNota')}>
          <Text style={styles.navButtonText}>Criar Nota</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Meditação do Dia</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : meditacao ? (
          <View>
            <Text selectable style={styles.meditacaoTexto}>
            <Text style={styles.meditacaoTitulo}>{meditacao.titulo}</Text>
            <Text style={styles.meditacaoTexto}>{meditacao.descricao}</Text>
            </Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>
            Nenhuma meditação disponível no momento.
          </Text>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleGerarMeditacao}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Gerar Nova Meditação</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  meditacaoTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 10,
    textAlign: 'center',
  },
  meditacaoTexto: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 24,
    textAlign: 'justify',
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  navButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#1e1e1e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
