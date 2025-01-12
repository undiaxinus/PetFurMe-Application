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
import PetCategory from './PetCategory';
import AddPetName from './AddPetName';
import AddPetSize from './AddPetSize';
import AddPetBirth from './AddPetBirth';
import CustomDrawerContent from './CustomDrawerContent';
import ViewMorePro from './ViewMorePro';
import AddtoCart from './AddtoCart';
import AddedtoCart from './AddedtoCart';

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
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name='PetCategory' component={PetCategory} />
        <Stack.Screen name='AddPetName' component={AddPetName} />
        <Stack.Screen name='AddPetSize' component={AddPetSize} />
        <Stack.Screen name='AddPetBirth' component={AddPetBirth} />
        <Stack.Screen name='CustomDrawerContent' component={CustomDrawerContent} />
        <Stack.Screen name='ViewMorePro' component={ViewMorePro} />
        <Stack.Screen name='AddtoCart' component={AddtoCart} />
        <Stack.Screen name='AddedtoCart' component={AddedtoCart} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
