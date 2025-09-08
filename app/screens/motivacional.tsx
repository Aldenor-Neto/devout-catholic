import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../../components/header';

import motivacionalData from '../../assets/data/motivacional.json';

export default function MeditacoesScreen() {
  const [meditacaoIndex, setMeditacaoIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Recupera o item atual
  const meditacao = motivacionalData[meditacaoIndex];

  const handleGerarMeditacao = async () => {
    setLoading(true);

    // Simula um pequeno delay só para manter o feedback visual
    setTimeout(() => {
      setMeditacaoIndex((prevIndex) => (prevIndex + 1) % motivacionalData.length);
      setLoading(false);
    }, 300);
  };

  // Carrega a primeira meditação automaticamente ao abrir a tela
  useEffect(() => {
    setMeditacaoIndex(0);
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
            <Text style={styles.meditacaoTitulo}>{meditacao.titulo}</Text>
            <Text style={styles.meditacaoTexto}>{meditacao.descricao}</Text>
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
