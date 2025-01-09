import React from 'react';
import { Text, TouchableOpacity, Image, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Fredoka_400Regular } from '@expo-google-fonts/fredoka'; // Import the font

const HomeScreen = ({ navigation }) => {
  // Load the font
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular, // Register the font
  });

  if (!fontsLoaded) {
    return null; // Ensure the app waits for the font to load
  }

  return (
    <LinearGradient
      colors={['#A259B5', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <View style={styles.outerCircle}>
        <View style={styles.imageWrapper}>
          <Image
            source={require('./assets/images/logo.png')}
            style={styles.image}
          />
        </View>
      </View>

      <Image
        source={require('./assets/images/vetcare.png')}
        style={styles.vetcare}
      />

      <Image
        source={require('./assets/images/footprint.png')}
        style={[styles.image2, { transform: [{ rotate: '12deg' }] }]} // Apply rotation here
      />
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>REGISTER</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCircle: {
    width: 200, 
    height: 200, 
    borderRadius: 100, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 9, 
    borderColor: '#2A27AE',
    marginBottom: 80, 
  },
  imageWrapper: {
    width: 180, 
    height: 180, 
    borderRadius: 90, 
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 12,
    borderColor: '#B61DB0', 
  },
  image: {
    width: 150, 
    height: 150,
    resizeMode: 'contain', 
  },
  image2: {
    width: 140,
    height: 140,
    marginTop: 60, 
  },
  vetcare: {
    width: 200,  
    height: 70,
    top: -70,
  },
  registerText: {
    position: 'absolute',
    top: -50,
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
    left: -29,
    fontFamily: 'Fredoka_400Regular', 
  },
});

export default HomeScreen;
