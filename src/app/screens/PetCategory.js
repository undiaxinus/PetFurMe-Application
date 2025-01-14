import React, { useState } from "react";
import {
	Text,
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	FlatList,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PetCategory = ({ navigation }) => {
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [loading, setLoading] = useState(false); // Loading state for spinner

	const categories = [
		{ id: "1", label: "DOG", image: require("../../assets/images/dogg.png") },
		{ id: "2", label: "CAT", image: require("../../assets/images/cat.png") },
		{
			id: "3",
			label: "RABBIT",
			image: require("../../assets/images/rabbit.png"),
		},
		{ id: "4", label: "BIRD", image: require("../../assets/images/bird.png") },
	];

	const handleContinue = () => {
		if (selectedCategory) {
			setLoading(true); // Show the spinner
			setTimeout(() => {
				setLoading(false); // Hide the spinner
				navigation.navigate("AddPetName"); // Navigate to the next screen
			}, 2000); // Simulate a delay for the spinner
		} else {
			alert("Please select a pet category.");
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
						style={styles.backButton}
						onPress={() => navigation.navigate("LandingPage")}>
						<Ionicons name="arrow-back" size={24} />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Pet Category</Text>
					<Text style={styles.headerStep}>Step 2/5</Text>
				</View>
			</View>

			{/* Categories */}
			<View
				style={[
					styles.categoryBackground,
					{ height: "auto", paddingVertical: 10 },
				]}>
				<FlatList
					data={categories}
					numColumns={2}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.categoryList}
					renderItem={({ item }) => (
						<TouchableOpacity
							style={[
								styles.categoryItem,
								selectedCategory === item.id && styles.selectedCategory,
							]}
							onPress={() => setSelectedCategory(item.id)}>
							<Image source={item.image} style={styles.categoryImage} />
							<Text style={styles.categoryLabel}>{item.label}</Text>
						</TouchableOpacity>
					)}
				/>
			</View>

			{/* Bottom Section */}
			<View style={styles.bottomContainer}>
				<TouchableOpacity
					style={[
						styles.continueButton,
						!selectedCategory && { backgroundColor: "#D428FF" },
					]}
					onPress={handleContinue}
					disabled={!selectedCategory || loading}>
					<Text style={styles.continueButtonText}>Continue</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.navigate("SkipScreen")}>
					<Text style={styles.skipText}>Skip for now</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F5F5F5",
		justifyContent: "center",
		alignItems: "center",
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 100,
	},
	headerContainer: {
		width: "100%",
		alignItems: "center",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#8146C1",
		width: "400",
		paddingHorizontal: 20,
		paddingVertical: 10,
		top: 35,
	},
	backButton: {
		position: "absolute",
		left: 30,
		top: 60,
	},
	headerTitle: {
		color: "#0d0d0d",
		fontSize: 18,
		fontWeight: "bold",
		top: 40,
		left: 130,
	},
	headerStep: {
		color: "#808080",
		fontSize: 14,
		top: 65,
		left: -10,
	},
	progressBarContainer: {
		backgroundColor: "#E0E0E0",
		height: 4,
		width: "90%",
		marginVertical: 10,
		borderRadius: 2,
	},
	progressBar: {
		backgroundColor: "#8146C1",
		width: "25%", // Adjust width based on step progress
		height: "100%",
		borderRadius: 2,
		top: 65,
	},
	categoryBackground: {
		flex: 1,
		backgroundColor: "#D1ACDA",
		borderRadius: 5,
		marginHorizontal: 2,
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 70,
		top: 20,
	},
	categoryList: {
		alignItems: "center",
		justifyContent: "center",
	},
	categoryItem: {
		width: 150,
		height: 150,
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		margin: 10,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: "#FFFFFF",
		elevation: 5,
		marginVertical: 30,
	},
	selectedCategory: {
		borderColor: "#8146C1",
		borderWidth: 3,
	},
	categoryImage: {
		width: 140, // Increased width
		height: 100, // Increased height
		resizeMode: "contain",
	},
	categoryLabel: {
		marginTop: 10,
		fontSize: 16,
		color: "#FFFFFF",
		fontWeight: "bold",
		textAlign: "center",
		backgroundColor: "#FF3DE0",
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 5,
		overflow: "hidden",
	},
	bottomContainer: {
		width: "100%",
		alignItems: "center",
		marginBottom: 20,
	},
	continueButton: {
		width: "90%",
		backgroundColor: "#8146C1",
		paddingVertical: 15,
		borderRadius: 25,
		alignItems: "center",
		marginBottom: 10,
	},
	continueButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
	skipText: {
		color: "#b3b3b3",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default PetCategory;
