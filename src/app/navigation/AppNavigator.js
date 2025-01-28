import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import CustomDrawerContent from '../screens/CustomDrawerContent';
import ActivityHistoryScreen from '../screens/ActivityHistoryScreen';
import HomePage from '../screens/HomePage';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
// Import other screens...

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="RegistrationScreen" component={RegistrationScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      {/* ... other screens */}
    </Stack.Navigator>
  );
};

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Home" component={HomePage} />
      <Drawer.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
      {/* Other drawer screens */}
    </Drawer.Navigator>
  );
}

export default AppNavigator; 