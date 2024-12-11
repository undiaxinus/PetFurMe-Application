import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Both fields are required!');
      return;
    }

    Alert.alert('Success', `Welcome back, ${email}!`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Log In</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCompleteType="email"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Log In
      </Button>

      <Text style={styles.footer}>
        Don't have an account?{' '}
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          Sign Up
        </Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
  },
  footer: {
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: '#007bff',
  },
});

export default LoginScreen;
