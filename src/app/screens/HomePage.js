import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Image,
	StyleSheet,
	ScrollView,
	Alert,
	ActivityIndicator,
	ToastAndroid,
	Platform,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import BottomNavigation from '../components/BottomNavigation';
import CustomHeader from '../components/CustomHeader';
import CompleteProfileBar from '../components/CompleteProfileBar';
import CustomToast from '../components/CustomToast';
import PetDetailsModal from '../components/PetDetailsModal';
import PetProductsSection from '../components/PetProductsSection';
import PetsSection from '../components/PetsSection';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = `http://${SERVER_IP}`;

const HomePage = ({ navigation, route }) => {
	const user_id = route.params?.user_id;
	console.log('HomePage initialized with user_id:', user_id);
	const refresh = route.params?.refresh;
	const [userPets, setUserPets] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [imageLoadErrors, setImageLoadErrors] = useState({});
	const [showWelcomePopup, setShowWelcomePopup] = useState(false);
	const [isProfileComplete, setIsProfileComplete] = useState(false);
	const [userName, setUserName] = useState('');
	const [userPhoto, setUserPhoto] = useState(null);
	const [showProfileTutorial, setShowProfileTutorial] = useState(false);
	const [credentialsComplete, setCredentialsComplete] = useState(false);
	const [toastConfig, setToastConfig] = useState(null);
	const [isVerified, setIsVerified] = useState(false);
	const [upcomingAppointments, setUpcomingAppointments] = useState([]);
	const [petRecords, setPetRecords] = useState([]);
	const [selectedPet, setSelectedPet] = useState(null);
	const [isPetModalVisible, setIsPetModalVisible] = useState(false);
	const { updateDetails } = route.params || {};

	// Add refresh interval reference
	const refreshIntervalRef = React.useRef(null);

	console.log("HomePage user_id:", user_id);

	useEffect(() => {
		if (user_id) {
			fetchUserPets();
			fetchUpcomingAppointments();
			fetchPetRecords();
			
			refreshIntervalRef.current = setInterval(() => {
				fetchUserPets();
				fetchUpcomingAppointments();
			}, 10000);
			
			return () => {
				if (refreshIntervalRef.current) {
					clearInterval(refreshIntervalRef.current);
				}
			};
		}
	}, [user_id, refresh]);

	useEffect(() => {
		console.log("Updated userPets:", userPets);
	}, [userPets]);

	useEffect(() => {
		checkProfileStatus();
	}, [user_id]);

	useEffect(() => {
		console.log("Current isProfileComplete state:", isProfileComplete);
	}, [isProfileComplete]);

	useEffect(() => {
		if (route.params?.refresh) {
			console.log('Refreshing pet list due to update');
			fetchUserPets();
			// Clear the refresh parameter
			navigation.setParams({ refresh: undefined });
		}
	}, [route.params?.refresh]);

	useEffect(() => {
		if (route.params?.showMessage) {
			const message = route.params.message;
			const messageType = route.params.messageType;

			if (Platform.OS === 'android') {
				// Use custom toast instead of ToastAndroid
				setToastConfig({
					message,
					type: messageType
				});
			} else {
				Alert.alert(
					messageType === 'success' ? '🎉 Success!' : 'Information',
					message,
					[{ text: 'OK' }],
					{ cancelable: false }
				);
			}

			navigation.setParams({
				showMessage: undefined,
				message: undefined,
				messageType: undefined
			});
			
			refreshAllData();
		}
	}, [route.params?.showMessage]);

	useEffect(() => {
		console.log("Verification status changed:", isVerified);
	}, [isVerified]);

	useEffect(() => {
		console.log("Profile status updated:", {
			credentialsComplete,
			isVerified
		});
	}, [credentialsComplete, isVerified]);

	useEffect(() => {
		if (updateDetails) {
			Alert.alert('Profile Update', updateDetails);
		}
	}, [updateDetails]);

	const fetchUserPets = async () => {
		try {
			const url = `${API_BASE_URL}/PetFurMe-Application/api/pets/get_user_pets.php?user_id=${user_id}`;
			console.log("Fetching updated pets from:", url);
			
			const response = await fetch(url);
			const data = await response.json();
			
			if (data.success) {
				console.log("Updated pets data received:", data.pets);
				setUserPets(data.pets);
			} else {
				console.error("Failed to fetch updated pets:", data.message);
			}
		} catch (error) {
			console.error("Error refreshing pets:", error);
		}
	};

	const checkProfileStatus = async () => {
		if (!user_id) return;
		
		try {
			const url = `${API_BASE_URL}/PetFurMe-Application/api/users/check_profile_status.php?user_id=${user_id}`;
			console.log("Checking profile status at:", url);
			
			const response = await fetch(url);
			const data = await response.json();
			
			console.log("Profile status response:", data);
			
			if (data.success && data.profile) {
				// Update states based on profile data
				setCredentialsComplete(data.profile.complete_credentials === 1);
				const verificationStatus = data.profile.verified_by !== null;
				setIsVerified(verificationStatus);
				
				// Store verification status in AsyncStorage
				await AsyncStorage.setItem('isVerified', JSON.stringify(verificationStatus));
				
				if (data.profile) {
					setUserName(data.profile.name || 'Guest');
					setUserPhoto(data.profile.photo 
						? `${API_BASE_URL}/PetFurMe-Application/${data.profile.photo}`
						: null
					);
				}
			}
		} catch (error) {
			console.error("Profile check error:", error);
		}
	};

	const handleSetUpNow = async () => {
		await logActivity('Started profile setup', user_id);
		setShowWelcomePopup(false);
		navigation.navigate('Profile', { 
			user_id: user_id,
			onComplete: async () => {
				await logActivity(ACTIVITY_TYPES.PROFILE_UPDATED, user_id);
				setIsProfileComplete(true);
				fetchUserPets();
			}
		});
	};

	const handleMaybeLater = () => {
		setShowWelcomePopup(false);
		setShowProfileTutorial(true);
	};

	const handleAddNewPet = async () => {
		if (!user_id) {
			Alert.alert("Error", "User ID is missing. Please try logging in again.");
			navigation.navigate("LoginScreen");
			return;
		}
		
		if (!isVerified) {
			Alert.alert(
				"Account Not Verified",
				"Your account needs to be verified before you can add pets. Please complete the verification process.",
				[{ text: "OK" }]
			);
			return;
		}
		
		await logActivity(ACTIVITY_TYPES.PET_ADDED, user_id);
		navigation.navigate("AddPetName", { 
			user_id: user_id 
		});
	};

	// Add a function to refresh all data
	const refreshAllData = async () => {
		await Promise.all([
			checkProfileStatus(),
			fetchUserPets()
		]);
	};

	const showVerificationAlert = () => {
		Alert.alert(
			"Account Pending Verification",
			"Your account is currently pending verification by an administrator. This process helps ensure the safety and quality of our pet care community. You'll be notified once your account is verified.",
			[
				{ 
					text: "OK",
					style: "default"
				}
			]
		);
	};

	const fetchUpcomingAppointments = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/PetFurMe-Application/api/appointments/get_upcoming.php?user_id=${user_id}`);
			
			if (!response.ok) {
				console.error("Server error:", response.status, response.statusText);
				const errorText = await response.text();
				console.error("Error details:", errorText);
				return;
			}

			const text = await response.text();

			
			if (!text) {
				console.error("Empty response received");
				return;
			}

			try {
				const data = JSON.parse(text);
				if (data.success) {
					setUpcomingAppointments(data.appointments || []);
				} else {
					console.error("API error:", data.message, data.debug_info);
				}
			} catch (parseError) {
				console.error("Parse error:", parseError);
				console.error("Failed to parse:", text);
			}
		} catch (error) {
			console.error("Network error:", error);
		}
	};

	const fetchPetRecords = async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/PetFurMe-Application/api/pets/get_pet_records.php?user_id=${user_id}`);
			const data = await response.json();
			if (data.success) {
				setPetRecords(data.records || []);
			} else {
				console.error("Failed to fetch pet records:", data.message);
			}
		} catch (error) {
			console.error("Error fetching pet records:", error);
		}
	};

	const getTimeBasedGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) {
			return "Start your day with your furry friend";
		} else if (hour < 17) {
			return "Time for some pet care activities";
		} else {
			return "Evening cuddles with your pet await";
		}
	};

	// Add this helper function near the other utility functions
	const formatTime = (timeString) => {
		const [hours, minutes] = timeString.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const hour12 = hour % 12 || 12;
		return `${hour12}:${minutes} ${ampm}`;
	};

	// Modify the pet item press handler
	const handlePetPress = (pet) => {
		if (!isVerified) {
			showVerificationAlert();
			return;
		}
		setSelectedPet(pet);
		setIsPetModalVisible(true);
	};

	// For updating existing pet
	const handleEditPet = (pet) => {
		navigation.navigate('UpdatePetProfile', { 
			pet: pet,
			user_id: user_id,
			onComplete: () => {
				// Refresh the pet list after update
				fetchUserPets();
				setIsPetModalVisible(false);
			}
		});
	};

	// Add this style object near the other style definitions
	const statusStyles = {
		pending: {
			backgroundColor: '#FFF3CD',
			color: '#856404',
			borderColor: '#FFEEBA'
		},
		confirmed: {
			backgroundColor: '#D4EDDA',
			color: '#155724',
			borderColor: '#C3E6CB'
		},
		completed: {
			backgroundColor: '#CCE5FF',
			color: '#004085',
			borderColor: '#B8DAFF'
		},
		cancelled: {
			backgroundColor: '#F8D7DA',
			color: '#721C24',
			borderColor: '#F5C6CB'
		},
		no_show: {
			backgroundColor: '#E2E3E5',
			color: '#383D41',
			borderColor: '#D6D8DB'
		}
	};

	return (
		<View style={styles.container}>
			{toastConfig && (
				<CustomToast
					message={toastConfig.message}
					type={toastConfig.type}
					onHide={() => setToastConfig(null)}
				/>
			)}
			<CustomHeader
				title="VetCare Animal Clinic"
				navigation={navigation}
				showDrawerButton={true}
				showProfileButton={true}
				userPhoto={userPhoto}
				user_id={user_id}
			/>

			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Only show verification banner if not verified */}
				{!isVerified && (
					<View style={styles.verificationBanner}>
						<Ionicons name="hourglass-outline" size={18} color="#8146C1" />
						<Text style={styles.verificationBannerText}>
							Account pending verification. Some features are limited until an admin verifies your account.
						</Text>
					</View>
				)}

				{/* Only show profile completion bar if credentials are not complete */}
				{!credentialsComplete && (
					<CompleteProfileBar 
						navigation={navigation}
						user_id={user_id}
					/>
				)}

				{showWelcomePopup && (
					<View style={styles.popupOverlay}>
						<View style={styles.popupContainer}>
							<Ionicons name="paw" size={50} color="#8146C1" style={styles.welcomeIcon} />
							<Text style={styles.popupTitle}>Welcome!</Text>
							<Text style={styles.popupText}>
								Hi {userName}, we're so excited to have you here. To make the most of your experience, join our pet-loving community and unlock amazing features for you and your furry friend.
							</Text>
							
							<View style={styles.popupFeatures}>
								<Text style={styles.popupFeatureItem}>
									<Ionicons name="heart-outline" size={16} /> Personalized Care Tips
								</Text>
								<Text style={styles.popupFeatureItem}>
									<Ionicons name="star-outline" size={16} /> Premium Features
								</Text>
								<Text style={styles.popupFeatureItem}>
									<Ionicons name="people-outline" size={16} /> Expert Support
								</Text>
							</View>
							
							<View style={styles.popupButtons}>
								<TouchableOpacity 
									style={styles.setupButton} 
									onPress={handleSetUpNow}
								>
									<Text style={styles.setupButtonText}>Get Started</Text>
								</TouchableOpacity>
								
								<TouchableOpacity 
									style={styles.laterButton} 
									onPress={handleMaybeLater}
								>
									<Text style={styles.laterButtonText}>Maybe Later</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				)}
				{showProfileTutorial && !isProfileComplete && (
					<TouchableWithoutFeedback>
						<View style={styles.tutorialOverlay}>
							<View style={styles.tutorialCutoutContainer}>
								<View style={styles.tutorialCutout} />
								<View style={styles.tutorialTextContainer}>
									<Text style={styles.tutorialTitle}>One More Thing!</Text>
									<Text style={styles.tutorialText}>
										Complete your profile to unlock all features and get personalized care for your pets
									</Text>
									<TouchableOpacity 
										style={styles.tutorialButton}
										onPress={() => setShowProfileTutorial(false)}
									>
										<Text style={styles.tutorialButtonText}>Got it!</Text>
									</TouchableOpacity>
								</View>
							</View>
						</View>
					</TouchableWithoutFeedback>
				)}
				{isLoading && (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#8146C1" />
					</View>
				)}

				{/* Welcome Card */}
				<View style={styles.welcomeCard}>
					<View style={styles.welcomeContent}>
						<Text style={styles.welcomeText}>Hi {userName}!</Text>
						<Text style={styles.welcomeSubtext}>
							{getTimeBasedGreeting()}
						</Text>
					</View>
				</View>

				{/* Upcoming Appointments Widget */}
				<View style={styles.widgetContainer}>
					<View style={styles.widgetHeader}>
						<Ionicons name="calendar" size={24} color="#8146C1" />
						<Text style={styles.widgetTitle}>Upcoming Appointments</Text>
					</View>
					{upcomingAppointments.length > 0 ? (
						<ScrollView horizontal showsHorizontalScrollIndicator={false}>
							{upcomingAppointments.map((appointment, index) => (
								<TouchableOpacity 
									key={index}
									style={styles.appointmentCard}
									onPress={() => navigation.navigate('AppointmentDetails', { appointmentId: appointment.appointment_id })}
								>
									<View style={styles.appointmentHeader}>
										<View style={styles.appointmentTitleRow}>
											<Text style={styles.appointmentPet}>{appointment.pet_name}</Text>
											<View style={[
												styles.statusTag,
												{ 
													backgroundColor: statusStyles[appointment.status]?.backgroundColor,
													borderColor: statusStyles[appointment.status]?.borderColor
												}
											]}>
												<Text style={[
													styles.statusText,
													{ color: statusStyles[appointment.status]?.color }
												]}>
													{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
												</Text>
											</View>
										</View>
										
										<View style={styles.appointmentInfo}>
											<View style={styles.infoRow}>
												<Ionicons name="calendar-outline" size={14} color="#666" />
												<Text style={styles.appointmentDate}>
													{appointment.appointment_date}
												</Text>
											</View>
											
											<View style={styles.infoRow}>
												<Ionicons name="time-outline" size={14} color="#666" />
												<Text style={styles.appointmentTime}>
													{formatTime(appointment.appointment_time)}
												</Text>
											</View>
											
											<View style={styles.infoRow}>
												<Ionicons name="medical-outline" size={14} color="#666" />
												<Text style={styles.appointmentType}>
													{Array.isArray(appointment.reason) ? appointment.reason.join(', ') : ''}
												</Text>
											</View>
										</View>
									</View>
								</TouchableOpacity>
							))}
						</ScrollView>
					) : (
						<View style={styles.emptyStateContainer}>
							<Text style={styles.emptyStateText}>No upcoming appointments</Text>
							<TouchableOpacity 
								style={styles.scheduleButton}
								onPress={() => navigation.navigate('Appointment', { user_id: user_id })}
							>
								<Text style={styles.scheduleButtonText}>Schedule Now</Text>
							</TouchableOpacity>
						</View>
					)}
				</View>

				{/* Pet Records Section */}
				<View style={styles.widgetContainer}>
					<View style={styles.widgetHeader}>
						<Ionicons name="document-text" size={24} color="#8146C1" />
						<Text style={styles.widgetTitle}>Pet Records</Text>
					</View>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{petRecords.map((record, index) => (
							<TouchableOpacity 
								key={index}
								style={styles.recordCard}
								onPress={() => navigation.navigate('PetRecordDetails', { recordId: record.id })}
							>
								<View style={styles.recordIcon}>
									<Ionicons name="document-text" size={24} color="#8146C1" />
								</View>
								<Text style={styles.recordPetName}>{record.pet_name}</Text>
								<Text style={styles.recordType}>{record.type}</Text>
								<Text style={styles.recordDate}>{record.date}</Text>
							</TouchableOpacity>
						))}
						<TouchableOpacity 
							style={styles.addRecordCard}
							onPress={() => navigation.navigate('AddPetRecord', { user_id: user_id })}
						>
							<Ionicons name="add-circle" size={32} color="#8146C1" />
							<Text style={styles.addRecordText}>Add New Record</Text>
						</TouchableOpacity>
					</ScrollView>
				</View>

				{/* Pets Section */}
				{isLoading ? (
					<ActivityIndicator size="large" color="#8146C1" />
				) : (
					<PetsSection 
						userPets={userPets}
						isVerified={isVerified}
						isLoading={isLoading}
						onPetPress={handlePetPress}
						onAddNewPet={handleAddNewPet}
						showVerificationAlert={showVerificationAlert}
					/>
				)}

				{/* Pet Products Section */}
				<PetProductsSection 
					navigation={navigation} 
					user_id={user_id}
				/>
			</ScrollView>

			{/* Bottom Navigation - Always present but with pointer-events disabled */}
			<BottomNavigation 
				activeScreen="HomePage" 
				user_id={user_id}
				isVerified={isVerified}
				style={[
					styles.bottomNav,
					(showWelcomePopup || showProfileTutorial) && styles.bottomNavDisabled
				]}
			/>

			{/* Add the PetDetailsModal component */}
			{console.log('HomePage rendering PetDetailsModal with user_id:', user_id)}
			<PetDetailsModal
				pet={selectedPet}
				isVisible={isPetModalVisible}
				onClose={() => setIsPetModalVisible(false)}
				user_id={user_id}
				onEdit={() => {
					fetchUserPets();
				}}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	scrollContent: {
		paddingBottom: 40,
	},
	petsContainer: {
		flexDirection: "row",
		marginVertical: 20,
		paddingHorizontal: 20,
		width: 70,
		height: 70,
	},
	petItem: {
		alignItems: 'center',
		marginRight: 15,
		marginTop: 5,
		padding: 5,
		overflow: 'visible',
	},
	petImage: {
		width: 65,
		height: 65,
		borderRadius: 32.5,
		marginBottom: 5,
		resizeMode: 'contain',
		borderWidth: 2,
		borderColor: '#8146C1',
		backgroundColor: '#FFFFFF',
	},
	petName: {
		fontSize: 12,
		color: '#333',
		textAlign: 'center',
		marginTop: 5,
		width: '100%',
	},
	petProductsBox: {
		backgroundColor: "#F8F2FF",
		borderRadius: 15,
		padding: 20,
		marginHorizontal: 16,
		marginBottom: 30,
		marginTop: 15,
		elevation: 3,
		shadowColor: '#8146C1',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 24,
		paddingHorizontal: 4,
	},
	leftHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	productIcon: {
		marginRight: 4,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333333",
		marginLeft: 0,
	},
	petproducts: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
		letterSpacing: 0.3,
	},
	viewMoreButton: {
		backgroundColor: '#8146C1',
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 20,
		elevation: 2,
		shadowColor: '#8146C1',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.2,
		shadowRadius: 2,
	},
	viewmore: {
		color: "#FFFFFF",
		fontWeight: "600",
		fontSize: 12,
	},
	productsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		gap: 12,
		paddingHorizontal: 4,
	},
	petProductCard: {
		borderRadius: 12,
		width: '47%',
		overflow: 'hidden',
		elevation: 3,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.15,
		shadowRadius: 3,
		backgroundColor: '#FFFFFF',
	},
	productImageContainer: {
		position: 'relative',
		width: '100%',
		height: 120,
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		overflow: 'hidden',
		alignItems: 'center',
		justifyContent: 'center',
	},
	productImageWrapper: {
		width: '90%',
		height: '90%',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#FFFFFF',
	},
	productImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'contain',
		padding: 8,
	},
	badge: {
		position: 'absolute',
		top: 4,
		left: 4,
		backgroundColor: "#8146C1",
		paddingVertical: 3,
		paddingHorizontal: 6,
		borderRadius: 8,
		opacity: 0.9,
	},
	badgeText: {
		fontSize: 9,
		color: "#FFFFFF",
		fontWeight: '600',
	},
	productDetails: {
		padding: 8,
		backgroundColor: '#FFFFFF',
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
	},
	productName: {
		fontSize: 13,
		fontWeight: "600",
		color: '#333',
		marginBottom: 4,
	},
	productFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	productPrice: {
		fontSize: 14,
		fontWeight: "700",
		color: '#8146C1',
	},
	productNotes: {
		fontSize: 11,
		color: '#666',
		marginTop: 2,
	},
	lowStock: {
		fontSize: 9,
		color: '#FF4444',
		fontWeight: '500',
	},
	sectionContainer: {
		marginHorizontal: 20,
		marginBottom: 20,
	},
	bottomNav: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 1000,
	},
	bottomNavDisabled: {
		opacity: 0.7,
	},
	disabledItem: {
		opacity: 0.5,
	},
	verificationBadge: {
		position: 'absolute',
		top: 5,
		right: 5,
		backgroundColor: '#FF4444',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		zIndex: 1,
	},
	verificationText: {
		color: '#FFFFFF',
		fontSize: 10,
		fontWeight: 'bold',
	},
	verificationBanner: {
		backgroundColor: 'rgba(129, 70, 193, 0.15)',
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		paddingHorizontal: 16,
		gap: 8,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(129, 70, 193, 0.2)',
	},
	verificationBannerText: {
		color: '#8146C1',
		fontSize: 12,
		flex: 1,
		fontWeight: '400',
	},
	disabledOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0,0,0,0.1)',
		borderRadius: 10,
		justifyContent: 'center',
		alignItems: 'center',
	},
	popupOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		zIndex: 2000,
	},
	popupContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		padding: 20,
		width: '85%',
		alignItems: 'center',
	},
	popupTitle: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#8146C1',
		marginBottom: 10,
		textAlign: 'center',
	},
	popupText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 20,
		paddingHorizontal: 10,
	},
	popupFeatures: {
		alignSelf: 'stretch',
		marginBottom: 25,
		paddingLeft: 20,
	},
	popupFeatureItem: {
		fontSize: 16,
		color: '#666',
		marginBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
	},
	popupQuestion: {
		fontSize: 18,
		color: '#333',
		fontWeight: '600',
		marginBottom: 20,
	},
	popupButtons: {
		width: '100%',
		gap: 10,
	},
	setupButton: {
		backgroundColor: '#8146C1',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
		width: '100%',
		alignItems: 'center',
	},
	setupButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	laterButton: {
		backgroundColor: '#FFFFFF',
		paddingVertical: 12,
		paddingHorizontal: 30,
		borderRadius: 25,
		width: '100%',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#8146C1',
	},
	laterButtonText: {
		color: '#8146C1',
		fontSize: 16,
		fontWeight: 'bold',
	},
	petsSection: {
		marginTop: 20,
		marginBottom: 20,
		marginHorizontal: 16,
		paddingHorizontal: 16,
		backgroundColor: '#FFFFFF',
		paddingVertical: 20,
		borderRadius: 20,
		elevation: 2,
		shadowColor: '#8146C1',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	petsSectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20,
		paddingHorizontal: 4,
	},
	petsTitleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	petsCountBadge: {
		backgroundColor: '#F8F2FF',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 4,
	},
	petsCountText: {
		color: '#8146C1',
		fontSize: 14,
		fontWeight: 'bold',
	},
	petsScrollContainer: {
		paddingLeft: 4,
		paddingRight: 20,
		gap: 12,
	},
	petItem: {
		width: 140,
		height: 190,
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		elevation: 3,
		shadowColor: '#8146C1',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#F0F0F0',
	},
	petImageContainer: {
		width: '100%',
		height: 120,
		position: 'relative',
		backgroundColor: '#F8F2FF',
	},
	petImage: {
		width: '100%',
		height: '100%',
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		resizeMode: 'contain',
	},
	petInfoContainer: {
		padding: 12,
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
	},
	petName: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#333333',
		marginBottom: 8,
		textAlign: 'center',
	},
	petDetailsChip: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#F8F2FF',
		paddingVertical: 4,
		paddingHorizontal: 10,
		borderRadius: 20,
		alignSelf: 'center',
		gap: 4,
	},
	petDetailsText: {
		fontSize: 11,
		color: '#8146C1',
		fontWeight: '600',
	},
	addPetItem: {
		width: 140,
		height: 190,
		borderRadius: 16,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: '#8146C1',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 2,
		shadowColor: '#8146C1',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	addPetContent: {
		alignItems: 'center',
		padding: 12,
	},
	addPetIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: '#F8F2FF',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 12,
	},
	addPetText: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#8146C1',
		marginBottom: 4,
		textAlign: 'center',
	},
	addPetSubtext: {
		fontSize: 11,
		color: '#666666',
		textAlign: 'center',
		paddingHorizontal: 8,
	},
	petLockOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 16,
	},
	welcomeIcon: {
		marginBottom: 10,
	},
	profilePhotoContainer: {
		marginLeft: 10,
		marginTop: -15,
	},
	profilePhoto: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	tutorialOverlay: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		zIndex: 2000,
	},
	tutorialCutoutContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		paddingTop: 95,
	},
	tutorialCutout: {
		marginHorizontal: 20,
		height: 65,
		borderRadius: 12,
		backgroundColor: 'transparent',
		borderWidth: 2,
		borderColor: '#FF8ACF',
		shadowColor: '#FF8ACF',
		shadowOffset: {
			width: 0,
			height: 0,
		},
		shadowOpacity: 0.5,
		shadowRadius: 10,
	},
	tutorialTextContainer: {
		marginHorizontal: 20,
		marginTop: 20,
		backgroundColor: '#FFFFFF',
		padding: 20,
		borderRadius: 15,
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
	tutorialTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#8146C1',
		marginBottom: 10,
		textAlign: 'center',
	},
	tutorialText: {
		fontSize: 14,
		color: '#666666',
		textAlign: 'center',
		marginBottom: 15,
		lineHeight: 20,
	},
	tutorialButton: {
		backgroundColor: '#8146C1',
		paddingVertical: 10,
		paddingHorizontal: 30,
		borderRadius: 25,
		marginTop: 5,
	},
	tutorialButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
	welcomeCard: {
		backgroundColor: '#8146C1',
		borderRadius: 20,
		margin: 16,
		padding: 20,
		marginTop: 20,
	},
	welcomeContent: {
		gap: 8,
	},
	welcomeText: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	welcomeSubtext: {
		fontSize: 16,
		color: '#FFFFFF',
		opacity: 0.9,
		letterSpacing: 0.3,
	},
	userName: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#FFFFFF',
	},
	welcomeSubtext: {
		fontSize: 14,
		color: '#FFFFFF',
		opacity: 0.8,
		marginTop: 4,
	},
	widgetContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 15,
		margin: 16,
		padding: 16,
		marginTop: 8,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	widgetHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		gap: 8,
	},
	widgetTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	appointmentCard: {
		backgroundColor: '#F8F2FF',
		borderRadius: 12,
		padding: 16,
		marginRight: 12,
		width: 250,
	},
	appointmentHeader: {
		gap: 12,
	},
	appointmentTitleRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 4,
	},
	appointmentInfo: {
		gap: 8,
	},
	infoRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	appointmentPet: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
		flex: 1,
	},
	appointmentType: {
		fontSize: 13,
		color: '#8146C1',
		flex: 1,
	},
	appointmentDate: {
		fontSize: 13,
		color: '#666',
	},
	appointmentTime: {
		fontSize: 13,
		color: '#666',
	},
	statusTag: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
		borderWidth: 1,
		alignSelf: 'flex-start',
	},
	statusText: {
		fontSize: 10,
		fontWeight: '600',
		textTransform: 'capitalize',
	},
	emptyStateContainer: {
		alignItems: 'center',
		padding: 20,
	},
	emptyStateText: {
		fontSize: 14,
		color: '#666',
		marginBottom: 12,
	},
	scheduleButton: {
		backgroundColor: '#8146C1',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
	},
	scheduleButtonText: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
	recordCard: {
		backgroundColor: '#F8F2FF',
		borderRadius: 12,
		padding: 16,
		marginRight: 12,
		width: 150,
		alignItems: 'center',
	},
	recordIcon: {
		backgroundColor: '#FFFFFF',
		borderRadius: 25,
		padding: 12,
		marginBottom: 8,
	},
	recordPetName: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 4,
	},
	recordType: {
		fontSize: 12,
		color: '#8146C1',
		marginBottom: 4,
	},
	recordDate: {
		fontSize: 11,
		color: '#666',
	},
	addRecordCard: {
		backgroundColor: '#F8F2FF',
		borderRadius: 12,
		padding: 16,
		marginRight: 12,
		width: 150,
		alignItems: 'center',
		justifyContent: 'center',
		borderStyle: 'dashed',
		borderWidth: 2,
		borderColor: '#8146C1',
	},
	addRecordText: {
		fontSize: 14,
		color: '#8146C1',
		marginTop: 8,
		fontWeight: '600',
	},
	modal: {
		margin: 0,
		justifyContent: 'flex-end',
	},
	modalContent: {
		backgroundColor: 'white',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingTop: 20,
		maxHeight: '80%',
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333',
	},
	closeButton: {
		padding: 5,
	},
	modalScroll: {
		padding: 20,
	},
	modalPetImage: {
		width: 150,
		height: 150,
		borderRadius: 75,
		alignSelf: 'center',
		marginBottom: 20,
	},
	detailsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	detailCard: {
		width: '48%',
		backgroundColor: '#F8F8F8',
		padding: 16,
		borderRadius: 12,
		marginBottom: 16,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	cardLabel: {
		fontSize: 14,
		color: '#666',
		marginLeft: 6,
	},
	cardValue: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	breedContainer: {
		backgroundColor: '#F8F8F8',
		padding: 16,
		borderRadius: 12,
		marginBottom: 24,
	},
	breedHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	breedLabel: {
		fontSize: 14,
		color: '#666',
		marginLeft: 6,
	},
	breedValue: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
});

export default HomePage;
