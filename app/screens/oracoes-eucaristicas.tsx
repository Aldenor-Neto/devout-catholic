import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { List } from 'react-native-paper';
import oracoesMarkdown from '../../assets/oracoes_eucaristicas';

import { useRouter } from 'expo-router';
import Header from '../../components/header';

interface OracaoEucaristica {
  titulo: string;
  conteudo: string[];
}

export default function OracoesEucaristicas() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [oracoes, setOracoes] = useState<OracaoEucaristica[]>([]);

  useEffect(() => {
    carregarOracoes();
  }, []);

  const carregarOracoes = async () => {
    try {
      const text = oracoesMarkdown;

      const sections = text.split(/(?=^# )/m).filter(Boolean);

      const oracoesProcessadas = sections.map(section => {
        const lines = section.trim().split('\n');
        const titulo = lines[0].replace(/^#\s*/, '').trim();
        const conteudo = lines.slice(1);
        return { titulo, conteudo };
      });

      setOracoes(oracoesProcessadas);
    } catch (error) {
      console.error('Erro ao carregar as orações:', error);
    }
  };

  const formatarConteudo = (conteudo: string[]) => {
    return conteudo.map((linha, index) => {
      const partes = linha.split(/(\*\*.*?\*\*)/g); // divide mantendo negrito
      return (
        <Text
          key={index}
          style={[
            styles.linha,
            linha.startsWith('R.') && styles.resposta
          ]}
        >
          {partes.map((parte, i) => {
            const negrito = /^\*\*(.*?)\*\*$/.exec(parte);
            return (
              <Text key={i} style={negrito ? styles.negrito : undefined}>
                {negrito ? negrito[1] : parte}
              </Text>
            );
          })}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView style={styles.content}>
        <View style={styles.toolbar}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.homeButton}
          >
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.pageTitle}>Orações Eucarísticas</Text>
          <Text style={styles.subtitle}>
            O coração da celebração da Santa Missa
          </Text>
        </View>

        <View style={styles.introCard}>
          <Text style={styles.introText}>
            As Orações Eucarísticas são o coração da celebração da Santa Missa,
            onde se realiza o memorial do sacrifício de Cristo e sua oferta ao Pai.
            Escolha uma das orações abaixo para meditar e aprofundar sua participação na liturgia.
          </Text>
        </View>

        {oracoes.map((oracao, index) => (
          <List.Accordion
            key={index}
            title={oracao.titulo}
            expanded={expandedSection === oracao.titulo}
            onPress={() => setExpandedSection(
              expandedSection === oracao.titulo ? null : oracao.titulo
            )}
            style={styles.accordion}
            titleStyle={styles.accordionTitle}
          >
            {formatarConteudo(oracao.conteudo)}
          </List.Accordion>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    padding: 16,
  },
  homeButton: {
    backgroundColor: '#1e1e1e',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  titleContainer: {
    padding: 16,
    alignItems: 'center',
  },
  pageTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#e0e0e0',
    fontSize: 16,
    textAlign: 'center',
  },
  introCard: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    margin: 16,
    borderRadius: 8,
  },
  introText: {
    color: '#e0e0e0',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  accordion: {
    backgroundColor: '#1e1e1e',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  accordionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  oracaoContent: {
    padding: 16,
  },
  linha: {
    color: '#e0e0e0',
    fontSize: 16,
    marginBottom: 16, // De 8 para 16, para maior espaçamento
    lineHeight: 24,
  },
  resposta: {
    color: '#bb86fc',
    fontWeight: '500',
    marginVertical: 8,
    textAlign: 'center',
  },
  titulo: {
    color: '#03dac6',
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  negrito: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
}); 