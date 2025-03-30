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
	Animated,
	Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logActivity } from '../utils/activityLogger';
import axios from 'axios';

const API_BASE_URL = `http://${SERVER_IP}`;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CustomDrawerContent = ({ navigation, state }) => {
	const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [userData, setUserData] = useState(null);
	const [activityLogs, setActivityLogs] = useState([]);
	const [profileImage, setProfileImage] = useState(null);
	
	const getUserData = async () => {
		if (!state?.routes) return null;
		
		for (const route of state.routes) {
			if (route.params?.user_id) {
				try {
					console.log("Fetching data for user_id:", route.params.user_id);
					
					const response = await fetch(
						`${API_BASE_URL}/PetFurMe-Application/api/users/get_user_data.php?user_id=${route.params.user_id}&t=${Date.now()}`
					);
					
					if (!response.ok) {
						throw new Error('Failed to fetch user data');
					}
					
					const data = await response.json();
					console.log("Raw API Response:", data);
					
					if (data.success) {
						const userData = {
							user_id: route.params.user_id,
							name: data.profile.name,
							username: data.profile.username,
							role: data.profile.role,
							photo: data.profile.photo,
							phone: data.profile.phone
						};
						
						console.log("Processed user data:", userData);
						return userData;
					}
				} catch (error) {
					console.error("Error in getUserData:", error);
				}
			}
		}
		return null;
	};

	const fetchUserPhoto = async (userId) => {
		if (!userId) return;
		
		try {
			const photoUrl = `${API_BASE_URL}/PetFurMe-Application/api/users/get_user_photo.php?user_id=${userId}`;
			
			const photoResponse = await axios.get(photoUrl);
			
			if (photoResponse.data.success) {
				if (photoResponse.data.source === 'photo_data') {
					// Handle binary data returned as base64
					const base64Data = photoResponse.data.photo;
					
					setProfileImage({
						uri: `data:image/jpeg;base64,${base64Data}`
					});
				} else if (photoResponse.data.photo_path) {
					// Handle traditional file path
					const filePhotoUrl = `${API_BASE_URL}/PetFurMe-Application/uploads/${photoResponse.data.photo_path}`;
					
					setProfileImage({
						uri: filePhotoUrl
					});
				} else {
					setProfileImage(null);
				}
			} else {
				console.log("No photo found for user in drawer");
				setProfileImage(null);
			}
		} catch (error) {
			console.error("Error fetching user photo in drawer:", error);
			setProfileImage(null);
		}
	};

	const loadActivityLogs = async () => {
		if (!userData?.user_id) return; // Don't load if no user

		try {
			const logs = await AsyncStorage.getItem('activityLogs');
			if (logs) {
				const parsedLogs = JSON.parse(logs);
				const userLogs = parsedLogs
					.filter(log => String(log.userId) === String(userData.user_id))
					.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
					.slice(0, 3);
				
				// Only update state if the logs are different
				if (JSON.stringify(userLogs) !== JSON.stringify(activityLogs)) {
					setActivityLogs(userLogs);
				}
			}
		} catch (error) {
			console.error('Error loading activity logs:', error);
		}
	};

	useEffect(() => {
		let isActive = true; // For handling component unmount
		
		const loadUserData = async () => {
			try {
				const data = await getUserData();
				if (data && isActive) {
					setUserData(data);
					fetchUserPhoto(data.user_id);
				}
			} catch (error) {
				console.error('Error loading user data:', error);
			}
		};
		
		loadUserData();
		
		// Set up periodic refresh
		const userRefreshInterval = setInterval(loadUserData, 30000); // Every 30 seconds
		const logsRefreshInterval = setInterval(loadActivityLogs, 5000);  // Every 5 seconds
		
		return () => {
			isActive = false;
			clearInterval(userRefreshInterval);
			clearInterval(logsRefreshInterval);
		};
	}, [state?.routes]);

	const handleLogout = async () => {
		setIsLogoutModalVisible(true);
	};

	const confirmLogout = async () => {
		setIsLoggingOut(true);
		try {
			// Log the activity
			await logActivity('Logged out', userData?.user_id);
			
			// Update local activity logs immediately
			const newActivity = {
				action: 'Logged out',
				timestamp: new Date().toISOString(),
				userId: userData?.user_id,
				type: 'Logout'
			};
			
			setActivityLogs(prevLogs => [newActivity, ...prevLogs].slice(0, 3));
			
			// Proceed with logout
			setTimeout(() => {
				setIsLoggingOut(false);
				setIsLogoutModalVisible(false);
				setUserData(null);
				setActivityLogs([]); // Clear logs on logout
				navigation.reset({
					index: 0,
					routes: [{ name: 'LoginScreen' }],
				});
			}, 1000);
		} catch (error) {
			console.error('Error during logout:', error);
			setIsLoggingOut(false);
		}
	};

	const cancelLogout = () => {
		setIsLogoutModalVisible(false);
	};

	const renderProfileSection = () => {
		const displayName = userData?.name || userData?.username;
		const userRole = userData?.role || "pet_owner";
		const userPhone = userData?.phone || "No phone number";
		
		return (
			<View style={styles.profileGradient}>
				<View style={styles.profileSection}>
					<View style={styles.profileImageContainer}>
						{profileImage ? (
							<Image 
								source={profileImage}
								style={styles.profileImage}
								onError={() => setProfileImage(null)}
							/>
						) : (
							<Image 
								source={{ uri: `${API_BASE_URL}/PetFurMe-Application/uploads/defaults/avatar.png` }}
								style={styles.profileImage}
							/>
						)}
					</View>
					
					<View style={styles.profileInfoContainer}>
						<Text style={styles.profileName} numberOfLines={1}>
							{displayName || "Guest User"}
						</Text>
						<Text style={styles.profileRole}>
							{userRole === "pet_owner" ? "Pet Owner" : 
								userRole === "store_owner" ? "Store Owner" : 
								userRole === "veterinarian" ? "Veterinarian" : 
								userRole === "admin" ? "Administrator" : 
								"Guest"}
						</Text>
						
						{userData?.phone && (
							<View style={styles.phoneContainer}>
								<Ionicons name="call-outline" size={12} color="#FFFFFF" style={{marginRight: 5}} />
								<Text style={styles.profilePhone} numberOfLines={1}>
									{userPhone}
								</Text>
							</View>
						)}
					</View>
				</View>
			</View>
		);
	};

	const renderActivityLogs = () => {
		return (
			<View style={styles.activityLogsSection}>
				<Text style={styles.activityLogsTitle}>Recent Activity</Text>
				
				{activityLogs.length > 0 ? (
					<View style={styles.activityLogsList}>
						{activityLogs.map((activity, index) => (
							<View key={activity.timestamp} style={styles.activityLogItem}>
								<View style={styles.activityLogContent}>
									<Text style={styles.activityLogText}>
										{activity.action}
									</Text>
									<Text style={styles.activityLogTime}>
										{new Date(activity.timestamp).toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit'
										})} • 
										{activity.type || 'Action'}
									</Text>
								</View>
								{index < activityLogs.length - 1 && <View style={styles.activityDivider} />}
							</View>
						))}
					</View>
				) : (
					<Text style={styles.noActivityText}>No recent activity</Text>
				)}
				
				<TouchableOpacity 
					style={styles.viewAllButton}
					onPress={() => {
						navigation.navigate('ActivityHistory', {
							user_id: userData?.user_id
						});
						navigation.closeDrawer();
					}}
				>
					<MaterialIcons name="history" size={16} color="#8146C1" />
					<Text style={styles.viewAllButtonText}>View All History</Text>
				</TouchableOpacity>
			</View>
		);
	};

	useEffect(() => {
		if (userData?.user_id) {
			loadActivityLogs();
		}
	}, [userData?.user_id]); // Only reload when user_id changes

	const appVersion = "1.0.0"; // You can manage this version number as needed

	return (
		<View style={styles.container}>
			{renderProfileSection()}
			
			<View style={styles.navigationContainer}>
				{renderActivityLogs()}
				
				<View style={styles.divider} />
			</View>

			{/* Login/Logout Section moved to bottom */}
			<View style={styles.bottomContainer}>
				{userData?.user_id ? (
					<TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
						<MaterialIcons name="logout" size={24} color="#FF4B4B" />
						<Text style={styles.logoutText}>Logout</Text>
					</TouchableOpacity>
				) : (
					<TouchableOpacity 
						onPress={() => navigation.navigate('LoginScreen')} 
						style={styles.logoutButton}
					>
						<MaterialIcons name="login" size={24} color="#8146C1" />
						<Text style={[styles.logoutText, { color: '#8146C1' }]}>Login</Text>
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
					<Animated.View style={[styles.modalContent]}>
						{isLoggingOut ? (
							<View style={styles.loadingContainer}>
								<ActivityIndicator size="large" color="#8146C1" />
								<Text style={styles.loadingText}>Logging out...</Text>
							</View>
						) : (
							<>
								<View style={styles.modalIconContainer}>
									<View style={styles.iconCircle}>
										<MaterialIcons name="logout" size={28} color="#8146C1" />
									</View>
								</View>
								<Text style={styles.modalTitle}>Logout</Text>
								<Text style={styles.modalText}>
									Are you sure you want to leave?
								</Text>
								<View style={styles.modalButtons}>
									<TouchableOpacity
										style={[styles.modalButton, styles.cancelButton]}
										onPress={cancelLogout}>
										<Text style={styles.cancelButtonText}>Cancel</Text>
									</TouchableOpacity>
									<TouchableOpacity
										style={[styles.modalButton, styles.confirmButton]}
										onPress={confirmLogout}>
										<Text style={styles.confirmButtonText}>Logout</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</Animated.View>
				</View>
			</Modal>

			<View style={styles.versionContainer}>
				<Text style={styles.versionText}>Version {appVersion}</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	profileGradient: {
		backgroundColor: '#8146C1',
		paddingTop: 40,
		paddingBottom: 20,
		borderBottomLeftRadius: 0,
		borderBottomRightRadius: 0,
	},
	profileSection: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 20,
		paddingTop: 10,
	},
	profileImageContainer: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#F0F0F0',
		overflow: 'hidden',
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	profileImage: {
		width: '100%',
		height: '100%',
	},
	profileInfoContainer: {
		flex: 1,
		marginLeft: 15,
	},
	profileName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#FFFFFF",
	},
	profileRole: {
		fontSize: 14,
		color: "#F0F0F0",
		marginTop: 2,
	},
	navigationContainer: {
		padding: 15,
		marginTop: 0,
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
		padding: 24,
		borderRadius: 16,
		alignItems: "center",
		width: "85%",
		maxWidth: 340,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	modalIconContainer: {
		marginBottom: 16,
	},
	iconCircle: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: '#F8F7FF',
		justifyContent: 'center',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#333333",
		marginBottom: 8,
		textAlign: "center",
	},
	modalText: {
		fontSize: 15,
		color: "#666666",
		marginBottom: 24,
		textAlign: "center",
		lineHeight: 22,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		gap: 12,
	},
	modalButton: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: 'center',
		justifyContent: 'center',
	},
	cancelButton: {
		backgroundColor: "#F8F7FF",
		borderWidth: 1,
		borderColor: '#8146C1',
	},
	confirmButton: {
		backgroundColor: "#8146C1",
	},
	cancelButtonText: {
		color: "#8146C1",
		fontSize: 15,
		fontWeight: "600",
	},
	confirmButtonText: {
		color: "#FFFFFF",
		fontSize: 15,
		fontWeight: "600",
	},
	loadingContainer: {
		alignItems: 'center',
		padding: 24,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 15,
		color: "#666666",
		fontWeight: "500",
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
	activityLogsSection: {
		marginVertical: 0,
		marginHorizontal: 15,
		backgroundColor: '#FFFFFF',
	},
	activityLogsTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333333',
		marginBottom: 15,
	},
	activityLogsList: {
		marginTop: 5,
	},
	activityLogItem: {
		marginBottom: 12,
	},
	activityLogContent: {
		paddingVertical: 8,
	},
	activityLogText: {
		fontSize: 14,
		color: '#333333',
		fontWeight: '500',
	},
	activityLogTime: {
		fontSize: 12,
		color: '#888888',
		marginTop: 4,
	},
	activityDivider: {
		height: 1,
		backgroundColor: '#F0F0F0',
		marginTop: 8,
	},
	noActivityText: {
		fontSize: 14,
		color: '#888888',
		fontStyle: 'italic',
		textAlign: 'center',
		paddingVertical: 15,
	},
	viewAllButton: {
		backgroundColor: '#F8F7FF',
		padding: 12,
		borderRadius: 12,
		marginTop: 15,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#8146C1',
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
	},
	viewAllButtonText: {
		color: '#8146C1',
		fontSize: 14,
		fontWeight: '500',
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 20,
		paddingBottom: 30,
		borderTopWidth: 1,
		borderTopColor: '#F0F0F0',
		backgroundColor: '#FFFFFF',
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -3,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15,
		paddingHorizontal: 15,
		borderRadius: 12,
		backgroundColor: '#FFF0F0',
		borderWidth: 1,
		borderColor: '#FFE5E5',
	},
	logoutText: {
		marginLeft: 15,
		fontSize: 16,
		color: '#FF4B4B',
		fontWeight: "600",
	},
	versionContainer: {
		position: 'absolute',
		bottom: 100,
		width: '100%',
		alignItems: 'center',
		backgroundColor: '#F8F7FF',
		paddingVertical: 8,
	},
	versionText: {
		fontSize: 12,
		color: '#8146C1',
		fontWeight: '500',
	},
	phoneContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 6,
		backgroundColor: 'rgba(255,255,255,0.15)',
		paddingHorizontal: 8,
		paddingVertical: 3,
		borderRadius: 12,
		alignSelf: 'flex-start',
	},
	profilePhone: {
		fontSize: 13,
		color: '#FFFFFF',
	},
});

export default CustomDrawerContent;
