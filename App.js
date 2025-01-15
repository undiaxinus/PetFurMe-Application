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
import PetProfile from "./src/app/screens/PetProfile";
import BookAppointment from "./src/app/screens/BookAppointment";
import Consultation from "./src/app/screens/Consultation";
import Vaccination from "./src/app/screens/Vaccination";
import Deworming from "./src/app/screens/Deworming";
import Grooming from "./src/app/screens/Grooming";
import Help from "./src/app/screens/Help";

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
				<Stack.Screen name="ChatScreen" component={ChatScreen} />

				<Stack.Screen name="Profile" component={ProfileScreen} />
				<Stack.Screen name="NotificationScreen" component={NotificationScreen} />
				<Stack.Screen name="AddPetName" component={AddPetName} />
				<Stack.Screen name="ViewMorePro" component={ViewMorePro} />
				<Stack.Screen name="BookAppointment" component={BookAppointment} />
				<Stack.Screen name="Consultation" component={Consultation} />
				<Stack.Screen name="Vaccination" component={Vaccination} />
				<Stack.Screen name="Deworming" component={Deworming} />
				<Stack.Screen name="Grooming" component={Grooming} />
				<Stack.Screen name="Help" component={Help} />

				{/* Drawer Navigator */}
				<Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
			</Stack.Navigator>
		</NavigationContainer>
	);
}
