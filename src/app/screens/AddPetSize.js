import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Image,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PetSizeSelection = ({ navigation }) => {
	const [selectedSize, setSelectedSize] = useState(null);
	const [loading, setLoading] = useState(false);

	const sizes = [
		{ id: "small", label: "Small", range: "under 14kg", icon: "paw" },
		{ id: "medium", label: "Medium", range: "14-25kg", icon: "paw" },
		{ id: "large", label: "Large", range: "over 25kg", icon: "paw" },
	];

	const handleContinue = () => {
		if (selectedSize) {
			setLoading(true); // Show loading spinner
			setTimeout(() => {
				setLoading(false); // Hide loading spinner
				navigation.navigate("AddPetBirth"); // Navigate to the next screen
			}, 2000); // Simulate a delay
		} else {
			alert("Please select a size.");
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
					<Ionicons name="arrow-back" size={24} color="#808080" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Add Pet Profile</Text>
				<Text style={styles.headerSubtitle}>Size</Text>
				<Text style={styles.headerStep}>Step 4/5</Text>
			</View>

			{/* Progress Bar */}
			<View style={styles.progressBarContainer}>
				<View style={styles.progressBar} />
			</View>

			{/* Pet Image */}
			<View style={styles.imageContainer}>
				<Image
					source={require("../../assets/images/dogg.png")} // Replace with your image path
					style={styles.petImage}
				/>
			</View>

			{/* Size Selection */}
			<Text style={styles.title}>What’s your pet’s size?</Text>
			<Text style={styles.subtitle}>
				Automatic selection based on your pet's breed. Adjust according to
				reality.
			</Text>
			<View style={styles.sizeContainer}>
				{sizes.map((size) => (
					<TouchableOpacity
						key={size.id}
						style={[
							styles.sizeBox,
							selectedSize === size.id && styles.selectedSizeBox,
						]}
						onPress={() => setSelectedSize(size.id)}>
						<Ionicons name={size.icon} size={30} color="#8146C1" />
						<Text style={styles.sizeLabel}>{size.label}</Text>
						<Text style={styles.sizeRange}>{size.range}</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Continue Button */}
			<TouchableOpacity
				style={[
					styles.continueButton,
					!selectedSize && { backgroundColor: "#E0E0E0" },
				]}
				onPress={handleContinue}
				disabled={!selectedSize}>
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
		paddingHorizontal: 20,
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 100,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#8146C1",
		width: 400,
		paddingHorizontal: 15,
		paddingVertical: 10,
		position: "relative",
		top: 35,
	},
	backButton: {
		position: "absolute",
		left: 35,
		top: 65,
	},
	headerTitle: {
		color: "#000000",
		fontSize: 18,
		fontWeight: "bold",
		textAlign: "center",
		flex: 1,
		top: 45,
	},
	headerSubtitle: {
		color: "#b3b3b3",
		fontSize: 14,
		position: "absolute",
		top: 85,
		left: 185,
	},
	headerStep: {
		color: "#808080",
		fontSize: 12,
		position: "absolute",
		right: 25,
		top: 75,
	},
	progressBarContainer: {
		width: "100%",
		backgroundColor: "#E0E0E0",
		height: 4,
		marginTop: 10,
		borderRadius: 2,
		top: 85,
	},
	progressBar: {
		width: "80%", // Adjust based on step
		height: "100%",
		backgroundColor: "#8146C1",
		borderRadius: 2,
		top: 0,
	},
	imageContainer: {
		alignItems: "center",
		marginTop: 120,
		marginBottom: 70,
	},
	petImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
		borderWidth: 2,
		borderColor: "#D1ACDA",
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#333333",
		marginBottom: 15,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 14,
		color: "#8E8E8E",
		textAlign: "center",
		marginBottom: 25,
	},
	sizeContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		top: 10,
	},
	sizeBox: {
		width: "30%",
		padding: 15,
		backgroundColor: "#F5F5F5",
		borderRadius: 10,
		alignItems: "center",
		borderWidth: 1,
		borderColor: "#F5F5F5",
	},
	selectedSizeBox: {
		borderColor: "#8146C1",
		backgroundColor: "#EDE7F6",
	},
	sizeLabel: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#8146C1",
		marginTop: 10,
	},
	sizeRange: {
		fontSize: 12,
		color: "#8E8E8E",
	},
	continueButton: {
		width: "90%",
		backgroundColor: "#8146C1",
		paddingVertical: 15,
		borderRadius: 25,
		alignItems: "center",
		marginTop: 50,
		top: 30,
	},
	continueButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default PetSizeSelection;
