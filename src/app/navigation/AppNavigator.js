import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import CustomDrawerContent from '../screens/CustomDrawerContent';
import ActivityHistoryScreen from '../screens/ActivityHistoryScreen';
import HomePage from '../screens/HomePage';
// Import other screens...

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function AppNavigator() {
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