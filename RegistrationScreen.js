import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert } from 'react-native';

const RegistrationScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignUp = () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    console.log('Sign up:', { name, email, password });
    // Add navigation or API integration here
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('./assets/images/vetcare.png')} // Replace with your logo path
      />

      <View style={styles.square}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            Log In
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 170,
    height: 170,
    position: 'absolute',
    top: 12,
  },
  square: {
    width: 310,
    height: 450,
    backgroundColor: '#D1ACDA',
    marginTop: 200,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    top: -10,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 10,
    marginBottom: 25,
    backgroundColor: '#fff',
    fontSize: 18,
    height: 50,
  },
  button: {
    borderWidth: 1,
    padding: 15,
    borderRadius: 90,
    marginBottom: 35,
    backgroundColor: '#fff',
    fontSize: 15,
    width: 130,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#8146C1',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  link: {
    color: '#007bff',
  },
  loginText: {
    marginTop: 20,
    color: '#000000',
    textAlign: 'center',
  },
});

export default RegistrationScreen;
