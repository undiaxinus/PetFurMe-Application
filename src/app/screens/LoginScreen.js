import React, { useState, useEffect, useRef } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Image,
	ActivityIndicator,
	Alert,
	Platform,
	Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL, SERVER_IP, SERVER_PORT, checkServerConnectivity, SERVER_CONFIGS, changeServer, useStandardHTTPS, API_BASE_URL, AUTH_BASE_URL, AUTH_API_URL } from '../config/constants';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false); // New state for password visibility
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [visibleError, setVisibleError] = useState("");
	const [rememberMe, setRememberMe] = useState(false); // New state for remember me option

	const API_URL = API_BASE_URL; // Use the API_BASE_URL which includes PetFurMe-Application/api

	// Add these animations
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;

	// Replace direct console usage with conditional logging
	const log = __DEV__ ? console.log : () => {};
	const logError = __DEV__ ? console.error : () => {};

	// Add this function to check network connectivity and DNS resolution
	const checkNetworkAndDns = async () => {
		try {
			log('===== NETWORK DIAGNOSTIC =====');
			
			// Check basic internet connectivity first
			const netInfo = await NetInfo.fetch();
			log('Network state:', {
				type: netInfo.type,
				isConnected: netInfo.isConnected,
				isInternetReachable: netInfo.isInternetReachable,
				details: netInfo.details
			});
			
			if (!netInfo.isConnected) {
				return {
					success: false,
					error: 'Device is not connected to any network'
				};
			}
			
			// Try to resolve the domain name with a standard HTTP request first
			log(`Testing DNS resolution for ${SERVER_IP}...`);
			try {
				const dnsCheckStart = Date.now();
				const response = await fetch(`https://${SERVER_IP}`, { 
					method: 'HEAD',
					mode: 'no-cors',
					timeout: 3000
				});
				const dnsCheckTime = Date.now() - dnsCheckStart;
				log(`DNS resolution successful in ${dnsCheckTime}ms`);
			} catch (dnsError) {
				log(`DNS resolution error:`, dnsError);
				
				// Try IP-only request if hostname fails
				if (SERVER_IP.match(/^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$/)) {
					log('Server appears to be an IP address, not a hostname');
				} else {
					log('Checking if the issue is DNS-related...');
				}
			}
			
			// Check if the server port is properly defined
			if (!SERVER_PORT) {
				logError('SERVER_PORT is undefined or null!', { SERVER_PORT });
				return {
					success: false,
					error: 'Server port is not properly configured in the app'
				};
			}
			
			log('===== NETWORK DIAGNOSTIC COMPLETE =====');
			return { success: true };
		} catch (error) {
			logError('Network diagnostic error:', error);
			return {
				success: false,
				error: 'Failed to complete network diagnostics'
			};
		}
	};

	// Update testConnection to handle CORS in web mode
	const testConnection = async () => {
		try {
			log('===== CONNECTION TEST =====');
			
			// First perform network diagnostics
			const networkCheck = await checkNetworkAndDns();
			if (!networkCheck.success) {
				setError(`Network issue: ${networkCheck.error}`);
				return false;
			}
			
			// Use the correct protocol based on port
			const protocol = SERVER_PORT === 443 ? 'https' : 'http';
			const rootUrl = `${protocol}://${SERVER_IP}${(SERVER_PORT !== 80 && SERVER_PORT !== 443) ? `:${SERVER_PORT}` : ''}`;
			
			log('Testing connection to server:', rootUrl);
			
			try {
				// For web platform, we need to use no-cors mode
				const fetchOptions = {
					method: 'GET',
					mode: Platform.OS === 'web' ? 'no-cors' : undefined,
					cache: 'no-cache'
				};
				
				// Try a simple ping to see if the server is reachable
				const response = await fetch(rootUrl, fetchOptions);
				
				// With no-cors mode, we can't check response details,
				// but if we get here without an error, the server is reachable
				log('Server is reachable!');
				return true;
			} catch (error) {
				log('===== CONNECTION TEST FAILED =====');
				logError('Connection test error type:', error.constructor.name);
				logError('Connection test failed:', {
					message: error.message,
					code: error.code,
					name: error.name
				});
				
				setError(`Cannot connect to server. Error: ${error.message}`);
				return false;
			}
		} catch (error) {
			log('===== CONNECTION TEST FAILED =====');
			setError(`Error: ${error.message}`);
			return false;
		}
	};

	useEffect(() => {
		log('===== LOGIN SCREEN MOUNTED =====');
		log('Environment details:', {
			Platform: Platform.OS,
			SERVER_IP,
			SERVER_PORT,
			API_URL,
			BASE_URL
		});
		
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 500,
				useNativeDriver: true,
			}),
			Animated.timing(slideAnim, {
				toValue: 0,
				duration: 500,
				useNativeDriver: true,
			}),
		]).start();

		// Load saved credentials if they exist
		loadSavedCredentials();

		// Call the testConnection function
		log('Initiating connection test on component mount...');
		testConnection().then(success => {
			log('Initial connection test result:', success ? 'SUCCESS' : 'FAILED');
		});

		// Clear loading state if screen is stuck
		const timeoutId = setTimeout(() => {
			if (loading || isLoading) {
				log('Login timeout detected - resetting loading state');
				setLoading(false);
				setIsLoading(false);
				setVisibleError("Connection timed out. Please try again.");
			}
		}, 10000);

		return () => {
			log('===== LOGIN SCREEN UNMOUNTED =====');
			clearTimeout(timeoutId);
		};
	}, []);

	// Add this function to load saved credentials
	const loadSavedCredentials = async () => {
		try {
			const savedCredentials = await AsyncStorage.getItem('savedCredentials');
			if (savedCredentials) {
				const { savedEmail, savedPassword } = JSON.parse(savedCredentials);
				setEmail(savedEmail);
				setPassword(savedPassword);
				setRememberMe(true);
				log('Loaded saved credentials');
			}
		} catch (error) {
			logError('Error loading saved credentials:', error);
		}
	};

	// Add this function to save credentials
	const saveCredentials = async () => {
		try {
			if (rememberMe) {
				await AsyncStorage.setItem('savedCredentials', JSON.stringify({
					savedEmail: email,
					savedPassword: password
				}));
				log('Credentials saved successfully');
			} else {
				await AsyncStorage.removeItem('savedCredentials');
				log('Credentials removed');
			}
		} catch (error) {
			logError('Error saving credentials:', error);
		}
	};

	const handleLogin = async () => {
		try {
			log('===== LOGIN ATTEMPT =====');
			
			setLoading(true);
			setError('');
			
			const loginData = {
				email: email,
				password: password
			};
			
			// Fix the URL construction to match the working PHP endpoint
			const loginUrl = `${API_BASE_URL}/auth/login.php`;  // This should point to your PHP endpoint
			
			log('Sending login request to:', loginUrl);
			
			const axiosConfig = {
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				timeout: 15000,
				withCredentials: false
			};
			
			try {
				const response = await axios.post(loginUrl, loginData, axiosConfig);
				
				log('Login response:', response.data);
				
				if (response.data.success) {
					// Save credentials if remember me is checked
					await saveCredentials();
					
					// Store user data
					const userData = {
						user_id: response.data.user.id,
						name: response.data.user.name,
						username: response.data.user.email,
						role: response.data.user.role
					};
					
					await AsyncStorage.setItem('userData', JSON.stringify(userData));
					
					// Navigate to home screen
					navigation.navigate('DrawerNavigator', { 
						screen: 'HomePage',
						params: { user_id: userData.user_id }
					});
				} else {
					setError(response.data.error || 'Login failed. Please try again.');
				}
			} catch (error) {
				logError('Login error:', error);
				
				if (error.code === 'ECONNABORTED') {
					setError('Connection timed out. Please try again.');
				} else if (error.response) {
					setError(error.response.data.error || `Server error: ${error.response.status}`);
				} else if (error.request) {
					setError('No response from server. Please check your connection.');
				} else {
					setError(`Error: ${error.message}`);
				}
			}
		} catch (error) {
			logError('===== LOGIN ATTEMPT FAILED =====');
			logError('Login error details:', error);
			setError(`Login failed: ${error.message}`);
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = () => {
		navigation.navigate('ForgotPassword'); // Make sure this matches the screen name in App.js
	};

	const handleLoginError = (error) => {
		if (error.code === 'ECONNABORTED') {
			setError('Connection timed out. Please try again.');
		} else if (error.response) {
			setError(error.response.data.error || `Server error: ${error.response.status}`);
		} else if (error.request) {
			setError('No response from server. Please check your connection.');
		} else {
			setError(`Error: ${error.message}`);
		}
		logError('===== LOGIN ATTEMPT FAILED =====');
		logError('Login error details:', error);
	};

	log('Environment:', {
		Platform: Platform.OS,
		SERVER_IP,
		SERVER_PORT,
		API_URL,
		BASE_URL
	});

	return (
		<View style={styles.container}>
			{isLoading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#8146C1" />
					<Text style={styles.loadingText}>Connecting to server...</Text>
				</View>
			)}
			
			{visibleError ? (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{visibleError}</Text>
					<TouchableOpacity 
						style={styles.retryButton}
						onPress={() => {
							setVisibleError("");
							testConnection();
						}}
					>
						<Text style={styles.retryButtonText}>Retry Connection</Text>
					</TouchableOpacity>
				</View>
			) : null}

			<Animated.View 
				style={[
					styles.content,
					{
						opacity: fadeAnim,
						transform: [{ translateY: slideAnim }],
					}
				]}
			>
				<View style={styles.logoContainer}>
					<Image
						source={require("../../assets/images/vetcare.png")}
						style={styles.logo}
					/>
				</View>

				<View style={styles.inputWrapper}>
					<Ionicons
						name="mail-outline"
						size={20}
						color="#8146C1"
						style={styles.icon}
					/>
					<TextInput
						style={styles.input}
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						placeholderTextColor="#666666"
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.inputWrapper}>
					<Ionicons
						name="lock-closed-outline"
						size={20}
						color="#8146C1"
						style={styles.icon}
					/>
					<TextInput
						style={styles.input}
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={!showPassword}
						placeholderTextColor="#666666"
					/>
					<TouchableOpacity 
						onPress={() => setShowPassword(!showPassword)}
						style={styles.eyeIcon}
					>
						<Ionicons
							name={showPassword ? "eye-outline" : "eye-off-outline"}
							size={20}
							color="#8146C1"
						/>
					</TouchableOpacity>
				</View>

				<View style={styles.rememberForgotContainer}>
					<TouchableOpacity 
						style={styles.rememberMeContainer} 
						onPress={() => setRememberMe(!rememberMe)}
					>
						<View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
							{rememberMe && (
								<Ionicons name="checkmark" size={14} color="#FFFFFF" />
							)}
						</View>
						<Text style={styles.rememberMeText}>Remember Me</Text>
					</TouchableOpacity>

					<TouchableOpacity onPress={handleForgotPassword}>
						<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
					</TouchableOpacity>
				</View>

				{error ? <Text style={styles.errorText}>{error}</Text> : null}

				<TouchableOpacity
					style={[styles.loginButton, (!email || !password || loading) && styles.disabledButton]}
					disabled={!email || !password || loading}
					onPress={handleLogin}
				>
					<Text style={styles.loginButtonText}>LOGIN</Text>
				</TouchableOpacity>

				<View style={styles.registerContainer}>
					<Text style={styles.registerText}>Don't have an account? </Text>
					<TouchableOpacity onPress={() => navigation.navigate('Register')}>
						<Text style={styles.registerLink}>Register</Text>
					</TouchableOpacity>
				</View>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F0E6FF",  // Light violet background
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	loadingOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(129, 70, 193, 0.9)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000
	},
	content: {
		width: "100%",
		maxWidth: 400,
		padding: 25,
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		borderRadius: 16,
		shadowColor: "#8146C1",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 30,
	},
	logo: {
		width: 150,
		height: 150,
		resizeMode: "contain",
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 15,
		paddingVertical: 12,
	},
	icon: {
		marginRight: 12,
	},
	eyeIcon: {
		padding: 4,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: "#333333",
		paddingVertical: 0,
	},
	loginButton: {
		backgroundColor: "#8146C1",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		marginTop: 24,
		marginBottom: 20,
		width: "100%",
		alignSelf: "center",
		shadowColor: "#8146C1",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 4,
	},
	loginButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
		letterSpacing: 1,
	},
	errorText: {
		color: "#FF4444",
		textAlign: "center",
		marginTop: 10,
		fontSize: 14,
	},
	disabledButton: {
		opacity: 0.7,
	},
	rememberForgotContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 8,
	},
	rememberMeContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	checkbox: {
		width: 20,
		height: 20,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: '#8146C1',
		marginRight: 8,
		justifyContent: 'center',
		alignItems: 'center',
	},
	checkboxChecked: {
		backgroundColor: '#8146C1',
	},
	rememberMeText: {
		color: '#666666',
		fontSize: 14,
	},
	forgotPasswordText: {
		color: '#8146C1',
		fontSize: 14,
		fontWeight: '500',
	},
	registerContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 16,
	},
	registerText: {
		color: '#666666',
		fontSize: 14,
	},
	registerLink: {
		color: '#8146C1',
		fontSize: 14,
		fontWeight: '600',
	},
	loadingText: {
		color: '#FFFFFF',
		marginTop: 10,
		fontSize: 16
	},
	errorContainer: {
		padding: 20,
		alignItems: 'center'
	},
	retryButton: {
		marginTop: 20,
		padding: 10,
		backgroundColor: '#8146C1',
		borderRadius: 5
	},
	retryButtonText: {
		color: '#FFFFFF'
	},
});

export default LoginScreen;
