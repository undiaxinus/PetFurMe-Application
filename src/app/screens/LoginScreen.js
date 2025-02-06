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

	const API_URL = Platform.select({
		web: `http://${SERVER_IP}:${SERVER_PORT}`,
		ios: `http://localhost:${SERVER_PORT}`,
		android: `http://${SERVER_IP}:${SERVER_PORT}`
	});

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
	}, []);

	const handleLogin = async () => {
		try {
			setLoading(true);
			setError("");

			if (!email || !password) {
				setError("Please enter both email and password");
				return;
			}

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
				// Remove withCredentials if you're not using cookies
				// withCredentials: true
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
			console.error("Login error:", error);
			if (error.response) {
				setError(error.response.data?.error || "Server error occurred");
			} else if (error.request) {
				setError("Unable to connect to server. Please check your connection.");
			} else {
				setError("An unexpected error occurred");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = () => {
		navigation.navigate('ForgotPassword'); // Make sure this matches the screen name in App.js
	};

	return (
		<View style={styles.container}>
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#8146C1" />
				</View>
			)}

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
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(129, 70, 193, 0.4)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 100,
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
});

export default LoginScreen;
