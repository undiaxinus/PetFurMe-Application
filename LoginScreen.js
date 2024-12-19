import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Both fields are required!');
      return;
    }

    setLoading(true); // Start loading

    try {
      // Simulate login process (Replace this with your login API request)
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate a network delay
      // On successful login, navigate to LandingPage
      navigation.navigate('LandingPage'); // Navigate to LandingPage instead of Home
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false); // Stop loading once the process is finished
    }
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

      <Button mode="contained" onPress={handleLogin} style={styles.button} disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </Button>

      {/* Show loading spinner if loading is true */}
      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
      )}

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
  loading: {
    marginTop: 20,
  },
});

export default LoginScreen;
