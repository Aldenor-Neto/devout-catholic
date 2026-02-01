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

import AveMariaData from '../../assets/data/Ave Maria.json';
import JerusalemData from '../../assets/data/jerusalem.json';
import PastoralData from '../../assets/data/pastoral.json';
import CnbbData from '../../assets/data/CNBB.json';

type LivroCompleto = {
  abbrev: string;
  name: string;
  chapters: string[][];
};

const BIBLIAS = {
  avemaria: { label: 'Versão Ave Maria', data: AveMariaData },
  jerusalem: { label: 'Versão Jerusalém', data: JerusalemData },
  pastoral: { label: 'Versão Pastoral', data: PastoralData },
  cnbb: { label: 'Versão CNBB', data: CnbbData },
} as const;

type VersaoBiblia = keyof typeof BIBLIAS;

export default function Biblia() {
  const router = useRouter();

  const [livros, setLivros] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [livroSelecionado, setLivroSelecionado] = useState<LivroCompleto | null>(null);
  const [capituloAtual, setCapituloAtual] = useState(0);
  const [versaoAtual, setVersaoAtual] = useState<VersaoBiblia>('avemaria');

  const [modalVisible, setModalVisible] = useState(false);
  const [seletorLivroVisivel, setSeletorLivroVisivel] = useState(false);
  const [seletorCapituloVisivel, setSeletorCapituloVisivel] = useState(false);

  const [ultimaLeitura, setUltimaLeitura] = useState<{
    livro: string;
    capitulo: number;
    versao: VersaoBiblia;
  } | null>(null);

  const STORAGE_VERSAO_KEY = 'versaoBibliaPadrao';

  useEffect(() => {
    const carregar = async () => {
      const versaoSalva = await AsyncStorage.getItem(STORAGE_VERSAO_KEY);
      if (versaoSalva && versaoSalva in BIBLIAS) {
        setVersaoAtual(versaoSalva as VersaoBiblia);
      }

      const salvo = await AsyncStorage.getItem('ultimaLeitura');
      if (salvo) setUltimaLeitura(JSON.parse(salvo));
    };
    carregar();
  }, []);

  const salvarLeitura = async (livro: string, capitulo: number, versao: VersaoBiblia) => {
    const dados = { livro, capitulo, versao };
    await AsyncStorage.setItem('ultimaLeitura', JSON.stringify(dados));
    setUltimaLeitura(dados);
  };

  useEffect(() => {
    if (livroSelecionado) {
      salvarLeitura(livroSelecionado.name, capituloAtual, versaoAtual);
    }
  }, [livroSelecionado, capituloAtual]);

  const carregarLivrosLocal = (versao: VersaoBiblia) => {
    setLoading(true);
    try {
      const data = BIBLIAS[versao].data;
      setLivros(data.map((l: LivroCompleto) => l.name));
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os livros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarLivrosLocal(versaoAtual);
    setLivroSelecionado(null);
  }, [versaoAtual]);

  const buscarLivroLocal = (nome: string) => {
    setLoading(true);
    try {
      const data = BIBLIAS[versaoAtual].data;
      const livro = data.find((l: LivroCompleto) => l.name === nome);
      if (!livro) throw new Error();
      setLivroSelecionado(livro);
      setCapituloAtual(0);
    } catch {
      Alert.alert('Erro', 'Livro não encontrado');
    } finally {
      setLoading(false);
    }
  };

  const continuarLeitura = () => {
    if (!ultimaLeitura) return;
    setVersaoAtual(ultimaLeitura.versao);
    buscarLivroLocal(ultimaLeitura.livro);
    setCapituloAtual(ultimaLeitura.capitulo);
  };

  const renderCapitulo = () => {
    if (!livroSelecionado) return null;

    const versiculos = livroSelecionado.chapters[capituloAtual];

    return (
      <View style={{ flex: 1 }}>
        <View style={styles.capituloHeader}>
          <TouchableOpacity onPress={() => setSeletorLivroVisivel(true)}>
            <Text style={[styles.subtitle, { textDecorationLine: 'underline' }]}>
              {livroSelecionado.name}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoSelecionarCapitulo}
            onPress={() => setSeletorCapituloVisivel(true)}
          >
            <Text style={styles.botaoTexto}>Selecionar Capítulo</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          {livroSelecionado.name} - Capítulo {capituloAtual + 1}
        </Text>

        <ScrollView style={styles.capituloContainer}>
          {versiculos.map((v, i) => (
            <Text key={i} selectable style={styles.versiculo}>
              {i + 1}. {v}
            </Text>
          ))}
        </ScrollView>

        <View style={styles.botoesContainer}>
          <Button
            title="Capítulo Anterior"
            onPress={() => setCapituloAtual(c => c - 1)}
            disabled={capituloAtual === 0}
          />
          <Button
            title="Próximo Capítulo"
            onPress={() => setCapituloAtual(c => c + 1)}
            disabled={capituloAtual >= livroSelecionado.chapters.length - 1}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.subHeader}>
        <Text style={styles.subtitle}>
          Bíblia Sagrada {BIBLIAS[versaoAtual].label}
        </Text>

        <View style={styles.subHeaderButtons}>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/')}>
            <Text style={styles.headerButtonText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.headerButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.headerButtonText}>Opções</Text>
          </TouchableOpacity>

          {livroSelecionado && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setLivroSelecionado(null)}
            >
              <Text style={styles.headerButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
        </View>

        {!livroSelecionado && ultimaLeitura && ultimaLeitura.versao === versaoAtual && (
          <TouchableOpacity style={styles.continuarBtnDestaque} onPress={continuarLeitura}>
            <Text style={styles.continuarTexto}>
              Continuar leitura: {ultimaLeitura.livro} – Capítulo {ultimaLeitura.capitulo + 1}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {!livroSelecionado ? (
        <FlatList
          data={livros}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.itemContainer}
              onPress={() => buscarLivroLocal(item)}
            >
              <Text style={styles.itemTexto}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        renderCapitulo()
      )}

      <Modal transparent visible={seletorLivroVisivel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <FlatList
              data={livros}
              keyExtractor={(_, i) => i.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemContainer}
                  onPress={() => {
                    setSeletorLivroVisivel(false);
                    buscarLivroLocal(item);
                  }}
                >
                  <Text style={styles.itemTexto}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Fechar" color="red" onPress={() => setSeletorLivroVisivel(false)} />
          </View>
        </View>
      </Modal>

      <Modal transparent visible={seletorCapituloVisivel}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {livroSelecionado && (
              <FlatList
                data={Array.from({ length: livroSelecionado.chapters.length }, (_, i) => i)}
                keyExtractor={item => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={() => {
                      setCapituloAtual(item);
                      setSeletorCapituloVisivel(false);
                    }}
                  >
                    <Text style={styles.itemTexto}>Capítulo {item + 1}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
            <Button title="Fechar" color="red" onPress={() => setSeletorCapituloVisivel(false)} />
          </View>
        </View>
      </Modal>

      <Modal transparent visible={modalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Opções</Text>

            {Object.entries(BIBLIAS).map(([key, versao]) => (
              <TouchableOpacity
                key={key}
                style={styles.headerButton}
                onPress={async () => {
                  const novaVersao = key as VersaoBiblia;
                  setVersaoAtual(novaVersao);
                  await AsyncStorage.setItem(STORAGE_VERSAO_KEY, novaVersao);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.headerButtonText}>{versao.label}</Text>
              </TouchableOpacity>
            ))}

            <View style={{ height: 10 }} />
            <Button title="Criar Nota" onPress={() => router.push('/screens/anotacoes/criarNota')} />
            <View style={{ height: 10 }} />
            <Button title="Fechar" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20 },
  itemContainer: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#333' },
  itemTexto: { color: '#fff', fontSize: 18, textAlign: 'center' },
  subtitle: { color: '#e0e0e0', fontSize: 20, fontWeight: '600' },
  capituloContainer: { marginVertical: 10 },
  versiculo: { color: '#e0e0e0', fontSize: 16, marginBottom: 8 },
  botoesContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  subHeader: { marginBottom: 10 },
  subHeaderButtons: { flexDirection: 'row', gap: 10 },
  headerButton: { backgroundColor: '#333', padding: 8, borderRadius: 5 },
  headerButtonText: { color: '#fff' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: '#1e1e1e', padding: 20, borderRadius: 10, maxHeight: '80%' },
  modalTitle: { color: '#fff', fontSize: 20, textAlign: 'center', marginBottom: 10 },
  botaoSelecionarCapitulo: { backgroundColor: '#333', padding: 6, borderRadius: 6 },
  botaoTexto: { color: '#fff' },
  continuarBtnDestaque: { backgroundColor: '#1e90ff', padding: 12, borderRadius: 8 },
  continuarTexto: { color: '#fff', fontWeight: '600' },
  capituloHeader: { flexDirection: 'row', justifyContent: 'space-between' },
});
