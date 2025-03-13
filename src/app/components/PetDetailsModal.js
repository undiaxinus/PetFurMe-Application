import React from 'react';
import defaultPetImage from '../../assets/images/doprof.png';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const DetailCard = ({ label, value, icon }) => (
    <View style={styles.detailCard}>
        <View style={styles.cardHeader}>
            <MaterialCommunityIcons name={icon} size={20} color="#8146C1" />
            <Text style={styles.cardLabel}>{label}</Text>
        </View>
        <Text style={styles.cardValue}>
            {value ? value : 'None'}
        </Text>
    </View>
);

const PetDetailsModal = ({ pet, isVisible, onClose, user_id, onEdit }) => {
    const navigation = useNavigation();
    
    // Add comprehensive debug logging
    console.log('PetDetailsModal rendered with props:', {
        petInfo: pet,
        isVisible,
        userId: user_id
    });
    
    if (!pet) return null;
    
    // Add this function to handle photo source
    const getPetPhotoSource = (pet) => {
        if (!pet.photo) return defaultPetImage;
        
        try {
            // Handle base64 image data
            return { uri: `data:image/jpeg;base64,${pet.photo}` };
        } catch (error) {
            console.error('Error processing pet photo:', error);
            return defaultPetImage;
        }
    };
    
    const handleEdit = () => {
        onClose(); // Use onClose instead of setIsVisible
        navigation.navigate('UpdatePetProfile', {
            pet: pet,
            user_id: user_id,
            onComplete: () => {
                if (onEdit) {
                    onEdit(pet); // Keep the onEdit callback if needed
                }
            }
        });
    };
    
    return (
        <Modal
            isVisible={isVisible}
            onBackdropPress={onClose}
            onSwipeComplete={onClose}
            swipeDirection={['down']}
            style={styles.modal}
            propagateSwipe
        >
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{pet.name}</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
                            <MaterialCommunityIcons name="square-edit-outline" size={22} color="#8146C1" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <ScrollView style={styles.modalScroll}>
                    <View style={styles.petImageContainer}>
                        {console.log('Pet photo data:', {
                            hasPhoto: !!pet.photo,
                            photoType: typeof pet.photo,
                            photoLength: pet.photo?.length,
                            photoPreview: pet.photo?.substring(0, 50) + '...'
                        })}
                        <Image
                            source={getPetPhotoSource(pet)}
                            style={styles.modalPetImage}
                            resizeMode="contain"
                            defaultSource={defaultPetImage}
                        />
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.detailsGrid}>
                            <DetailCard 
                                label="Age" 
                                value={pet.age ? `${pet.age} yrs` : null}
                                icon="calendar-heart"
                            />
                            <DetailCard 
                                label="Gender" 
                                value={pet.gender}
                                icon="gender-male-female"
                            />
                            <DetailCard 
                                label="Breed" 
                                value={pet.breed}
                                icon="dog-side"
                            />
                            <DetailCard 
                                label="Weight" 
                                value={pet.weight ? `${pet.weight} kg` : null}
                                icon="scale-bathroom"
                            />
                        </View>

                        <View style={styles.notesContainer}>
                            <View style={styles.notesHeader}>
                                <MaterialCommunityIcons name="text-box-outline" size={20} color="#8146C1" />
                                <Text style={styles.notesLabel}>Notes</Text>
                            </View>
                            <Text style={styles.notesValue}>
                                {pet.notes?.trim() || "None"}
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        margin: 0,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingBottom: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: '#FFFFFF',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#8146C1',
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    editButton: {
        padding: 8,
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
    },
    closeButton: {
        padding: 8,
    },
    modalScroll: {
        flexGrow: 0,
    },
    petImageContainer: {
        height: 200,
        width: '100%',
        backgroundColor: '#F8F8F8',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        overflow: 'hidden',
    },
    modalPetImage: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        padding: 16,
        paddingTop: 12,
        gap: 12,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    detailCard: {
        width: '48%',
        backgroundColor: '#F8F8F8',
        padding: 12,
        borderRadius: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 1.5,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    cardLabel: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
        fontWeight: '500',
    },
    cardValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginTop: 2,
        marginLeft: 26,
    },
    notesContainer: {
        backgroundColor: '#F8F8F8',
        padding: 12,
        borderRadius: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.08,
        shadowRadius: 1.5,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    notesHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    notesLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        fontWeight: '500',
    },
    notesValue: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginLeft: 26,
    },
});

export default PetDetailsModal; 