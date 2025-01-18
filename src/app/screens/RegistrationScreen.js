import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Image,
	ScrollView,
	ActivityIndicator,
	Platform,
	Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const RegistrationScreen = ({ navigation }) => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [step, setStep] = useState(1); // 1: Registration form, 2: OTP verification
	const [otp, setOtp] = useState("");

	const API_URL = Platform.select({
		ios: "http://localhost:3001",
		android: "http://192.168.0.108:3001"
	});

	const handleSendOTP = async () => {
		try {
			setLoading(true);
			setError("");

			// Basic validation
			if (!name || !email || !username || !password || !confirmPassword) {
				setError("Please fill in all fields");
				return;
			}

			if (password !== confirmPassword) {
				setError("Passwords do not match");
				return;
			}

			// Check if email already exists
			const verifyResponse = await axios.post(`${API_URL}/api/verify-email`, {
				email: email.trim()
			});

			if (verifyResponse.data.exists) {
				setError("Email already registered");
				return;
			}

			// Send OTP
			const response = await axios.post(`${API_URL}/api/send-otp`, {
				email: email.trim()
			});

			if (response.data.success) {
				setStep(2);
			} else {
				setError(response.data.error || "Failed to send OTP");
			}
		} catch (error) {
			setError(error.response?.data?.error || "Failed to send OTP");
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOTP = async () => {
		try {
			setLoading(true);
			setError("");

			if (!otp) {
				setError("Please enter the OTP");
				return;
			}

			// Verify OTP
			const verifyResponse = await axios.post(`${API_URL}/api/verify-otp`, {
				email,
				otp: otp.trim()
			});

			if (verifyResponse.data.success) {
				// If OTP is verified, proceed with registration
				const registerResponse = await axios.post(`${API_URL}/api/register`, {
					name,
					email: email.trim(),
					username: username.trim(),
					password,
					role: "pet_owner"
				});

				if (registerResponse.data.success) {
					Alert.alert(
						"Success",
						"Registration successful! Please login.",
						[
							{
								text: "OK",
								onPress: () => navigation.replace("LoginScreen")
							}
						]
					);
				} else {
					setError(registerResponse.data.error || "Registration failed");
				}
			} else {
				setError(verifyResponse.data.error || "Invalid OTP");
			}
		} catch (error) {
			setError(error.response?.data?.error || "Verification failed");
		} finally {
			setLoading(false);
		}
	};

	const renderRegistrationForm = () => (
		<>
			<View style={styles.inputWrapper}>
				<Ionicons name="person-outline" size={20} color="#8146C1" style={styles.icon} />
				<TextInput
					style={styles.input}
					placeholder="Full Name"
					value={name}
					onChangeText={setName}
					placeholderTextColor="#8146C1"
				/>
			</View>
			
			<View style={styles.inputWrapper}>
				<Ionicons name="person-circle-outline" size={20} color="#8146C1" style={styles.icon} />
				<TextInput
					style={styles.input}
					placeholder="Username"
					value={username}
					onChangeText={setUsername}
					placeholderTextColor="#8146C1"
					autoCapitalize="none"
				/>
			</View>
			
			<View style={styles.inputWrapper}>
				<Ionicons name="mail-outline" size={20} color="#8146C1" style={styles.icon} />
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
				<Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
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
				<Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
				<TextInput
					style={styles.input}
					placeholder="Confirm Password"
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry={!showPassword}
					placeholderTextColor="#8146C1"
				/>
			</View>
		</>
	);

	const renderOTPVerification = () => (
		<>
			<Text style={styles.otpText}>
				Please enter the verification code sent to your email
			</Text>
			<View style={styles.inputWrapper}>
				<Ionicons name="key-outline" size={20} color="#8146C1" style={styles.icon} />
				<TextInput
					style={styles.input}
					placeholder="Enter OTP"
					value={otp}
					onChangeText={setOtp}
					keyboardType="number-pad"
					placeholderTextColor="#8146C1"
				/>
			</View>
		</>
	);

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<View style={styles.logoContainer}>
				<Image
					source={require("../../assets/images/vetcare.png")}
					style={styles.logo}
				/>
			</View>

			<View style={styles.formContainer}>
				<Text style={styles.headerText}>
					{step === 1 ? "Create Account" : "Verify Email"}
				</Text>
				
				{error ? <Text style={styles.errorText}>{error}</Text> : null}
				
				{step === 1 ? renderRegistrationForm() : renderOTPVerification()}

				<TouchableOpacity
					style={[styles.registerButton, loading && styles.disabledButton]}
					onPress={step === 1 ? handleSendOTP : handleVerifyOTP}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator size="small" color="#FFFFFF" />
					) : (
						<Text style={styles.registerButtonText}>
							{step === 1 ? "Continue" : "Verify & Register"}
						</Text>
					)}
				</TouchableOpacity>

				{step === 2 && (
					<TouchableOpacity
						style={styles.resendButton}
						onPress={handleSendOTP}
						disabled={loading}
					>
						<Text style={styles.resendButtonText}>Resend OTP</Text>
					</TouchableOpacity>
				)}
			</View>

			<View style={styles.loginContainer}>
				<Text style={styles.loginText}>Already have an account?</Text>
				<TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
					<Text style={styles.loginLink}>Login</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#FFFFFF",
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 40,
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
		width: "90%",
		padding: 20,
		backgroundColor: "#D1ACDA",
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 8,
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#8146C1",
		textAlign: "center",
		marginBottom: 20,
	},
	otpText: {
		fontSize: 14,
		color: "#666",
		textAlign: "center",
		marginBottom: 20,
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
	registerButton: {
		backgroundColor: "#8146C1",
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: "center",
		marginTop: 20,
	},
	registerButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
	resendButton: {
		marginTop: 15,
		alignItems: "center",
	},
	resendButtonText: {
		color: "#8146C1",
		fontSize: 14,
		fontWeight: "500",
	},
	errorText: {
		color: "#FF0000",
		textAlign: "center",
		marginBottom: 10,
		fontSize: 14,
	},
	loginContainer: {
		flexDirection: "row",
		marginTop: 20,
		alignItems: "center",
	},
	loginText: {
		color: "#666666",
		marginRight: 5,
	},
	loginLink: {
		color: "#8146C1",
		fontWeight: "bold",
	},
	disabledButton: {
		opacity: 0.7,
	},
});

export default RegistrationScreen;
