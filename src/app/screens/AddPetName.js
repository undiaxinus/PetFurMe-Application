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
	SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomDropdown from '../components/CustomDropdown';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import Toast, { BaseToast } from 'react-native-toast-message';
import CustomHeader from '../components/CustomHeader';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const PET_TYPES = [
	"Dog",
	"Cat",
	"Bird",
	"Rabbit",
	"Other"
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
	const [petWeight, setPetWeight] = useState("");
	const [petAllergies, setPetAllergies] = useState("");
	const [petNotes, setPetNotes] = useState("");
	const [petGender, setPetGender] = useState("");
	const [loading, setLoading] = useState(false);
	const [photo, setPhoto] = useState(null);
	const [ageUnit, setAgeUnit] = useState('years');
	const isEditing = route.params?.isEditing || false;
	const existingPet = route.params?.pet;

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

	useEffect(() => {
		if (isEditing && existingPet) {
			setPetName(existingPet.name || '');
			setPetAge(existingPet.age?.toString() || '');
			setPetType(existingPet.type || '');
			setPetBreed(existingPet.breed || '');
			setPetWeight(existingPet.weight?.toString() || '');
			setPetAllergies(existingPet.allergies || '');
			setPetNotes(existingPet.notes || '');
			setPetGender(existingPet.gender || '');
			setAgeUnit(existingPet.age_unit || 'years');
			if (existingPet.photo) {
				setPhoto({ uri: existingPet.photo });
			}
		}
	}, [isEditing, existingPet]);

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

		// Updated validation for required fields
		if (
			petName.trim() === "" ||
			petAge.trim() === "" ||
			!petType ||
			!petGender
		) {
			Alert.alert("Error", "Please fill in the required fields: Name, Age, Type, and Gender");
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

			// Capitalize first letter of type for category
			const capitalizedType = petType.charAt(0).toUpperCase() + petType.slice(1).toLowerCase();

			const petData = {
				user_id: parseInt(user_id),
				created_by: parseInt(user_id),
				name: petName.trim(),
				type: petType.toLowerCase(),
				breed: petBreed.trim() || null,
				age: parseInt(petAge),
				age_unit: ageUnit,
				owner_name: null,
				allergies: petAllergies?.trim() || null,
				notes: petNotes.trim() || null,
				category: capitalizedType,
				gender: petGender.toLowerCase(),
				weight: petWeight.trim() ? parseFloat(petWeight) : null,
				size: null
			};

			if (isEditing) {
				petData.id = existingPet.id;
			}

			// Add debugging log
			console.log('Pet Data being sent:', petData);

			// Append each field to FormData
			Object.keys(petData).forEach(key => {
				formData.append(key, petData[key]);
			});

			const url = `http://${SERVER_IP}/PetFurMe-Application/api/pets/${isEditing ? 'update' : 'index'}.php`;
			
			const response = await fetch(url, {
				method: isEditing ? 'POST' : 'POST',
				headers: {
					'Accept': 'application/json',
				},
				body: formData
			});

			const responseText = await response.text();
			const data = JSON.parse(responseText);

			if (data.success) {
				// Log the activity
				await logActivity(
					isEditing ? ACTIVITY_TYPES.PET_UPDATED : ACTIVITY_TYPES.PET_ADDED,
					user_id,
					{
						petName: petName.trim(),
						petType: petType,
						petBreed: petBreed,
						petAge: petAge,
						petGender: petGender,
						details: {
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
					text2: isEditing 
						? `${petName}'s profile has been updated`
						: `${petName} has been added to your pets`,
					position: 'bottom',
					visibilityTime: 3000,
				});

				// Navigate back to HomePage with refresh flag
				navigation.reset({
					index: 0,
					routes: [
						{
							name: 'DrawerNavigator',
							params: { 
								user_id: user_id,
								refresh: true
							},
							state: {
								routes: [
									{
										name: 'HomePage',
										params: { 
											user_id: user_id,
											refresh: true
										}
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
					text2: data.message || `Failed to ${isEditing ? 'update' : 'create'} pet profile`,
					position: 'bottom',
				});
			}
		} catch (error) {
			console.error('Error in handleContinue:', error);
			Toast.show({
				type: 'error',
				text1: 'Error',
				text2: `Failed to ${isEditing ? 'update' : 'create'} pet profile. Please try again.`,
				position: 'bottom',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<View style={styles.mainContainer}>
			{/* Sticky Header */}
			<View style={[
				styles.headerLayer,
				{
					position: 'sticky',
					top: 0,
					zIndex: 1000,
				}
			]}>
				<CustomHeader 
					title={isEditing ? "Update Pet Profile" : "Add Pet Profile"}
					showBack
					navigation={navigation}
				/>
			</View>

			{/* Content */}
			<View style={styles.contentContainer}>
				<ScrollView 
					style={styles.scrollView}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollViewContent}
				>
					<View style={styles.formContainer}>
						{/* Profile Photo Section */}
						<View style={styles.imageContainer}>
							<View style={styles.imageWrapper}>
								<View style={styles.imageCircle}>
									<Image
										source={photo ? { uri: photo.uri } : require("../../assets/images/doprof.png")}
										style={styles.petImage}
										defaultSource={require("../../assets/images/doprof.png")}
									/>
									<TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
										<MaterialIcons name="photo-camera" size={11} color="#FFFFFF" />
									</TouchableOpacity>
								</View>
								<Text style={styles.uploadText}>Add Pet Photo</Text>
							</View>
						</View>
						
						<View style={styles.formSections}>
							{/* Basic Info Section */}
							<View style={styles.section}>
								<View style={styles.sectionHeader}>
									<MaterialIcons name="pets" size={14} color="#8146C1" />
									<Text style={styles.sectionTitle}>Basic Information</Text>
								</View>
								
								<View style={styles.inputGroup}>
									<Text style={styles.label}>Name</Text>
									<View style={styles.inputWithIcon}>
										<FontAwesome5 name="paw" size={14} color="#8146C1" style={styles.inputIcon} />
										<TextInput
											style={styles.inputWithIconField}
											placeholder="Enter your pet's name"
											value={petName}
											onChangeText={setPetName}
											placeholderTextColor="#A3A3A3"
										/>
									</View>
								</View>

								<View style={styles.inputGroup}>
									<Text style={styles.label}>Age <Text style={styles.required}>*</Text></Text>
									<View style={styles.ageInputContainer}>
										<View style={styles.ageInputWrapper}>
											<TextInput
												style={styles.ageInput}
												placeholder="Age"
												value={petAge}
												onChangeText={setPetAge}
												placeholderTextColor="#A3A3A3"
												keyboardType="numeric"
											/>
										</View>
										<View style={styles.ageUnitSelector}>
											<TouchableOpacity 
												style={[
													styles.unitButton,
													ageUnit === 'years' && styles.unitButtonActive
												]}
												onPress={() => setAgeUnit('years')}
											>
												<Text style={[
													styles.unitButtonText,
													ageUnit === 'years' && styles.unitButtonTextActive
												]}>Yrs</Text>
											</TouchableOpacity>
											<TouchableOpacity 
												style={[
													styles.unitButton,
													ageUnit === 'months' && styles.unitButtonActive
												]}
												onPress={() => setAgeUnit('months')}
											>
												<Text style={[
													styles.unitButtonText,
													ageUnit === 'months' && styles.unitButtonTextActive
												]}>Mos</Text>
											</TouchableOpacity>
										</View>
									</View>
								</View>

								<View style={styles.rowContainer}>
									<View style={styles.halfInput}>
										<Text style={styles.label}>Weight (kg)</Text>
										<TextInput
											style={styles.input}
											placeholder="Optional"
											value={petWeight}
											onChangeText={setPetWeight}
											placeholderTextColor="#A3A3A3"
											keyboardType="decimal-pad"
										/>
									</View>
									<View style={styles.halfInput}>
										<Text style={styles.label}>Pet Type</Text>
										<CustomDropdown
											label="Select type"
											options={PET_TYPES}
											value={petType}
											onSelect={setPetType}
											placeholder="Choose type"
										/>
									</View>
								</View>

								<View style={styles.rowContainer}>
									<View style={styles.halfInput}>
										<Text style={styles.label}>Gender</Text>
										<CustomDropdown
											label="Select gender"
											options={PET_GENDERS}
											value={petGender}
											onSelect={setPetGender}
											placeholder="Choose gender"
										/>
									</View>
								</View>

								<View style={styles.inputGroup}>
									<Text style={styles.label}>Breed</Text>
									<TextInput
										style={styles.input}
										placeholder="Optional"
										value={petBreed}
										onChangeText={setPetBreed}
										placeholderTextColor="#A3A3A3"
									/>
								</View>
							</View>

							{/* Health Info Section */}
							<View style={[styles.section, styles.optionalSection]}>
								<View style={styles.sectionHeader}>
									<MaterialIcons name="healing" size={14} color="#8146C1" />
									<Text style={styles.sectionTitle}>Health Information</Text>
								</View>
								
								<View style={styles.inputGroup}>
									<Text style={styles.label}>Allergies</Text>
									<TextInput
										style={[styles.input, styles.textArea]}
										placeholder="List any known allergies (if any)"
										value={petAllergies}
										onChangeText={setPetAllergies}
										placeholderTextColor="#A3A3A3"
										multiline
										numberOfLines={2}
									/>
								</View>

								<View style={styles.inputGroup}>
									<Text style={styles.label}>Special Notes</Text>
									<TextInput
										style={[styles.input, styles.textArea]}
										placeholder="Add any special care instructions"
										value={petNotes}
										onChangeText={setPetNotes}
										placeholderTextColor="#A3A3A3"
										multiline
										numberOfLines={3}
									/>
								</View>
							</View>
						</View>
					</View>

					{/* Save Button */}
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[
								styles.continueButton,
								(!petName.trim() || !petAge.trim() || !petType || !petBreed || !petGender || !petWeight.trim()) && 
								styles.continueButtonDisabled,
							]}
							onPress={handleContinue}
							disabled={!petName.trim() || !petAge.trim() || !petType || !petBreed || !petGender || !petWeight.trim()}>
							<Text style={styles.continueButtonText}>
								{isEditing ? 'Update Pet Profile' : 'Save Pet Profile'}
							</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</View>

			{/* Loading Overlay */}
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#8146C1" />
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	headerLayer: {
		width: '100%',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: '#FFFFFF',
		zIndex: 1000,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.08,
		shadowRadius: 1.5,
		elevation: 2,
		height: 60,
	},
	contentContainer: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	scrollView: {
		flex: 1,
	},
	scrollViewContent: {
		paddingTop: 8,
		paddingBottom: 20,
	},
	formContainer: {
		padding: 16,
	},
	imageContainer: {
		alignItems: "center",
		marginBottom: 20,
		marginTop: 12,
		paddingHorizontal: 16,
	},
	imageWrapper: {
		padding: 10,
		backgroundColor: '#F8F5FF',
		borderRadius: 16,
		width: '100%',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E9E3F5',
		shadowColor: "#8146C1",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	imageCircle: {
		width: 72,
		height: 72,
		borderRadius: 36,
		borderWidth: 2.5,
		borderColor: '#8146C1',
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		shadowColor: "#8146C1",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
		padding: 8,
	},
	petImage: {
		width: 48,
		height: 48,
		borderRadius: 24,
		resizeMode: 'contain',
	},
	uploadText: {
		marginTop: 8,
		color: '#8146C1',
		fontSize: 11,
		fontWeight: '600',
		letterSpacing: 0.3,
		opacity: 0.9,
	},
	cameraButton: {
		position: "absolute",
		bottom: -3,
		right: -3,
		backgroundColor: "#8146C1",
		borderRadius: 12,
		padding: 4,
		elevation: 3,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.2,
		shadowRadius: 2,
		borderWidth: 2,
		borderColor: '#FFFFFF',
	},
	formSections: {
		gap: 16,
	},
	section: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: '#F0F0F0',
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 6,
		elevation: 2,
	},
	optionalSection: {
		backgroundColor: '#FDFCFF',
		borderColor: '#E9E3F5',
		borderStyle: 'dashed',
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
		paddingBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: '#F0F0F0',
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: "600",
		color: '#8146C1',
		marginLeft: 6,
		letterSpacing: 0.3,
		textTransform: 'uppercase',
	},
	inputGroup: {
		marginBottom: 14,
	},
	inputWithIcon: {
		height: 42,
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderRadius: 10,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	inputIcon: {
		padding: 12,
		opacity: 0.8,
	},
	inputWithIconField: {
		flex: 1,
		height: '100%',
		color: "#2D3748",
		fontSize: 13,
		paddingRight: 12,
	},
	label: {
		fontSize: 12,
		color: '#666666',
		marginBottom: 5,
		fontWeight: "500",
		letterSpacing: 0.2,
		flexDirection: 'row',
		alignItems: 'center',
	},
	input: {
		height: 42,
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderRadius: 10,
		padding: 10,
		backgroundColor: "#FFFFFF",
		color: "#2D3748",
		fontSize: 13,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	textArea: {
		height: 80,
		textAlignVertical: 'top',
		paddingTop: 12,
	},
	buttonContainer: {
		padding: 16,
		paddingTop: 8,
	},
	continueButton: {
		backgroundColor: "#8146C1",
		height: 48,
		borderRadius: 24,
		alignItems: "center",
		justifyContent: 'center',
		marginTop: 8,
		shadowColor: "#8146C1",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 8,
		elevation: 4,
	},
	continueButtonDisabled: {
		backgroundColor: "#E2D9F3",
		shadowOpacity: 0,
		elevation: 0,
	},
	continueButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
		letterSpacing: 0.5,
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(255, 255, 255, 0.8)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 1000,
	},
	rowContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 16,
		gap: 12,
	},
	halfInput: {
		flex: 1,
	},
	required: {
		color: '#8146C1',
		fontSize: 14,
	},
	ageInputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	ageInputWrapper: {
		flex: 1,
		maxWidth: '50%',
	},
	ageInput: {
		height: 42,
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderRadius: 10,
		padding: 10,
		backgroundColor: "#FFFFFF",
		color: "#2D3748",
		fontSize: 13,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	ageUnitSelector: {
		flexDirection: 'row',
		backgroundColor: '#F8F5FF',
		borderRadius: 8,
		padding: 2,
		borderWidth: 1,
		borderColor: '#E9E3F5',
	},
	unitButton: {
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 6,
		minWidth: 45,
		alignItems: 'center',
		justifyContent: 'center',
	},
	unitButtonActive: {
		backgroundColor: '#8146C1',
	},
	unitButtonText: {
		fontSize: 12,
		color: '#666666',
		fontWeight: '500',
	},
	unitButtonTextActive: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
});

export default AddPetProfile;
