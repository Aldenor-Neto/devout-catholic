import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { adicionarNota } from '../../interface/notasData';
import Header from '../../../components/header';

export default function CriarNota() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const router = useRouter();

  const gerarDataAtual = () => {
    const agora = new Date();
    const data = agora.toLocaleDateString('pt-BR');
    const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${data} ${hora}`;
  };

  const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
      if (onOk) onOk();
    } else {
      Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
    }
  };

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web') {
      const result = window.confirm(`${title}\n\n${message}`);
      if (result) onConfirm();
    } else {
      Alert.alert(title, message, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'OK', style: 'destructive', onPress: onConfirm },
      ]);
    }
  };

  const handleCriarNota = async () => {
    if (!titulo || !descricao) {
      showAlert('Erro', 'Preencha todos os campos!');
      return;
    }

    const novaNota = {
      id: Date.now().toString(),
      titulo,
      descricao,
      dataCriacao: gerarDataAtual(),
    };

    try {
      await adicionarNota(novaNota);
      showAlert('Sucesso', 'Nota criada com sucesso!', () =>
        router.push('/screens/anotacoes/anotacoes')
      );
    } catch (error) {
      showAlert('Erro', 'Não foi possível salvar a nota.');
      console.error(error);
    }
  };

  const handleCancelar = () => {
    showConfirm(
      'Cancelar criação',
      'Deseja realmente cancelar a criação da nota?',
      () => router.push('/screens/anotacoes/anotacoes')
    );
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
        <Button title="Criar Nota" onPress={handleCriarNota} color="#1e90ff" />
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
