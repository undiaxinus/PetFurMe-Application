import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('./assets/images/vetcare.png')} // Replace with your logo path
          style={styles.logo}
        />
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#8146C1" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#8146C1"
          />
        </View>

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
            secureTextEntry={!showPassword}
            placeholderTextColor="#8146C1"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#8146C1"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#8146C1"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color="#8146C1"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupButtonText} onPress={() => navigation.navigate('Landing')}>
            Sign Up
          </Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text
            style={styles.loginText}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            Log in now
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Changed to white
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 130,
    height: 130,
    bottom: 30,
  },
  formContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: '#D1ACDA',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: 430,
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
  signupButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: 120,
    height: 30,
    left: 80,
    top: 30,
  },
  signupButtonText: {
    color: '#8146C1',
    fontSize: 16,
    fontWeight: 'bold',
    top: -10,
    height: 20,
  },
  footerText: {
    textAlign: 'center',
    color: '#000000',
    marginTop: 55,
  },
  loginText: {
    color: '#8146C1',
    fontWeight: 'bold',
  },
});

export default SignupScreen;
