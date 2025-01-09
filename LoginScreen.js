import React, { useState } from 'react';
import { StyleSheet, View, Image, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Both fields are required!');
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate login process
      navigation.navigate('LandingPage'); // Navigate to LandingPage on successful login
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('./assets/images/vetcare.png')} />

      <View style={styles.square}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#8146C1" style={styles.loading} />}

        <Text style={styles.loginText}>
          Don't have an account?{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
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
    height: 350,
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
    height: 50,
    width: 130,
  },
  buttonText: {
    color: '#8146C1',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#FEFEFF',
  },
  loading: {
    marginTop: 20,
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

export default LoginScreen;
