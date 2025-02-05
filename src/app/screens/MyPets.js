import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SERVER_IP } from '../config/constants';

const API_BASE_URL = `http://${SERVER_IP}/PetFurMe-Application`;

const renderPetImage = (photo) => {
  if (photo) {
    // Clean up the photo path and construct the full URL
    const imageUrl = photo.startsWith('http') 
      ? photo 
      : `${API_BASE_URL}/${photo.startsWith('/') ? photo.slice(1) : photo}`;
      
    console.log('Loading pet image from:', imageUrl); // For debugging
    
    return (
      <Image
        source={{ 
          uri: imageUrl,
          // Add cache busting to ensure fresh images
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          cache: 'reload'
        }}
        style={styles.petImage}
        defaultSource={require('../../assets/images/doprof.png')}
        onError={(error) => {
          console.error('Image loading error:', imageUrl, error);
        }}
      />
    );
  }
  
  // Return default image if no photo is available
  return (
    <Image
      source={require('../../assets/images/doprof.png')}
      style={styles.petImage}
    />
  );
};

{pets.map((pet) => (
  <View key={pet.id} style={styles.petContainer}>
    {renderPetImage(pet.photo)}
    <Text style={styles.petName}>{pet.name}</Text>
  </View>
))}

// Add this to your component to debug photo paths
useEffect(() => {
  pets.forEach(pet => {
    console.log(`Pet: ${pet.name}, Photo path: ${pet.photo}`);
  });
}, [pets]);

// Add a useEffect hook to fetch pets or modify your existing fetch logic
useEffect(() => {
  const fetchPets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pets/get_pets.php?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter out soft-deleted pets (where deleted_at is not null)
        const activePets = data.pets.filter(pet => !pet.deleted_at);
        setPets(activePets);
      } else {
        console.error('Failed to fetch pets:', data.message);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  fetchPets();
}, [userId]); // Add any other dependencies as needed

const styles = StyleSheet.create({
  petContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  petName: {
    fontSize: 12,
    textAlign: 'center',
  }
}); 