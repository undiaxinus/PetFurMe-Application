import React, { useState } from 'react';
import { Text, TouchableOpacity, Image, StyleSheet, View, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts } from 'expo-font';
import { Fredoka_400Regular } from '@expo-google-fonts/fredoka'; // Import the font

const HomeScreen = ({ navigation }) => {
  const [rotation] = useState(new Animated.Value(0)); // Initialize animated value for rotation

  // Load the font
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular, // Register the font
  });

  if (!fontsLoaded) {
    return null; // Ensure the app waits for the font to load
  }

  // Function to handle the rotation animation
  const rotateCircle = () => {
    Animated.timing(rotation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      rotation.setValue(0); // Reset rotation value
      navigation.navigate('Register'); // Navigate to the Register screen after animation
    });
  };

  // Interpolate the rotation value to rotate the circle
  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'], // Rotate from 0 to 360 degrees
  });

  return (
    <LinearGradient
      colors={['#A259B5', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <Animated.View
        style={[
          styles.outerCircle,
          { transform: [{ rotate: rotateInterpolate }] }, // Apply rotation to the outer circle
        ]}
      >
        <View style={styles.imageWrapper}>
          <Image
            source={require('./assets/images/logo.png')}
            style={styles.image}
          />
        </View>
      </Animated.View>

      <Image
        source={require('./assets/images/animal.png')}
        style={styles.vetcare}
      />

      <Image
        source={require('./assets/images/footprint.png')}
        style={[styles.image2, { transform: [{ rotate: '12deg' }] }]} // Apply rotation here
      />
      <TouchableOpacity onPress={rotateCircle}>
        <Text style={styles.registerText}>GET STARTED</Text>
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
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    left: -37,
    fontFamily: 'Fredoka_400Regular',
  },
});

export default HomeScreen;
//huhu