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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AddPetProfile = ({ navigation, route }) => {
	const [petName, setPetName] = useState("");
	const [petAge, setPetAge] = useState("");
	const [petType, setPetType] = useState("");
	const [petBreed, setPetBreed] = useState("");
	const [loading, setLoading] = useState(false);

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

	const handleContinue = async () => {
		if (!user_id) {
			alert("Error: User ID is missing");
			return;
		}

		if (
			petName.trim() === "" ||
			petAge.trim() === "" ||
			petType.trim() === "" ||
			petBreed.trim() === ""
		) {
			alert("Please fill out all the fields.");
			return;
		}

		try {
			setLoading(true);
			
			const response = await fetch('http://192.168.1.7:3001/api/pets/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_id: user_id,
					name: petName.trim(),
					age: parseInt(petAge),
					type: petType.trim(),
					breed: petBreed.trim(),
					category: 'Mammal',
				}),
			});

			// Log the raw response for debugging
			const responseText = await response.text();
			console.log('Raw response:', responseText);

			// Try to parse as JSON
			let data;
			try {
				data = JSON.parse(responseText);
			} catch (parseError) {
				throw new Error(`Server response was not JSON: ${responseText}`);
			}

			if (!response.ok) {
				throw new Error(data.error || data.message || 'Failed to save pet details');
			}

			setLoading(false);
			alert('Pet profile created successfully!');
			navigation.navigate("DrawerNavigator", { 
				screen: "HomePage",
				params: { pet_id: data.pet_id }
			});
			
		} catch (error) {
			setLoading(false);
			console.error('Error details:', error);
			alert("Error saving pet details: " + error.message);
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
			<View style={styles.headerContainer}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color="#808080" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Add Pet Profile</Text>
				</View>
			</View>

			{/* Pet Image */}
			<View style={styles.imageContainer}>
				<View style={styles.imageCircle}>
					<Image
						source={require("../../assets/images/doprof.png")} // Replace with your image path
						style={styles.petImage}
					/>
					<TouchableOpacity style={styles.cameraButton}>
						<Ionicons name="camera" size={20} color="#FFFFFF" />
					</TouchableOpacity>
				</View>
			</View>

			{/* Pet Name Input */}
			<Text style={styles.label}>What’s your pet’s name?</Text>
			<TextInput
				style={styles.input}
				placeholder="Your pet’s name"
				value={petName}
				onChangeText={setPetName}
				placeholderTextColor="#8146C1"
			/>

<Text style={styles.label}>What’s your pet’s age?</Text>
			<TextInput
				style={styles.input}
				placeholder="Your pet's age"
				value={petAge}
				onChangeText={setPetAge}
				placeholderTextColor="#8146C1"
				keyboardType="numeric"
			/>

<Text style={styles.label}>What’s your pet’s type?</Text>
			<TextInput
				style={styles.input}
				placeholder="Your pet's type"
				value={petType}
				onChangeText={setPetType}
				placeholderTextColor="#8146C1"
			/>

<Text style={styles.label}>What’s your pet’s breed?</Text>
			<TextInput
				style={styles.input}
				placeholder="Your pet's breed"
				value={petBreed}
				onChangeText={setPetBreed}
				placeholderTextColor="#8146C1"
			/>

	

			{/* Continue Button */}
			<TouchableOpacity
				style={[
					styles.continueButton,
					(!petName.trim() || !petAge.trim() || !petType.trim() || !petBreed.trim()) && {
						backgroundColor: "#D52FFF",
					},
				]}
				onPress={handleContinue}
				disabled={!petName.trim() || !petAge.trim() || !petType.trim() || !petBreed.trim()}>
				<Text style={styles.continueButtonText}>Save</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 100,
	},
	headerContainer: {
		width: 360,
		alignItems: "center",
		marginBottom: 150,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#8146C1",
		width: "400",
		paddingHorizontal: 20,
		paddingVertical: 10,
		bottom: 1,
	},
	backButton: {
		position: "absolute",
		left: 35,
		top: 50,
	},
	headerTitle: {
		color: "#000000",
		fontSize: 18,
		fontWeight: "bold",
		top: 40,
		left: 120,
	},
	imageContainer: {
		alignItems: "center",
		marginVertical: 20,
		bottom: 120,
	},
	imageCircle: {
		width: 120,
		height: 120,
		borderRadius: 75,
		borderWidth: 2,
		borderColor: "#D1ACDA",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
	},
	petImage: {
		width: 120,
		height: 120,
		borderRadius: 70,
	},
	cameraButton: {
		position: "absolute",
		bottom: 0,
		right: 0,
		backgroundColor: "#FF3DE0",
		borderRadius: 20,
		padding: 8,
	},
	label: {
		fontSize: 16,
		color: "#595959",
		marginBottom: 10,
		fontWeight: "bold",
		top: -100,
		right: 50,
	},
	input: {
		width: "90%",
		borderWidth: 1,
		borderColor: "#bfbfbf",
		borderRadius: 10,
		padding: 9,
		marginBottom: 20,
		backgroundColor: "#FFFFFF",
		color: "#000000",
		top: -100,
	},
	continueButton: {
		width: "90%",
		backgroundColor: "#8146C1",
		paddingVertical: 15,
		borderRadius: 25,
		alignItems: "center",
		marginTop: -80,
	},
	continueButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default AddPetProfile;
