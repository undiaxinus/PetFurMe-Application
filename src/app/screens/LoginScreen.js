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
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const LoginScreen = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false); // New state for password visibility
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const API_URL = Platform.select({
		ios: "http://localhost:3001",
		android: "http://192.168.1.5:3001",
	});

	const handleLogin = async () => {
		try {
			setLoading(true);
			setError("");

			if (!email || !password) {
				setError("Please enter both email and password");
				return;
			}

			const response = await axios.post(`${API_URL}/api/login`, {
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
			console.error("Login error:", error);
			setError(
				error.response?.data?.error || "Login failed. Please try again."
			);
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

			<View style={styles.logoContainer}>
				<Image
					source={require("../../assets/images/vetcare.png")}
					style={styles.logo}
				/>
			</View>

			<View style={styles.formContainer}>
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
						placeholderTextColor="#8146C1"
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
						placeholderTextColor="#8146C1"
					/>
					<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
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
					<Text style={styles.loginButtonText}>LOGIN</Text>
				</TouchableOpacity>

				<Text style={styles.footerText}>
					Don't have an account?{" "}
					<Text
						style={styles.signUpText}
						onPress={() => navigation.navigate("Register")}
					>
						Sign Up
					</Text>
				</Text>
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
		width: 180,
		height: 180,
		resizeMode: "contain",
	},
	formContainer: {
		width: "100%",
		padding: 20,
		backgroundColor: "#D1ACDA",
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 8,
		marginBottom: 20,
		height: 'auto',
		paddingBottom: 30,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 15,
		borderWidth: 1,
		borderColor: "#8146C1",
		borderRadius: 12,
		backgroundColor: "#F5F5F5",
		paddingHorizontal: 15,
		paddingVertical: 8,
		marginTop: 10,
	},
	icon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: "#8146C1",
		paddingVertical: 8,
	},
	loginButton: {
		backgroundColor: "#8146C1",
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: "center",
		marginTop: 20,
		marginBottom: 20,
		width: "50%",
		alignSelf: "center",
	},
	loginButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
	footerText: {
		textAlign: "center",
		color: "#000000",
		marginTop: 20,
		fontSize: 15,
	},
	signUpText: {
		color: "#8146C1",
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
	forgotPasswordText: {
		color: '#8146C1',
		textAlign: 'right',
		fontSize: 14,
		marginTop: 5,
		marginBottom: 15,
		fontWeight: '500',
	},
});

export default LoginScreen;
