import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { buscarNotaPorId, atualizarNota } from '../../../src/interface/notasData';
import Header from '../../../components/header';

export default function EditarNota() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataCriacao, setDataCriacao] = useState('');
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const carregarNota = async () => {
      try {
        const nota = await buscarNotaPorId(id);
        if (nota) {
          setTitulo(nota.titulo);
          setDescricao(nota.descricao);
          setDataCriacao(nota.dataCriacao); // preservar data original
        } else {
          showAlert('Erro', 'Nota não encontrada.', () => router.back());
        }
      } catch (error) {
        showAlert('Erro', 'Erro ao carregar a nota.', () => router.back());
      }
    };
    carregarNota();
  }, [id]);

  const showAlert = (title, message, onOk) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
      if (onOk) onOk();
    } else {
      Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
    }
  };

  const handleAtualizarNota = async () => {
    if (!titulo || !descricao) {
      showAlert('Erro', 'Preencha todos os campos!');
      return;
    }

    const notaAtualizada = {
      id: id.toString(),
      titulo,
      descricao,
      dataCriacao, // preserva a data de criação
    };

    try {
      await atualizarNota(notaAtualizada);
      showAlert('Sucesso', 'Nota atualizada com sucesso!', () =>
        router.push('/screens/anotacoes/anotacoes')
      );
    } catch (error) {
      showAlert('Erro', 'Erro ao atualizar a nota.');
      console.error(error);
    }
  };

  const handleCancelar = () => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm('Deseja cancelar a edição da nota?');
      if (confirmar) router.push('/screens/anotacoes/anotacoes');
    } else {
      Alert.alert('Cancelar edição', 'Deseja cancelar a edição da nota?', [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => router.push('/screens/anotacoes/anotacoes') },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.label}>Título</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite o título"
        placeholderTextColor="#888"
        value={titulo}
        onChangeText={setTitulo}
      />
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Digite a descrição"
        placeholderTextColor="#888"
        multiline
        value={descricao}
        onChangeText={setDescricao}
      />
      <View style={styles.botoes}>
        <Button title="Atualizar Nota" onPress={handleAtualizarNota} color="#1e90ff" />
        <Button title="Cancelar" onPress={handleCancelar} color="#ff4d4d" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  label: { color: '#fff', fontSize: 18, marginBottom: 8 },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
});
