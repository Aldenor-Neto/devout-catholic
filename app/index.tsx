import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Home() {
  const router = useRouter();

  const funcionalidades = [
    'Bíblia Sagrada',
    'Liturgia Diária',
    'Orações Eucarísticas',
    'Celebração da Palavra',
    'Santo do Dia',
    'Motivacional',
    'Anotações',
  ];

  const handleFuncionalidade = (nome: string) => {
    try {
      if (nome === 'Bíblia Sagrada') {
        router.push('/screens/biblia');
      } else if (nome === 'Liturgia Diária') {
        router.push('/screens/liturgia');
      } else if (nome === 'Anotações') {
        router.push('/screens/anotacoes/anotacoes');
      } else if (nome === 'Celebração da Palavra') {
        router.push('/screens/celebracao');
      } else if (nome === 'Orações Eucarísticas') {
        router.push('/screens/oracoes-eucaristicas');
      } else if (nome === 'Motivacional') {
        router.push('/screens/motivacional');
      } else if (nome === 'Santo do Dia') {
        router.push('/screens/santoDoDia');
      } else {
        const mensagem = `Você selecionou: ${nome}`;
        Platform.OS === 'web'
          ? window.alert(mensagem)
          : Alert.alert('Funcionalidade', mensagem);
      }
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro inesperado');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/images/símbolos católicos.jpg')}
        style={styles.image}
        resizeMode="contain"
        accessible={true}
        accessibilityLabel="imagem de uma representação compacta e simbólica de elementos fundamentais da fé cristã, com ênfase na Eucaristia, na Palavra de Deus e na Cruz como centro da salvação. No centro há uma grande cruz de madeira de tonalidade escura, com um círculo no ponto de intersecção dos braços. Ao redor da cruz, envolvendo-a parcialmente, há uma coroa de folhas verdes. Na base da cruz, no lado esquerdo, encontra-se um cálice com vinho.  No lado direito da base, há uma bíblia de capa marrom com uma pequena cruz gravada em sua superfície.  Abaixo do livro, dispostas horizontalmente, estão três hóstias brancas e arredondadas. Ao fundo da parte superior da cruz, projeta-se um semicírculo em um tom de amarelo pálido com raios de luz que se expandem a partir do centro, criando um efeito de brilho ou auréola"
      />
      <Text style={styles.title}>Devout Catholic</Text>
      <Text style={styles.subtitle}>Sou católico, pratico minha fé!</Text>

      <View style={styles.buttonList}>
        {funcionalidades.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.button}
            onPress={() => handleFuncionalidade(item)}
            accessible={true}
            accessibilityLabel={`Botão ${item}`}
          >
            <Text style={styles.buttonText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#cccccc',
    marginBottom: 25,
    textAlign: 'center',
  },
  buttonList: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: 'transparent', // fundo transparente
    borderWidth: 1, // borda fina
    borderColor: '#1e90ff', // azul
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 14,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff', // texto branco
    fontSize: 15,
    fontWeight: '600',
  },
});
 