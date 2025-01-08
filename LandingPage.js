import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#A259B5', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <Image 
          source={require('./assets/images/lanpage.png')} 
          style={styles.image}
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('HomePage')} // Replace 'HomePage' with your actual route name
        >
          <Text style={styles.buttonText}>Let's Explore</Text>
        </TouchableOpacity>

        <Image 
          source={require('./assets/images/3.png')} 
          style={styles.image1}
        />

        <Image 
          source={require('./assets/images/4.png')} 
          style={styles.image2}
        />

        <Image 
          source={require('./assets/images/5.png')} 
          style={styles.image3}
        />
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
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 580,
    height: 400,
    resizeMode: 'contain',
    position: 'absolute', // Fixes the image in place
    top: 45,
  },
  image1: {
    width: 280,
    height: 200,
    resizeMode: 'contain',
    position: 'absolute', // Fixes the image in place
    top: 490,
    left: 15,
  },
  image2: {
    width: 220,
    height: 300,
    resizeMode: 'contain',
    position: 'absolute', // Fixes the image in place
    top: 450,
    left: -60,
  },
  image3: {
    width: 400,
    height: 300,
    resizeMode: 'contain',
    position: 'absolute', // Fixes the image in place
    top: 455,
    left: 100,
  },
  button: {
    marginBottom: -400,
    backgroundColor: '#6666ff',
    paddingVertical: 12,
    paddingHorizontal: 57,
    borderRadius: 3,
    position: 'absolute', // Fixes the button in place
    top: 450,
    zIndex: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LandingPage;
