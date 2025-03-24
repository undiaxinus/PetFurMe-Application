import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
const AddPetSize = ({ navigation, route }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const pet_id = route.params?.pet_id;

  const sizes = [
    { id: 1, label: "Small", description: "0-15 pounds" },
    { id: 2, label: "Medium", description: "16-40 pounds" },
    { id: 3, label: "Large", description: "41-100 pounds" },
    { id: 4, label: "Extra Large", description: "100+ pounds" },
  ];

  const handleSizeSelect = async (size) => {
    try {
      const response = await fetch(`http://${SERVER_IP}:1800/api/pets/update-size`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pet_id: pet_id,
          size: size.label,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update pet size');
      }

      Alert.alert(
        "Success",
        "Pet size updated successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("DrawerNavigator", { 
              screen: 'HomePage'
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update pet size. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#808080" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Pet Size</Text>
        </View>
      </View>

      {/* Size Options */}
      <View style={styles.sizesContainer}>
        {sizes.map((size) => (
          <TouchableOpacity
            key={size.id}
            style={[
              styles.sizeOption,
              selectedSize?.id === size.id && styles.selectedSize,
            ]}
            onPress={() => handleSizeSelect(size)}
          >
            <Text style={styles.sizeLabel}>{size.label}</Text>
            <Text style={styles.sizeDescription}>{size.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8146C1",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 100,
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 50,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 120,
    marginTop: 40,
  },
  sizesContainer: {
    padding: 20,
  },
  sizeOption: {
    backgroundColor: "#F5F5F5",
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectedSize: {
    borderColor: "#8146C1",
    backgroundColor: "#F0E6FF",
  },
  sizeLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  sizeDescription: {
    fontSize: 14,
    color: "#666666",
  },
});

export default AddPetSize; 