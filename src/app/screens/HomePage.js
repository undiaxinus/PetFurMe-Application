import React, { useState, useEffect, useCallback } from "react";
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
	Button,
	RefreshControl,
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
import Modal from 'react-native-modal';
import { useRefresh } from '../hooks/useRefresh';

const API_BASE_URL = `${BASE_URL}/PetFurMe-Application/api`;

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
	const [isRecordModalVisible, setIsRecordModalVisible] = useState(false);
	const [selectedRecord, setSelectedRecord] = useState(null);
	const { updateDetails } = route.params || {};

	// Add refresh interval reference
	const refreshIntervalRef = React.useRef(null);

	console.log("HomePage user_id:", user_id);

	// Add this refresh function to fetch all data at once
	const refreshAllContent = useCallback(async () => {
		console.log('Pull-to-refresh triggered, refreshing all content...');
		
		if (!user_id) {
			console.warn('Cannot refresh: No user ID available');
			return;
		}
		
		// Show loading indicator during manual refresh
		setIsLoading(true);
		
		try {
			// Use Promise.all to fetch data in parallel
			await Promise.all([
				checkProfileStatus(),
				fetchUserPets(),
				fetchUpcomingAppointments(),
				fetchPetRecords()
			]);
			
			console.log('All content refreshed successfully');
		} catch (error) {
			console.error('Error refreshing content:', error);
		} finally {
			setIsLoading(false);
		}
	}, [user_id]);
	
	// Use our custom refresh hook
	const { refreshControlProps, RefreshButton, webProps } = useRefresh(refreshAllContent);

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
			
			refreshAllContent();
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
			const url = `${API_BASE_URL}/pets/get_user_pets.php?user_id=${user_id}`;
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
			const url = `${API_BASE_URL}/users/check_profile_status.php?user_id=${user_id}`;
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
						? `${BASE_URL}/${data.profile.photo}`
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
			const response = await fetch(`${API_BASE_URL}/appointments/get_upcoming.php?user_id=${user_id}`);
			
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
		if (!user_id) return;
		
		try {
			const response = await fetch(
				`${API_BASE_URL}/pets/get_pet_records.php?user_id=${user_id}&include_services=true`
			);
			
			const data = await response.json();
			
			if (data.success) {
				setPetRecords(data.records);
			} else {
				console.error('Failed to fetch pet records:', data.message);
			}
		} catch (error) {
			console.error('Error fetching pet records:', error);
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

	const renderPetRecords = () => {
		if (petRecords.length === 0) {
			return (
				<View style={styles.emptyStateContainer}>
					<Ionicons name="document-text-outline" size={32} color="#8146C1" style={{opacity: 0.5}} />
					<Text style={styles.emptyStateText}>No medical records available</Text>
					<Text style={styles.emptyStateSubtext}>
						Records will appear here after your pet's veterinary visits
					</Text>
				</View>
			);
		}

		return (
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				{petRecords.map((record, index) => (
					<TouchableOpacity 
						key={index}
						style={[
							styles.recordCardNew,
							styles.medicalRecordCard
						]}
						onPress={() => {
							if (record.medical) {
								toggleRecordModal(record);
							} else {
								Alert.alert(
									"Record Details",
									"No medical details available for this record.",
									[{ text: "OK" }]
								);
							}
						}}
					>
						<View style={styles.recordHeader}>
							<Text style={styles.recordPetName}>{record.pet_name}</Text>
							<Text style={styles.recordDate}>{record.date}</Text>
						</View>
						
						<View style={styles.singleRecordContainer}>
							<View style={styles.iconTextRow}>
								<Ionicons name="medical" size={16} color="#4285F4" />
								<Text style={styles.recordType}>Finding</Text>
							</View>
							
							<Text numberOfLines={1} style={styles.recordDescription}>
								{record.medical?.description || "Medical Record"}
							</Text>
							
							{record.medical?.details && (
								<Text numberOfLines={2} style={styles.recordDetails}>
									{record.medical.details}
								</Text>
							)}
						</View>
					</TouchableOpacity>
				))}
			</ScrollView>
		);
	};

	// Enhance the debug logging function
	const logRecordStructure = (record) => {
		if (!record) return;
		
		console.log('--------- DETAILED RECORD INSPECTION ---------');
		// Log the entire record for reference
		console.log('Complete record object:', record);
		
		// Medical record inspection
		if (record.medical) {
			console.log('MEDICAL RECORD KEYS:', Object.keys(record.medical));
			console.log('Medical record content:', JSON.stringify(record.medical, null, 2));
			
			// Look for attending physician in various locations
			console.log('Physician check - medical.attending_physician:', record.medical.attending_physician);
			console.log('Physician check - medical.created_by:', record.medical.created_by);
			console.log('Physician check - medical.physician:', record.medical.physician);
		}
		
		// Financial record inspection
		if (record.financial) {
			console.log('FINANCIAL RECORD KEYS:', Object.keys(record.financial));
			console.log('Financial record content:', JSON.stringify(record.financial, null, 2));
			
			// Look for services
			console.log('Services check - financial.services:', record.financial.services);
			if (record.financial.data) {
				console.log('Services check - financial.data.services:', record.financial.data.services);
				console.log('Services check - financial.data.items:', record.financial.data.items);
			}
			
			// Look for attending physician in various locations
			console.log('Physician check - financial.attending_physician:', record.financial.attending_physician);
			if (record.financial.data) {
				console.log('Physician check - financial.data.attending_physician:', record.financial.data.attending_physician);
			}
		}
		
		console.log('--------- END DETAILED INSPECTION ---------');
	};

	// Update toggleRecordModal to use this
	const toggleRecordModal = (record = null) => {
		if (record) {
			logRecordStructure(record);
			setSelectedRecord(record);
			setIsRecordModalVisible(true);
		} else {
			setIsRecordModalVisible(false);
			setSelectedRecord(null);
		}
	};

	// Add these helper functions to flexibly find data in different formats
	const findPhysician = (record) => {
		if (!record || !record.medical || !record.medical.data) return null;
		
		// Check in medical.data for vaccination_administered_by
		if (record.medical.data.vaccination_administered_by) {
			return record.medical.data.vaccination_administered_by;
		}
		
		return null;
	};

	// Add a product name mapping function
	const getProductNameById = (productId) => {
		// Map product IDs to names based on the products table
		const productMap = {
			"4": "Vetericyn",
			"5": "Dog Food",
			"6": "Comb",
			// Add more as needed
		};
		
		return productMap[productId] || `Product #${productId}`;
	};

	// Update the findServicesAndProducts function to use the product name mapping
	const findServicesAndProducts = (record) => {
		if (!record || !record.financial || !record.financial.data) return [];
		
		const items = [];
		
		// Add services
		if (record.financial.data.services && Array.isArray(record.financial.data.services)) {
			items.push(...record.financial.data.services.map(service => ({
				name: service.description || 'Service',
				quantity: 1,
				price: service.amount || 0,
				type: 'service'
			})));
		}
		
		// Add products with proper names
		if (record.financial.data.products && Array.isArray(record.financial.data.products)) {
			items.push(...record.financial.data.products.map(product => ({
				name: getProductNameById(product.item),
				quantity: product.quantity || 1,
				price: product.amount || 0,
				type: 'product'
			})));
		}
		
		return items;
	};

	// Helper function to get financial totals
	const getFinancialTotals = (record) => {
		if (!record || !record.financial || !record.financial.data) return {
			servicesTotal: 0,
			productsTotal: 0,
			grandTotal: 0
		};
		
		return {
			servicesTotal: parseFloat(record.financial.data.services_total || 0),
			productsTotal: parseFloat(record.financial.data.products_total || 0),
			grandTotal: parseFloat(record.financial.data.grand_total || 0)
		};
	};

	const findItemName = (item) => {
		if (!item) return null;
		return item.name || item.service_name || item.product_name || 
			   item.description || item.item_name || item.title;
	};

	const findItemPrice = (item) => {
		if (!item) return 0;
		return item.price || item.amount || item.cost || item.value || 0;
	};

	// First, fix the description formatting in findPhysician function 
	const formatDescription = (description) => {
		// Remove any leading colons and trim whitespace
		return description.replace(/^:?\s*/, '').trim();
	};

	const testApiConnection = async () => {
		try {
			// Show loading indicator
			setIsLoading(true);
			
			console.log('Testing API connection to:', `${API_BASE_URL}/test_connection.php`);
			
			const response = await fetch(`${API_BASE_URL}/test_connection.php`);
			const data = await response.json();
			
			console.log('Connection test result:', data);
			
			// Show success message
			Alert.alert(
				'Connection Test',
				`Success! Server responded: ${data.message}`,
				[{ text: 'OK' }]
			);
		} catch (error) {
			console.error('Connection test failed:', error);
			
			// Show error message with details
			Alert.alert(
				'Connection Error',
				`Failed to connect to server: ${error.message}. Please check your internet connection and try again.`,
				[{ text: 'OK' }]
			);
		} finally {
			setIsLoading(false);
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

			<ScrollView 
				contentContainerStyle={styles.scrollContent}
				refreshControl={
					<RefreshControl
						{...refreshControlProps}
					/>
				}
				{...webProps}
			>
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
							{isVerified ? (
								<>
									<Text style={styles.emptyStateText}>No upcoming appointments</Text>
									<TouchableOpacity 
										style={styles.scheduleButton}
										onPress={() => navigation.navigate('Appointment', { user_id: user_id })}
									>
										<Text style={styles.scheduleButtonText}>Schedule Now</Text>
									</TouchableOpacity>
								</>
							) : (
								<View style={styles.verificationRequiredContainer}>
									<Ionicons name="lock-closed" size={24} color="#FF4444" />
									<Text style={styles.verificationRequiredTitle}>Account verification required</Text>
									<Text style={styles.verificationRequiredText}>
										Appointment scheduling is available after your account is verified
									</Text>
								</View>
							)}
						</View>
					)}
				</View>

				{/* Pet Records Section */}
				<View style={styles.widgetContainer}>
					<View style={styles.widgetHeader}>
						<Ionicons name="document-text" size={24} color="#8146C1" />
						<Text style={styles.widgetTitle}>Pet Records</Text>
					</View>
					{renderPetRecords()}
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

			<Modal
				isVisible={isRecordModalVisible}
				onBackdropPress={() => toggleRecordModal()}
				onSwipeComplete={() => toggleRecordModal()}
				swipeDirection="down"
				propagateSwipe
				style={styles.modalContainer}
				backdropOpacity={0.5}
				animationIn="slideInUp"
				animationOut="slideOutDown"
			>
				<View style={styles.recordModalContent}>
					<View style={styles.recordModalHandle} />
					
					<View style={styles.recordModalHeader}>
						<Text style={styles.recordModalTitle}>
							{selectedRecord?.pet_name || 'Pet'} Record
						</Text>
						<TouchableOpacity 
							onPress={() => toggleRecordModal()} 
							style={styles.closeButton}
						>
							<Ionicons name="close" size={24} color="#666" />
						</TouchableOpacity>
					</View>
					
					{selectedRecord && (
						<ScrollView style={styles.recordModalScroll}>
							{/* Combined Record Card */}
							<View style={styles.recordCard}>
								{/* Pet Info & Appointment Header */}
								<View style={styles.recordCardHeader}>
									<View>
										<Text style={styles.recordCardPetName}>
											{selectedRecord.pet_name}
										</Text>
										<Text style={styles.recordCardDate}>
											{selectedRecord.date}
										</Text>
									</View>
									<View style={styles.appointmentBadge}>
										<Text style={styles.appointmentBadgeText}>
											Appointment #{selectedRecord.appointment_id}
										</Text>
									</View>
								</View>
								
								{/* Attending Physician - Now using the correct data path */}
								<View style={styles.attendingPhysicianContainer}>
									<Ionicons name="person" size={16} color="#8146C1" />
									<Text style={styles.attendingPhysicianLabel}>Attending Physician:</Text>
									<Text style={styles.attendingPhysicianName}>
										{findPhysician(selectedRecord) || 'Not Specified'}
									</Text>
								</View>
								
								{/* Medical Finding Section - Use correct field names */}
								<View style={styles.recordSubSection}>
									<View style={styles.sectionTitleRow}>
										<Ionicons name="medical" size={16} color="#4285F4" />
										<Text style={styles.sectionTitle}>Medical Finding</Text>
									</View>
									
									{selectedRecord.medical && selectedRecord.medical.description && (
										<View style={styles.dataRow}>
											<Text style={styles.dataLabel}>Description:</Text>
											<Text style={styles.dataValue}>
												{formatDescription(selectedRecord.medical.description)}
											</Text>
										</View>
									)}
									
									{selectedRecord.medical && selectedRecord.medical.details && (
										<View style={styles.dataRow}>
											<Text style={styles.dataLabel}>Details:</Text>
											<Text style={styles.dataValue}>
												{formatDescription(selectedRecord.medical.details)}
											</Text>
										</View>
									)}
								</View>
								
								{/* Divider between medical and financial sections */}
								{selectedRecord.medical && selectedRecord.financial && (
									<View style={styles.sectionDivider} />
								)}
								
								{/* Products & Services Section */}
								{selectedRecord.financial && (
									<>
										<View style={styles.itemsContainer}>
											<Text style={styles.dataLabel}>Products & Services:</Text>
											
											<View style={styles.itemsTable}>
												<View style={styles.itemsTableHeader}>
													<Text style={styles.itemNameHeader}>Item</Text>
													<Text style={styles.itemQtyHeader}>Qty</Text>
													<Text style={styles.itemPriceHeader}>Price</Text>
												</View>
												
												{findServicesAndProducts(selectedRecord).map((item, index) => (
													<View key={index} style={styles.itemsTableRow}>
														<Text style={styles.itemNameCell} numberOfLines={1}>
															{item.name}
														</Text>
														<Text style={styles.itemQtyCell}>
															{item.quantity}
														</Text>
														<Text style={styles.itemPriceCell}>
															${parseFloat(item.price).toFixed(2)}
														</Text>
													</View>
												))}
											</View>
										</View>
										
										{/* Simplified financial summary showing just the total */}
										<View style={styles.totalContainer}>
											<Text style={styles.totalLabel}>Total:</Text>
											<Text style={styles.totalValue}>
												${parseFloat(selectedRecord.financial.data?.grand_total || 0).toFixed(2)}
											</Text>
										</View>
									</>
								)}
								
								{/* Payment Status Badge */}
								{(selectedRecord.financial.data?.payment_status || 
									selectedRecord.financial.payment_status) && (
									<View style={[
										styles.paymentStatusBadge, 
										(selectedRecord.financial.data?.payment_status === 'paid' || 
											selectedRecord.financial.payment_status === 'paid')
											? styles.paidBadge : styles.unpaidBadge
									]}>
										<Text style={[
											styles.paymentStatusText,
											(selectedRecord.financial.data?.payment_status === 'paid' || 
												selectedRecord.financial.payment_status === 'paid')
													? styles.paidText : styles.unpaidText
										]}>
											{(selectedRecord.financial.data?.payment_status === 'paid' || 
												selectedRecord.financial.payment_status === 'paid')
													? 'PAID' : 'UNPAID'}
										</Text>
									</View>
								)}
							</View>
						</ScrollView>
					)}
				</View>
			</Modal>
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
	recordCardNew: {
		backgroundColor: '#F8F8F8',
		borderRadius: 12,
		padding: 14,
		marginRight: 12,
		width: 240,
		borderLeftWidth: 4,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
		minHeight: 160,
		marginBottom: 8,
	},
	recordHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 10,
		paddingBottom: 8,
		borderBottomWidth: 1,
		borderBottomColor: 'rgba(0,0,0,0.05)',
	},
	recordPetName: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	recordDate: {
		fontSize: 12,
		color: '#666',
	},
	recordType: {
		fontSize: 13,
		fontWeight: '500',
		color: '#555',
	},
	recordDescription: {
		fontSize: 14,
		color: '#333',
		fontWeight: '500',
		marginBottom: 6,
		lineHeight: 18,
	},
	recordDetails: {
		fontSize: 12,
		color: '#666',
		marginBottom: 6,
		lineHeight: 16,
	},
	recordSection: {
		paddingVertical: 8,
	},
	combinedRecordsContainer: {
		flex: 1,
	},
	singleRecordContainer: {
		flex: 1,
		paddingTop: 4,
	},
	recordDivider: {
		height: 1,
		backgroundColor: 'rgba(0,0,0,0.05)',
		marginVertical: 6,
	},
	iconTextRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
		gap: 6,
	},
	addRecordCardNew: {
		backgroundColor: '#F0F0F0',
		borderRadius: 12,
		padding: 16,
		marginRight: 12,
		width: 180,
		alignItems: 'center',
		justifyContent: 'center',
		borderStyle: 'dashed',
		borderWidth: 1,
		borderColor: '#8146C1',
		height: 160,
	},
	totalAmount: {
		fontSize: 14,
		fontWeight: 'bold',
		color: '#34A853',
		marginTop: 4,
		alignSelf: 'flex-end',
	},
	medicalRecordCard: {
		backgroundColor: '#F0F7FF',
		borderLeftWidth: 4,
		borderLeftColor: '#4285F4',
	},
	modalContainer: {
		margin: 0,
		justifyContent: 'flex-end',
	},
	recordModalContent: {
		backgroundColor: 'white',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingTop: 15,
		paddingBottom: 25,
		maxHeight: '85%',
	},
	recordModalHandle: {
		width: 40,
		height: 4,
		backgroundColor: '#E0E0E0',
		borderRadius: 2,
		alignSelf: 'center',
		marginBottom: 15,
	},
	recordModalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
		paddingBottom: 10,
	},
	recordModalTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	closeButton: {
		padding: 4,
	},
	recordModalScroll: {
		padding: 15,
		paddingTop: 0,
	},
	recordCard: {
		backgroundColor: 'white',
		marginBottom: 12,
	},
	recordCardHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 10,
		paddingHorizontal: 20,
	},
	recordCardPetName: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#333',
		marginBottom: 2,
	},
	recordCardDate: {
		fontSize: 14,
		color: '#666',
	},
	appointmentBadge: {
		backgroundColor: '#F0E6FF',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 16,
	},
	appointmentBadgeText: {
		fontSize: 12,
		color: '#8146C1',
		fontWeight: '500',
	},
	attendingPhysicianContainer: {
		backgroundColor: '#F8F2FF',
		padding: 12,
		borderRadius: 8,
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 16,
	},
	attendingPhysicianLabel: {
		fontSize: 14,
		fontWeight: '500',
		color: '#8146C1',
		marginLeft: 6,
		marginRight: 4,
	},
	attendingPhysicianName: {
		fontSize: 14,
		fontWeight: '600',
		color: '#333',
		flex: 1,
	},
	sectionDivider: {
		height: 1,
		backgroundColor: '#E0E0E0',
		marginVertical: 12,
	},
	recordSubSection: {
		marginBottom: 12,
	},
	sectionTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
		paddingHorizontal: 20,
	},
	sectionTitle: {
		fontSize: 15,
		fontWeight: 'bold',
		marginLeft: 6,
		color: '#333',
	},
	dataRow: {
		marginBottom: 6,
		paddingHorizontal: 20,
	},
	dataLabel: {
		fontSize: 13,
		fontWeight: '500',
		color: '#666',
	},
	dataValue: {
		fontSize: 14,
		color: '#333',
		lineHeight: 18,
	},
	itemsContainer: {
		marginTop: 5,
		marginBottom: 10,
		paddingHorizontal: 20,
	},
	itemsTable: {
		marginTop: 4,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 4,
	},
	itemsTableHeader: {
		flexDirection: 'row',
		backgroundColor: '#F5F5F5',
		paddingVertical: 6,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#E0E0E0',
	},
	itemNameHeader: {
		flex: 2,
		fontSize: 12,
		fontWeight: '500',
		color: '#666',
	},
	itemQtyHeader: {
		width: 40,
		fontSize: 12,
		fontWeight: '500',
		color: '#666',
		textAlign: 'center',
	},
	itemPriceHeader: {
		width: 60,
		fontSize: 12,
		fontWeight: '500',
		color: '#666',
		textAlign: 'right',
	},
	itemsTableRow: {
		flexDirection: 'row',
		paddingVertical: 6,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	itemNameCell: {
		flex: 2,
		fontSize: 13,
		color: '#333',
	},
	itemQtyCell: {
		width: 40,
		fontSize: 13,
		color: '#333',
		textAlign: 'center',
	},
	itemPriceCell: {
		width: 60,
		fontSize: 13,
		color: '#333',
		textAlign: 'right',
	},
	totalContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 8,
		paddingHorizontal: 20,
		borderTopWidth: 1,
		borderTopColor: '#E0E0E0',
		marginTop: 5,
	},
	totalLabel: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
	totalValue: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#333',
	},
	paymentStatusBadge: {
		padding: 4,
		borderRadius: 12,
		borderWidth: 1,
		alignSelf: 'flex-start',
	},
	paidBadge: {
		borderColor: '#34A853',
	},
	unpaidBadge: {
		borderColor: '#FF4444',
	},
	paymentStatusText: {
		fontSize: 10,
		fontWeight: '600',
		textTransform: 'capitalize',
	},
	paidText: {
		color: '#34A853',
	},
	unpaidText: {
		color: '#FF4444',
	},
	verificationRequiredContainer: {
		alignItems: 'center',
		padding: 20,
		gap: 8,
	},
	verificationRequiredTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		color: '#FF4444',
		marginTop: 8,
	},
	verificationRequiredText: {
		fontSize: 14,
		color: '#666',
		textAlign: 'center',
		marginTop: 4,
	},
	emptyStateSubtext: {
		fontSize: 12,
		color: '#888',
		textAlign: 'center',
		marginTop: 4,
		paddingHorizontal: 20,
	},
});

export default HomePage;
