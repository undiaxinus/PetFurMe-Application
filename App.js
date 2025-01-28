import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AppNavigator from './src/app/navigation/AppNavigator';

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
import AddPetSize from "./src/app/screens/AddPetSize";
import ForgotPasswordScreen from "./src/app/screens/ForgotPasswordScreen";
import ProfileVerification from "./src/app/screens/ProfileVerification";
import UpdatePetProfile from "./src/app/screens/UpdatePetProfile";
import ActivityHistoryScreen from "./src/app/screens/ActivityHistoryScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator
function DrawerNavigator() {
	return (
		<Drawer.Navigator
			drawerContent={(props) => <CustomDrawerContent {...props} />}
			screenOptions={{ headerShown: false }}
		>
			<Drawer.Screen name="HomePage" component={HomePage} />
			<Drawer.Screen name="ChatScreen" component={ChatScreen} />
			<Drawer.Screen name="NotificationScreen" component={NotificationScreen} />
			<Drawer.Screen name="ProfileVerification" component={ProfileVerification} />
			<Drawer.Screen name="ViewMorePro" component={ViewMorePro} />
			<Drawer.Screen name="Help" component={Help} />
			<Drawer.Screen name="ActivityHistory" component={ActivityHistoryScreen} />
		</Drawer.Navigator>
	);
}

// Main Stack Navigator
export default function App() {
	return (
		<NavigationContainer>
			<AppNavigator />
		</NavigationContainer>
	);
}
