import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Platform, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

import { Liturgia } from '../interface/liturgiaData';
import Header from '../../components/header';

export default function LiturgiaScreen() {
  const [liturgiaData, setLiturgiaData] = useState<Liturgia | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showOferendas, setShowOferendas] = useState<boolean | null>(null);
  const [showLeituras, setShowLeituras] = useState<boolean | null>(null);
  const [showAntifona, setShowAntifona] = useState<boolean | null>(null);

  const [showDatePickerModal, setShowDatePickerModal] = useState(false); // Controla a exibição do modal de data
  const [selectedDate, setSelectedDate] = useState(new Date()); // Data selecionada

  const router = useRouter();

  const fetchLiturgiaData = async (dia: number, mes: number, ano: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://liturgia.up.railway.app/?dia=${dia}&mes=${mes < 10 ? `0${mes}` : mes}&ano=${ano}`);
      const data: Liturgia = await response.json();
      setLiturgiaData(data);
    } catch (error) {
      console.error('Erro ao buscar dados da Liturgia:', error);
    } finally {
      setLoading(false);
    }
  };

  const showOferendasSection = () => {
    setShowOferendas(true);
    setShowLeituras(false);
    setShowAntifona(false);
  };

  const showLeiturasSection = () => {
    setShowOferendas(false);
    setShowLeituras(true);
    setShowAntifona(false);
  };

  const showAntifonaSection = () => {
    setShowOferendas(false);
    setShowLeituras(false);
    setShowAntifona(true);
  };

  const showDatePicker = () => {
    setShowDatePickerModal(true);
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || new Date();
    setShowDatePickerModal(Platform.OS === 'ios' ? true : false); // Para dispositivos iOS, mantém o modal aberto
    setSelectedDate(currentDate);

    // Pega os valores de dia, mês e ano da data selecionada
    const dia = currentDate.getDate();
    const mes = currentDate.getMonth() + 1; // Meses começam em 0
    const ano = currentDate.getFullYear();

    // Realiza a requisição para a data selecionada
    fetchLiturgiaData(dia, mes, ano);
  };

  useEffect(() => {
    const dia = new Date().getDate();
    const mes = new Date().getMonth() + 1;
    const ano = new Date().getFullYear();
    fetchLiturgiaData(dia, mes, ano);
    showLeiturasSection();
  }, []);

  return (
    <View style={styles.container}>
      <View>
        <Header />
        <Button
          title="Home"
          onPress={() => {
            router.push({
              pathname: '/',
            });
          }}
        />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Liturgia Diária</Text>

        <View style={styles.buttonContainer}>
          {/* Botão "Escolher Data" - Estilo especial */}
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.buttonText}>Escolher Data</Text>
          </TouchableOpacity>

          {/* Outros Botões */}
          <TouchableOpacity style={styles.button} onPress={showOferendasSection}>
            <Text style={styles.buttonText}>Oração do Dia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={showLeiturasSection}>
            <Text style={styles.buttonText}>Leituras do Dia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={showAntifonaSection}>
            <Text style={styles.buttonText}>Antífona</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#fff" />}

        {liturgiaData && !loading && (
          <View style={styles.dataContainer}>
            {showOferendas && (
              <>
                <Text style={styles.liturgiaTitle}>Oração do Dia</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.dia}</Text>
                <Text style={styles.liturgiaTitle}>Oferenda</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.oferendas}</Text>
                <Text style={styles.liturgiaTitle}>Pós-comunhão</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.comunhao}</Text>
              </>
            )}

            {showLeituras && (
              <>
                <Text style={styles.liturgiaTitle}>{liturgiaData.data}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.liturgia}</Text>
                <Text style={styles.liturgiaDetails}>Cor: {liturgiaData.cor}</Text>

                <Text style={styles.liturgiaTitle}>Primeira Leitura</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.primeiraLeitura.referencia}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.primeiraLeitura.titulo}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.primeiraLeitura.texto}</Text>

                <Text style={styles.liturgiaTitle}>Salmo</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.salmo.referencia}</Text>
                <Text style={styles.liturgiaDetails}> Refrão: {liturgiaData.salmo.refrao}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.salmo.texto}</Text>

                {liturgiaData.segundaLeitura !== null && (
                  <>
                    <Text style={styles.liturgiaTitle}>Segunda Leitura</Text>
                    {/* Verificando se a segunda leitura é um objeto, caso seja, acessamos suas propriedades */}
                    {typeof liturgiaData.segundaLeitura === 'object' ? (
                      <>
                        <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura.referencia}</Text>
                        <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura.titulo}</Text>
                        <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura.texto}</Text>
                      </>
                    ) : (
                      <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura}</Text>
                    )}
                  </>
                )}

                <Text style={styles.liturgiaTitle}>Evangelho</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.evangelho.referencia}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.evangelho.titulo}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.evangelho.texto}</Text>
              </>
            )}

            {showAntifona && (
              <>
                <Text style={styles.liturgiaTitle}>Antífona - Entrada</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.antifonas.entrada}</Text>

                <Text style={styles.liturgiaTitle}>Antífona - Ofertório</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.antifonas.ofertorio}</Text>

                <Text style={styles.liturgiaTitle}>Antífona - Comunhão</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.antifonas.comunhao}</Text>
              </>
            )}
          </View>
        )}

        {/* Exibição do DateTimePicker */}
        {showDatePickerModal && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#00BFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  dataContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  liturgiaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  liturgiaDetails: {
    fontSize: 18,
    marginBottom: 5,
    textAlign: 'center',
    color: '#fff',
  },
});
