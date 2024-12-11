import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const App = () => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#A259B5', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <Image
          source={require('./assets/images/vetcare.png')}
          style={styles.image}
        />

      <Image
          source={require('./assets/images/footprint.png')}
          style={styles.image2}
        />

      <Text style={styles.text}>REGISTER NOW</Text>

      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    bottom: 100,
  },
  image2: {
    width: 130,
    height: 130,
    top: 100,
  },
  text:{
    fontSize : 15,
  }
});

export default App;
