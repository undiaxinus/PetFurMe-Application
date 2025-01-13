import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true); // Start loading spinner

    setTimeout(() => {
      setLoading(false); // Stop loading spinner
      navigation.navigate('LandingPage'); // Navigate to LandingPage after login
    }, 2000); // Simulate a network request with a 2-second delay
  };

  return (
    <View style={styles.container}>
      {/* Spinner overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8146C1" />
        </View>
      )}

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/images/vetcare.png')} // Replace with your logo path
          style={styles.logo}
        />
      </View>

      {/* Form Section */}
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#8146C1" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#8146C1"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#8146C1"
          />
        </View>

        <TouchableOpacity style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading} // Disable button while loading
        >
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Don’t have an account?{' '}
          <Text
            style={styles.signUpText}
            onPress={() => navigation.navigate('Register')}
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // White background
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  logoContainer: {
    alignItems: 'center',
    top: -20,
    marginBottom: 30,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '90%',
    padding: 10,
    backgroundColor: '#D1ACDA',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 20,
    height: 400,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#8146C1',
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    top: 20,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#8146C1',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#8146C1',
    fontSize: 14,
    top: 30,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 5,
    alignItems: 'center',
    marginBottom: 20,
    width: 80,
    height: 35,
    left: 110,
    top: 50,
  },
  loginButtonText: {
    color: '#793ABD',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerText: {
    textAlign: 'center',
    color: '#000000',
    marginTop: 110,
  },
  signUpText: {
    color: '#8146C1',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
