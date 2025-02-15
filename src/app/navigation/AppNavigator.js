import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import CustomDrawerContent from '../screens/CustomDrawerContent';
import ActivityHistoryScreen from '../screens/ActivityHistoryScreen';
import HomePage from '../screens/HomePage';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import NotificationHelpScreen from '../screens/NotificationHelpScreen';
import { NavigationContainer } from '@react-navigation/native';
import { screenTransitionConfig, forSlide } from '../config/transitions';
import Appointment from '../screens/Appointment';
// Import other screens...

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        cardStyleInterpolator: forSlide,
        transitionSpec: {
          open: screenTransitionConfig,
          close: screenTransitionConfig,
        },
      }}
    >
      <Stack.Screen name="Home" component={HomePage} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegistrationScreen} />
      <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
      <Stack.Screen 
        name="NotificationHelp" 
        component={NotificationHelpScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Appointment" 
        component={Appointment}
        options={{ headerShown: false }}
      />
      {/* Other drawer screens */}
    </Stack.Navigator>
  );
}

export default AppNavigator; 