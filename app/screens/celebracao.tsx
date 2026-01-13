import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Platform, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Liturgia } from '../interface/liturgiaData';
import Header from '../../components/header';
import Accordion from '../components/Accordion';
import { initializeLiturgiaCache, getLiturgiaByDate } from '../util/liturgiacache';


export default function CelebracaoScreen() {
  const [liturgiaData, setLiturgiaData] = useState<Liturgia | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const router = useRouter();

const fetchLiturgiaData = async (date: Date) => {
  setLoading(true);
  setError(null);
  try {
    const liturgia = await getLiturgiaByDate(date);
    if (liturgia) {
      setLiturgiaData(liturgia);
    } else {
      setError('Não foi possível carregar a liturgia para esta data. Verifique sua conexão com a internet.');
    }
  } catch (error: any) {
    console.error('Erro ao buscar dados da Liturgia:', error);
    setError(error.message || 'Erro ao carregar a liturgia. Verifique sua conexão com a internet.');
    setLiturgiaData(null);
  } finally {
    setLoading(false);
  }
};

  const showDatePicker = () => {
    setShowDatePickerModal(true);
  };

const onDateChange = (event: any, date?: Date) => {
  const currentDate = date || selectedDate;
  setShowDatePickerModal(Platform.OS === 'ios');
  setSelectedDate(currentDate);
  fetchLiturgiaData(currentDate);
};

useEffect(() => {
  const init = async () => {
    setLoading(true);
    setError(null);
    try {
      await initializeLiturgiaCache(); // garante que o cache exista
      const today = new Date();
      const liturgiaHoje = await getLiturgiaByDate(today);
      if (liturgiaHoje) {
        setLiturgiaData(liturgiaHoje);
      } else {
        setError('Não foi possível carregar a liturgia de hoje. Verifique sua conexão com a internet.');
      }
    } catch (error: any) {
      console.error('Erro ao inicializar liturgia:', error);
      setError(error.message || 'Erro ao carregar a liturgia. Verifique sua conexão com a internet.');
    } finally {
      setLoading(false);
    }
  };
  init();
}, []);

  return (
    <View style={styles.container}>
      <View>
        <Header />
        <View style={styles.subHeaderButtons}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/' })} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push({ pathname: '/screens/anotacoes/criarNota' })} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Criar nota</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Celebração da palavra</Text>

        <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
          <Text style={styles.buttonText}>Escolher Data</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#fff" />}

        {error && !loading && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={async () => {
                setError(null);
                setLoading(true);
                try {
                  await initializeLiturgiaCache();
                  const today = new Date();
                  const liturgiaHoje = await getLiturgiaByDate(today);
                  if (liturgiaHoje) {
                    setLiturgiaData(liturgiaHoje);
                  } else {
                    setError('Não foi possível carregar a liturgia. Verifique sua conexão com a internet.');
                  }
                } catch (err: any) {
                  setError(err.message || 'Erro ao carregar a liturgia. Verifique sua conexão com a internet.');
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.buttonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        )}

        {liturgiaData && !loading && !error && (
          <View style={styles.dataContainer}>
            <Text style={styles.liturgiaTitle}>{liturgiaData.data}</Text>
            <Text style={styles.liturgiaDetails}>{liturgiaData.liturgia}</Text>
            <Text style={styles.liturgiaDetails}>Cor: {liturgiaData.cor}</Text>

            <Accordion title="Introdução">
              <Text style={styles.liturgiaDetails}>
                A Eucaristia é a celebração mais plena e mais apropriada do Dia do Senhor, mas a escassez de ministros ordenados leva muitas comunidades a se reunirem no domingo, encontrando no tesouro da tradição litúrgica a celebração da Palavra para alimento da sua fé. A Palavra é celebrada como evento pascal, pela ação íntima do Espírito Santo que a torna operante no coração dos fiéis.
              </Text>
              <Text style={styles.liturgiaDetails}>
                De fato, quando nos reunimos como irmãos e irmãs, temos a oportunidade de renovar a nossa fé e esperança em Cristo Ressuscitado, e dessa forma, podemos levar a sua graça a todos aqueles que carecem dessa experiência de amor.
              </Text>
              <Text style={styles.quote}>
                "Senhor, fazei de mim instrumento da vossa paz",{'\n'}
                como disse nosso querido São Francisco das Chagas,{'\n'}
                precisamos desejar ser esse instrumento de paz e amor a cada dia.
              </Text>
              <Text style={styles.liturgiaDetails}>
                O presente subsídio é destinado a quem preside a celebração. Tomando como base o rito do domingo ou festa correspondente, deverá ser localizado no lecionário dominical ou na Bíblia as respectivas leituras.
              </Text>
              <Text style={styles.liturgiaDetails}>
                Que essa alegria e o desejo de servir ao Senhor esteja sempre presente em suas vidas.
              </Text>
              <Text style={styles.signature}>
                Unidos em Cristo,{'\n'}
                Pe. Marcílio Gomes
              </Text>
            </Accordion>

            <Accordion title="Rito Inicial">
              <Text style={styles.subsectionTitle}>Saudação Inicial</Text>
              <Text style={styles.liturgiaDetails}>M.: Em nome do Pai e do Filho e do Espírito Santo.</Text>
              <Text style={styles.liturgiaDetails}>T.: Amém.</Text>
              <Text style={styles.liturgiaDetails}>M.: Irmãos e irmãos, bendizei a Deus que em sua bondade nos convida para a mesa da Palavra e do Corpo de Cristo.</Text>
              <Text style={styles.liturgiaDetails}>T.: Bendito seja Deus para sempre.</Text>

              <Text style={styles.subsectionTitle}>Ato Penitencial</Text>
              <Text style={styles.liturgiaDetails}>M.: Irmãos e irmãs, reconheçamos os nossos pecados, para participarmos dignamente desta santa Celebração.</Text>
              <Text style={styles.liturgiaDetails}>(momento de silêncio)</Text>
              <Text style={styles.liturgiaDetails}>T.: Confesso a Deus todo-poderoso e a vós, irmãos e irmãs, que pequei muitas vezes por pensamentos e palavras, atos e omissões, por minha culpa, minha culpa, minha tão grande culpa. E peço à Virgem Maria, aos anjos e santos e a vós, irmãos e irmãs, que rogueis por mim a Deus, nosso Senhor.</Text>
              <Text style={styles.liturgiaDetails}>M.: Deus todo-poderoso tenha compaixão de nós, perdoe os nossos pecados e nos conduza à vida eterna.</Text>
              <Text style={styles.liturgiaDetails}>T.: Amém.</Text>

              <Text style={styles.subsectionTitle}>OU:</Text>
              <Text style={styles.liturgiaDetails}>M.: Senhor, que viestes salvar os corações arrependidos, tende piedade de nós.</Text>
              <Text style={styles.liturgiaDetails}>T.: Senhor, tende piedade de nós.</Text>
              <Text style={styles.liturgiaDetails}>M.: Senhor, que viestes chamar os pecadores, tende piedade de nós.</Text>
              <Text style={styles.liturgiaDetails}>T.: Cristo, tende piedade de nós.</Text>
              <Text style={styles.liturgiaDetails}>M.: Senhor, que intercedeis por nós junto do Pai, tende piedade de nós.</Text>
              <Text style={styles.liturgiaDetails}>T.: Senhor, tende piedade de nós.</Text>
              <Text style={styles.liturgiaDetails}>M.: Deus todo-poderoso tenha compaixão de nós, perdoe os nossos pecados e nos conduza à vida eterna.</Text>
              <Text style={styles.liturgiaDetails}>T.: Amém.</Text>

              <Text style={styles.subsectionTitle}>Hino do Glória</Text>
              <Text style={styles.liturgiaDetails}>
                Glória a Deus nas alturas, e paz na terra aos homens por Ele amados.{'\n'}
                Senhor Deus, Rei dos Céus, Deus Pai Todo-Poderoso, nós Vos louvamos,{'\n'}
                nós Vos bendizemos, nós Vos adoramos, nós Vos glorificamos,{'\n'}
                nós Vos damos graças, por Vossa imensa glória.{'\n'}
                Senhor Jesus Cristo, Filho Unigênito, Senhor Deus, Cordeiro de Deus, Filho de Deus Pai:{'\n'}
                Vós que tirais o pecado do mundo, tende piedade de nós;{'\n'}
                Vós que tirais o pecado do mundo, acolhei a nossa súplica;{'\n'}
                Vós que estais à direita do Pai, tende piedade de nós.{'\n'}
                Só Vós sois o Santo; só Vós, o Senhor; só Vós, o Altíssimo, Jesus Cristo;{'\n'}
                com o Espírito Santo, na glória de Deus Pai. Amém!
              </Text>

              <Text style={styles.subsectionTitle}>Oração do Dia</Text>
              <Text style={styles.liturgiaDetails}>{liturgiaData.dia}</Text>
            </Accordion>

            <Accordion title="Liturgia da Palavra">
              <Text style={styles.subsectionTitle}>Invocação ao Espírito Santo</Text>
              <Text style={styles.liturgiaDetails}>
                Mandai o vosso Espírito Santo Paráclito aos nossos corações{'\n'}
                e fazei-nos compreender as Escrituras por ele inspiradas.
              </Text>

              <Text style={styles.sectionTitle}>Primeira Leitura</Text>
              <Text style={styles.liturgiaDetails}>{liturgiaData.primeiraLeitura.referencia}</Text>
              <Text style={styles.liturgiaDetails}>{liturgiaData.primeiraLeitura.titulo}</Text>
              <Text style={styles.liturgiaDetails}>{liturgiaData.primeiraLeitura.texto}</Text>

              <Text style={styles.sectionTitle}>Salmo Responsorial</Text>
              <Text style={styles.liturgiaDetails}>{liturgiaData.salmo.referencia}</Text>
              <Text style={styles.liturgiaDetails}>Refrão: {liturgiaData.salmo.refrao}</Text>
              <Text style={styles.liturgiaDetails}>{liturgiaData.salmo.texto}</Text>

              {typeof liturgiaData.segundaLeitura === 'object' && (
                <>
                  <Text style={styles.sectionTitle}>Segunda Leitura</Text>
                  <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura.referencia}</Text>
                  <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura.titulo}</Text>
                  <Text style={styles.liturgiaDetails}>{liturgiaData.segundaLeitura.texto}</Text>
                </>
              )}

              <Text style={styles.sectionTitle}>Evangelho</Text>
              <Text style={styles.liturgiaDetails}>{liturgiaData.evangelho.referencia}</Text>
              <Text style={styles.liturgiaDetails}>{liturgiaData.evangelho.titulo}</Text>
              <Text style={styles.liturgiaDetails}>{liturgiaData.evangelho.texto}</Text>

              <Text style={styles.sectionTitle}>Partilha da Palavra</Text>
              <Text style={styles.sectionTitle}>Profissão de Fé (Domingos e Solenidades)</Text>

              <Text style={styles.subsectionTitle}>Oração dos Fiéis</Text>
              <Text style={styles.liturgiaDetails}>Preces dos fiéis</Text>
            </Accordion>

            <Accordion title="Rito da Comunhão">
              <Text style={styles.subsectionTitle}>Coleta Fraterna</Text>
              <Text style={styles.liturgiaDetails}>M.: Essa partilha de dons e talentos diante de vós, ó Deus, sirva à missão de vossa Igreja, ao amor e à comunhão entre nós. Por Cristo, Nosso Senhor.</Text>
              <Text style={styles.liturgiaDetails}>T.: Amém.</Text>

              <Text style={styles.subsectionTitle}>Louvor e Ação de Graças</Text>
              <Text style={styles.liturgiaDetails}>Pode-se utilizar:</Text>
              <Text style={styles.liturgiaDetails}>- Salmos</Text>
              <Text style={styles.liturgiaDetails}>- Hinos</Text>
              <Text style={styles.liturgiaDetails}>- Cânticos</Text>
              <Text style={styles.liturgiaDetails}>- Orações em forma de ladainha</Text>
              <Text style={styles.liturgiaDetails}>- Louvações</Text>
              <Text style={styles.liturgiaDetails}>- Outras expressões orantes</Text>
              <Text style={styles.liturgiaDetails}>- Não deve ter a forma da Oração Eucarística.</Text>

              <Text style={styles.liturgiaDetails}>M.: Irmãos e irmãs, proclamemos a bondade de Deus e exaltemos a sua misericórdia, manifestada nas palavras de salvação que escutamos.</Text>

              <Text style={styles.subsectionTitle}>Sugestão:</Text>
              <Text style={styles.subsectionTitle}>Louvação das Escrituras (Reginaldo Veloso - Paulinas-COMEP)</Text>
              <Text style={styles.liturgiaDetails}>
                É bom cantar um bendito{'\n'}
                Um canto novo, um louvor!{'\n'}
                Ao Pai, Criador do universo{'\n'}
                Por Cristo, Verbo de amor!{'\n'}
                Ao Deus que, por sua Palavra{'\n'}
                Os seres todos chamou!{'\n'}
                Das Escrituras bebendo{'\n'}
                Exulta o povo em louvor!
              </Text>

              <Text style={styles.subsectionTitle}>Rito da Comunhão</Text>
              <Text style={styles.liturgiaDetails}>- Ministro extraordinário traz a âmbula com o Santíssimo e a coloca no altar.</Text>
              <Text style={styles.liturgiaDetails}>- Faz-se genuflexão.</Text>

              <Text style={styles.liturgiaDetails}>M.: Rezemos com amor e confiança a oração que o Senhor nos ensinou:</Text>
              <Text style={styles.liturgiaDetails}>Pai Nosso</Text>

              <Text style={styles.subsectionTitle}>Saudação da Paz</Text>
              <Text style={styles.liturgiaDetails}>M.: Irmãos e irmãs, saudemo-nos com a paz de Cristo Jesus.</Text>
              <Text style={styles.liturgiaDetails}>(Todos trocam o gesto de paz)</Text>

              <Text style={styles.liturgiaDetails}>M.: Felizes os convidados para a Ceia do Senhor! Eis o Cordeiro de Deus que tira o pecado do mundo.</Text>
              <Text style={styles.liturgiaDetails}>T.: Senhor, eu não sou digno(a) de que entreis em minha morada, mas dizei uma palavra e serei salvo(a).</Text>

              <Text style={styles.liturgiaDetails}>Se o ministro comungar:</Text>
              <Text style={styles.liturgiaDetails}>Que o Corpo de Cristo me guarde para a vida eterna.</Text>

              <Text style={styles.liturgiaDetails}>Após distribuir a comunhão:</Text>
              <Text style={styles.liturgiaDetails}>M.: Oremos. Senhor Jesus Cristo, neste admirável sacramento, nos deixastes o memorial da vossa paixão. Dai-nos venerar com tão grande amor o mistério do vosso Corpo e do vosso Sangue, que possamos colher continuamente os frutos da vossa redenção.</Text>
              <Text style={styles.liturgiaDetails}>T.: Amém.</Text>
            </Accordion>

            <Accordion title="Rito Final">
              <Text style={styles.subsectionTitle}>Oração Vocacional</Text>
              <Text style={styles.liturgiaDetails}>
                Senhor da messe e pastor do rebanho. Fazei ressoar em nossos ouvidos vosso forte e suave convite:{'\n'}
                "vem e segue-me!".{'\n'}
                Derramai sobre nós o vosso Espírito;{'\n'}
                que Ele nos dê sabedoria para ver o caminho e generosidade para seguir a vossa voz.{'\n'}
                Despertai nossas comunidades para a missão.{'\n'}
                Ensinai nossa vida a ser serviço.{'\n'}
                Fortalecei os que querem dedicar-se ao Reino, na vida consagrada e religiosa.{'\n'}
                Sustentai a fidelidade de nossos bispos, padres, diáconos e ministros.{'\n'}
                Dai perseverança a nossos seminaristas.{'\n'}
                Despertai o coração de nossos jovens para o ministério pastoral em vossa Igreja.{'\n'}
                Senhor, chamai-nos para o serviço do vosso povo.{'\n'}
                Maria Mãe da Igreja, modelo dos servidores do Evangelho, ajudai-nos a responder sim. Amém.
              </Text>

              <Text style={styles.subsectionTitle}>Avisos, Bênção e Despedida</Text>
              <Text style={styles.liturgiaDetails}>M.: Supliquemos a benção de Deus.</Text>
              <Text style={styles.liturgiaDetails}>Traçando o sinal da cruz:</Text>
              <Text style={styles.liturgiaDetails}>O Senhor todo-poderoso e cheio de misericórdia, Pai e Filho + e Espírito Santo nos abençoe e nos guarde.</Text>
              <Text style={styles.liturgiaDetails}>T.: Amém.</Text>
              <Text style={styles.liturgiaDetails}>M.: Ide em paz e o Senhor vos acompanhe.</Text>
              <Text style={styles.liturgiaDetails}>T.: Graças a Deus.</Text>
            </Accordion>
          </View>
        )}

        {showDatePickerModal && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            maximumDate={new Date(new Date().setMonth(new Date().getMonth() + 2))}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
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
    backgroundColor: '#1f2937',
    padding: 16,
    borderRadius: 8,
  },
  section: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  liturgiaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  liturgiaDetails: {
    fontSize: 16,
    color: '#d1d5db',
    marginBottom: 12,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 24,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  quote: {
    fontSize: 16,
    color: '#d1d5db',
    marginVertical: 16,
    fontStyle: 'italic',
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#4f46e5',
  },
  signature: {
    fontSize: 16,
    color: '#d1d5db',
    marginTop: 24,
    fontStyle: 'italic',
    textAlign: 'right',
  },
  subHeaderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  errorContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#8B0000',
    borderRadius: 10,
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },

}); 