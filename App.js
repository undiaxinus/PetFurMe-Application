import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './HomeScreen'; // Ensure this file exists and works correctly
import LoginScreen from './LoginScreen';
import RegistrationScreen from './RegistrationScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
