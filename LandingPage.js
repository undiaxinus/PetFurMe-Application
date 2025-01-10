import React from 'react';
import { Text, View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LandingPage = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.greetingText}>Hello,</Text>
        <Text style={styles.userName}>Esther</Text>
      </View>

      {/* Illustration */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('./assets/images/landingimage.png')} // Replace with your illustration path
          style={styles.illustration}
        />
      </View>

      {/* Message Section */}
      <View style={styles.messageContainer}>
        <Text style={styles.title}>Uh Oh!</Text>
        <Text style={styles.subtitle}>
          Looks like you have no profiles set up at this moment, add your pet now
        </Text>
      </View>

      {/* Swipe Button */}
      <TouchableOpacity
        style={styles.swipeButton}
        onPress={() => navigation.navigate('ProfileSetup')}
      >
        <LinearGradient
          colors={['#8146C1', '#B682EB']}
          style={styles.gradientButton}
        >
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          <Text style={styles.swipeButtonText} onPress={() => navigation.navigate('Profile2')}>Swipe to continue</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    backgroundColor: '#8146C1',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  greetingText: {
    color: '#FFFFFF',
    fontSize: 16,
    top: 20,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    top: 20,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 230,
    height: 230,
    position: 'absolute',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212134',
    marginBottom: 50,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E8E',
    textAlign: 'center',
    marginBottom: 10,
  },
  swipeButton: {
    width: '90%',
    marginBottom: 30,
  },
  gradientButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    paddingVertical: 15,
  },
  swipeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default LandingPage;
