import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	ActivityIndicator,
	Alert,
	ScrollView,
	Dimensions
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import defaultPetImage from '../../assets/images/doprof.png';
import CustomHeader from '../components/CustomHeader';

const PetProfile = ({ route, navigation }) => {
	const [pet, setPet] = useState(null);
	const [loading, setLoading] = useState(true);
	const { petId, user_id: routeUserId } = route.params;
	const [userId, setUserId] = useState(routeUserId);

	useEffect(() => {
		const getUserId = async () => {
			if (userId) {
				return;
			}

			try {
				const storedUserId = await AsyncStorage.getItem('user_id');
				if (storedUserId) {
					setUserId(storedUserId);
				} else {
					console.error('No user_id found in AsyncStorage');
					Alert.alert(
						'Session Expired',
						'Please login again to continue',
						[
							{
								text: 'OK',
								onPress: () => navigation.navigate('LoginScreen')
							}
						]
					);
				}
			} catch (error) {
				console.error('Error getting user_id:', error);
				Alert.alert('Error', 'Failed to get user session');
			}
		};

		getUserId();
		fetchPetDetails();
	}, [petId, routeUserId]);

	const fetchPetDetails = async () => {
		try {
			if (!petId) {
				console.error('No pet ID provided');
				throw new Error('Pet ID is required');
			}

			const url = `http://${SERVER_IP}/PetFurMe-Application/api/pets/get_user_pets.php?user_id=${userId}`;
			console.log('Fetching from URL:', url);

			const response = await fetch(url);
			console.log('Response status:', response.status);
			
			const data = await response.json();
			console.log('Parsed pets data:', data);

			if (data.success && data.pets) {
				const petData = data.pets.find(pet => pet.id === parseInt(petId));
				console.log('Found pet data:', petData);

				if (petData) {
					setPet(petData);
					console.log('Set pet data:', petData);
				} else {
					console.error('Pet not found in user\'s pets');
					throw new Error('Pet not found');
				}
			} else {
				console.error('API error:', data.message || 'Unknown error');
				throw new Error(data.message || 'Failed to load pet details');
			}
		} catch (error) {
			console.error('Error in fetchPetDetails:', error);
			Alert.alert('Error', error.message || 'Failed to load pet details');
		} finally {
			setLoading(false);
		}
	};

	const handleEditPress = async () => {
		if (!userId) {
			Alert.alert('Error', 'Please login again');
			navigation.navigate('LoginScreen');
			return;
		}
		navigation.navigate('UpdatePetProfile', { 
			pet_id: petId,
			user_id: userId
		});
	};

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#8146C1" />
			</View>
		);
	}

	if (!pet) {
		return (
			<View style={styles.container}>
				<Text>Pet not found</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<CustomHeader
				title={pet?.name || 'Pet Profile'}
				subtitle={pet?.type || ''}
				navigation={navigation}
				showBackButton={true}
			/>

			<ScrollView style={styles.scrollView}>
				<View style={styles.profileContainer}>
					<View style={styles.imageWrapper}>
						<View style={styles.imageContainer}>
							<Image
								source={
									pet?.photo
										? { 
											uri: pet.photo,
											headers: {
												'Cache-Control': 'no-cache',
												'Pragma': 'no-cache',
												'Expires': '0',
											},
											cache: 'reload'
										}
										: defaultPetImage
								}
								style={styles.profileImage}
								onError={(error) => {
									console.error('Image loading error:', error);
									console.log('Failed photo URL:', pet?.photo);
								}}
							/>
						</View>
					</View>
				</View>

				<View style={styles.detailsContainer}>
					<View style={styles.detailsGrid}>
						<DetailCard 
							label="Age" 
							value={`${pet.age} yrs`}
							icon="calendar-outline"
						/>
						<DetailCard 
							label="Gender" 
							value={pet.gender}
							icon="gender-male-female"
						/>
						<DetailCard 
							label="Size" 
							value={pet.size}
							icon="ruler"
						/>
						<DetailCard 
							label="Weight" 
							value={`${pet.weight} kg`}
							icon="weight"
						/>
					</View>
					
					<View style={styles.breedContainer}>
						<View style={styles.breedHeader}>
							<MaterialCommunityIcons 
								name="dog" 
								size={20} 
								color="#666"
							/>
							<Text style={styles.breedLabel}>Breed</Text>
						</View>
						<Text style={styles.breedValue}>{pet.breed}</Text>
					</View>
				</View>

				<TouchableOpacity 
					style={styles.updateButton}
					onPress={handleEditPress}
				>
					<MaterialCommunityIcons 
						name="pencil" 
						size={20} 
						color="#FFF" 
						style={styles.buttonIcon}
					/>
					<Text style={styles.updateButtonText}>Edit Profile</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
};

const DetailCard = ({ label, value, icon }) => (
	<View style={styles.detailCard}>
		<View style={styles.cardHeader}>
			<MaterialCommunityIcons 
				name={icon} 
				size={20} 
				color="#666"
			/>
			<Text style={styles.cardLabel}>{label}</Text>
		</View>
		<Text style={styles.cardValue}>{value}</Text>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	scrollView: {
		flex: 1,
	},
	profileContainer: {
		alignItems: 'center',
		paddingVertical: 20,
	},
	imageWrapper: {
		width: '100%',
		height: 220,
		alignItems: 'center',
		justifyContent: 'center',
	},
	imageContainer: {
		width: 180,
		height: 180,
		borderRadius: 90,
		overflow: 'hidden',
		backgroundColor: '#F5F5F5',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},
	profileImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	detailsContainer: {
		padding: 20,
	},
	detailsGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginBottom: 24,
	},
	detailCard: {
		width: '48%',
		backgroundColor: '#F8F8F8',
		padding: 16,
		borderRadius: 12,
		marginBottom: 16,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	cardLabel: {
		fontSize: 14,
		color: '#666',
		marginLeft: 6,
	},
	cardValue: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	breedContainer: {
		backgroundColor: '#F8F8F8',
		padding: 16,
		borderRadius: 12,
		marginBottom: 24,
	},
	breedHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 8,
	},
	breedLabel: {
		fontSize: 14,
		color: '#666',
		marginLeft: 6,
	},
	breedValue: {
		fontSize: 16,
		fontWeight: '600',
		color: '#333',
	},
	updateButton: {
		backgroundColor: '#8146C1',
		margin: 20,
		padding: 16,
		borderRadius: 12,
		alignItems: 'center',
		flexDirection: 'row',
		justifyContent: 'center',
	},
	buttonIcon: {
		marginRight: 8,
	},
	updateButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '600',
	},
});

export default PetProfile;
