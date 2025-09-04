import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { generateReflection } from '../../app/util/gemini';
import { formatarReflexao } from '../util/formatarReflexao';

import Header from '../../components/header';
import { Liturgia } from '../interface/liturgiaData';
import { initializeLiturgiaCache, getLiturgiaByDate, fetchAndStoreMonth } from '../util/liturgiacache';
import { AppState } from 'react-native';

export default function LiturgiaScreen() {
  const [liturgiaData, setLiturgiaData] = useState<Liturgia | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<'oferendas' | 'leituras' | 'antifona'>('leituras');
  const [reflexoes, setReflexoes] = useState<{ [key: string]: string }>({});
  const [gerandoReflexao, setGerandoReflexao] = useState<string | null>(null);

  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const router = useRouter();

  const showSection = (section: 'oferendas' | 'leituras' | 'antifona') => setCurrentSection(section);

  const showDatePicker = () => setShowDatePickerModal(true);

  const onDateChange = async (event: any, date?: Date) => {
    const currentDate = date || selectedDate;
    setShowDatePickerModal(Platform.OS === 'ios');
    setSelectedDate(currentDate);
    setReflexoes({});
    setLoading(true);
    const liturgia = await getLiturgiaByDate(currentDate);
    setLiturgiaData(liturgia);
    setLoading(false);
  };

  useEffect(() => {
    let currentMonth = new Date().getMonth();

    const init = async () => {
      setLoading(true);

      await initializeLiturgiaCache();

      const today = new Date();
      const liturgiaHoje = await getLiturgiaByDate(today);
      setLiturgiaData(liturgiaHoje);
      setLoading(false);

      const fetchMonthIfNotCached = async (year: number, month: number) => {
        const d = new Date(year, month - 1, 1);
        const cached = await getLiturgiaByDate(d);
        if (!cached) {
          fetchAndStoreMonth(year, month); // fire-and-forget
        }
      };

      const preloadNextMonths = () => {
        const monthsToPreload = [1, 2];
        monthsToPreload.forEach(async (offset) => {
          const d = new Date(today.getFullYear(), today.getMonth() + offset, 1);
          const year = d.getFullYear();
          const month = d.getMonth() + 1;
          fetchMonthIfNotCached(year, month);
        });
      };

      preloadNextMonths();

      // Listener para detectar quando o app volta para foreground
      const subscription = AppState.addEventListener('change', async (state) => {
        if (state === 'active') {
          const now = new Date();
          const newMonth = now.getMonth();
          if (newMonth !== currentMonth) {
            // mês mudou, atualiza currentMonth e faz preload
            currentMonth = newMonth;
            const liturgiaHoje = await getLiturgiaByDate(now);
            setLiturgiaData(liturgiaHoje);
            preloadNextMonths();
          }
        }
      });

      return () => {
        subscription.remove();
      };
    };

    init();
  }, []);
  const handleGerarReflexao = async (texto: string, id: string) => {
    setGerandoReflexao(id);
    try {
      const reflexao = await generateReflection(texto);
      setReflexoes((prev) => ({ ...prev, [id]: reflexao }));
    } catch (error) {
      console.error('Erro ao gerar reflexão:', error);
      setReflexoes((prev) => ({ ...prev, [id]: 'Erro ao gerar reflexão.' }));
    } finally {
      setGerandoReflexao(null);
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.subHeaderButtons}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/' })} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push({ pathname: '/screens/anotacoes/criarNota' })} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Criar nota</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Liturgia Diária</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.buttonText}>Escolher Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => showSection('oferendas')}>
            <Text style={styles.buttonText}>Oração do Dia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => showSection('leituras')}>
            <Text style={styles.buttonText}>Leituras do Dia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => showSection('antifona')}>
            <Text style={styles.buttonText}>Antífona</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#fff" />}

        {liturgiaData && !loading && (
          <View style={styles.dataContainer}>
            {currentSection === 'oferendas' && (
              <>
                <Text style={styles.liturgiaTitle}>Oração do Dia</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.dia}</Text>
                <Text style={styles.liturgiaTitle}>Oferenda</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.oferendas}</Text>
                <Text style={styles.liturgiaTitle}>Pós-comunhão</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.comunhao}</Text>
              </>
            )}

            {currentSection === 'leituras' && (
              <>
                <Text style={styles.liturgiaTitle}>{liturgiaData.data}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.liturgia}</Text>
                <Text style={styles.liturgiaDetails}>Cor: {liturgiaData.cor}</Text>

                <Text style={styles.liturgiaTitle}>1ª Leitura</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.primeiraLeitura.referencia}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.primeiraLeitura.titulo}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.primeiraLeitura.texto}</Text>

                <TouchableOpacity
                  style={styles.reflexaoButton}
                  onPress={() => handleGerarReflexao("qual a reflexão do trecho biblico " + liturgiaData.primeiraLeitura.texto, 'primeira')}
                >
                  <Text style={styles.buttonText}>
                    {gerandoReflexao === 'primeira' ? 'Gerando reflexão...' : 'Reflexão da 1ª leitura'}
                  </Text>
                </TouchableOpacity>

                {reflexoes['primeira'] && <View style={styles.reflexaoContainer}>{formatarReflexao(reflexoes['primeira'])}</View>}

                <Text style={styles.liturgiaTitle}>Salmo</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.salmo.referencia}</Text>
                <Text style={styles.liturgiaDetails}> Refrão: {liturgiaData.salmo.refrao}</Text>
                <Text style={styles.liturgiaDetails}>{liturgiaData.salmo.texto}</Text>

                <TouchableOpacity
                  style={styles.reflexaoButton}
                  onPress={() => handleGerarReflexao("qual a reflexão do trecho biblico " + liturgiaData.salmo.texto, 'salmo')}
                >
                  <Text style={styles.buttonText}>
                    {gerandoReflexao === 'salmo' ? 'Gerando reflexão...' : 'Reflexão do salmo'}
                  </Text>
                </TouchableOpacity>

                {reflexoes['salmo'] && <View style={styles.reflexaoContainer}>{formatarReflexao(reflexoes['salmo'])}</View>}

                {liturgiaData.segundaLeitura && (
                  <>
                    <Text style={styles.liturgiaTitle}>Segunda Leitura</Text>
                    {typeof liturgiaData.segundaLeitura === 'object' ? (
                      <>
                        <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura.referencia}</Text>
                        <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura.titulo}</Text>
                        <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura.texto}</Text>

                        <TouchableOpacity
                          style={styles.reflexaoButton}
                          onPress={() =>
                            handleGerarReflexao("qual a reflexão do trecho biblico " + liturgiaData.segundaLeitura.texto, 'segunda')
                          }
                        >
                          <Text style={styles.buttonText}>
                            {gerandoReflexao === 'segunda' ? 'Gerando reflexão...' : 'Reflexão da 2ª leitura'}
                          </Text>
                        </TouchableOpacity>

                        {reflexoes['segunda'] && <View style={styles.reflexaoContainer}>{formatarReflexao(reflexoes['segunda'])}</View>}
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

                <TouchableOpacity
                  style={styles.reflexaoButton}
                  onPress={() => handleGerarReflexao("qual a reflexão do trecho biblico " + liturgiaData.evangelho.texto, 'evangelho')}
                >
                  <Text style={styles.buttonText}>
                    {gerandoReflexao === 'evangelho' ? 'Gerando reflexão...' : 'Reflexão do evangelho'}
                  </Text>
                </TouchableOpacity>

                {reflexoes['evangelho'] && <View style={styles.reflexaoContainer}>{formatarReflexao(reflexoes['evangelho'])}</View>}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    const segundaLeituraRef =
                      liturgiaData.segundaLeitura && typeof liturgiaData.segundaLeitura === 'object'
                        ? liturgiaData.segundaLeitura.referencia
                        : liturgiaData.segundaLeitura || '';

                    handleGerarReflexao(
                      "qual a ligação entre os trechos biblicos " +
                      liturgiaData.primeiraLeitura.referencia +
                      liturgiaData.salmo.referencia +
                      segundaLeituraRef +
                      liturgiaData.evangelho.referencia,
                      'liturgia'
                    );
                  }}
                >
                  <Text style={styles.buttonText}>
                    {gerandoReflexao === 'liturgia' ? 'Gerando reflexão...' : 'Reflexão da Liturgia'}
                  </Text>
                </TouchableOpacity>

                {reflexoes['liturgia'] && <View style={styles.reflexaoContainer}>{formatarReflexao(reflexoes['liturgia'])}</View>}
              </>
            )}

            {currentSection === 'antifona' && (
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

        {showDatePickerModal && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date(2020, 0, 1)}
            maximumDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#000' },
  title: { fontSize: 36, fontWeight: 'bold', marginBottom: 20, color: '#fff', textAlign: 'center' },
  buttonContainer: { marginBottom: 20 },
  button: { backgroundColor: '#00BFFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, marginVertical: 10, justifyContent: 'center', alignItems: 'center' },
  dateButton: { borderColor: '#fff', borderWidth: 2, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, marginVertical: 10, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  dataContainer: { marginTop: 20, alignItems: 'center', width: '100%' },
  liturgiaTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#fff' },
  liturgiaDetails: { fontSize: 18, marginBottom: 5, textAlign: 'center', color: '#fff' },
  reflexaoButton: { backgroundColor: '#228B22', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginTop: 10, alignItems: 'center' },
  subHeaderButtons: { flexDirection: 'row', gap: 10 },
  headerButton: { backgroundColor: '#333', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5, marginLeft: 10 },
  headerButtonText: { color: '#fff', fontSize: 14 },
  reflexaoContainer: { marginVertical: 10, paddingHorizontal: 20, width: '100%' },
});
