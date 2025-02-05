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
	const [userPhoto, setUserPhoto] = useState(null);

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

	const fetchUserPets = async () => {
		// Don't set loading state for auto refresh to avoid UI flicker
		const isAutoRefresh = isLoading === false;
		if (!isAutoRefresh) {
			setIsLoading(true);
		}
		
		try {
			// Fix the URL to use the correct endpoint
			const url = `${API_BASE_URL}/PetFurMe-Application/api/pets/get_user_pets.php?user_id=${user_id}`;
			console.log("Attempting to fetch from:", url);
			
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			});
			
			// Add debug logging
			console.log("Response status:", response.status);
			const data = await response.json();
			console.log("Raw response data:", data);
			
			if (data.success) {
				const loggablePets = data.pets.map(pet => {
					console.log(`Processing pet ${pet.name} with photo URL:`, pet.photo);
					return {
						...pet,
						photo: pet.photo ? pet.photo : null
					};
				});
				console.log("Active pets found:", loggablePets);
				setUserPets(loggablePets);
			} else {
				throw new Error(data.message || 'Failed to load pets data');
			}
		} catch (error) {
			console.error("Error fetching pets:", error);
			Alert.alert("Error", "Unable to load pets. Please try again.");
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
			
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				}
			});
			
			const data = await response.json();
			console.log("Profile data:", data);
			
			if (data.success) {
				setIsProfileComplete(data.isProfileComplete);
				setShowWelcomePopup(!data.isProfileComplete);
				
				// Update user name and photo
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
			setIsProfileComplete(false);
			setShowWelcomePopup(true);
			// Set defaults if there's an error
			setUserName('Guest');
			setUserPhoto(null);
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
				fetchUserPets();
			}
		});
	};

	const handleMaybeLater = () => {
		setShowWelcomePopup(false);
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
						Hey {userName}! Your pet's happiness starts here!
					</Text>
				</View>
				
				<TouchableOpacity 
					style={styles.profilePhotoContainer}
					onPress={() => navigation.navigate('ProfileVerification', { user_id: user_id })}
				>
					<Image
						source={userPhoto ? { uri: userPhoto } : require("../../assets/images/doprof.png")}
						style={styles.profilePhoto}
					/>
				</TouchableOpacity>
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
								{ backgroundColor: category.backgroundColor },
							]}
							onPress={() =>
								navigation.navigate(category.screen, { 
									reason: category.label,
									user_id: user_id
								})
							}
						>
							<View style={styles.categoryContent}>
								<Image 
									source={category.image} 
									style={styles.categoryImage} 
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
													'Cache-Control': 'no-cache'
												}
											}
											: require("../../assets/images/doprof.png")
									}
									style={styles.petImage}
									defaultSource={require("../../assets/images/doprof.png")}
									resizeMode="contain"
									onError={(e) => {
										console.log('Image loading error:', e.nativeEvent.error);
										setImageLoadErrors(prev => ({...prev, [pet.id]: true}));
									}}
								/>
								<Text style={styles.petName}>{pet.name}</Text>
							</TouchableOpacity>
							))}
							<TouchableOpacity onPress={handleAddNewPet} style={styles.petItem}>
								<Image
									source={require("../../assets/images/addnew.png")}
									style={styles.petImage}
								/>
								<Text style={styles.petName}>Add New</Text>
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
					style={styles.vet}
				/>
					<Text style={styles.vets}>Vets</Text>
					{vets.map((vet) => (
						<View key={vet.id} style={styles.vetCard}>
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
									onPress={() =>
										navigation.navigate("Consultation", { user_id: user_id })
									}>
									<Text style={styles.bookAppointmentText}>
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
					onPress={() => navigation.navigate('Help')}
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
		height: 100,
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
		marginBottom: 12,
		marginTop: -15,
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
		top: -50,
		marginBottom: 20,
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
});

export default HomePage;
