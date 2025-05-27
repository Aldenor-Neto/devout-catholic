import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function Home() {
  const router = useRouter();

  const funcionalidades = [
    'Bíblia Sagrada',
    'Liturgia Diária',
    'Liturgia Eucarística',
    'Celebração da Palavra',
    'Santo do Dia',
    'Meditação',
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
      <View style={styles.header}>
        <Image
          source={require('../assets/images/símbolos católicos.jpg')}
          style={styles.image}
          resizeMode="contain"
          accessible={true}
          accessibilityLabel="imagem de Uma cruz de madeira centralizada, com um cálice dourado à esquerda e uma Bíblia marrom à direita, acompanhada de duas hóstias brancas. Ao redor da cruz, há ramos verdes formando uma coroa. No fundo, há um círculo amarelo com raios que emanam do centro. Na parte inferior, há uma faixa amarela em branco"
        />
        <Text style={styles.title}>Devout Catholic</Text>
      </View>
      <View>
        <Text style={styles.subtitle}>Sou católico, pratíco minha fé!</Text>
      </View>

      <View style={styles.buttonList}>
        {funcionalidades.map((item) => (
          <View key={item} style={styles.buttonContainer}>
            <Button
              title={item}
              color="#1e90ff"
              onPress={() => handleFuncionalidade(item)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212', // fundo escuro
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff', // texto branco para contraste
    flex: 1,
    flexWrap: 'wrap',
  },
  image: {
    width: 120,
    height: 120,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: '#cccccc', // texto secundário mais claro
    alignSelf: 'flex-start',
  },
  buttonList: {
    width: '100%',
  },
  buttonContainer: {
    marginBottom: 15,
  },
});
