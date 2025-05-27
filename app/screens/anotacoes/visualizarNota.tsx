import React from 'react';
import { View, Text, StyleSheet, Button, Alert, Platform } from 'react-native';

import Header  from '../../../components/header';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function VisualizarNota() {
  const { titulo, descricao, dataCriacao, id } = useLocalSearchParams();
  const router = useRouter();

  const handleVoltar = () => {
    router.back();
  };

  const handleEditar = () => {
    router.push({
      pathname: '/screens/anotacoes/editarNota',
      params: { id },
    });
  };

  const handleExcluir = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Deseja excluir a anotação?');
      if (!confirm) return;
      confirmarExclusao();
    } else {
      Alert.alert(
        'Confirmar Exclusão',
        'Deseja excluir a anotação?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', onPress: confirmarExclusao, style: 'destructive' },
        ],
        { cancelable: true }
      );
    }
  };

  const confirmarExclusao = () => {
    // Aqui você pode implementar persistência se necessário
    Alert.alert('Sucesso', 'Anotação excluída com sucesso!');
    router.back();
  };

  return (
    <View style={styles.container}>
        <Header/>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.data}>Criado em: {dataCriacao}</Text>
      <Text style={styles.descricao}>{descricao}</Text>

      <View style={styles.botoesContainer}>
        <Button title="Editar" onPress={handleEditar} color="#ffa500" />
        <Button title="Excluir" onPress={handleExcluir} color="#ff4d4d" />
        <Button title="Voltar" onPress={handleVoltar} color="#1e90ff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  data: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  descricao: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 40,
  },
  botoesContainer: {
    gap: 12,
  },
});
