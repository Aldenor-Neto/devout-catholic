import React from 'react';
import { Text, StyleSheet } from 'react-native';

export const formatarReflexao = (texto: string) => {
  if (!texto) return null;

  const linhas = texto.split('\n');

  return linhas.map((linha, index) => {
    if (!linha.trim()) return <Text key={index} style={styles.linhaVazia}></Text>;

    if (linha.trim().startsWith('* ')) {
      const conteudo = linha.trim().substring(2);
      return (
        <Text key={index} style={styles.linha}>
          <Text style={styles.marcador}>• </Text>
          {formatarPartesTexto(conteudo)}
        </Text>
      );
    }

    if (linha.trim().startsWith('- ')) {
      const conteudo = linha.trim().substring(2);
      return (
        <Text key={index} style={styles.linha}>
          <Text style={styles.marcador}>• </Text>
          {formatarPartesTexto(conteudo)}
        </Text>
      );
    }

    return (
      <Text key={index} style={styles.linha}>
        {formatarPartesTexto(linha)}
      </Text>
    );
  });
};

export const formatarPartesTexto = (texto: string) => {
  if (!texto) return null;

  // Primeiro, divide considerando negrito e itálico
  const partes = texto.split(/(\*\*.*?\*\*|\*.*?\*)/g);

  return partes.map((parte, i) => {
    // Negrito: **texto**
    const negrito = /^\*\*(.*?)\*\*$/.exec(parte);
    if (negrito) {
      return (
        <Text key={i} style={styles.negrito}>
          {negrito[1]}
        </Text>
      );
    }

    // Itálico: *texto*
    const italico = /^\*(.*?)\*$/.exec(parte);
    if (italico) {
      return (
        <Text key={i} style={styles.italico}>
          {italico[1]}
        </Text>
      );
    }

    // Texto normal
    return <Text key={i}>{parte}</Text>;
  });
};

const styles = StyleSheet.create({
  linha: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 6,
    textAlign: 'justify',
  },
  linhaVazia: {
    marginBottom: 6,
  },
  marcador: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  negrito: {
    fontWeight: 'bold',
    color: '#fff',
  },
  italico: {
    fontStyle: 'italic',
    color: '#fff',
  },

});
