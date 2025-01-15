import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Image,
	ActivityIndicator,
	Platform,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const SignupScreen = ({ navigation }) => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const API_URL = Platform.select({
		ios: "http://localhost:3001",
		android: "http://192.168.0.100:3001"
	});

	const handleSignup = async () => {
		try {
			setIsLoading(true);
			setError("");

			// Validation
			if (!name || !email || !password || !confirmPassword) {
				setError("All fields are required");
				return;
			}

			if (password !== confirmPassword) {
				setError("Passwords do not match");
				return;
			}

			const response = await axios.post(`${API_URL}/api/register`, {
				name,
				email,
				password,
				username: email.split('@')[0],
				role: 'pet_owner'
			});

			if (response.data.success) {
				Alert.alert(
					"Success",
					"Registration successful! Please login.",
					[{ 
						text: "OK", 
						onPress: () => navigation.navigate("LoginScreen") 
					}]
				);
			}
		} catch (error) {
			console.error("Registration error:", error);
			setError(error.response?.data?.error || "Registration failed. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			<View style={styles.logoContainer}>
				<Image
					source={require("../../assets/images/vetcare.png")} // Replace with your logo path
					style={styles.logo}
				/>
			</View>

			<View style={styles.formContainer}>
				<View style={styles.inputWrapper}>
					<Ionicons
						name="person-outline"
						size={20}
						color="#8146C1"
						style={styles.icon}
					/>
					<TextInput
						style={styles.input}
						placeholder="Name"
						value={name}
						onChangeText={setName}
						placeholderTextColor="#8146C1"
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
						placeholderTextColor="#8146C1"
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

				<View style={styles.inputWrapper}>
					<Ionicons
						name="lock-closed-outline"
						size={20}
						color="#8146C1"
						style={styles.icon}
					/>
					<TextInput
						style={styles.input}
						placeholder="Confirm Password"
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						secureTextEntry={!showConfirmPassword}
						placeholderTextColor="#8146C1"
					/>
					<TouchableOpacity
						onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
						<Ionicons
							name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
							size={20}
							color="#8146C1"
						/>
					</TouchableOpacity>
				</View>

				{error ? (
					<Text style={styles.errorText}>{error}</Text>
				) : null}

				<TouchableOpacity 
					style={[styles.signupButton, isLoading && styles.disabledButton]}
					onPress={handleSignup}
					disabled={isLoading}>
					{isLoading ? (
						<ActivityIndicator size="small" color="#8146C1" />
					) : (
						<Text style={styles.signupButtonText}>
							Sign Up
						</Text>
					)}
				</TouchableOpacity>

				<Text style={styles.footerText}>
					Already have an account?{" "}
					<Text
						style={styles.loginText}
						onPress={() => navigation.navigate("LoginScreen")}>
						Log in now
					</Text>
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF", // Changed to white
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 20,
	},
	logo: {
		width: 150,
		height: 150,
		bottom: 30,
	},
	formContainer: {
		width: "90%",
		padding: 20,
		backgroundColor: "#D1ACDA",
		borderRadius: 15,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
		height: 430,
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
	},
	icon: {
		marginRight: 10,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: "#8146C1",
	},
	signupButton: {
		backgroundColor: "#FFFFFF",
		borderRadius: 15,
		paddingVertical: 12,
		alignItems: "center",
		marginBottom: 20,
		width: 120,
		height: 30,
		left: 80,
		top: 30,
	},
	signupButtonText: {
		color: "#8146C1",
		fontSize: 16,
		fontWeight: "bold",
		top: -10,
		height: 20,
	},
	footerText: {
		textAlign: "center",
		color: "#000000",
		marginTop: 55,
	},
	loginText: {
		color: "#8146C1",
		fontWeight: "bold",
	},
	errorText: {
		color: 'red',
		textAlign: 'center',
		marginBottom: 10,
	},
	disabledButton: {
		opacity: 0.7,
	},
});

export default SignupScreen;
