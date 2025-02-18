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
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';

const LoginScreen = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false); // New state for password visibility
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [visibleError, setVisibleError] = useState("");

	const API_URL = BASE_URL; // Use the BASE_URL from constants directly

	// Add these animations
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;

	useEffect(() => {
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

		// Add connection test on component mount
		const testConnection = async () => {
			try {
				console.log('Testing connection to:', `${API_URL}/health`);
				const response = await axios.get(`${API_URL}/health`, { 
					timeout: 5000,
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					// Add retry logic
					validateStatus: function (status) {
						return status >= 200 && status < 300;
					},
				});
				console.log('Server health check response:', response.data);
				setError(""); // Clear any existing errors
				return true;
			} catch (error) {
				console.error('Connection test failed:', {
					message: error.message,
					code: error.code,
					config: error.config
				});
				
				// More specific error messages
				if (error.code === 'ECONNABORTED') {
					setError('Connection timed out. Please check if the server is running.');
				} else if (error.code === 'ERR_NETWORK') {
					setError('Network error. Please check:\n1. Is the server running?\n2. Is XAMPP running?\n3. Check port 3001 is free');
				} else {
					setError(`Cannot connect to server. Error: ${error.message}`);
				}
				return false;
			}
		};

		testConnection();

		// Clear loading state if screen is stuck
		const timeoutId = setTimeout(() => {
			if (isLoading) {
				setIsLoading(false);
				setVisibleError("Connection timed out. Please try again.");
			}
		}, 10000);

		return () => clearTimeout(timeoutId);
	}, []);

	const handleLogin = async () => {
		try {
			setIsLoading(true);
			setError("");

			console.log('Login attempt:', {
				API_URL,
				SERVER_IP,
				SERVER_PORT,
				Platform: Platform.OS
			});

			if (!email || !password) {
				setError("Please enter both email and password");
				return;
			}

			// Add connection test
			try {
				console.log('Testing connection to:', `${API_URL}/health`);
				const healthCheck = await axios.get(`${API_URL}/health`, { timeout: 5000 });
				console.log('Server health check:', healthCheck.data);
			} catch (healthError) {
				console.error('Health check failed:', healthError);
				setError(`Cannot connect to server (${SERVER_IP}:${SERVER_PORT}). Please check your connection and server address.`);
				return;
			}

			console.log('Attempting login to:', `${API_URL}/api/login`);

			const response = await axios({
				method: 'post',
				url: `${API_URL}/api/login`,
				data: {
					username: email,
					password: password
				},
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				},
				timeout: 10000,
			});

			console.log("Login response:", response.data);

			if (response.data.success) {
				navigation.navigate("DrawerNavigator", { 
					screen: 'HomePage',
					params: { user_id: response.data.user.id }
				});
			} else {
				setError(response.data.error || "Login failed");
			}
		} catch (error) {
			console.error('Login error:', {
				message: error.message,
				code: error.code,
				response: error.response?.data,
				config: error.config,
				stack: error.stack
			});
			
			if (error.code === 'ECONNABORTED') {
				setError(`Connection timed out. Server (${SERVER_IP}:${SERVER_PORT}) is not responding.`);
			} else if (error.code === 'ERR_NETWORK') {
				setError(`Network error. Please check if:\n- Server is running (${SERVER_IP}:${SERVER_PORT})\n- IP is correct\n- You're on the same network`);
			} else if (error.response) {
				setError(error.response.data?.error || `Server error: ${error.response.status}`);
			} else if (error.request) {
				setError(`Cannot reach server at ${API_URL}. Check your connection.`);
			} else {
				setError(`Error: ${error.message}`);
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleForgotPassword = () => {
		navigation.navigate('ForgotPassword'); // Make sure this matches the screen name in App.js
	};

	console.log('Environment:', {
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

				<TouchableOpacity onPress={handleForgotPassword}>
					<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
				</TouchableOpacity>

				{error ? <Text style={styles.errorText}>{error}</Text> : null}

				<TouchableOpacity
					style={[styles.loginButton, loading && styles.disabledButton]}
					onPress={handleLogin}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator size="small" color="#FFFFFF" />
					) : (
						<Text style={styles.loginButtonText}>LOGIN</Text>
					)}
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
	forgotPasswordText: {
		color: '#8146C1',
		textAlign: 'right',
		fontSize: 14,
		marginTop: 8,
		marginBottom: 8,
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
	}
});

export default LoginScreen;
