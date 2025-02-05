import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	ScrollView,
	Alert,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
const API_BASE_URL = `http://${SERVER_IP}`;

const HomePage = ({ navigation, route }) => {
	const user_id = route.params?.user_id;
	const refresh = route.params?.refresh;
	const [userPets, setUserPets] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [imageLoadErrors, setImageLoadErrors] = useState({});
	const [showWelcomePopup, setShowWelcomePopup] = useState(false);
	const [isProfileComplete, setIsProfileComplete] = useState(false);
	const [petProducts, setPetProducts] = useState([]);
	const [isProductsLoading, setIsProductsLoading] = useState(false);
	const [userName, setUserName] = useState('');
	const [areFeaturesDisabled, setAreFeaturesDisabled] = useState(false);

	// Add refresh interval reference
	const refreshIntervalRef = React.useRef(null);

	console.log("HomePage user_id:", user_id);

	useEffect(() => {
		if (user_id) {
			// Initial fetch
			fetchUserPets();
			
			// Set up auto refresh every 30 seconds
			refreshIntervalRef.current = setInterval(() => {
				fetchUserPets();
			}, 10000);
			
			// Cleanup function
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
		if (isProfileComplete) {
			setAreFeaturesDisabled(false);
		}
	}, [isProfileComplete]);

	const fetchUserPets = async () => {
		// Don't set loading state for auto refresh to avoid UI flicker
		const isAutoRefresh = isLoading === false;
		if (!isAutoRefresh) {
			setIsLoading(true);
		}
		
		try {
			const url = `${API_BASE_URL}/PetFurMe-Application/api/pets/get_user_pets.php?user_id=${user_id}`;
			console.log("Attempting to fetch from:", url);
			
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 5000);
			
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				signal: controller.signal
			});
			
			clearTimeout(timeoutId);
			
			console.log("Response status:", response.status);
			console.log("Response headers:", Object.fromEntries(response.headers.entries()));
			
			if (!response.ok) {
				const errorText = await response.text();
				console.error("Error response body:", errorText);
				throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
			}
			
			const data = await response.json();
			console.log("Successfully parsed response data:", data);
			
			if (data.success) {
				const loggablePets = data.pets.map(pet => ({
					...pet,
					photo: pet.photo ? '[Photo Data]' : null // Replace base64 data with placeholder
				}));
				console.log("Pets data received:", loggablePets);
				setUserPets(data.pets || []);
			} else {
				throw new Error(data.message || 'Failed to load pets data');
			}
		} catch (error) {
			console.error("Error fetching pets:", error);
			console.error("Error details:", {
				message: error.message,
				stack: error.stack,
				name: error.name
			});
			
			let errorMessage = 'Unable to load pets';
			if (error.name === 'AbortError') {
				errorMessage = 'Request timed out. Please check your connection.';
			} else if (error.message.includes('Network request failed')) {
				errorMessage = 'Network error. Please check if the server is running.';
			}
			
			Alert.alert(
				"Connection Error",
				`${errorMessage}\n${error.message}`
			);
		} finally {
			if (!isAutoRefresh) {
				setIsLoading(false);
			}
		}
	};

	const checkProfileStatus = async () => {
		if (!user_id) return;
		
		try {
			const url = `${API_BASE_URL}/PetFurMe-Application/api/users/check_profile_status.php?user_id=${user_id}`;
			console.log("Checking profile status at:", url);
			
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 10000);
			
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				signal: controller.signal
			});
			
			clearTimeout(timeoutId);
			
			console.log("Response status:", response.status);
			console.log("Response headers:", Object.fromEntries(response.headers));
			
			const text = await response.text();
			console.log("Raw response:", text);
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
			}
			
			if (!text.trim()) {
				throw new Error("Empty response from server");
			}
			
			const data = JSON.parse(text);
			console.log("Parsed data:", data);
			
			if (data.success) {
				setIsProfileComplete(data.isProfileComplete);
				setShowWelcomePopup(!data.isProfileComplete);
				setUserName(data.profile?.name || 'there');
				setAreFeaturesDisabled(!data.isProfileComplete);
			} else {
				console.error("Profile check failed:", data.message);
				setIsProfileComplete(false);
				setShowWelcomePopup(true);
				setAreFeaturesDisabled(true);
			}
		} catch (error) {
			console.error("Profile check error:", error);
			console.error("Error details:", {
				message: error.message,
				stack: error.stack,
				name: error.name
			});
			
			let errorMessage = "Failed to check profile status.";
			if (error.name === 'AbortError') {
				errorMessage = "Request timed out. Please check your connection.";
			} else if (error.message.includes('Network request failed')) {
				errorMessage = "Network error. Please check your connection.";
			}
			
			Alert.alert(
				"Connection Error",
				errorMessage
			);
			
			setIsProfileComplete(false);
			setShowWelcomePopup(true);
			setAreFeaturesDisabled(true);
		}
	};

	const handleSetUpNow = async () => {
		await logActivity('Started profile setup', user_id);
		setShowWelcomePopup(false);
		navigation.navigate('ProfileVerification', { 
			user_id: user_id,
			onComplete: async () => {
				await logActivity(ACTIVITY_TYPES.PROFILE_UPDATED, user_id);
				setIsProfileComplete(true);
				setAreFeaturesDisabled(false);
				fetchUserPets();
			}
		});
	};

	const handleMaybeLater = () => {
		setShowWelcomePopup(false);
		setAreFeaturesDisabled(true);
	};

	const categories = [
		{
			id: "1",
			label: "Consultation",
			backgroundColor: "#FF8ACF",
			screen: "Consultation",
			image: require("../../assets/images/consultation.png"),
		},
		{
			id: "2",
			label: "Vaccination",
			backgroundColor: "#8146C1",
			screen: "Consultation",
			image: require("../../assets/images/vaccination.png"),
		},
		{
			id: "3",
			label: "Deworming",
			backgroundColor: "#FF8ACF",
			screen: "Consultation",
			image: require("../../assets/images/deworming.png"),
		},
		{
			id: "4",
			label: "Grooming",
			backgroundColor: "#8146C1",
			screen: "Consultation",
			image: require("../../assets/images/grooming.png"),
		},
	];

	const vets = [
		{
			id: "1",
			name: "Dr. Iwan",
			specialty: "Bachelor of Veterinary Science",
			rating: "5.0",
			reviews: "100 reviews",
			lastVisit: "25/07/2024",
			distance: "2.5km",
			image: require("../../assets/images/doctor.png"),
		},
	];

	const handleAddNewPet = async () => {
		if (!user_id) {
			Alert.alert("Error", "User ID is missing. Please try logging in again.");
			navigation.navigate("LoginScreen");
			return;
		}
		await logActivity(ACTIVITY_TYPES.PET_ADDED, user_id);
		navigation.navigate("AddPetName", { user_id: user_id });
	};

	const fetchPetProducts = async () => {
		try {
			setIsProductsLoading(true);
			const response = await fetch(`${API_BASE_URL}/PetFurMe-Application/api/products/get_home_products.php`);
			
			if (!response.ok) {
				throw new Error('Failed to fetch products');
			}

			const data = await response.json();
			console.log('Received products data:', data);

			if (data.success) {
				const transformedProducts = data.products.map(product => {
					console.log('Processing product:', product);
					return {
						id: product.id.toString(),
						name: product.name,
						weight: product.notes || 'N/A',
						image: product.product_image 
							? { uri: `${API_BASE_URL}/PetFurMe-Application/${product.product_image}` }
							: require("../../assets/images/meowmix.png"),
						type: product.category_name || 'Pet Product'
					};
				});
				console.log('Transformed products:', transformedProducts);
				setPetProducts(transformedProducts);
			}
		} catch (error) {
			console.error('Error fetching products:', error);
		} finally {
			setIsProductsLoading(false);
		}
	};

	useEffect(() => {
		fetchPetProducts();
	}, []);

	return (
		<View style={styles.container}>
			{showWelcomePopup && (
				<View style={styles.popupOverlay}>
					<View style={styles.popupContainer}>
						<Text style={styles.popupTitle}>Welcome to Pet Fur Me!</Text>
						<Text style={styles.popupText}>
							Hi {userName}, we're so excited to have you here. To make the most of your
							experience, let's personalize your profile.
						</Text>
						
						<View style={styles.popupFeatures}>
							<Text style={styles.popupFeatureItem}>• Tailored recommendations</Text>
							<Text style={styles.popupFeatureItem}>• Exclusive features</Text>
							<Text style={styles.popupFeatureItem}>• A smoother experience</Text>
						</View>
						
						<Text style={styles.popupQuestion}>What would you like to do?</Text>
						
						<View style={styles.popupButtons}>
							<TouchableOpacity 
								style={styles.setupButton} 
								onPress={handleSetUpNow}
							>
								<Text style={styles.setupButtonText}>Set Up Now</Text>
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
			{isLoading && (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#8146C1" />
				</View>
			)}
			{/* Fixed Header */}
			<View style={styles.header}>
				<TouchableOpacity 
					style={styles.menuButton} 
					onPress={() => navigation.openDrawer()}
				>
					<Image
						source={require("../../assets/images/burger.png")}
						style={styles.menuIcon}
					/>
				</TouchableOpacity>

				<View style={styles.headerContent}>
					<Text style={styles.welcomeText}>
						Hey! Your pet's happiness starts here!
					</Text>
					
				</View>
			</View>

			{/* Add paddingTop to scrollContent to account for fixed header */}
			<ScrollView contentContainerStyle={styles.scrollContent}>
			<View style={styles.searchSection}>
						<Image
							source={require("../../assets/images/lookingfor.png")}
							style={styles.searchIcon}
						/>
						<Text style={styles.searchText}>
							What are you looking for?
						</Text>
					</View>
				{/* Categories Section */}
				<View style={styles.categoriesContainer}>
					{categories.map((category) => (
						<TouchableOpacity
							key={category.id}
							style={[
								styles.categoryItem,
								{ 
									backgroundColor: category.backgroundColor,
									opacity: areFeaturesDisabled ? 0.5 : 1
								},
							]}
							onPress={() => {
								if (!areFeaturesDisabled) {
									navigation.navigate(category.screen, { 
										reason: category.label,
										user_id: user_id
									});
								}
							}}
							disabled={areFeaturesDisabled}
						>
							<View style={styles.categoryContent}>
								<Image 
									source={category.image} 
									style={[
										styles.categoryImage,
										{ opacity: areFeaturesDisabled ? 0.5 : 1 }
									]} 
								/>
								<Text style={styles.categoryLabel}>{category.label}</Text>
							</View>
						</TouchableOpacity>
					))}
				</View>

				{/* Pets Section - Moved up */}
				{isLoading ? (
					<ActivityIndicator size="large" color="#8146C1" />
				) : (
					<View style={styles.petsSection}>
						<Text style={[styles.sectionTitle, { marginTop: -40 }]}>My Pets</Text>
						<ScrollView 
							horizontal 
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.petsScrollContainer}
						>
							{userPets.map((pet) => (
								<TouchableOpacity onPress={() => navigation.navigate('PetProfile', { petId: pet.id, user_id: user_id })} key={pet.id} style={styles.petItem}>
									<Image
										source={
											pet.photo 
												? { 
													uri: pet.photo,
													headers: {
														'Accept': 'image/jpeg',
														'Cache-Control': 'no-cache'
													}
												}
												: require("../../assets/images/lena.png")
										}
										style={styles.petImage}
										defaultSource={require("../../assets/images/lena.png")}
										onError={(error) => {
											console.log('Image load error for pet:', pet.id, error.nativeEvent);
											setImageLoadErrors(prev => ({
												...prev,
												[pet.id]: true
											}));
										}}
									/>
									<Text style={styles.petName}>{pet.name}</Text>
								</TouchableOpacity>
							))}
							<TouchableOpacity 
								onPress={handleAddNewPet} 
								style={[
									styles.petItem,
									{ opacity: areFeaturesDisabled ? 0.5 : 1 }
								]}
								disabled={areFeaturesDisabled}
							>
								<Image
									source={require("../../assets/images/addnew.png")}
									style={[
										styles.petImage,
										{ opacity: areFeaturesDisabled ? 0.5 : 1 }
									]}
								/>
								<Text style={[
									styles.petName,
									{ opacity: areFeaturesDisabled ? 0.5 : 1 }
								]}>Add New</Text>
							</TouchableOpacity>
						</ScrollView>
					</View>
				)}

				{/* Pet Products Section */}
				<View style={styles.petProductsBox}>
					<View style={styles.sectionHeader}>
						<View style={styles.leftHeader}>
							<Image
								source={require("../../assets/images/petpro.png")}
								style={styles.vetcare}
							/>
							<Text style={styles.petproducts}>Pet Products</Text>
						</View>
						<TouchableOpacity onPress={() => navigation.navigate("ViewMorePro")}>
							<Text style={styles.viewmore}>View More</Text>
						</TouchableOpacity>
					</View>

					{isProductsLoading ? (
						<ActivityIndicator size="small" color="#8146C1" />
					) : (
						petProducts.map((item) => (
							<View key={item.id} style={styles.petProductCard}>
								<Image source={item.image} style={styles.productImage} />
								<View style={styles.productDetails}>
									<Text style={styles.productName}>{item.name}</Text>
									<Text style={styles.productWeight}>{item.weight}</Text>
									<View style={styles.badge}>
										<Text style={styles.badgeText}>{item.type}</Text>
									</View>
								</View>
							</View>
						))
					)}
				</View>

				{/* Vets Section */}
				<View style={styles.sectionContainer}>
					<Image
						source={require("../../assets/images/vet.png")}
						style={[
							styles.vet,
							{ opacity: areFeaturesDisabled ? 0.5 : 1 }
						]}
					/>
					<Text style={[
						styles.vets,
						{ opacity: areFeaturesDisabled ? 0.5 : 1 }
					]}>Vets</Text>
					{vets.map((vet) => (
						<View key={vet.id} style={[
							styles.vetCard,
							{ opacity: areFeaturesDisabled ? 0.5 : 1 }
						]}>
							<Image source={vet.image} style={styles.vetImage} />
							<View style={styles.vetDetails}>
								<Text style={styles.vetName}>{vet.name}</Text>
								<Text style={styles.vetSpecialty}>{vet.specialty}</Text>
								<Text style={styles.vetRating}>
									⭐ {vet.rating} ({vet.reviews})
								</Text>
								<Text style={styles.vetDistance}>{vet.distance}</Text>
								<Text style={styles.lastVisit}>Last Visit: {vet.lastVisit}</Text>

								<TouchableOpacity
									onPress={() => {
										if (!areFeaturesDisabled) {
											navigation.navigate("Consultation", { user_id: user_id });
										}
									}}
									disabled={areFeaturesDisabled}
									style={[
										styles.bookAppointmentButton,
										{ opacity: areFeaturesDisabled ? 0.5 : 1 }
									]}
								>
									<Text style={[
										styles.bookAppointmentText,
										{ opacity: areFeaturesDisabled ? 0.5 : 1 }
									]}>
										Book Appointment ➔
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					))}
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<View style={styles.bottomNav}>
				<TouchableOpacity style={styles.navItem}>
					<Ionicons name="home" size={24} color="#8146C1" />
					<Text style={styles.navText}>Home</Text>
				</TouchableOpacity>

				<TouchableOpacity 
					style={styles.navItem}
					onPress={() => navigation.navigate('ChatScreen', { 
						user_id: user_id 
					})}
				>
					<Ionicons name="chatbubble-outline" size={24} color="#8146C1" />
					<Text style={styles.navText}>Chat</Text>
				</TouchableOpacity>

				<TouchableOpacity 
					style={styles.navItem}
					onPress={() => navigation.navigate('NotificationScreen', { user_id: user_id })}
				>
					<Ionicons name="notifications-outline" size={24} color="#8146C1" />
					<Text style={styles.navText}>Notifications</Text>
				</TouchableOpacity>

				<TouchableOpacity 
					style={styles.navItem}
					onPress={() => navigation.navigate('Help', { user_id: user_id })}
				>
					<Ionicons name="help-circle-outline" size={24} color="#8146C1" />
					<Text style={styles.navText}>Help</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	header: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		paddingTop: 50,
		backgroundColor: '#8146C1',
		height: 120,
		zIndex: 1000,
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
	},
	scrollContent: {
		paddingTop: 100,
		paddingBottom: 100,
	},
	menuButton: {
		padding: 8,
		marginTop: -15,
	},
	menuIcon: {
		width: 24,
		height: 24,
		resizeMode: 'contain',
	},
	headerContent: {
		flex: 1,
		marginLeft: 12,
	},
	welcomeText: {
		fontSize: 16,
		color: '#FFFFFF',
		fontWeight: 'bold',
		Top: 10,
	},
	searchSection: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderRadius: 8,
		padding: 8,
		top: 10,
	},
	searchIcon: {
		width: 20,
		height: 20,
		resizeMode: 'contain',
		marginRight: 8,
	},
	searchText: {
		fontSize: 14,
		color: '#666666',
		marginBottom: 20,
		top: 10,
	},
	categoriesContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginVertical: 65,
		paddingHorizontal: 10,
		top: -50,
	},
	categoryItem: {
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 10,
		width: 80,
		height: 90,
		padding: 5,
	},
	categoryContent: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
	},
	categoryImage: {
		width: 60,
		height: 60,
		marginBottom: 9,
		top: 5,
	},
	categoryLabel: {
		fontSize: 12,
		color: "#FFFFFF",
		textAlign: "center",
		fontWeight: "bold",
		top: -10,
	},
	petsContainer: {
		flexDirection: "row",
		marginVertical: 20,
		paddingHorizontal: 20,
		top: -20,
		width: 70,
		height: 70,
	},
	petImage: {
		width: 60,
		height: 60,
		borderRadius: 35,
		marginBottom: 5,
	},
	petName: {
		textAlign: "center",
		color: "#8146C1",
		fontWeight: "bold",
		fontSize: 12,
	},
	petProductsBox: {
		backgroundColor: "#F7F7F7",
		borderRadius: 10,
		padding: 15,
		marginHorizontal: 20,
		marginBottom: 30,
		marginTop: 15,
		elevation: 3,
		top: -50,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 15,
		paddingHorizontal: 5,
	},
	leftHeader: {
		flexDirection: "row",
		alignItems: "center",
	},
	vetcare: {
		width: 24,
		height: 24,
		marginRight: 8,
		resizeMode: "contain",
	},
	vets: {
		fontSize: 18,
		fontWeight: 'bold',
		marginLeft: 32,
		bottom: 25,
		color: '#333',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#8146C1",
		left: 30,
		marginTop: 30,
	},
	petproducts: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#333',
	},
	viewmore: {
		color: "#5809BB",
		fontWeight: "bold",
		fontSize: 14,
	},
	petProductCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		padding: 10,
		marginBottom: 10,
		elevation: 2,
	},
	productImage: {
		width: 60,
		height: 60,
		borderRadius: 10,
		marginRight: 10,
	},
	productDetails: {
		flex: 1,
	},
	productName: {
		fontSize: 14,
		fontWeight: "bold",
	},
	productWeight: {
		fontSize: 12,
		color: "#888888",
		marginBottom: 5,
	},
	badge: {
		backgroundColor: "#FFD700",
		paddingVertical: 2,
		paddingHorizontal: 5,
		borderRadius: 5,
		alignSelf: "flex-start",
	},
	badgeText: {
		fontSize: 10,
		color: "#FFFFFF",
	},
	sectionContainer: {
		marginHorizontal: 20,
		marginBottom: -100,
		top: -50,
	},
	vetCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		padding: 15,
		bottom: 10,
		elevation: 2,
		marginBottom: 20,
	},
	vetImage: {
		width: 60,
		height: 60,
		borderRadius: 30,
		marginRight: 15,
	},
	vetDetails: {
		flex: 1,
	},
	vetName: {
		fontSize: 16,
		fontWeight: "bold",
	},
	vetSpecialty: {
		fontSize: 12,
		color: "#888888",
	},
	vetRating: {
		fontSize: 12,
		color: "#FFD700",
	},
	vetDistance: {
		fontSize: 12,
		color: "#888888",
	},
	lastVisit: {
		fontSize: 12,
		color: "#888888",
		marginVertical: 5,
	},
	bookAppointmentText: {
		fontSize: 14,
		color: "#8146C1",
		fontWeight: "bold",
	},
	bottomNav: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 10,
		backgroundColor: "#FFFFFF",
		borderTopWidth: 1,
		borderTopColor: "#E5E5E5",
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
	},
	navItem: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	navText: {
		fontSize: 12,
		color: '#8146C1',
		marginTop: 4,
	},
	loadingContainer: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(255, 255, 255, 0.7)',
		zIndex: 1000
	},
	petsScrollContainer: {
		paddingHorizontal: 20,
		paddingVertical: 10,

	},
	petItem: {
		alignItems: 'center',
		marginRight: 15,
		marginTop: -10,
	},
	petImage: {
		width: 50,
		height: 50,
		borderRadius: 40,
		marginBottom: 5,
	},
	petName: {
		fontSize: 12,
		color: '#333',
		textAlign: 'center',
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginLeft: 20,
		color: '#808080',
		bottom: 10,
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
		zIndex: 1000,
	},
	popupContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		padding: 20,
		width: '85%',
		alignItems: 'center',
	},
	popupTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#8146C1',
		marginBottom: 15,
		textAlign: 'center',
	},
	popupText: {
		fontSize: 16,
		color: '#666',
		textAlign: 'center',
		marginBottom: 20,
		lineHeight: 22,
	},
	popupFeatures: {
		alignSelf: 'flex-start',
		marginBottom: 20,
	},
	popupFeatureItem: {
		fontSize: 16,
		color: '#666',
		marginBottom: 8,
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
		top: -50,
		marginBottom: 20,
	},
	bookAppointmentButton: {
		marginTop: 5,
	},
});

export default HomePage;
