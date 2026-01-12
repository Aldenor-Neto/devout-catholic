import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

import Header from '../../components/header';
import santosData from '../../assets/data/santos.json'; // importa o JSON

export default function SantoDoDiaScreen() {
  const [santos, setSantos] = useState<any[]>([]);
  const [santosDoDia, setSantosDoDia] = useState<any[]>([]);
  const [santoSelecionado, setSantoSelecionado] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [searchText, setSearchText] = useState('');
  const [filteredSantos, setFilteredSantos] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setSantos(santosData);
    buscarSantoPorData(selectedDate);
  }, []);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  const buscarSantoPorData = (date: Date) => {
    setLoading(true);
    const dataFormatada = formatDate(date);
    const encontrados = santosData.filter((s) => s.data === dataFormatada);
    setSantosDoDia(encontrados);
    setSantoSelecionado(encontrados.length === 1 ? encontrados[0] : null);
    setLoading(false);
  };

  const onDateChange = (event: any, selected?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }
    const currentDate = selected || selectedDate;
    setShowDatePicker(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    buscarSantoPorData(currentDate);
  };

  const onSearchChange = (text: string) => {
    setSearchText(text);
    if (text.trim().length > 0) {
      const results = santos.filter((s) =>
        s.nome.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSantos(results);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selecionarSanto = (santo: any) => {
    setSantoSelecionado(santo);
    setShowSuggestions(false);
    setSearchText(santo.nome);
  };

  const abrirListaCompleta = () => {
    const ordenados = [...santos].sort((a, b) =>
      a.nome.localeCompare(b.nome)
    );
    setSantosDoDia(ordenados);
    setSantoSelecionado(null);
  };

  return (
    <View style={styles.container}>
      <Header />

      {/* Navegação */}
      <View style={styles.navButtonsContainer}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.navButtonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/screens/anotacoes/criarNota')}
        >
          <Text style={styles.navButtonText}>Criar Nota</Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <TextInput
        style={styles.input}
        placeholder="Busque por um santo"
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={onSearchChange}
      />

      {showSuggestions && (
        <FlatList
          data={filteredSantos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => selecionarSanto(item)}
            >
              <Text style={{ color: '#fff' }}>{item.nome}</Text>
            </TouchableOpacity>
          )}
          style={styles.suggestionsList}
        />
      )}

      {/* Botão calendário */}
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.dateButton}
      >
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
        />
      )}

      {/* Botão Lista completa */}
      {/* Conteúdo */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Santo do Dia</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : santoSelecionado ? (
          <View style={styles.meditacaoTexto}>
            <Text selectable style={styles.santoDescricao}>
              {'\n'}
            <Text style={styles.santoNome}>{santoSelecionado.nome}</Text>
            <Text style={styles.santoDescricao}>
              {'\n\n'}
              </Text>
              {santoSelecionado.descricao}
            </Text>
          </View>
        ) : santosDoDia.length > 1 ? (
          santosDoDia.map((santo, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => selecionarSanto(santo)}
            >
              <Text style={{ color: '#fff' }}>{santo.nome}</Text>
            </TouchableOpacity>
          ))
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
  container: { flex: 1, backgroundColor: '#121212', padding: 16 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  santoNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  santoDescricao: { fontSize: 16, color: '#ddd', lineHeight: 22 },
  meditacaoTexto: { marginBottom: 24 },
  placeholderText: { fontSize: 16, color: '#888', textAlign: 'center' },
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
  navButtonText: { color: '#fff', fontSize: 16 },
  dateButton: {
    borderColor: '#fff',
    borderWidth: 2,
    paddingVertical: 12,
    borderRadius: 25,
    marginVertical: 10,
    alignItems: 'center',
  },
  listButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  input: {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  suggestionsList: { maxHeight: 150, backgroundColor: '#222', marginBottom: 10 },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
});
