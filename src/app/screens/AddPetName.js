import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	TextInput,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AddPetProfile = ({ navigation }) => {
	const [petName, setPetName] = useState("");
	const [petAge, setPetAge] = useState("");
	const [petType, setPetType] = useState("");
	const [loading, setLoading] = useState(false);

	const handleContinue = () => {
		if (
			petName.trim() === "" ||
			petAge.trim() === "" ||
			petType.trim() === ""
		) {
			alert("Please fill out all the fields.");
		} else {
			setLoading(true); // Show loading spinner
			setTimeout(() => {
				setLoading(false); // Hide loading spinner
				navigation.navigate("AddPetSize"); // Replace 'NextStep' with your next screen
			}, 2000); // Simulate a delay
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
					<Text style={styles.headerStep}>Step 3/5</Text>
				</View>

				{/* Progress Bar */}
				<View style={styles.progressBarContainer}>
					<View style={styles.progressBar} />
				</View>
			</View>

			{/* Pet Image */}
			<View style={styles.imageContainer}>
				<View style={styles.imageCircle}>
					<Image
						source={require("../../assets/images/dogg.png")} // Replace with your image path
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

			{/* Pet Age Input */}
			<Text style={styles.label}>Age</Text>
			<TextInput
				style={styles.input}
				placeholder="Your pet’s age"
				value={petAge}
				onChangeText={setPetAge}
				placeholderTextColor="#8146C1"
				keyboardType="numeric"
			/>

			{/* Pet Type Input */}
			<Text style={styles.label}>Pet Type</Text>
			<TextInput
				style={styles.input}
				placeholder="Your pet's type"
				value={petType}
				onChangeText={setPetType}
				placeholderTextColor="#8146C1"
			/>

			{/* Continue Button */}
			<TouchableOpacity
				style={[
					styles.continueButton,
					(!petName.trim() || !petAge.trim() || !petType.trim()) && {
						backgroundColor: "#D52FFF",
					},
				]}
				onPress={handleContinue}
				disabled={!petName.trim() || !petAge.trim() || !petType.trim()}>
				<Text style={styles.continueButtonText}>Continue</Text>
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
		top: 18,
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
		left: 110,
	},
	headerStep: {
		color: "#808080",
		fontSize: 14,
		top: 45,
		left: -5,
	},
	progressBarContainer: {
		backgroundColor: "#E0E0E0",
		height: 4,
		width: "70%",
		marginVertical: 10,
		top: 50,
	},
	progressBar: {
		backgroundColor: "#8146C1",
		width: "60%",
		height: "100%",
	},
	imageContainer: {
		alignItems: "center",
		marginVertical: 20,
		top: -100,
	},
	imageCircle: {
		width: 150,
		height: 150,
		borderRadius: 75,
		borderWidth: 2,
		borderColor: "#D1ACDA",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
	},
	petImage: {
		width: 140,
		height: 140,
		borderRadius: 70,
	},
	cameraButton: {
		position: "absolute",
		bottom: 10,
		right: 10,
		backgroundColor: "#FF3DE0",
		borderRadius: 20,
		padding: 8,
	},
	label: {
		fontSize: 16,
		color: "#595959",
		marginBottom: 10,
		fontWeight: "bold",
		top: -80,
	},
	input: {
		width: "90%",
		borderWidth: 1,
		borderColor: "#bfbfbf",
		borderRadius: 10,
		padding: 15,
		marginBottom: 20,
		backgroundColor: "#FFFFFF",
		color: "#000000",
		top: -70,
	},
	continueButton: {
		width: "90%",
		backgroundColor: "#8146C1",
		paddingVertical: 15,
		borderRadius: 25,
		alignItems: "center",
		marginTop: -50,
	},
	continueButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default AddPetProfile;
