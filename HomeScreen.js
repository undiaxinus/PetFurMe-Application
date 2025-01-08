import React from 'react';
import { Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const HomeScreen = ({ navigation }) => {
  return (
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
    width: 220,
    height: 220,
    bottom: 70,
  },
  image2: {
    width: 130,
    height: 130,
    marginTop: 70,
  },
  registerText: {
    position: 'absolute',  // Fix position relative to the container
    top: -70,  // You can adjust this value to control how far from the top the text appears
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    left: -35,
  },});

export default HomeScreen;

//HomeScreen