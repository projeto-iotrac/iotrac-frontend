import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Colors from "../constants/Colors";

const getStatusColor = (subtitle?: string) => {
  switch (subtitle) {
    case 'Seguro':
      return Colors.success;
    case 'Vulnerável':
      return Colors.warning;
    case 'Sob Ataque!':
      return Colors.error;
    default:
      return '#000';
  }
};

type CardProps = {
  title: string;
  subtitle?: 'Seguro' | 'Vulnerável' | 'Sob Ataque!';
  href: string;
};

const Device: React.FC<CardProps> = ({ title, subtitle, href }) => {
  const router = useRouter();

  const handlePress = () => {
      router.push(href as any);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.subtitle, { color: getStatusColor(subtitle) }]}>Status: {subtitle}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: 'rgb(171, 171, 171)',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
});

export default Device;