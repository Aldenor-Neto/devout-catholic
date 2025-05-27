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
          accessibilityLabel="Imagem de símbolos católicos, com cruz, cálice, bíblia e hóstias"
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
