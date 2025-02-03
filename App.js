import React from "react";
import { Platform } from "react-native";
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
const App = () => {
	// Add web-specific navigation container config
	const navigationConfig = Platform.select({
		web: {
			linking: {
				enabled: true,
				config: {
					screens: {
						Home: '',
						Login: 'login',
						Register: 'register',
						// ... add other routes
					}
				}
			}
		},
		default: {}
	});

	return (
		<NavigationContainer {...navigationConfig}>
			<Stack.Navigator
				initialRouteName="HomeScreen"
				screenOptions={{ headerShown: false }}
			>
				{/* Authentication and Landing Screens */}
				<Stack.Screen name="HomeScreen" component={HomeScreen} />
				<Stack.Screen name="LoginScreen" component={LoginScreen} />
				<Stack.Screen name="Register" component={RegistrationScreen} />
				<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
				<Stack.Screen name="LandingPage" component={LandingPage} />

				{/* Remove duplicate screens that are in DrawerNavigator */}
				<Stack.Screen name="PetProfile" component={PetProfile} />
				<Stack.Screen name="AddPetName" component={AddPetName} />
				<Stack.Screen name="AddPetSize" component={AddPetSize} />
				<Stack.Screen name="BookAppointment" component={BookAppointment} />
				<Stack.Screen name="Consultation" component={Consultation} />
				<Stack.Screen name="Vaccination" component={Vaccination} />
				<Stack.Screen name="Deworming" component={Deworming} />
				<Stack.Screen name="Grooming" component={Grooming} />
				<Stack.Screen name="Help" component={Help} />
				<Stack.Screen name="UpdatePetProfile" component={UpdatePetProfile} />

				{/* Drawer Navigator */}
				<Stack.Screen name="DrawerNavigator" component={DrawerNavigator} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default App;
