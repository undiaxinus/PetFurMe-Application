import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Image,
	Modal,
	ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

const CustomDrawerContent = ({ navigation }) => {
	const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

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

	return (
		<View style={styles.container}>
			{/* Profile Section */}
			<View style={styles.profileSection}>
				<Image
					source={require("../../assets/images/ekis.png")}
					style={styles.ekis}
				/>

				<Image
					source={require("../../assets/images/profile.png")}
					style={styles.profileImage}
				/>
				<Text style={styles.profileName}>Angelica V.</Text>
				<Text style={styles.profileRole}>User</Text>
				<Text style={styles.urpets}>Your Pets</Text>
			</View>

			<View style={styles.yourpets}>
				<TouchableOpacity onPress={() => navigation.navigate("HomePage")}>
					<Image
						source={require("../../assets/images/rigor.png")}
						style={styles.profileImage}
					/>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => navigation.navigate("HomePage")}>
					<Image
						source={require("../../assets/images/lena.png")}
						style={styles.profileImage}
					/>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => navigation.navigate("AddPetName")}>
					<Image
						source={require("../../assets/images/addnew.png")}
						style={styles.profileImage}
					/>
				</TouchableOpacity>
			</View>

			<View style={styles.petname}>
				<Text style={styles.rigor}>Rigor</Text>
				<Text style={styles.lena}>Lena</Text>
				<Text style={styles.more}>Add New</Text>
			</View>

			{/* Navigation Links */}
			<View style={styles.navSection}>
				<TouchableOpacity onPress={() => navigation.navigate("HomePage")}>
					<View style={styles.navItem}>
						<Ionicons name="home" size={24} color="#808080" />
						<Text style={styles.navText}>Home</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => navigation.navigate("Reminders")}>
					<View style={styles.navItem}>
						<MaterialIcons name="alarm" size={24} color="#808080" />
						<Text style={styles.navText}>Reminder</Text>
					</View>
				</TouchableOpacity>

				<TouchableOpacity onPress={() => navigation.navigate("Help")}>
					<View style={styles.navItem}>
						<MaterialIcons name="help-outline" size={24} color="#808080" />
						<Text style={styles.navText}>Help</Text>
					</View>
				</TouchableOpacity>
			</View>

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
	navSection: {
		flex: 1,
		marginTop: 20,
	},
	navItem: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 30,
		left: -20,
	},
	navText: {
		marginLeft: 15,
		fontSize: 16,
		color: "#000000",
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
	ekis: {
		left: 250,
	},
	yourpets: {
		flexDirection: "row",
		top: -10,
		left: -20,
		justifyContent: "space-between",
	},
	urpets: {
		top: 30,
		fontSize: 18,
		color: "#808080",
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
});

export default CustomDrawerContent;
