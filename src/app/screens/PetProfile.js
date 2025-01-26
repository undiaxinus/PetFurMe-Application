import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	FlatList,
	ActivityIndicator,
	Alert,
	ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import defaultPetImage from '../../assets/images/doprof.png';

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
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Text style={styles.backButton}>← Back</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Pet Profile</Text>
			</View>

			<View style={styles.profileContainer}>
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
				<Text style={styles.petName}>{pet.name}</Text>
			</View>

			<View style={styles.detailsContainer}>
				<DetailItem label="Category" value={pet.type} />
				<DetailItem label="Age" value={`${pet.age} yrs old`} />
				<DetailItem label="Gender" value={pet.gender} />
				<DetailItem label="Breed" value={pet.breed} />
				<DetailItem label="Size" value={pet.size} />
				<DetailItem label="Weight" value={`${pet.weight} kg`} />
			</View>

			<TouchableOpacity 
				style={styles.updateButton}
				onPress={handleEditPress}
			>
				<Text style={styles.updateButtonText}>Update Pet's Profile</Text>
			</TouchableOpacity>
		</ScrollView>
	);
};

const DetailItem = ({ label, value }) => (
	<View style={styles.detailItem}>
		<Text style={styles.label}>{label}</Text>
		<Text style={styles.value}>{value}</Text>
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
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 20,
		paddingTop: 40,
		backgroundColor: '#8146C1',
	},
	backButton: {
		color: '#FFFFFF',
		fontSize: 16,
		marginRight: 20,
	},
	title: {
		color: '#FFFFFF',
		fontSize: 20,
		fontWeight: 'bold',
		left: 40,
	},
	profileContainer: {
		alignItems: 'center',
		padding: 20,
	},
	imageContainer: {
		width: 150,
		height: 150,
		borderRadius: 75,
		overflow: 'hidden',
		marginBottom: 20,
		backgroundColor: '#F0F0F0',
		alignSelf: 'center',
	},
	profileImage: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
	petName: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#8146C1',
		marginTop: 10,
	},
	detailsContainer: {
		padding: 20,
	},
	detailItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#EEEEEE',
	},
	label: {
		fontSize: 16,
		color: '#666666',
	},
	value: {
		fontSize: 16,
		color: '#333333',
		fontWeight: '500',
	},
	updateButton: {
		backgroundColor: '#8146C1',
		margin: 20,
		padding: 15,
		borderRadius: 25,
		alignItems: 'center',
	},
	updateButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: 'bold',
	},
});

export default PetProfile;
