import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Button } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/header';
import { generateReflection } from '../util/gemini';
import { formatarReflexao } from '../util/formatarReflexao';

export default function MeditacoesScreen() {
  const [meditacao, setMeditacao] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const frasePrompt = 'gere um texto motivacional com fundamentação biblica';

  const handleGerarMeditacao = async () => {
    setLoading(true);
    setMeditacao(null);

    try {
      const resposta = await generateReflection(frasePrompt);
      setMeditacao(resposta);
    } catch (error) {
      console.error('Erro ao gerar meditação:', error);
      setMeditacao('Erro ao gerar meditação. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Gera a meditação automaticamente ao carregar a tela
  useEffect(() => {
    handleGerarMeditacao();
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
    <View style={styles.meditacaoTexto}>
      {formatarReflexao(meditacao)}
    </View>
  ) : (
    <Text style={styles.placeholderText}>
      Pressione o botão abaixo para gerar uma meditação motivacional inspirada nos santos da Igreja Católica.
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
