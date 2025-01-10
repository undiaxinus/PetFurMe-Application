import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './HomeScreen'; 
import LoginScreen from './LoginScreen';
import RegistrationScreen from './RegistrationScreen';
import HomePage from './HomePage';
import ProfileScreen from './ProfileScreen';
import ChatScreen from './ChatScreen';
import NotificationScreen from './NotificationScreen';
import LandingPage from './LandingPage';
import Profile2 from './Profile2';
import Profile3 from './Profile3';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{ headerShown: false }} // Globally hide headers
      >
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="HomePage" component={HomePage} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="Landing" component={LandingPage} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name='Profile2' component={Profile2} />
        <Stack.Screen name='Profile3' component={Profile3} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
