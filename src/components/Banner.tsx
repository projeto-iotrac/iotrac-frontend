import Colors from '../constants/Colors';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type BannerProps = {
  source: ImageSourcePropType;
};

const Banner: React.FC<BannerProps> = ({ source }) => (
  <View style={styles.container}>
    <Image
      source={source}
      style={styles.image}
      resizeMode="cover"
    />
    <LinearGradient
      colors={[Colors.primary, 'transparent']}
      style={styles.gradient}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
});

export default Banner;