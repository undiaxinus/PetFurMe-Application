import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
	Modal,
	ActivityIndicator,
	Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';

const API_BASE_URL = `http://${SERVER_IP}`;

const CustomDrawerContent = ({ navigation, state }) => {
	const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [userData, setUserData] = useState(null);
	
	const getUserData = async () => {
		if (!state?.routes) return null;
		
		for (const route of state.routes) {
			if (route.params?.user_id) {
				try {
					const response = await fetch(
						`${API_BASE_URL}/PetFurMe-Application/api/users/get_user_data.php?user_id=${route.params.user_id}&t=${Date.now()}`
					);
					
					if (!response.ok) {
						throw new Error('Failed to fetch user data');
					}
					
					const data = await response.json();
					console.log("User data response:", data);
					
					if (data.success) {
						let photoUri = null;
						
						if (data.profile.photo) {
							try {
								const cleanBase64 = data.profile.photo.replace(/[\r\n\s]/g, '');
								
								if (cleanBase64.startsWith('data:image')) {
									photoUri = cleanBase64;
								} else if (cleanBase64.match(/^[A-Za-z0-9+/=]+$/)) {
									photoUri = `data:image/jpeg;base64,${cleanBase64}`;
								} else {
									photoUri = cleanBase64.startsWith('http') 
										? cleanBase64 
										: `${API_BASE_URL}/PetFurMe-Application/${cleanBase64}`;
								}
							} catch (error) {
								console.error("Error processing photo:", error);
								photoUri = null;
							}
						}

						return {
							user_id: route.params.user_id,
							name: data.profile.name || "Guest",
							role: data.profile.role || "User",
							photo: photoUri
						};
					}
				} catch (error) {
					console.error("Error in getUserData:", error);
				}
			}
		}
		return null;
	};

	useEffect(() => {
		const loadUserData = async () => {
			const data = await getUserData();
			if (data) {
				setUserData(data);
			}
		};
		
		// Initial load
		loadUserData();
		
		// Set up auto refresh interval
		const refreshInterval = setInterval(loadUserData, 10000); // Refresh every 10 seconds
		
		// Cleanup interval on unmount
		return () => clearInterval(refreshInterval);
	}, [state?.routes]);

	const handleLogout = () => {
		setIsLogoutModalVisible(true);
	};

	const confirmLogout = () => {
		setIsLoggingOut(true);
		setTimeout(() => {
			setIsLoggingOut(false);
			setIsLogoutModalVisible(false);
			setUserData(null);
			navigation.reset({
				index: 0,
				routes: [{ name: 'LoginScreen' }],
			});
		}, 1000);
	};

	const cancelLogout = () => {
		setIsLogoutModalVisible(false);
	};

	const handleAddNewPet = () => {
		if (!userData || !userData.user_id) {
			console.error("No user ID available");
			Alert.alert(
				"Error",
				"Please login again to add a new pet",
				[
					{
						text: "OK",
						onPress: () => navigation.navigate("LoginScreen")
					}
				]
			);
			return;
		}

		navigation.navigate("AddPetName", {
			user_id: userData.user_id
		});
	};

	const renderProfileSection = () => {
		return (
			<View style={styles.profileSection}>
				<View style={styles.profileImageContainer}>
					<Image
						source={userData?.photo ? { uri: userData.photo } : require("../../assets/images/profile.png")}
						style={styles.profileImage}
						defaultSource={require("../../assets/images/profile.png")}
					/>
				</View>
				<View style={styles.profileTextContainer}>
					<Text style={styles.profileName}>
						{userData?.name || "Guest"}
					</Text>
					<Text style={styles.profileRole}>
						{userData?.role || "User"}
					</Text>
				</View>
			</View>
		);
	};

	useEffect(() => {
		if (userData) {
			console.log("userData updated:", {
				hasPhoto: !!userData.photo,
				photoType: typeof userData.photo,
				photoDetails: userData.photo
			});
		}
	}, [userData]);

	return (
		<View style={styles.container}>
			{renderProfileSection()}
			
			<View style={styles.navigationContainer}>
				{/* Home Section */}
				<TouchableOpacity 
					onPress={() => navigation.navigate('HomePage', { 
						user_id: userData?.user_id,
						refresh: Date.now()
					})} 
					style={styles.navigationItem}
				>
					<Ionicons name="home-outline" size={24} color="#808080" />
					<Text style={styles.navText}>Home</Text>
				</TouchableOpacity>

				{/* Pets Section - Always show but handle auth in onPress */}
				<TouchableOpacity 
					onPress={handleAddNewPet}
					style={styles.navigationItem}
				>
					<MaterialIcons name="pets" size={24} color="#808080" />
					<Text style={styles.navText}>Add Pet</Text>
				</TouchableOpacity>

				{/* Settings Section - Always show but handle auth in onPress */}
				<TouchableOpacity 
					onPress={() => {
						if (!userData?.user_id) {
							Alert.alert(
								"Login Required",
								"Please login to access settings",
								[
									{
										text: "OK",
										onPress: () => navigation.navigate("LoginScreen")
									}
								]
							);
							return;
						}
						navigation.navigate('ProfileVerification', { 
							user_id: userData.user_id 
						});
					}} 
					style={styles.navigationItem}
				>
					<Ionicons name="settings-outline" size={24} color="#808080" />
					<Text style={styles.navText}>Settings</Text>
				</TouchableOpacity>

				{/* Divider */}
				<View style={styles.divider} />

				{/* Login/Logout Section */}
				{userData?.user_id ? (
					<TouchableOpacity onPress={handleLogout} style={styles.navigationItem}>
						<MaterialIcons name="logout" size={24} color="#808080" />
						<Text style={styles.navText}>Logout</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity 
						onPress={() => navigation.navigate('LoginScreen')} 
						style={styles.navigationItem}
					>
						<MaterialIcons name="login" size={24} color="#808080" />
						<Text style={styles.navText}>Login</Text>
					</TouchableOpacity>
				)}
			</View>

			{/* Logout Confirmation Modal */}
			<Modal
				transparent={true}
				visible={isLogoutModalVisible}
				animationType="fade"
				onRequestClose={cancelLogout}>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						{isLoggingOut ? (
							<ActivityIndicator size="large" color="#8146C1" />
						) : (
							<>
								<Text style={styles.modalText}>
									Are you sure you want to log out?
								</Text>
								<View style={styles.modalButtons}>
									<TouchableOpacity
										style={styles.cancelButton}
										onPress={cancelLogout}>
										<Text style={styles.cancelButtonText}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.confirmButton}
										onPress={confirmLogout}>
										<Text style={styles.confirmButtonText}>Logout</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</View>
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
	profileSection: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
		top: 20,
	},
	profileImageContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#F0F0F0',
		overflow: 'hidden',
	},
	profileImage: {
		width: '100%',
		height: '100%',
	},
	profileTextContainer: {
		marginLeft: 15,
	},
	profileName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000",
	},
	profileRole: {
		fontSize: 14,
		color: "#888888",
		marginTop: 4,
	},
	navigationContainer: {
		padding: 15,
		marginTop: 10,
	},
	navigationItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15,
		paddingHorizontal: 15,
		borderRadius: 8,
		marginBottom: 5,
	},
	navText: {
		marginLeft: 15,
		fontSize: 16,
		color: "#333333",
		fontWeight: "500",
	},
	divider: {
		height: 1,
		backgroundColor: '#F0F0F0',
		marginVertical: 15,
		width: '100%',
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		backgroundColor: "#FFFFFF",
		padding: 20,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		width: "80%",
	},
	yourpets: {
		flexDirection: "row",
		top: -10,
		left: -20,
		justifyContent: "space-between",
	},
	petname: {
		flexDirection: "row",
		top: -10,
		left: -10,
		justifyContent: "space-between",
		fontWeight: "bold",
	},
	modalText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000",
		marginBottom: 20,
		textAlign: "center",
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	cancelButton: {
		backgroundColor: "#CCCCCC",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
		marginRight: 10,
	},
	cancelButtonText: {
		color: "#000000",
		fontSize: 16,
	},
	confirmButton: {
		backgroundColor: "#FF0000",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 5,
	},
	confirmButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
	},
	addNewPetButton: {
		marginTop: 10,
		marginLeft: 10,
	},
});

export default CustomDrawerContent;
