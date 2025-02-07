import React, { useState, useEffect, useRef } from "react";
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
	Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { API_BASE_URL } from '../config/constants';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator';
import { checkPasswordStrength } from '../utils/passwordStrength';

const SuccessPopup = ({ onClose }) => (
	<View style={styles.successOverlay}>
		<View style={styles.successPopup}>
			<Text style={{ fontSize: 50, marginBottom: 20 }}>🎉</Text>
			<Text style={styles.successTitle}>Welcome to VetCare!</Text>
			<Text style={styles.successMessage}>
				Your account has been successfully created. You can now log in and start managing your pet's care.
			</Text>
			<TouchableOpacity 
				style={styles.successButton} 
				onPress={onClose}
			>
				<Text style={styles.successButtonText}>Continue to Login</Text>
			</TouchableOpacity>
		</View>
	</View>
);

const RegistrationScreen = ({ navigation }) => {
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [step, setStep] = useState(1); // 1: Registration form, 2: OTP verification
	const [otp, setOtp] = useState("");
	const [showSuccessPopup, setShowSuccessPopup] = useState(false);

	const API_URL = API_BASE_URL;

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

		console.log('API URL:', API_URL);
	}, [API_URL]);

	const handleSendOTP = async () => {
		try {
			setLoading(true);
			setError("");

			console.log('Current API_URL:', API_URL);
			console.log('Full verify-email URL:', `${API_URL}/verify-email`);
			
			// Basic validation
			if (!email || !username || !password || !confirmPassword) {
				setError("Please fill in all fields");
				return;
			}

			if (password !== confirmPassword) {
				setError("Passwords do not match");
				return;
			}

			// Add email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				setError("Please enter a valid email address");
				return;
			}

			// Check password strength
			const passwordCheck = checkPasswordStrength(password);
			if (passwordCheck.strength === 'weak') {
				setError("Please choose a stronger password");
				return;
			}

			console.log('Sending request to:', `${API_URL}/verify-email`);
			
			// Check if email already exists
			const verifyResponse = await axios.post(`${API_URL}/verify-email`, {
				email: email.trim()
			}).catch(error => {
				console.error('Email verification error:', error.response || error);
				throw error;
			});

			if (verifyResponse.data.exists) {
				setError("Email already registered");
				return;
			}

			console.log('Sending OTP request to:', `${API_URL}/send-otp`);
			
			// Send OTP with improved error handling
			const response = await axios.post(`${API_URL}/send-otp`, {
				email: email.trim()
			}).catch(error => {
				console.error('Send OTP error:', error.response || error);
				throw error;
			});

			if (response.data.success) {
				setStep(2);
				// Add success message
				Alert.alert(
					"Success",
					"Verification code has been sent to your email",
					[{ text: "OK" }]
				);
			} else {
				setError(response.data.error || "Failed to send OTP");
			}
		} catch (error) {
			console.error('Detailed error:', error);
			// More detailed error message based on the error type
			if (error.response) {
				// Server responded with an error
				setError(error.response.data.error || `Server error: ${error.response.status}`);
			} else if (error.request) {
				// Request was made but no response received
				setError("No response from server. Please check your connection.");
			} else {
				// Error in request setup
				setError("Failed to send OTP. Please try again.");
			}
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
			const verifyResponse = await axios.post(`${API_URL}/verify-otp`, {
				email,
				otp: otp.trim()
			});

			if (verifyResponse.data.success) {
				const registerData = {
					email: email.trim(),
					username: username.trim(),
					password,
					role: "pet_owner",
					name: username.trim()
				};

				const registerResponse = await axios.post(`${API_URL}/register`, registerData);

				if (registerResponse.data.success) {
					// Clear form data
					setEmail("");
					setUsername("");
					setPassword("");
					setConfirmPassword("");
					setOtp("");
					
					// Show success popup
					setShowSuccessPopup(true);
					
					// Auto-navigate after 5 seconds if user doesn't click the button
					setTimeout(() => {
						if (showSuccessPopup) { // Only navigate if popup is still showing
							setShowSuccessPopup(false);
							navigation.reset({
								index: 0,
								routes: [{ name: 'LoginScreen' }]
							});
						}
					}, 5000);
				} else {
					setError(registerResponse.data.error || "Registration failed");
				}
			} else {
				setError(verifyResponse.data.error || "Invalid OTP");
			}
		} catch (error) {
			console.error('Registration error:', error.response?.data || error);
			setError(error.response?.data?.error || "Registration failed");
		} finally {
			setLoading(false);
		}
	};

	const renderRegistrationForm = () => (
		<>
			<View style={styles.inputWrapper}>
				<Ionicons name="person-circle-outline" size={20} color="#8146C1" style={styles.icon} />
				<TextInput
					style={styles.input}
					placeholder="Username"
					value={username}
					onChangeText={setUsername}
					placeholderTextColor="#666666"
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
					placeholderTextColor="#666666"
					autoCapitalize="none"
				/>
			</View>

			<View style={styles.inputContainer}>
				<View style={styles.inputWrapper}>
					<Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
					<TextInput
						style={styles.input}
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={!showPassword}
						placeholderTextColor="#666666"
					/>
					<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
						<Ionicons
							name={showPassword ? "eye-outline" : "eye-off-outline"}
							size={20}
							color="#8146C1"
						/>
					</TouchableOpacity>
				</View>
				<PasswordStrengthIndicator password={password} />
			</View>

			<View style={styles.inputWrapper}>
				<Ionicons name="lock-closed-outline" size={20} color="#8146C1" style={styles.icon} />
				<TextInput
					style={styles.input}
					placeholder="Confirm Password"
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry={!showPassword}
					placeholderTextColor="#666666"
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
		<View style={styles.container}>
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#8146C1" />
				</View>
			)}
			
			{showSuccessPopup && (
				<SuccessPopup 
					onClose={() => {
						setShowSuccessPopup(false);
						navigation.reset({
							index: 0,
							routes: [{ name: 'LoginScreen' }]
						});
					}} 
				/>
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
				<View style={styles.formContainer}>
					<View style={styles.logoContainer}>
						<Image
							source={require("../../assets/images/vetcare.png")}
							style={styles.logo}
						/>
					</View>

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
								{step === 1 ? "CONTINUE" : "VERIFY & REGISTER"}
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

					<View style={styles.loginContainer}>
						<Text style={styles.loginText}>Already have an account? </Text>
						<TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
							<Text style={styles.loginLink}>Login</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F0E6FF",
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
	logoContainer: {
		alignItems: "center",
		marginBottom: 15,
	},
	logo: {
		width: 150,
		height: 150,
		resizeMode: "contain",
	},
	formContainer: {
		width: "100%",
		maxWidth: 450,
		padding: 40,
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		borderRadius: 16,
		shadowColor: "#8146C1",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
		marginBottom: 20,
	},
	headerText: {
		fontSize: 26,
		fontWeight: "bold",
		color: "#8146C1",
		textAlign: "center",
		marginBottom: 20,
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
		marginTop: 8,
	},
	icon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: "#333333",
		paddingVertical: 2,
	},
	registerButton: {
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
	registerButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
		letterSpacing: 1,
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
		color: "#FF4444",
		textAlign: "center",
		marginTop: 10,
		fontSize: 14,
	},
	loginContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 16,
	},
	loginText: {
		color: "#666666",
		fontSize: 14,
	},
	loginLink: {
		color: "#8146C1",
		fontSize: 14,
		fontWeight: "600",
	},
	disabledButton: {
		opacity: 0.7,
	},
	otpText: {
		fontSize: 14,
		color: "#666666",
		textAlign: "center",
		marginBottom: 20,
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	successOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 1000,
	},
	successPopup: {
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 20,
		width: '80%',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	successIcon: {
		width: 80,
		height: 80,
		marginBottom: 20,
	},
	successTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#8146C1',
		marginBottom: 10,
		textAlign: 'center',
	},
	successMessage: {
		fontSize: 16,
		color: '#666',
		marginBottom: 20,
		textAlign: 'center',
		lineHeight: 22,
	},
	successButton: {
		backgroundColor: '#8146C1',
		paddingHorizontal: 30,
		paddingVertical: 12,
		borderRadius: 25,
		marginTop: 10,
	},
	successButtonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: '600',
	},
	inputContainer: {
		marginBottom: 16,
		position: 'relative',
	},
});

export default RegistrationScreen;
