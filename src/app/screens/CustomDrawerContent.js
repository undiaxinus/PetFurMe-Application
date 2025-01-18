import React, { useState } from "react";
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

const CustomDrawerContent = ({ navigation, state }) => {
	const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	const getUserData = () => {
		if (!state?.routes) return null;
		
		const homeRoute = state.routes.find(route => route.name === "HomePage");
		if (!homeRoute?.params) {
			console.log("No params in HomePage route");
			return null;
		}
		
		console.log("Found user data in route:", homeRoute.params);
		return homeRoute.params;
	};

	const userData = getUserData();
	console.log("Drawer user data:", userData);

	const handleLogout = () => {
		setIsLogoutModalVisible(true);
	};

	const confirmLogout = () => {
		setIsLoggingOut(true); // Show the spinner
		setTimeout(() => {
			setIsLoggingOut(false); // Hide the spinner
			setIsLogoutModalVisible(false);
			navigation.navigate("HomeScreen"); // Navigate after logout
		}, 2000); // Simulate a delay for the logout process
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

	const renderProfileSection = () => (
		<View style={styles.profileSection} onclick >
			<Image 
				source={require("../../assets/images/profile.png")}
				style={styles.profileImage}
			/>
			<View style={styles.profileTextContainer}>
				<Text style={styles.profileName}>{userData.userName || "Guest"}</Text>
				<Text style={styles.profileRole}>{userData.userRole || "User"}</Text>
			</View>
		</View>
	);

	return (
		<View style={styles.container}>
			{renderProfileSection()}
			
			{/* Navigation Items */}
			<View style={styles.navigationContainer}>
				{/* Home Section */}
				<TouchableOpacity 
					onPress={() => navigation.navigate('HomePage')} 
					style={styles.navigationItem}
				>
					<Ionicons name="home-outline" size={24} color="#808080" />
					<Text style={styles.navText}>Home</Text>
				</TouchableOpacity>

				{/* Pets Section */}
				<TouchableOpacity 
					onPress={handleAddNewPet} 
					style={styles.navigationItem}
				>
					<MaterialIcons name="pets" size={24} color="#808080" />
					<Text style={styles.navText}>Add Pet</Text>
				</TouchableOpacity>

				{/* Settings Section */}
				<TouchableOpacity 
					onPress={() => {
						if (!userData || !userData.user_id) {
							Alert.alert(
								"Error",
								"Please login again to access settings",
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

				{/* Logout Section */}
				<TouchableOpacity onPress={handleLogout} style={styles.navigationItem}>
					<MaterialIcons name="logout" size={24} color="#808080" />
					<Text style={styles.navText}>Logout</Text>
				</TouchableOpacity>
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
	},
	profileImage: {
		width: 60,
		height: 60,
		borderRadius: 30,
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
