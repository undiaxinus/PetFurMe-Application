import React, { useState } from "react";
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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';

const axiosInstance = axios.create({
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json'
	}
});

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
	}) || `http://${SERVER_IP}:${SERVER_PORT}`;

	const handleLogin = async () => {
		try {
			setLoading(true);
			setError("");

			if (!email || !password) {
				setError("Please enter both email and password");
				return;
			}

			console.log('Attempting login with URL:', `${API_URL}/api/login`);
			
			const response = await axiosInstance.post(`${API_URL}/api/login`, {
				username: email,
				password: password,
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
			console.error("Login error details:", {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status,
				config: error.config
			});
			setError(
				error.response?.data?.error || 
				`Login failed: ${error.message}. Please try again.`
			);
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = () => {
		navigation.navigate('ForgotPassword'); // Make sure this matches the screen name in App.js
	};

	console.log('Navigation prop:', navigation);

	return (
		<View style={styles.container}>
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#8146C1" />
				</View>
			)}

			<View style={styles.logoContainer}>
				<Image
					source={require("../../assets/images/logo.png")}
					style={styles.logo}
				/>
				<Text style={styles.logoText}>VetCare</Text>
				<Text style={styles.subText}>Animal Clinic</Text>
				<Text style={styles.tagline}>Where caring means more.</Text>
			</View>

			<View style={styles.formContainer}>
				<View style={styles.inputContainer}>
					<MaterialCommunityIcons name="email" size={20} color="#666" />
					<TextInput
						style={styles.input}
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
				</View>

				<View style={styles.inputContainer}>
					<MaterialCommunityIcons name="lock" size={20} color="#666" />
					<TextInput
						style={styles.input}
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={!showPassword}
					/>
					<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
						<MaterialCommunityIcons
							name={showPassword ? "eye-off" : "eye"}
							size={20}
							color="#666"
						/>
					</TouchableOpacity>
				</View>

				<TouchableOpacity 
					style={styles.forgotPassword}
					onPress={handleForgotPassword}
				>
					<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
				</TouchableOpacity>

				{error ? <Text style={styles.errorText}>{error}</Text> : null}

				<TouchableOpacity
					style={[styles.loginButton, loading && styles.disabledButton]}
					onPress={handleLogin}
					disabled={loading}
				>
					<Text style={styles.loginButtonText}>LOGIN</Text>
				</TouchableOpacity>

				<View style={styles.signupContainer}>
					<Text style={styles.signupText}>Don't have an account? </Text>
					<TouchableOpacity 
						onPress={() => {
							console.log('Sign Up pressed');
							navigation.navigate('RegistrationScreen');
						}}
					>
						<Text style={styles.signupLink}>Sign Up</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.6)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 100,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	logo: {
		width: 120,
		height: 120,
		marginBottom: 20,
	},
	logoText: {
		fontSize: 32,
		fontWeight: 'bold',
		color: '#4A4A8F',
	},
	subText: {
		fontSize: 18,
		color: '#4A4A8F',
		marginTop: 5,
	},
	tagline: {
		fontSize: 14,
		color: '#666',
		marginTop: 5,
	},
	formContainer: {
		width: "100%",
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F5F5F5",
		borderRadius: 10,
		paddingHorizontal: 15,
		marginBottom: 15,
		height: 50,
	},
	input: {
		flex: 1,
		marginLeft: 10,
		color: "#333",
	},
	forgotPassword: {
		alignSelf: "flex-end",
		marginBottom: 20,
	},
	forgotPasswordText: {
		color: "#4A4A8F",
		fontSize: 14,
	},
	loginButton: {
		backgroundColor: "#8146C1",
		borderRadius: 10,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
	},
	loginButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
	signupContainer: {
		flexDirection: "row",
		justifyContent: "center",
	},
	signupText: {
		color: "#666",
	},
	signupLink: {
		color: "#4A4A8F",
		fontWeight: "bold",
	},
	errorText: {
		color: "#FF0000",
		textAlign: "center",
		marginTop: 10,
		fontSize: 14,
	},
	disabledButton: {
		opacity: 0.7,
	},
});

export default LoginScreen;
