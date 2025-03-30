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
	Dimensions,
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

	const API_URL = 'https://app.petfurme.shop/PetFurMe-Application/api/auth';

	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(50)).current;

	const windowWidth = Dimensions.get('window').width;
	const isSmallDevice = windowWidth < 380;

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

		console.log('Environment:', Platform.OS, __DEV__ ? 'Development' : 'Production');
		console.log('API URL:', API_URL);
	}, []);

	const tryAlternateEndpoints = async (email) => {
		const endpoints = [
			`${API_URL}/send-otp`,
		];
		
		const axiosInstance = axios.create({
			timeout: 15000, // Increased timeout
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
			}
		});
		
		for (const endpoint of endpoints) {
			try {
				console.log(`Trying endpoint: ${endpoint}`);
				const response = await axiosInstance.post(endpoint, { 
					email: email.trim() 
				});
				
				console.log(`Response from ${endpoint}:`, response.data);
				return response;
			} catch (error) {
				console.log(`Failed with endpoint ${endpoint}:`, error.message);
				throw error; // Throw the error to handle it in the calling function
			}
		}
	};

	const handleSendOTP = async () => {
		try {
			setLoading(true);
			setError("");

			// Basic validation
			if (!email || !username || !password || !confirmPassword) {
				setError("Please fill in all fields");
				return;
			}

			if (password !== confirmPassword) {
				setError("Passwords do not match");
				return;
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				setError("Please enter a valid email address");
				return;
			}

			const passwordCheck = checkPasswordStrength(password);
			if (passwordCheck.strength === 'weak') {
				setError("Please choose a stronger password");
				return;
			}

			console.log('Sending request to:', `${API_URL}/verify-email`);
			
			// Create axios instance with timeout and better error handling
			const axiosInstance = axios.create({
				timeout: 15000,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			});
			
			// Check if email exists
			const verifyResponse = await axiosInstance.post(`${API_URL}/verify-email`, {
				email: email.trim()
			});

			if (verifyResponse.data.exists) {
				setError("Email already registered");
				return;
			}

			console.log('Sending OTP request to:', `${API_URL}/send-otp`);
			
			// Send OTP
			const response = await axiosInstance.post(`${API_URL}/send-otp`, {
				email: email.trim()
			});

			console.log('OTP Response:', response.data);

			if (response.data.success) {
				setStep(2);
				Alert.alert(
					"Success",
					"Verification code has been sent to your email",
					[{ text: "OK" }]
				);
			} else {
				throw new Error(response.data.error || "Failed to send OTP");
			}
		} catch (error) {
			console.error('Detailed error:', {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status,
				config: error.config
			});
			
			setError(error.response?.data?.error || error.message);
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOTP = async () => {
		try {
			setLoading(true);
			setError("");

			if (!otp) {
				setError("Please enter the verification code");
				return;
			}

			console.log('Verifying OTP:', otp, 'for email:', email);

			const axiosInstance = axios.create({
				timeout: 15000,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json'
				}
			});

			const response = await axiosInstance.post(`${API_URL}/verify-otp`, {
				email: email.trim(),
				otp: otp.trim()
			});

			console.log('OTP verification response:', response.data);

			if (response.data.success) {
				// Register the user
				const registerResponse = await axiosInstance.post(`${API_URL}/register`, {
					email: email.trim(),
					username: username.trim(),
					password: password
				});

				console.log('Registration response:', registerResponse.data);

				if (registerResponse.data.success) {
					setShowSuccessPopup(true);
				} else {
					throw new Error(registerResponse.data.error || "Registration failed");
				}
			} else {
				setError(response.data.error || "Invalid verification code");
			}
		} catch (error) {
			console.error('Verification error:', {
				message: error.message,
				response: error.response?.data,
				status: error.response?.status
			});
			setError(error.response?.data?.error || error.message);
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
				Please enter the verification code sent to:
			</Text>
			<Text style={styles.emailDisplay}>
				{email}
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

			{error ? (
				<View style={styles.errorContainer}>
					<Text style={styles.errorText}>{error}</Text>
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
				<ScrollView 
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<View style={[styles.formContainer, isSmallDevice && styles.formContainerSmall]}>
						<View style={styles.logoContainer}>
							<Image
								source={require("../../assets/images/vetcare.png")}
								style={[styles.logo, isSmallDevice && styles.logoSmall]}
							/>
						</View>

						<Text style={styles.headerText}>
							{step === 1 ? "Create Account" : "Verify Email"}
						</Text>
						
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
				</ScrollView>
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
		paddingHorizontal: Platform.OS === 'web' ? 20 : 10,
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
	logoSmall: {
		width: 120,
		height: 120,
	},
	formContainer: {
		width: "100%",
		maxWidth: Platform.OS === 'web' ? 450 : '95%',
		padding: Platform.OS === 'web' ? 40 : 20,
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		borderRadius: 16,
		shadowColor: "#8146C1",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
		marginBottom: 20,
		marginTop: Platform.OS === 'web' ? 0 : 10,
	},
	formContainerSmall: {
		padding: 15,
	},
	headerText: {
		fontSize: Platform.OS === 'web' ? 26 : 22,
		fontWeight: "bold",
		color: "#8146C1",
		textAlign: "center",
		marginBottom: Platform.OS === 'web' ? 20 : 15,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: Platform.OS === 'web' ? 16 : 12,
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderRadius: 12,
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 15,
		paddingVertical: Platform.OS === 'web' ? 12 : 10,
		marginTop: Platform.OS === 'web' ? 8 : 6,
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
	errorContainer: {
		padding: 10,
		marginVertical: 10,
		backgroundColor: 'rgba(255, 68, 68, 0.1)',
		borderRadius: 8,
		width: '100%',
	},
	errorText: {
		color: '#FF4444',
		textAlign: 'center',
		fontSize: 14,
		fontFamily: Platform.select({ ios: 'System', android: 'Roboto' }),
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
		marginBottom: 10,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
	},
	content: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		width: '100%',
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
	emailDisplay: {
		fontSize: 16,
		fontWeight: "500",
		color: "#8146C1",
		textAlign: "center",
		marginBottom: 20,
	},
});

export default RegistrationScreen;
