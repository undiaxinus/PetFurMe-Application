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
		if (!state?.routes) return {};
		
		const homeRoute = state.routes.find(route => route.name === "HomePage");
		if (!homeRoute?.params) {
			console.log("No params in HomePage route");
			return {};
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
		const userId = userData.user_id;
		console.log("Attempting to add new pet with user ID:", userId);
		
		if (userId) {
			navigation.navigate("AddPetName", {
				user_id: userId
			});
		} else {
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
		}
	};

	const renderProfileSection = () => (
		<View style={styles.profileSection} onclick >
			<Image 
				source={require("../../assets/images/profile.png")}
				style={styles.profileImage}
			/>
			<Text style={styles.profileName}>{userData.userName || "Guest"}</Text>
			<Text style={styles.profileRole}>{userData.userRole || "User"}</Text>
		</View>
	);

	return (
		<View style={styles.container}>
			{renderProfileSection()}
			{/* Logout Section */}
			<TouchableOpacity onPress={handleLogout}>
				<View style={styles.logoutSection}>
					<MaterialIcons name="logout" size={24} color="#808080" />
					<Text style={styles.navText}>Logout</Text>
				</View>
			</TouchableOpacity>

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
		padding: 40,
		backgroundColor: "#FFFFFF",
	},
	profileSection: {
		alignItems: "flex-start",
		marginBottom: 50,
		marginTop: 20,
		left: -20,
	},
	profileImage: {
		width: 70,
		height: 70,
		borderRadius: 35,
		marginBottom: 10,
	},
	profileName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000000",
	},
	profileRole: {
		fontSize: 14,
		color: "#888888",
	},
	logoutSection: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 30,
		left: -15,
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
