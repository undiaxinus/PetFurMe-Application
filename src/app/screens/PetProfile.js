import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	FlatList,
	ActivityIndicator,
	Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';


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
			const response = await fetch(
				`http://${SERVER_IP}/PetFurMe-Application/api/pets/get_pet_details.php?pet_id=${petId}`
			);
			
			if (!response.ok) {
				throw new Error('Failed to fetch pet details');
			}

			const data = await response.json();
			console.log('Pet details response:', data);

			if (data.success && data.pet) {
				setPet(data.pet);
			} else {
				throw new Error(data.message || 'Failed to load pet details');
			}
		} catch (error) {
			Alert.alert('Error', 'Failed to load pet details');
			console.error('Error fetching pet details:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleEditPress = () => {
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
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Text style={styles.backButton}>← Back</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Pet Profile</Text>
			</View>

			<View style={styles.profileContainer}>
				<Image
					source={
						pet.photo
							? { uri: pet.photo }
							: require('../../assets/images/lena.png')
					}
					style={styles.profileImage}
				/>
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
		</View>
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
	profileImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
		marginBottom: 10,
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
