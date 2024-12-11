import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ navigation }) => {
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
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.registerText}>REGISTER</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 150,
    height: 150,
  },
  image2: {
    width: 100,
    height: 100,
    marginTop: 20,
  },
  registerText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A259B5',
  },
});

export default HomeScreen;
