import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	TextInput,
	ActivityIndicator,
	Alert,
	ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomDropdown from '../components/CustomDropdown';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import Toast, { BaseToast } from 'react-native-toast-message';

const PET_TYPES = [
	"Dog",
	"Cat",
	"Bird",
	"Rabbit",
	"Other"
];

const PET_SIZES = [
	"Small",
	"Medium",
	"Large",
	"Extra Large"
];

const PET_GENDERS = [
	"Male",
	"Female"
];

const AddPetProfile = ({ navigation, route }) => {
	const [petName, setPetName] = useState("");
	const [petAge, setPetAge] = useState("");
	const [petType, setPetType] = useState("");
	const [petBreed, setPetBreed] = useState("");
	const [petSize, setPetSize] = useState("");
	const [petWeight, setPetWeight] = useState("");
	const [petAllergies, setPetAllergies] = useState("");
	const [petNotes, setPetNotes] = useState("");
	const [petGender, setPetGender] = useState("");
	const [loading, setLoading] = useState(false);
	const [photo, setPhoto] = useState(null);

	// Get user_id from route params
	const user_id = route.params?.user_id;

	// Add this for debugging
	console.log("AddPetName user_id:", user_id);

	// Add useEffect to check for user_id
	useEffect(() => {
		if (!user_id) {
			Alert.alert(
				"Error",
				"User ID is missing. Please try logging in again.",
				[
					{
						text: "OK",
						onPress: () => navigation.navigate("LoginScreen")
					}
				]
			);
		}
	}, [user_id]);

	useEffect(() => {
		(async () => {
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('Sorry', 'We need camera roll permissions to upload photos.');
			}
		})();
	}, []);

	const pickImage = async () => {
		try {
			const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
			
			if (!permissionResult.granted) {
				Alert.alert('Permission Required', 'You need to grant access to your photos to upload a profile picture.');
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.5,
				base64: true,
			});

			if (!result.canceled) {
				const base64Size = result.assets[0].base64.length * 0.75;
				const maxSize = 2 * 1024 * 1024;

				if (base64Size > maxSize) {
					Alert.alert(
						'Image Too Large',
						'Please select an image smaller than 2MB',
						[{ text: 'OK' }]
					);
					return;
				}

				setPhoto({
					uri: result.assets[0].uri,
					base64: result.assets[0].base64
				});
			}
		} catch (error) {
			console.error('Error picking image:', error);
			Alert.alert('Error', 'Failed to pick image');
		}
	};

	const handleContinue = async () => {
		if (!user_id) {
			Alert.alert("Error", "User ID is missing");
			return;
		}

		// Validation for required fields
		if (
			petName.trim() === "" ||
			petAge.trim() === "" ||
			!petType ||
			petBreed.trim() === "" ||
			!petGender ||
			petWeight.trim() === ""
		) {
			Alert.alert("Error", "Please fill out all required fields.");
			return;
		}

		try {
			setLoading(true);
			
			const formData = new FormData();
			
			// Handle photo
			if (photo?.base64) {
				const photoFile = {
					uri: photo.uri,
					type: 'image/jpeg',
					name: 'photo.jpg'
				};
				formData.append('photo', photoFile);
			}

			const petData = {
				user_id: parseInt(user_id),
				created_by: parseInt(user_id),
				name: petName.trim(),
				type: petType.toLowerCase(),
				breed: petBreed.trim(),
				age: parseInt(petAge),
				owner_name: null,
				allergies: petAllergies?.trim() || null,
				notes: petNotes?.trim() || null,
				category: petType.toLowerCase(),
				gender: petGender.toLowerCase(),
				weight: parseFloat(petWeight),
				size: petSize?.toLowerCase() || null
			};

			// Add debugging log
			console.log('Pet Data being sent:', petData);

			// Append each field individually to FormData
			Object.keys(petData).forEach(key => {
				formData.append(key, petData[key]);
				// Add debugging log
				console.log(`Appending ${key}:`, petData[key]);
			});

			const url = `http://${SERVER_IP}/PetFurMe-Application/api/pets/index.php`;
			console.log('Request URL:', url);
			console.log('Sending pet data:', petData);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
				},
				body: formData
			});

			const responseText = await response.text();
			console.log('Response status:', response.status);
			console.log('Raw server response:', responseText);

			let data;
			try {
				data = JSON.parse(responseText);
			} catch (e) {
				console.error('Server returned non-JSON response:', responseText);
				throw new Error('Server returned an invalid response');
			}

			if (data.success) {
				// Log the activity
				await logActivity(
					ACTIVITY_TYPES.PET_ADDED,
					user_id,
					{
						petName: petName.trim(),
						petType: petType,
						petBreed: petBreed,
						petAge: petAge,
						petGender: petGender,
						details: {
							size: petSize || 'Not specified',
							weight: petWeight,
							allergies: petAllergies || 'None',
							notes: petNotes || 'None'
						}
					}
				);

				// Show success toast
				Toast.show({
					type: 'success',
					text1: 'Success!',
					text2: `${petName} has been added to your pets`,
					position: 'bottom',
					visibilityTime: 3000,
				});

				// Reset navigation stack and navigate to DrawerNavigator/HomePage
				navigation.reset({
					index: 0,
					routes: [
						{
							name: 'DrawerNavigator',
							params: { user_id: user_id },
							state: {
								routes: [
									{
										name: 'HomePage',
										params: { user_id: user_id }
									}
								]
							}
						}
					],
				});
			} else {
				Toast.show({
					type: 'error',
					text1: 'Error',
					text2: data.message || 'Failed to create pet profile',
					position: 'bottom',
				});
			}
		} catch (error) {
			console.error('Error in handleContinue:', error);
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: 'Failed to create pet profile. Please try again.',
				position: 'bottom',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.container}>
			{/* Loading Overlay */}
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#8146C1" />
				</View>
			)}

			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color="#FFFFFF" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Add Pet Profile</Text>
			</View>

			<ScrollView 
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollViewContent}
			>
				

				<View style={styles.formContainer}>
				{/* Pet Image */}
				<View style={styles.imageContainer}>
					<View style={styles.imageCircle}>
						<Image
							source={photo ? { uri: photo.uri } : require("../../assets/images/doprof.png")}
							style={styles.petImage}
							defaultSource={require("../../assets/images/doprof.png")}
						/>
						<TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
							<Ionicons name="camera" size={20} color="#FFFFFF" />
						</TouchableOpacity>
					</View>
				</View>
					
					{/* Required Fields Section */}
					<Text style={styles.sectionTitle}>Required Information</Text>
					
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Pet's Name</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter pet's name"
							value={petName}
							onChangeText={setPetName}
							placeholderTextColor="#8146C1"
						/>
					</View>

					{/* Create a row for age and weight */}
					<View style={styles.rowContainer}>
						<View style={styles.halfInput}>
							<Text style={styles.label}>Age</Text>
							<TextInput
								style={styles.input}
								placeholder="Age"
								value={petAge}
								onChangeText={setPetAge}
								placeholderTextColor="#8146C1"
								keyboardType="numeric"
							/>
						</View>
						<View style={styles.halfInput}>
							<Text style={styles.label}>Weight (kg)</Text>
							<TextInput
								style={styles.input}
								placeholder="Weight"
								value={petWeight}
								onChangeText={setPetWeight}
								placeholderTextColor="#8146C1"
								keyboardType="decimal-pad"
							/>
						</View>
					</View>

					{/* Create a row for type and size */}
					<View style={styles.rowContainer}>
						<View style={styles.halfInput}>
							<Text style={styles.label}>Type</Text>
							<CustomDropdown
								label="Select Pet Type"
								options={PET_TYPES}
								value={petType}
								onSelect={setPetType}
								placeholder="Select type"
							/>
						</View>
						<View style={styles.halfInput}>
							<Text style={styles.label}>Size</Text>
							<CustomDropdown
								label="Select Pet Size"
								options={PET_SIZES}
								value={petSize}
								onSelect={setPetSize}
								placeholder="Select size"
							/>
						</View>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Breed</Text>
						<TextInput
							style={styles.input}
							placeholder="Enter breed"
							value={petBreed}
							onChangeText={setPetBreed}
							placeholderTextColor="#8146C1"
						/>
					</View>

					{/* Add Gender dropdown */}
					<View style={styles.inputGroup}>
						<Text style={styles.label}>Gender</Text>
						<CustomDropdown
							label="Select Pet Gender"
							options={PET_GENDERS}
							value={petGender}
							onSelect={setPetGender}
							placeholder="Select gender"
						/>
					</View>

					{/* Optional Fields Section */}
					<Text style={styles.sectionTitle}>Additional Information</Text>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Allergies (Optional)</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							placeholder="List any allergies"
							value={petAllergies}
							onChangeText={setPetAllergies}
							placeholderTextColor="#8146C1"
							multiline
							numberOfLines={2}
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.label}>Notes (Optional)</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							placeholder="Any additional notes"
							value={petNotes}
							onChangeText={setPetNotes}
							placeholderTextColor="#8146C1"
							multiline
							numberOfLines={3}
						/>
					</View>
				</View>

				<TouchableOpacity
					style={[
						styles.continueButton,
						(!petName.trim() || !petAge.trim() || !petType || !petBreed || !petSize || !petGender || !petWeight.trim()) && {
							backgroundColor: "#D52FFF",
						},
					]}
					onPress={handleContinue}
					disabled={!petName.trim() || !petAge.trim() || !petType || !petBreed || !petSize || !petGender || !petWeight.trim()}>
					<Text style={styles.continueButtonText}>Save Pet Profile</Text>
				</TouchableOpacity>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	header: {
		backgroundColor: "#8146C1",
		paddingTop: 50,
		paddingBottom: 15,
		paddingHorizontal: 20,
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		marginRight: 15,
	},
	headerTitle: {
		color: "#FFFFFF",
		fontSize: 20,
		fontWeight: "bold",
	},
	scrollView: {
		flex: 1,
	},
	scrollViewContent: {
		paddingBottom: 30,
	},
	imageContainer: {
		alignItems: "center",
		marginVertical: 20,
	},
	imageCircle: {
		width: 100,
		height: 100,
		borderRadius: 60,
		borderWidth: 2,
		borderColor: "#D1ACDA",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
	},
	petImage: {
		width: 90,
		height: 90,
		borderRadius: 55,
	},
	cameraButton: {
		position: "absolute",
		bottom: 0,
		right: 0,
		backgroundColor: "#FF3DE0",
		borderRadius: 20,
		padding: 8,
	},
	formContainer: {
		paddingHorizontal: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#8146C1",
		marginTop: 20,
		marginBottom: 15,
	},
	inputGroup: {
		marginBottom: 15,
	},
	rowContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 15,
	},
	halfInput: {
		width: "48%",
	},
	label: {
		fontSize: 14,
		color: "#595959",
		marginBottom: 5,
		fontWeight: "600",
	},
	input: {
		borderWidth: 1,
		borderColor: "#bfbfbf",
		borderRadius: 10,
		padding: 12,
		backgroundColor: "#FFFFFF",
		color: "#000000",
		fontSize: 14,
	},
	textArea: {
		height: 80,
		textAlignVertical: 'top',
		paddingTop: 12,
	},
	continueButton: {
		backgroundColor: "#8146C1",
		paddingVertical: 15,
		borderRadius: 25,
		alignItems: "center",
		marginHorizontal: 20,
		marginTop: 20,
	},
	continueButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 100,
	},
});

export default AddPetProfile;
