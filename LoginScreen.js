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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
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
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}

      <LinearGradient
        colors={['#FFFFFF', '#D1ACDA']}
        style={styles.gradientBackground}
      >
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
            <Ionicons name="mail-outline" size={20} color="#8146C1" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
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
            <Text style={styles.loginButtonText} onPress={() => navigation.navigate('LandingPage')}>LOGIN</Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or connect with</Text>

          {/* Social Login Section */}
          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity style={[styles.socialButton, styles.googleButton]}>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={styles.socialButtonText}>Login With Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, styles.facebookButton]}>
              <Ionicons name="logo-facebook" size={20} color="#1877F2" />
              <Text style={styles.socialButtonText}>Login With Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.socialButton, styles.appleButton]}>
              <Ionicons name="logo-apple" size={20} color="#000000" />
              <Text style={styles.socialButtonText}>Login With Apple</Text>
            </TouchableOpacity>
          </View>

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
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: 20,
  },
  logo: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
  },
  formContainer: {
    width: '90%',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  },
  loginButton: {
    backgroundColor: '#8146C1',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orText: {
    textAlign: 'center',
    color: '#8146C1',
    marginBottom: 20,
  },
  socialButtonsContainer: {
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#8146C1',
  },
  footerText: {
    textAlign: 'center',
    color: '#8146C1',
    marginTop: 10,
  },
  signUpText: {
    color: '#8146C1',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
