import React, { useState } from "react";
import {
	Text,
	View,
	StyleSheet,
	Image,
	TouchableOpacity,
	ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const LandingPage = ({ navigation }) => {
	const [loading, setLoading] = useState(false);

	const handleContinue = () => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
			navigation.navigate("DrawerNavigator", { 
				screen: "AddPetName"
			});
		}, 2000);
	};

	return (
		<View style={styles.container}>
			{/* Loading Overlay */}
			{loading && (
				<View style={styles.loadingOverlay}>
					<ActivityIndicator size="large" color="#8146C1" />
				</View>
			)}

			{/* Top Header */}
			<View style={styles.header}>
				<Text style={styles.greetingText}>Hello,</Text>
				<Text style={styles.userName}>Angee</Text>
			</View>

			{/* Illustration */}
			<View style={styles.illustrationContainer}>
				<Image
					source={require("../../assets/images/landingimage.png")} // Replace with your illustration path
					style={styles.illustration}
				/>
			</View>

			{/* Message Section */}
			<View style={styles.messageContainer}>
				<Text style={styles.title}>Uh Oh!</Text>
				<Text style={styles.subtitle}>
					Looks like you have no profiles set up at this moment, add your pet
					now!
				</Text>
			</View>

			{/* Swipe Button */}
			<TouchableOpacity
				style={styles.swipeButton}
				onPress={handleContinue}
				disabled={loading}>
				<LinearGradient
					colors={["#b3b3ff", "#9999ff"]}
					style={styles.gradientButton}>
					<Text style={styles.swipeButtonText}>Click to continue</Text>
				</LinearGradient>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		justifyContent: "space-between",
		alignItems: "center",
	},
	loadingOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
		zIndex: 100,
	},
	header: {
		width: "100%",
		backgroundColor: "#8146C1",
		paddingVertical: -30,
		paddingHorizontal: 20,
		alignItems: "flex-start",
		top: 35,
	},
	greetingText: {
		color: "#8c8c8c",
		fontSize: 18,
		top: 60,
		left: 20,
	},
	userName: {
		color: "#8c8c8c",
		fontSize: 19,
		fontWeight: "bold",
		top: 35,
		left: 70,
	},
	illustrationContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	illustration: {
		width: 230,
		height: 230,
		position: "absolute",
		top: 150,
	},
	person: {
		width: 28,
		height: 28,
		position: "absolute",
		top: 55,
		left: 8,
	},
	messageContainer: {
		alignItems: "center",
		marginBottom: 100,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#212134",
		marginBottom: 50,
	},
	subtitle: {
		fontSize: 16,
		color: "#8E8E8E",
		textAlign: "center",
		marginBottom: 10,
	},
	swipeButton: {
		width: "90%",
		marginBottom: 30,
	},
	gradientButton: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 25,
		paddingVertical: 15,
	},
	swipeButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		marginLeft: 10,
	},
});

export default LandingPage;
