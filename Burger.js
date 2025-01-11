import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import CustomDrawerContent, { DrawerMenuItems } from './CustomDrawerContent'; // Update path accordingly
import HomePage from './HomePage'; // Replace with your actual components

const Drawer = createDrawerNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveTintColor: '#8146C1',
          drawerInactiveTintColor: '#000000',
          drawerLabelStyle: { fontSize: 16 },
        }}
      >
        {DrawerMenuItems.map((item) => (
          <Drawer.Screen
            key={item.id}
            name={item.screen}
            component={HomePage} // Replace with respective screens
            options={{
              drawerIcon: ({ color, size }) => (
                <Ionicons name={item.icon} size={size} color={color} />
              ),
            }}
          />
        ))}
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

export default App;
