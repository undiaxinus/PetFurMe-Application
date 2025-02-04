import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import CustomDrawerContent from '../screens/CustomDrawerContent';
import ActivityHistoryScreen from '../screens/ActivityHistoryScreen';
import HomePage from '../screens/HomePage';
import LoginScreen from '../screens/LoginScreen';
import RegistrationScreen from '../screens/RegistrationScreen';
import { NavigationContainer } from '@react-navigation/native';
// Import other screens...

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomePage} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
        <Stack.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
        {/* Other drawer screens */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator; 