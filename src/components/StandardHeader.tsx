import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import Colors from '../constants/Colors';

interface StandardHeaderProps {
  title?: string;
}

const StandardHeader: React.FC<StandardHeaderProps> = ({ title }) => (
  <View style={styles.container}>
    {/* Barra azul no topo com logo à esquerda - SEM PADDING HORIZONTAL */}
    <View style={styles.blueBar}>
      <View style={styles.logoContainer}>
        <Image 
          source={require("../../assets/images/logo-2.png")} 
          style={styles.logo} 
        />
      </View>
    </View>
    
    {/* Título opcional abaixo da barra azul */}
    {title && (
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>{title}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'stretch',
  },
  blueBar: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  logoContainer: {
    paddingLeft: 16,
  },
  logo: {
    width: 200,
    height: 50,
    resizeMode: 'contain',
  },
  titleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
});

export default StandardHeader; 