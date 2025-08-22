import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/símbolos católicos.jpg')}
          style={styles.image}
          resizeMode="contain"
          accessible
          accessibilityLabel="imagem de uma representação compacta e simbólica de elementos fundamentais da fé cristã, com ênfase na Eucaristia, na Palavra de Deus e na Cruz como centro da salvação. No centro há uma grande cruz de madeira de tonalidade escura, com um círculo no ponto de intersecção dos braços. Ao redor da cruz, envolvendo-a parcialmente, há uma coroa de folhas verdes. Na base da cruz, no lado esquerdo, encontra-se um cálice com vinho.  No lado direito da base, há uma bíblia de capa marrom com uma pequena cruz gravada em sua superfície.  Abaixo do livro, dispostas horizontalmente, estão três hóstias brancas e arredondadas. Ao fundo da parte superior da cruz, projeta-se um semicírculo em um tom de amarelo pálido com raios de luz que se expandem a partir do centro, criando um efeito de brilho ou auréola"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Devout Catholic</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
    backgroundColor: '#000',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 10,
  },
  textContainer: {
    flex: 1, // Permite que o texto ocupe o espaço restante
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flexWrap: 'wrap',
  },
});
