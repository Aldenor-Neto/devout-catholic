import React, { useState, useEffect } from 'react';
import { TextInput } from 'react-native';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

import Header from '../../components/header';
import { generateReflection } from '../util/gemini';
import { formatarReflexao } from '../util/formatarReflexao';

export default function SantoDoDiaScreen() {
  const [santo, setSanto] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>(''); // Novo estado

  const router = useRouter();

  const formatDateForPrompt = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const gerarSanto = async (data: Date, textoBusca: string = '') => {
    setLoading(true);
    setSanto(null);

    let frasePrompt = '';

    if (textoBusca.trim() !== '') {
      frasePrompt = `fale sobre a historia e a devoção ao santo ${textoBusca.trim()}`;
    } else {
      const dataFormatada = formatDateForPrompt(data);
      frasePrompt = `o que é celebrado no dia ${dataFormatada} pela igreja católica apostólica romana? qual o santo para essa data? qual a sua história?`;
    }

    try {
      const resposta = await generateReflection(frasePrompt);
      setSanto(resposta);
    } catch (error) {
      console.error('Erro ao buscar santo do dia:', error);
      setSanto('Erro ao buscar santo do dia. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selected?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    const currentDate = selected || selectedDate;
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    gerarSanto(currentDate, searchText);
  };

  const onSearchSubmit = () => {
    gerarSanto(selectedDate, searchText);
  };

  useEffect(() => {
    gerarSanto(selectedDate);
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

      <TextInput
        style={styles.input}
        placeholder="Busque por um santo"
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={onSearchSubmit}
        returnKeyType="search"
      />

      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
        <Text style={styles.buttonText}>
          Selecionar Data: {selectedDate.toLocaleDateString('pt-BR')}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          onChange={onDateChange}
          maximumDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
        />
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Santo do Dia</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : santo ? (
          <View style={styles.meditacaoTexto}>
            {formatarReflexao(santo || '')}
          </View>
        ) : (
          <Text style={styles.placeholderText}>
            Selecione uma data ou digite o nome de um santo para descobrir mais.
          </Text>
        )}
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
    marginBottom: 24,
    alignSelf: 'stretch', // garante que ocupe a largura disponível
    paddingHorizontal: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 8,
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
  dateButton: {
    borderColor: '#fff',
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 16,
  },

});
