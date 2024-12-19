import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from './supabaseclient';

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (isLogin) {
      // Login logic
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        Alert.alert('Login Error', error.message);
      } else {
        Alert.alert('Success', 'You are logged in!');
      }
    } else {
      // Signup logic
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        Alert.alert('Signup Error', error.message);
      } else {
        Alert.alert('Success', 'Account created! Check your email for confirmation.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={isLogin ? 'Log In' : 'Sign Up'} onPress={handleAuth} />
      <Text style={styles.switchText}>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}
      </Text>
      <Button
        title={isLogin ? 'Sign Up' : 'Log In'}
        onPress={() => setIsLogin(!isLogin)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  switchText: {
    marginVertical: 10,
    fontSize: 16,
  },
});

export default AuthScreen;
