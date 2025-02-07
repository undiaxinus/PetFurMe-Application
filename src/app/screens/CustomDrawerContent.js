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
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logActivity } from '../utils/activityLogger';

const API_BASE_URL = `http://${SERVER_IP}`;

const CustomDrawerContent = ({ navigation, state }) => {
	const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);
	const [userData, setUserData] = useState(null);
	const [activityLogs, setActivityLogs] = useState([]);
	
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
							photo: data.profile.photo
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

	const loadActivityLogs = async () => {
		try {
			const logs = await AsyncStorage.getItem('activityLogs');
			if (logs) {
				const parsedLogs = JSON.parse(logs);
				console.log('All activity logs:', parsedLogs);
				
				// Filter logs for current user
				const userLogs = parsedLogs.filter(log => 
					String(log.userId) === String(userData?.user_id)
				);
				
				console.log('Filtered user logs:', userLogs);
				setActivityLogs(userLogs);
			}
		} catch (error) {
			console.error('Error loading activity logs:', error);
		}
	};

	useEffect(() => {
		const loadUserData = async () => {
			const data = await getUserData();
			console.log("Fetched user data:", data);
			if (data) {
				setUserData(data);
				loadActivityLogs();
			}
		};
		
		loadUserData();
		const refreshInterval = setInterval(loadUserData, 10000);
		return () => clearInterval(refreshInterval);
	}, [state?.routes]);

	const handleLogout = () => {
		setIsLogoutModalVisible(true);
	};

	const confirmLogout = async () => {
		setIsLoggingOut(true);
		await logActivity('Logged out', userData?.user_id);
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

	const renderProfileSection = () => {
		// Get the actual user data
		const displayName = userData?.name || userData?.username;
		const userRole = userData?.role || "pet_owner";
		
		console.log("Rendering profile with:", {
			displayName,
			userRole,
			photo: userData?.photo
		});
		
		return (
			<View style={styles.profileSection}>
				<View style={styles.profileImageContainer}>
					<Image
						source={
							userData?.photo 
								? { uri: `${API_BASE_URL}/PetFurMe-Application/uploads/${userData.photo}` }
								: require("../../assets/images/defphoto.png")
						}
						style={styles.profileImage}
						defaultSource={require("../../assets/images/defphoto.png")}
						onError={(error) => console.error("Image loading error:", error)}
					/>
				</View>
				<View style={styles.profileTextContainer}>
					<Text style={styles.profileName}>
						{displayName}
					</Text>
					<Text style={styles.profileRole}>
						{userRole === 'pet_owner' ? 'Pet Owner' : userRole}
					</Text>
				</View>
			</View>
		);
	};

	const renderActivityLogs = () => {
		// Get only the latest activity
		const latestActivity = activityLogs[0];
		
		return (
			<View style={styles.activityLogsSection}>
				<View style={styles.activityLogsHeader}>
					<MaterialIcons name="history" size={24} color="#808080" />
					<Text style={styles.activityLogsTitle}>Recent Activity</Text>
				</View>
				
				{latestActivity ? (
					<View style={styles.activityLogsList}>
						{/* Latest Activity */}
						<View style={[styles.activityLogItem, styles.latestActivity]}>
							<Text style={[styles.activityLogText, styles.latestActivityText]}>
								{latestActivity.action}
							</Text>
							<Text style={[styles.activityLogTime, styles.latestActivityTime]}>
								{new Date(latestActivity.timestamp).toLocaleTimeString()} • 
								{latestActivity.type || 'Action'}
							</Text>
						</View>
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
					<Text style={styles.viewAllButtonText}>View All History</Text>
				</TouchableOpacity>
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

	useEffect(() => {
		console.log('Current activity logs:', activityLogs);
	}, [activityLogs]);

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
								<ActivityIndicator size="large" color="#6C63FF" />
								<Text style={styles.loadingText}>Logging out...</Text>
							</View>
						) : (
							<>
								<View style={styles.modalIconContainer}>
									<View style={styles.iconCircle}>
										<MaterialIcons name="logout" size={28} color="#6C63FF" />
									</View>
								</View>
								<Text style={styles.modalTitle}>Log Out</Text>
								<Text style={styles.modalText}>
									Are you sure you want to leave?
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
										<Text style={styles.confirmButtonText}>Log Out</Text>
									</TouchableOpacity>
								</View>
							</>
						)}
					</Animated.View>
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
		backgroundColor: "rgba(17, 24, 39, 0.6)",
		backdropFilter: "blur(5px)",
	},
	modalContent: {
		backgroundColor: "#FFFFFF",
		padding: 24,
		borderRadius: 24,
		alignItems: "center",
		width: "85%",
		maxWidth: 340,
		elevation: 8,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.15,
		shadowRadius: 12,
	},
	modalIconContainer: {
		marginBottom: 20,
		marginTop: 8,
	},
	iconCircle: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: '#F0F0FF',
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: "#111827",
		marginBottom: 8,
		textAlign: "center",
	},
	modalText: {
		fontSize: 16,
		color: "#6B7280",
		marginBottom: 24,
		textAlign: "center",
		lineHeight: 24,
	},
	modalButtons: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		gap: 12,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: "#F3F4F6",
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 12,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E5E7EB',
	},
	confirmButton: {
		flex: 1,
		backgroundColor: "#6C63FF",
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 12,
		alignItems: 'center',
	},
	cancelButtonText: {
		color: "#374151",
		fontSize: 16,
		fontWeight: "600",
	},
	confirmButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	loadingContainer: {
		alignItems: 'center',
		padding: 32,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#6B7280",
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
		marginVertical: 10,
	},
	activityLogsHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
		marginBottom: 10,
	},
	activityLogsTitle: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333333',
		marginLeft: 10,
	},
	activityLogsList: {
		paddingHorizontal: 15,
	},
	activityLogItem: {
		marginBottom: 12,
		padding: 8,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	activityLogText: {
		fontSize: 14,
		color: '#333333',
	},
	activityLogTime: {
		fontSize: 12,
		color: '#888888',
		marginTop: 2,
	},
	noActivityText: {
		fontSize: 14,
		color: '#888888',
		fontStyle: 'italic',
		textAlign: 'center',
		paddingVertical: 15,
		paddingHorizontal: 15,
	},
	viewAllButton: {
		backgroundColor: '#F0F0F0',
		padding: 10,
		borderRadius: 8,
		marginTop: 10,
		marginHorizontal: 15,
		alignItems: 'center',
	},
	viewAllButtonText: {
		color: '#8146C1',
		fontSize: 14,
		fontWeight: '500',
	},
	latestActivity: {
		backgroundColor: '#F0F0FF', // Light purple background for latest activity
		padding: 12,
		borderRadius: 8,
		borderLeftWidth: 4,
		borderLeftColor: '#8146C1',
		marginBottom: 15,
	},
	latestActivityText: {
		fontSize: 15,
		fontWeight: '600',
		color: '#333333',
	},
	latestActivityTime: {
		fontSize: 12,
		color: '#8146C1',
		marginTop: 4,
	},
	bottomContainer: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		padding: 20,
		borderTopWidth: 1,
		borderTopColor: '#F0F0F0',
		backgroundColor: '#FFFFFF',
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15,
		paddingHorizontal: 15,
		borderRadius: 8,
		backgroundColor: '#FFF0F0',
	},
	logoutText: {
		marginLeft: 15,
		fontSize: 16,
		color: '#FF4B4B',
		fontWeight: "600",
	},
});

export default CustomDrawerContent;
