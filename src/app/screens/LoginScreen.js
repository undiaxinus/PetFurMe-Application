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
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const API_URL = Platform.select({
		ios: "http://localhost:3001",
		android: "http://192.168.43.100:3001",
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
				Alert.alert("Success", "Login successful!", [
					{ text: "OK", onPress: () => navigation.navigate("LandingPage") },
				]);
			} else {
				setError(response.data.error || "Login failed");
			}
		} catch (error) {
			console.error("Login error:", error.response?.data || error.message);
			setError(
				error.response?.data?.error || "Login failed. Please try again."
			);
		} finally {
			setLoading(false);
		}
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
						secureTextEntry
						placeholderTextColor="#8146C1"
					/>
				</View>

				{error ? <Text style={styles.errorText}>{error}</Text> : null}

				<TouchableOpacity style={styles.forgotPasswordButton}>
					<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.loginButton, loading && styles.disabledButton]}
					onPress={handleLogin}
					disabled={loading}>
					<Text style={styles.loginButtonText}>LOGIN</Text>
				</TouchableOpacity>

				<Text style={styles.footerText}>
					Don't have an account?{" "}
					<Text
						style={styles.signUpText}
						onPress={() => navigation.navigate("Register")}>
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
		backgroundColor: "#FFFFFF", // White background
		justifyContent: "center",
		alignItems: "center",
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
		top: -20,
		marginBottom: 30,
	},
	logo: {
		width: 130,
		height: 130,
		resizeMode: "contain",
	},
	formContainer: {
		width: "90%",
		padding: 10,
		backgroundColor: "#D1ACDA",
		borderRadius: 15,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		marginBottom: 20,
		height: 400,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		borderWidth: 1,
		borderColor: "#8146C1",
		borderRadius: 10,
		backgroundColor: "#F5F5F5",
		paddingHorizontal: 10,
		top: 20,
	},
	icon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: "#8146C1",
	},
	forgotPasswordButton: {
		alignSelf: "flex-end",
		marginBottom: 20,
	},
	forgotPasswordText: {
		color: "#8146C1",
		fontSize: 14,
		top: 30,
		fontWeight: "bold",
	},
	loginButton: {
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		paddingVertical: 5,
		alignItems: "center",
		marginBottom: 20,
		width: 80,
		height: 35,
		left: 110,
		top: 50,
	},
	loginButtonText: {
		color: "#793ABD",
		fontSize: 16,
		fontWeight: "bold",
	},
	footerText: {
		textAlign: "center",
		color: "#000000",
		marginTop: 110,
	},
	signUpText: {
		color: "#8146C1",
		fontWeight: "bold",
	},
	errorText: {
		color: "#FF0000",
		textAlign: "center",
		marginTop: 10,
	},
	disabledButton: {
		opacity: 0.7,
	},
});

export default LoginScreen;
