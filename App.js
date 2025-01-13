import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Import all screens
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
import PetProfile from './PetProfile';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }} // Hide headers for drawer screens
    >
      <Drawer.Screen name="HomePage" component={HomePage} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Chat" component={ChatScreen} />
      <Drawer.Screen name="Notification" component={NotificationScreen} />
      <Drawer.Screen name="PetCategory" component={PetCategory} />
      <Drawer.Screen name="AddPetName" component={AddPetName} />
      <Drawer.Screen name="AddPetSize" component={AddPetSize} />
      <Drawer.Screen name="AddPetBirth" component={AddPetBirth} />
      <Drawer.Screen name="ViewMorePro" component={ViewMorePro} />
      <Drawer.Screen name="AddtoCart" component={AddtoCart} />
      <Drawer.Screen name="AddedtoCart" component={AddedtoCart} />
    </Drawer.Navigator>
  );
}

// Main Stack Navigator
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{ headerShown: false }} // Hide headers globally
      >
        {/* Authentication and Landing Screens */}
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="LandingPage" component={LandingPage} />
        <Stack.Screen name="PetProfile" component={PetProfile} />

        {/* Drawer Navigator */}
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
