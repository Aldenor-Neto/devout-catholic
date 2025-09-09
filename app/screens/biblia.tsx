import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Button,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from '../../components/header';

// Importa os JSON locais
import AveMariaData from '../../assets/data/Ave Maria.json';
import JerusalemData from '../../assets/data/jerusalem.json';

type LivroCompleto = {
  abbrev: string;
  name: string;
  chapters: string[][];
};

export default function Biblia() {
  const [livros, setLivros] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [livroSelecionado, setLivroSelecionado] = useState<LivroCompleto | null>(null);
  const [capituloAtual, setCapituloAtual] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [versaoAtual, setVersaoAtual] = useState<'avemaria' | 'jerusalem'>('avemaria');
  const [seletorCapituloVisivel, setSeletorCapituloVisivel] = useState(false);
  const [seletorLivroVisivel, setSeletorLivroVisivel] = useState(false);

  const router = useRouter();

  const [ultimaLeitura, setUltimaLeitura] = useState<{
    livro: string;
    capitulo: number;
    versao: 'avemaria' | 'jerusalem';
  } | null>(null);

  // Carregar última leitura ao montar
  useEffect(() => {
    const carregarLeitura = async () => {
      try {
        const salvo = await AsyncStorage.getItem('ultimaLeitura');
        if (salvo) {
          setUltimaLeitura(JSON.parse(salvo));
        }
      } catch (e) {
        console.log("Erro ao carregar última leitura", e);
      }
    };
    carregarLeitura();
  }, []);

  // Função para salvar
  const salvarLeitura = async (livro: string, capitulo: number, versao: 'avemaria' | 'jerusalem') => {
    try {
      const dados = { livro, capitulo, versao };
      await AsyncStorage.setItem('ultimaLeitura', JSON.stringify(dados));
      setUltimaLeitura(dados);
    } catch (e) {
      console.log("Erro ao salvar leitura", e);
    }
  };

  // Atualizar quando mudar capítulo
  useEffect(() => {
    if (livroSelecionado) {
      salvarLeitura(livroSelecionado.name, capituloAtual, versaoAtual);
    }
  }, [livroSelecionado, capituloAtual, versaoAtual]);

  // Função para continuar leitura
  const continuarLeitura = () => {
    if (!ultimaLeitura) return;
    setVersaoAtual(ultimaLeitura.versao);
    buscarLivroLocal(ultimaLeitura.livro);
    setCapituloAtual(ultimaLeitura.capitulo);
  };
  // Função para carregar lista de livros da versão local
  const carregarLivrosLocal = (versao: 'avemaria' | 'jerusalem') => {
    setLoading(true);
    try {
      const data = versao === 'avemaria' ? AveMariaData : JerusalemData;
      // Extrai só o nome dos livros
      const nomes = data.map((livro: LivroCompleto) => livro.name);
      setLivros(nomes);
      setLoading(false);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar os livros localmente');
      setLoading(false);
    }
  };

  // Carrega lista na montagem e quando mudar a versão
  useEffect(() => {
    carregarLivrosLocal(versaoAtual);
    setLivroSelecionado(null);
  }, [versaoAtual]);

  // Busca o livro completo no JSON local pelo nome
  const buscarLivroLocal = (nome: string) => {
    setLoading(true);
    try {
      const data = versaoAtual === 'avemaria' ? AveMariaData : JerusalemData;
      const livro = data.find((l: LivroCompleto) => l.name === nome);
      if (!livro) throw new Error('Livro não encontrado');
      setLivroSelecionado(livro);
      setCapituloAtual(0);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const renderCapitulo = () => {
    if (!livroSelecionado) return null;

    const versiculos = livroSelecionado.chapters[capituloAtual];

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.capituloHeader}>
          <View style={styles.capituloHeader}>
            <TouchableOpacity onPress={() => setSeletorLivroVisivel(true)}>
              <Text style={[styles.subtitle, { textDecorationLine: 'underline' }]}>
                {livroSelecionado.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSeletorCapituloVisivel(true)}
              style={styles.botaoSelecionarCapitulo}
            >
              <Text style={styles.botaoTexto}>Selecionar Capítulo</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {livroSelecionado.name} - Capítulo {capituloAtual + 1}
          </Text>
        </View>
        <ScrollView style={styles.capituloContainer}>
          {versiculos.map((versiculo, index) => (
            <Text key={index} style={styles.versiculo}>
              {index + 1}. {versiculo}
            </Text>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
        <View style={styles.botoesContainer}>
          <Button
            title="Capítulo Anterior"
            onPress={() => setCapituloAtual(prev => prev - 1)}
            disabled={capituloAtual === 0}
          />
          <Button
            title="Próximo Capítulo"
            onPress={() => setCapituloAtual(prev => prev + 1)}
            disabled={capituloAtual >= livroSelecionado.chapters.length - 1}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.subHeader}>
        <Text style={styles.subtitle}>
          Bíblia Sagrada {versaoAtual === 'avemaria' ? 'Versão Ave Maria' : 'Versão Jerusalém'}
        </Text>

        <View style={styles.subHeaderButtons}>
          <TouchableOpacity onPress={() => router.push({ pathname: '/' })} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>Opções</Text>
          </TouchableOpacity>

          {/* Botão Voltar só aparece quando estiver lendo */}
          {livroSelecionado && (
            <TouchableOpacity onPress={() => setLivroSelecionado(null)} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Botão Continuar leitura só aparece quando não estiver lendo */}
        {!livroSelecionado && ultimaLeitura && ultimaLeitura.versao === versaoAtual && (
          <TouchableOpacity
            style={styles.continuarBtnDestaque}
            onPress={continuarLeitura}
          >
            <Text style={styles.continuarTexto}>
              Continuar leitura: {ultimaLeitura.livro} - Capítulo {ultimaLeitura.capitulo + 1}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!livroSelecionado ? (
        <FlatList
          data={livros}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.itemContainer} onPress={() => buscarLivroLocal(item)}>
              <Text style={styles.itemTexto}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        renderCapitulo()
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Opções</Text>
            <Button
              title={versaoAtual === 'avemaria' ? 'Versão Jerusalém' : 'Versão Ave Maria'}
              onPress={() => {
                const novaVersao = versaoAtual === 'avemaria' ? 'jerusalem' : 'avemaria';
                setVersaoAtual(novaVersao);
                setModalVisible(false);
              }}
            />
            <View style={{ height: 10 }} />
            <Button
              title="Criar Nota"
              onPress={() => {
                setModalVisible(false);
                router.push('/screens/anotacoes/criarNota');
              }}
            />
            <View style={{ height: 20 }} />
            <Button title="Fechar" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={seletorCapituloVisivel}
        onRequestClose={() => setSeletorCapituloVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecione o Capítulo</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {livroSelecionado?.chapters.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.itemContainer}
                  onPress={() => {
                    setCapituloAtual(index);
                    setSeletorCapituloVisivel(false);
                  }}
                >
                  <Text style={styles.itemTexto}>Capítulo {index + 1}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ marginTop: 10 }}>
              <Button title="Fechar" onPress={() => setSeletorCapituloVisivel(false)} color="red" />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={seletorLivroVisivel}
        onRequestClose={() => setSeletorLivroVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecione o Livro</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {livros.map((livro, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.itemContainer}
                  onPress={() => {
                    buscarLivroLocal(livro);
                    setSeletorLivroVisivel(false);
                  }}
                >
                  <Text style={styles.itemTexto}>{livro}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={{ marginTop: 10 }}>
              <Button title="Fechar" onPress={() => setSeletorLivroVisivel(false)} color="red" />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    width: '100%',
    alignItems: 'center',
  },
  itemTexto: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    flexWrap: 'wrap',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
    color: '#e0e0e0',
  },
  image: {
    width: 120,
    height: 120,
    marginLeft: 10,
  },
  capituloContainer: {
    marginVertical: 10,
  },
  versiculo: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 8,
  },
  botoesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap', // garante que os botões não sejam cortados em telas pequenas
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1e1e1e',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  capituloHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoSelecionarCapitulo: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 14,
  },
  continuarBtn: {
    backgroundColor: '#444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  continuarTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  continuarBtnDestaque: {
    backgroundColor: '#1e90ff', // azul destacado
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

});
