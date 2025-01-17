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
const API_BASE_URL = 'http://192.168.1.5';

const HomePage = ({ navigation, route }) => {
	const user_id = route.params?.user_id;
	const refresh = route.params?.refresh;
	const [userPets, setUserPets] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [imageLoadErrors, setImageLoadErrors] = useState({});
	const [showWelcomePopup, setShowWelcomePopup] = useState(false);
	const [isProfileComplete, setIsProfileComplete] = useState(false);

	console.log("HomePage user_id:", user_id);

	useEffect(() => {
		if (user_id) {
			console.log("Fetching pets...", { user_id, refresh });
			fetchUserPets();
		}
	}, [user_id, refresh]);

	useEffect(() => {
		console.log("Updated userPets:", userPets);
	}, [userPets]);

	useEffect(() => {
		checkProfileStatus();
	}, [user_id]);

	const fetchUserPets = async () => {
		setIsLoading(true);
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
				console.log("Pets data received:", data.data?.pets);
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
			setIsLoading(false);
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
			} else {
				console.error("Profile check failed:", data.message);
				setIsProfileComplete(false);
				setShowWelcomePopup(true);
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
		}
	};

	const handleSetUpNow = () => {
		setShowWelcomePopup(false);
		navigation.navigate('ProfileVerification', { 
			user_id: user_id,
			onComplete: () => {
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

	const petProducts = [
		{
			id: "1",
			name: "Pedigree Adult",
			weight: "3kg",
			image: require("../../assets/images/pedigree.png"),
			type: "Dog",
		},
		{
			id: "2",
			name: "Meow Mix",
			weight: "726g",
			image: require("../../assets/images/meowmix.png"),
			type: "Cat",
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

	const handleAddNewPet = () => {
		if (!user_id) {
			Alert.alert("Error", "User ID is missing. Please try logging in again.");
			navigation.navigate("LoginScreen");
			return;
		}
		navigation.navigate("AddPetName", { user_id: user_id });
	};

	return (
		<View style={styles.container}>
			{showWelcomePopup && (
				<View style={styles.popupOverlay}>
					<View style={styles.popupContainer}>
						<Text style={styles.popupTitle}>Welcome to Pet Fur Me!</Text>
						<Text style={styles.popupText}>
							Hi Angelica, we're so excited to have you here. To make the most of your
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
			{/* Main Scrollable Content */}
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Header Section */}
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation.openDrawer()}>
						<Image
							source={require("../../assets/images/burger.png")}
							style={styles.burger}
						/>
					</TouchableOpacity>

					<View style={styles.headerTextContainer}>
						<Text style={styles.greetingText}>Hey Angge,</Text>
						<Text style={styles.questionText}>What are you looking for?</Text>
					</View>
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
							<Image source={category.image} style={styles.categoryImage} />
							<Text style={styles.categoryLabel}>{category.label}</Text>
						</TouchableOpacity>
					))}
				</View>

				{/* Pets Section */}
				{isLoading ? (
					<ActivityIndicator size="large" color="#8146C1" />
				) : (
					<View>
						<Text style={styles.sectionTitle}>My Pets</Text>
						<ScrollView 
							horizontal 
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={styles.petsScrollContainer}
						>
							{userPets.map((pet) => (
								<TouchableOpacity key={pet.id} style={styles.petItem}>
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
							<Text style={styles.sectionTitle}>Pet Products</Text>
						</View>
						<TouchableOpacity onPress={() => navigation.navigate("ViewMorePro")}>
							<Text style={styles.viewmore}>View More</Text>
						</TouchableOpacity>
					</View>

					{petProducts.map((item) => (
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
					))}
				</View>

				{/* Vets Section */}
				<View style={styles.sectionContainer}>
					<Text style={styles.sectionTitle}>Vets</Text>
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
										navigation.navigate("BookAppointment", { vetId: vet.id })
									}>
									<Text style={styles.bookAppointmentText}>
										Book Appointment →
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					))}
				</View>
			</ScrollView>

			{/* Bottom Navigation */}
			<View style={styles.bottomNav}>
				<TouchableOpacity>
					<Image
						source={require("../../assets/images/homee.png")}
						style={styles.navIcon}
					/>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => navigation.navigate('ChatScreen')}>
					<Image
						source={require("../../assets/images/message.png")}
						style={styles.navIcon}
					/>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')}>
  <Image
    source={require("../../assets/images/notif.png")}
    style={styles.navIcon}
  />
			</TouchableOpacity>


			<TouchableOpacity onPress={() => navigation.navigate('Help')}>
  <Image
    source={require("../../assets/images/circle.png")}
    style={styles.navIcon}
  />
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
	scrollContent: {
		paddingBottom: 100, // Space for bottom navigation
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#8146C1",
		width: "100%",
		paddingHorizontal: 20,
		top: 32,
	},
	burger: {
		width: 25,
		height: 25,
		resizeMode: "contain",
	},
	headerTextContainer: {
		flex: 1,
		marginLeft: 10,
	},
	greetingText: {
		fontSize: 18,
		color: "#9134A9",
		fontWeight: "bold",
		top: 50,
		left: -40,
	},
	questionText: {
		fontSize: 14,
		color: "#141415",
		fontWeight: "bold",
		top: 60,
		left: 0,
	},
	categoriesContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginVertical: 65,
		paddingHorizontal: 10,
		top: 40,
	},
	categoryItem: {
		alignItems: "center",
		borderRadius: 10,
		width: 80, // Increased size
		height: 90, // Increased size
	},
	categoryImage: {
		width: 60, // Adjusted size
		height: 60, // Adjusted size
		marginBottom: 9,
		top: 5,
	},
	categoryLabel: {
		fontSize: 12, // Adjusted font size
		color: "#FFFFFF",
		textAlign: "center",
		fontWeight: "bold",
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
		marginBottom: 20,
		marginTop: -10,
		elevation: 3,
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
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#8146C1",
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
	},
	vetCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		padding: 15,
		marginBottom: 10,
		elevation: 2,
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
		paddingVertical: 15,
		backgroundColor: "#8146C1",
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
		marginRight: 15, // Space between pets
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
		marginBottom: 10,
		color: '#333',
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
});

export default HomePage;
