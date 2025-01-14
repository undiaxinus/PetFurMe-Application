import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

// Import all screens
import HomeScreen from "./src/app/screens/HomeScreen";
import LoginScreen from "./src/app/screens/LoginScreen";
import RegistrationScreen from "./src/app/screens/RegistrationScreen";
import HomePage from "./src/app/screens/HomePage";
import ProfileScreen from "./src/app/screens/ProfileScreen";
import ChatScreen from "./src/app/screens/ChatScreen";
import AddPetName from "./src/app/screens/AddPetName";
import NotificationScreen from "./src/app/screens/NotificationScreen";
import LandingPage from "./src/app/screens/LandingPage";
import CustomDrawerContent from "./src/app/screens/CustomDrawerContent";
import ViewMorePro from "./src/app/screens/ViewMorePro";
import AddtoCart from "./src/app/screens/AddtoCart";
import AddedtoCart from "./src/app/screens/AddedtoCart";
import PetProfile from "./src/app/screens/PetProfile";
import BookAppointment from "./src/app/screens/BookAppointment";

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
			<Drawer.Screen name="AddPetName" component={AddPetName} />
			<Drawer.Screen name="ViewMorePro" component={ViewMorePro} />
			<Drawer.Screen name="AddtoCart" component={AddtoCart} />
			<Drawer.Screen name="AddedtoCart" component={AddedtoCart} />
			<Drawer.Screen name="BookAppointment" component={BookAppointment} />
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
