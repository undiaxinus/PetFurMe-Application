import 'react-native-gesture-handler';
import React from "react";
import { Platform, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast, { BaseToast } from 'react-native-toast-message';
import ErrorBoundary from './src/app/components/ErrorBoundary';
import * as Font from 'expo-font';

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
import ProductListScreen from "./src/app/screens/ProductListScreen";
import Appointment from "./src/app/screens/Appointment";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Drawer Navigator
const DrawerNavigator = () => {
	return (
		<Drawer.Navigator
			drawerContent={props => <CustomDrawerContent {...props} />}
			screenOptions={{
				headerShown: false,
				drawerStyle: {
					backgroundColor: '#fff',
					width: 280,
				},
				swipeEnabled: true,
				gestureEnabled: true,
				drawerType: 'front',
				overlayColor: 'rgba(0,0,0,0.5)',
			}}
			initialRouteName="HomePage"
		>
			<Drawer.Screen 
				name="HomePage" 
				component={HomePage}
				options={{
					drawerLabel: 'Home',
				}}
			/>
			<Drawer.Screen 
				name="NotificationScreen" 
				component={NotificationScreen}
				options={{
					drawerLabel: 'Notifications',
				}}
			/>
			<Drawer.Screen 
				name="Profile" 
				component={ProfileScreen}
				options={{
					drawerLabel: 'Profile',
				}}
			/>
			<Drawer.Screen 
				name="ChatScreen" 
				component={ChatScreen}
				options={{
					drawerLabel: 'Chat',
				}}
			/>
			<Drawer.Screen 
				name="Help" 
				component={Help}
				options={{
					drawerLabel: 'Help',
				}}
			/>
			<Drawer.Screen 
				name="ActivityHistory" 
				component={ActivityHistoryScreen}
				options={{
					drawerLabel: 'Activity History',
				}}
			/>
			<Drawer.Screen 
				name="Appointment" 
				component={Appointment}
				options={{
					drawerLabel: 'Appointments',
				}}
			/>
		</Drawer.Navigator>
	);
};

// Add this toast config before the App component
const toastConfig = {
	success: (props) => (
		<BaseToast
			{...props}
			style={{ borderLeftColor: '#8146C1' }}
			contentContainerStyle={{ paddingHorizontal: 15 }}
			text1Style={{
				fontSize: 15,
				fontWeight: '500'
			}}
			text2Style={{
				fontSize: 13
			}}
		/>
	),
	error: (props) => (
		<BaseToast
			{...props}
			style={{ borderLeftColor: '#FF0000' }}
			contentContainerStyle={{ paddingHorizontal: 15 }}
			text1Style={{
				fontSize: 15,
				fontWeight: '500'
			}}
			text2Style={{
				fontSize: 13
			}}
		/>
	)
};

// Main Stack Navigator
const App = () => {
	const [fontsLoaded] = Font.useFonts({
		// Your fonts here
	});

	if (!fontsLoaded) {
		return null;
	}

	// Add web-specific navigation container config
	const navigationConfig = Platform.select({
		web: {
			linking: {
				enabled: true,
				prefixes: ['http://localhost:8081'], // Add your domain
				config: {
					screens: {
						HomeScreen: '',
						LoginScreen: 'login',
						Register: 'register',
						Appointment: {
							path: 'appointment',
							parse: {
								user_id: (user_id) => String(user_id),
								timestamp: (timestamp) => Number(timestamp),
								fromConsultation: (value) => value === 'true'
							},
						},
						DrawerNavigator: {
							screens: {
								HomePage: 'home',
								NotificationScreen: 'notifications',
								Profile: 'profile',
								ChatScreen: 'chat',
								Help: 'help',
								ActivityHistory: 'activity'
							}
						}
					}
				}
			}
		},
		default: {}
	});

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<ErrorBoundary>
				<NavigationContainer {...navigationConfig} fallback={<Text>Loading...</Text>}>
					<Stack.Navigator
						initialRouteName="HomeScreen"
						screenOptions={{
							headerShown: false,
							gestureEnabled: true,
							cardStyleInterpolator: ({ current, layouts }) => ({
								cardStyle: {
									transform: [
										{
											translateX: current.progress.interpolate({
												inputRange: [0, 1],
												outputRange: [layouts.screen.width, 0],
											}),
										},
									],
								},
							}),
						}}
					>
						{/* Authentication and Landing Screens */}
						<Stack.Screen name="HomeScreen" component={HomeScreen} />
						<Stack.Screen name="LoginScreen" component={LoginScreen} />
						<Stack.Screen name="Register" component={RegistrationScreen} />
						<Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
						<Stack.Screen name="LandingPage" component={LandingPage} />

						{/* Add ProfileVerification screen here */}
						<Stack.Screen name="ProfileVerification" component={ProfileVerification} />

						{/* Add ViewMorePro screen here */}
						<Stack.Screen name="ViewMorePro" component={ViewMorePro} />

						{/* Remove duplicate screens that are in DrawerNavigator */}
						<Stack.Screen name="PetProfile" component={PetProfile} />
						<Stack.Screen name="AddPetName" component={AddPetName} />
						<Stack.Screen name="AddPetSize" component={AddPetSize} />
						<Stack.Screen name="BookAppointment" component={BookAppointment} />
						<Stack.Screen name="Consultation" component={Consultation} />
						<Stack.Screen name="Vaccination" component={Vaccination} />
						<Stack.Screen name="Deworming" component={Deworming} />
						<Stack.Screen name="Grooming" component={Grooming} />
						<Stack.Screen name="UpdatePetProfile" component={UpdatePetProfile} />

						{/* DrawerNavigator (which now includes Appointment) */}
						<Stack.Screen 
							name="DrawerNavigator" 
							component={DrawerNavigator}
							options={{ headerShown: false }}
						/>

						{/* Add ProductListScreen */}
						<Stack.Screen 
							name="ProductListScreen" 
							component={ProductListScreen}
							options={{ 
								headerShown: false,
								initialParams: { user_id: undefined }
							}}
						/>

						<Stack.Screen 
							name="CreatePetProfile" 
							component={AddPetName}
							options={{
								title: 'Add New Pet',
								headerShown: true,
								headerStyle: {
									backgroundColor: '#8146C1',
								},
								headerTintColor: '#FFFFFF',
								headerTitleStyle: {
									fontWeight: 'bold',
								},
							}}
						/>
					</Stack.Navigator>
				</NavigationContainer>
				<Toast config={toastConfig} />
			</ErrorBoundary>
		</GestureHandlerRootView>
	);
};

export default App;
