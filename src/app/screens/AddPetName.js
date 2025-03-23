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
	Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomDropdown from '../components/CustomDropdown';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL, SERVER_IP, SERVER_PORT, API_BASE_URL } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import Toast, { BaseToast } from 'react-native-toast-message';
import CustomHeader from '../components/CustomHeader';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PET_TYPES = [
	"Dog",
	"Cat",
	"Bird",
	"Rabbit",
];

const PET_GENDERS = [
	"Male",
	"Female"
];

const AddPetProfile = ({ route }) => {
	const navigation = useNavigation();

	// Log the entire route params first
	console.log('AddPetName received route params:', route.params);

	const isEditing = route.params?.isEditing || false;
	const existingPet = route.params?.pet;
	const user_id = route.params?.user_id;

	// Add comprehensive debug logging
	console.log('AddPetName initialized with:', {
		isEditing,
		existingPet,
		user_id,
		routeParams: route.params
	});

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

	useEffect(() => {
		// Validate user_id on mount
		if (!user_id) {
			console.error('Missing user_id in AddPetName', {
				routeParams: route.params,
				existingPet
			});
			Alert.alert(
				"Error",
				"User ID is missing. Please try again.",
				[{ text: "OK", onPress: () => navigation.goBack() }]
			);
		}
	}, []);

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
			setPetAllergies(existingPet.allergies === null ? 'None' : existingPet.allergies);
			setPetNotes(existingPet.notes === null ? 'None' : existingPet.notes);
			setPetGender(existingPet.gender || '');
			setAgeUnit(existingPet.age_unit || 'years');
			
			// Handle existing photo
			if (existingPet.photo) {
				setPhoto({
					uri: `http://${SERVER_IP}/PetFurMe-Application/uploads/${existingPet.photo}`,
					exists: true
				});
				console.log('Setting existing photo:', existingPet.photo);
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
				const asset = result.assets[0];
				setPhoto({
					uri: asset.uri,
					base64: asset.base64,
					type: 'image/jpeg',
					isNew: true
				});
				console.log('New photo selected:', {
					hasUri: !!asset.uri,
					hasBase64: !!asset.base64
				});
			}
		} catch (error) {
			console.error('Error picking image:', error);
			Alert.alert('Error', 'Failed to pick image');
		}
	};

	const handleContinue = async () => {
		try {
			setLoading(true);
			console.log('Starting update process...');

			// Validate only the truly required fields
			if (!petName.trim()) {
				Alert.alert("Error", "Pet name is required.");
				return;
			}

			if (!petType) {
				Alert.alert("Error", "Pet type is required.");
				return;
			}

			const formData = new FormData();
			
			// Prepare pet data
			const petData = {
				user_id: parseInt(user_id),
				created_by: parseInt(user_id),
				name: petName.trim(),
				type: petType.toLowerCase(),
				breed: petBreed?.trim() || null,
				age: petAge ? parseInt(petAge) : null,
				age_unit: ageUnit || 'years',
				owner_name: null,
				allergies: petAllergies?.trim() || null,
				notes: petNotes?.trim() || null,
				category: petType,
				gender: petGender?.toLowerCase() || null,
				weight: petWeight ? parseFloat(petWeight) : null,
				size: null  // Set size to null explicitly
			};

			// Handle photo as binary data
			if (photo) {
				try {
					if (photo.base64) {
						// Directly append base64 data
						formData.append('photo_binary', photo.base64);
						formData.append('is_base64', 'true');
					} else if (photo.uri) {
						// For URI, we'll need to read the file and convert to base64
						const response = await fetch(photo.uri);
						const blob = await response.blob();
						const reader = new FileReader();
						
						const base64Data = await new Promise((resolve, reject) => {
							reader.onload = () => resolve(reader.result.split(',')[1]);
							reader.onerror = reject;
							reader.readAsDataURL(blob);
						});
						
						formData.append('photo_binary', base64Data);
						formData.append('is_base64', 'true');
					}
				} catch (error) {
					console.error('Error processing photo:', error);
					Alert.alert('Error', 'Failed to process photo. Please try again.');
					return;
				}
			}

			// Add pet_id for updates
			if (isEditing && existingPet?.id) {
				petData.pet_id = existingPet.id;
			}

			formData.append('data', JSON.stringify(petData));

			const endpoint = isEditing ? 'update_pet.php' : 'add_pet.php';
			const url = `${API_BASE_URL}/pets/${endpoint}`;
			
			console.log('Sending request to:', url);
			console.log('Pet Data:', petData);
			console.log('FormData contents:', Array.from(formData.entries()));

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
				},
				body: formData
			});

			// Log the response status and headers
			console.log('Response status:', response.status);
			console.log('Response headers:', response.headers);

			// Try to get the response text first
			const responseText = await response.text();
			console.log('Raw response:', responseText);

			let result;
			try {
				result = JSON.parse(responseText);
			} catch (e) {
				console.error('Failed to parse JSON response:', e);
				throw new Error('Invalid JSON response from server');
			}

			console.log('Parsed API Response:', result);

			if (!result.success) {
				throw new Error(result.message || 'Failed to add pet profile');
			}

			// Log the activity
			await logActivity(
				user_id,
				isEditing ? ACTIVITY_TYPES.PET_UPDATED : ACTIVITY_TYPES.PET_ADDED,
				`${isEditing ? 'Updated' : 'Added'} pet profile for ${petName}`
			);

			// Show success message
			Toast.show({
				type: 'success',
				text1: 'Success',
				text2: `Pet profile added successfully!`,
				position: 'bottom',
				visibilityTime: 3000,
			});

			// Navigate to HomePage with user_id
			navigation.navigate('HomePage', {
				user_id: user_id,
				refresh: true,
				showMessage: true,
				message: `Pet profile added successfully!`,
				messageType: 'success'
			});

		} catch (error) {
			console.error('Error in handleContinue:', error);
			Alert.alert(
				"Error",
				`Failed to add pet profile. ${error.message}`
			);
			// Navigate to HomePage in case of error
			navigation.navigate('HomePage', {
				user_id: user_id,
				refresh: true,
				showMessage: true,
				message: `Failed to add pet profile. ${error.message}`,
				messageType: 'error'
			});
		} finally {
			setLoading(false);
		}
	};

	// Skip button handlers
	const handleSkipAge = () => {
		setPetAge(prev => prev === 'Not Provided' ? '' : 'Not Provided'); // Toggle between skipped and empty
	};

	const handleSkipWeight = () => {
		setPetWeight(prev => prev === 'Not Provided' ? '' : 'Not Provided'); // Toggle between skipped and empty
	};

	const handleSkipBreed = () => {
		setPetBreed(prev => prev === null ? '' : null); // Toggle between null and empty
	};

	// Add these validation helper functions
	const isAllRequiredFieldsFilled = () => {
		return petName.trim() !== '' && 
			   petType !== '' && 
			   petGender !== '';
	};

	const isAdditionalFieldsValid = () => {
		// Since these are optional fields, they should be valid by default
		// Only validate them if they have content
		const isAgeValid = !petAge || petAge === 'Not Provided' || !isNaN(petAge);
		const isWeightValid = !petWeight || petWeight === 'Not Provided' || !isNaN(petWeight);
		const isBreedValid = !petBreed || petBreed === null || petBreed.trim() !== '';
		
		// Allergies and notes are always valid since they're optional
		return isAgeValid && isWeightValid && isBreedValid;
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
										source={{
											uri: photo && (
												photo.base64 
													? `data:image/jpeg;base64,${photo.base64}`
													: photo.uri
											)
										}}
										style={styles.petImage}
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
								
								{/* Required Fields */}
								<View style={styles.inputGroup}>
									<Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
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
									<Text style={styles.label}>Pet Type <Text style={styles.required}>*</Text></Text>
									<CustomDropdown
										label="Pet Type"
										options={PET_TYPES}
										value={petType}
										onSelect={setPetType}
										placeholder="Choose type"
										style={styles.dropdown}
									/>
								</View>

								<View style={styles.inputGroup}>
									<Text style={styles.label}>Gender <Text style={styles.required}>*</Text></Text>
									<CustomDropdown
										label="Gender"
										options={PET_GENDERS}
										value={petGender}
										onSelect={setPetGender}
										placeholder="Choose gender"
										style={styles.dropdown}
									/>
								</View>

								{/* Additional Information Section */}
								<View style={styles.additionalInfoContainer}>
									<Text style={styles.additionalInfoHeader}>Additional Information</Text>

									{/* Age Field */}
									<View style={styles.optionalField}>
										<View style={styles.fieldWrapper}>
											<Text style={styles.label}>Age</Text>
											<View style={styles.inputWithAction}>
												<TextInput
													style={[styles.optionalInput, petAge === 'Not Provided' && styles.skippedInput]}
													placeholder={petAge === 'Not Provided' ? 'Age skipped' : 'Enter age'}
													value={petAge === 'Not Provided' ? '' : petAge}
													onChangeText={(text) => {
														if (text.trim() === '') {
															setPetAge('Not Provided');
														} else {
															setPetAge(text);
														}
													}}
													placeholderTextColor="#A3A3A3"
													keyboardType="numeric"
													editable={petAge !== 'Not Provided'}
												/>
												<TouchableOpacity 
													style={[styles.skipButton, petAge === 'Not Provided' && styles.skipButtonActive]}
													onPress={handleSkipAge}
													disabled={false} // Allow clicking even if already skipped
												>
													<Text style={[styles.skipButtonText, petAge === 'Not Provided' && styles.activeButtonText]}>
														{petAge === 'Not Provided' ? 'Skipped' : 'Skip'}
													</Text>
												</TouchableOpacity>
											</View>
										</View>
									</View>

									{/* Weight Field */}
									<View style={styles.optionalField}>
										<View style={styles.fieldWrapper}>
											<Text style={styles.label}>Weight (kg)</Text>
											<View style={styles.inputWithAction}>
												<TextInput
													style={[styles.optionalInput, petWeight === 'Not Provided' && styles.skippedInput]}
													placeholder={petWeight === 'Not Provided' ? 'Weight skipped' : 'Enter weight in kg'}
													value={petWeight === 'Not Provided' ? '' : petWeight}
													onChangeText={setPetWeight}
													placeholderTextColor="#A3A3A3"
													keyboardType="decimal-pad"
													editable={petWeight !== 'Not Provided'}
												/>
												<TouchableOpacity 
													style={[styles.skipButton, petWeight === 'Not Provided' && styles.skipButtonActive]}
													onPress={handleSkipWeight}
													disabled={false} // Allow clicking even if already skipped
												>
													<Text style={[styles.skipButtonText, petWeight === 'Not Provided' && styles.activeButtonText]}>
														{petWeight === 'Not Provided' ? 'Skipped' : 'Skip'}
													</Text>
												</TouchableOpacity>
											</View>
										</View>
									</View>

									{/* Breed Field */}
									<View style={styles.optionalField}>
										<View style={styles.fieldWrapper}>
											<Text style={styles.label}>Breed</Text>
											<View style={styles.inputWithAction}>
												<TextInput
													style={[styles.optionalInput, petBreed === null && styles.skippedInput]}
													placeholder={petBreed === null ? 'Breed skipped' : 'Enter breed'}
													value={petBreed === null ? '' : petBreed}
													onChangeText={setPetBreed}
													placeholderTextColor="#A3A3A3"
													editable={petBreed !== null}
												/>
												<TouchableOpacity 
													style={[styles.skipButton, petBreed === null && styles.skipButtonActive]}
													onPress={handleSkipBreed}
													disabled={false}
												>
													<Text style={[styles.skipButtonText, petBreed === null && styles.activeButtonText]}>
														{petBreed === null ? 'Skipped' : 'Skip'}
													</Text>
												</TouchableOpacity>
											</View>
										</View>
									</View>
								</View>
							</View>

							{/* Health Info Section */}
							<View style={[styles.section, styles.optionalSection, styles.healthInfoContainer]}>
								<View style={styles.sectionHeader}>
									<MaterialIcons name="healing" size={14} color="#8146C1" />
									<Text style={styles.sectionTitle}>Health Information</Text>
								</View>
								
								<View style={styles.inputGroup}>
									<Text style={styles.label}>Allergies</Text>
									<TextInput
										style={[styles.input, styles.textArea]}
										placeholder="List any known allergies (if any)"
										value={petAllergies === 'null' || petAllergies === null ? 'None' : petAllergies}
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
										value={petNotes === 'null' || petNotes === null ? 'None' : petNotes}
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
								(!isAllRequiredFieldsFilled() || !isAdditionalFieldsValid()) && 
								styles.continueButtonDisabled,
							]}
							onPress={handleContinue}
							disabled={!isAllRequiredFieldsFilled() || !isAdditionalFieldsValid()}
						>
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
	optionalFieldsContainer: {
		marginTop: 20,
		gap: 16,
	},
	optionalFieldsHeader: {
		fontSize: 12,
		color: '#8146C1',
		fontWeight: '600',
		marginBottom: 12,
		letterSpacing: 0.2,
	},
	optionalField: {
		borderTopWidth: 1,
		borderTopColor: '#F0F0F0',
		padding: 16,
	},
	fieldWrapper: {
		gap: 8,
	},
	inputWithAction: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	optionalInput: {
		flex: 1,
		height: 40,
		borderWidth: 1,
		borderColor: "#E0E0E0",
		borderRadius: 8,
		paddingHorizontal: 12,
		backgroundColor: "#FFFFFF",
		color: "#2D3748",
		fontSize: 13,
	},
	skipButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: '#F8F5FF',
		borderWidth: 1,
		borderColor: '#E9E3F5',
		minWidth: 70,
		alignItems: 'center'
	},
	skipButtonText: {
		color: '#8146C1',
		fontSize: 12,
		fontWeight: '500'
	},
	activeButtonText: {
		color: '#666666'
	},
	additionalInfoContainer: {
		marginTop: 5,
		backgroundColor: '#FFFFFF',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#F0F0F0',
		overflow: 'hidden',
	},
	additionalInfoHeader: {
		fontSize: 14,
		fontWeight: '600',
		color: '#8146C1',
		marginBottom: 16,
		paddingHorizontal: 16,
		paddingTop: 16,
	},
	healthInfoContainer: {
		backgroundColor: '#FFFFFF',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#E9E3F5',
		padding: 16,
	},
	skippedInput: {
		backgroundColor: '#F5F5F5',
		color: '#666666',
		fontStyle: 'italic'
	},
	skippedButton: {
		backgroundColor: '#8146C1',
	},
	skippedButtonText: {
		color: '#FFFFFF',
	},
	activeButtonText: {
		color: '#666666'
	},
	dropdown: {
		padding: 0,
		backgroundColor: 'transparent',
		borderWidth: 0,
	},
	skipButtonActive: {
		backgroundColor: '#E9E3F5',
		borderColor: '#D1C4E9'
	},
	activeButtonText: {
		color: '#666666'
	},
});

export default AddPetProfile;
