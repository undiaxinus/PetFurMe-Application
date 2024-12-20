import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LandingPage = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.circleBackground}>
        <Image 
          source={require('./assets/images/dogcat.png')} 
          style={styles.image}
        />
      </View>

      <View style={styles.headerContainer}>
        <Text style={styles.header1}>Where Caring</Text>
        <Text style={styles.header2}>Means More</Text>
      </View>

      <Text style={styles.content}>
        Join & discover the best pet services near you.
      </Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('HomePage')} // Replace 'HomePage' with your actual route name
      >
        <Text style={styles.buttonText}>Continue...</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F9', // Light gray for a softer background
    padding: 20,
  },
  circleBackground: {
    width: 235, // Slightly larger circle for better balance
    height: 230,
    borderRadius: 115, // Half of width/height for a perfect circle
    backgroundColor: '#df80ff', // A vibrant violet shade
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100,
  },
  image: {
    width: 280, // Reduced image size for better proportions
    height: 250,
    resizeMode: 'contain',
    top: -38,
    left: -18,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  header1: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#6666ff',
  },
  header2: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  content: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    color: '#555',
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  button: {
    marginTop: 30,
    backgroundColor: '#6666ff',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LandingPage;

//LandingPage