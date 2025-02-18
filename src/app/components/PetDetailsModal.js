import React from 'react';
import defaultPetImage from '../../assets/images/doprof.png';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';

const DetailCard = ({ label, value, icon }) => (
    <View style={styles.detailCard}>
        <View style={styles.cardHeader}>
            <MaterialCommunityIcons name={icon} size={22} color="#8146C1" />
            <Text style={styles.cardLabel}>{label}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
    </View>
);

const PetDetailsModal = ({ pet, isVisible, onClose }) => {
    const navigation = useNavigation();
    if (!pet) return null;
    
    const handleEditProfile = () => {
        onClose(); // Close the modal
        navigation.navigate('AddPetName', {
            user_id: pet.user_id,
            isEditing: true, // Add this flag to indicate edit mode
            pet: pet // Pass the existing pet data
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
                        <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
                            <MaterialCommunityIcons name="square-edit-outline" size={22} color="#8146C1" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>
                </View>
                
                <ScrollView style={styles.modalScroll}>
                    <View style={styles.petImageContainer}>
                        <Image
                            source={
                                pet.photo
                                    ? { uri: pet.photo }
                                    : defaultPetImage
                            }
                            style={styles.modalPetImage}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.contentContainer}>
                        <View style={styles.detailsGrid}>
                            <DetailCard 
                                label="Age" 
                                value={`${pet.age} yrs`}
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
                                value={`${pet.weight} kg`}
                                icon="scale-bathroom"
                            />
                        </View>

                        <View style={styles.notesContainer}>
                            <View style={styles.notesHeader}>
                                <MaterialCommunityIcons name="text-box-outline" size={22} color="#8146C1" />
                                <Text style={styles.notesLabel}>Notes</Text>
                            </View>
                            <Text style={styles.notesValue}>
                                {pet.notes ? pet.notes.trim() : "No notes"}
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
        maxHeight: '85%',
        paddingBottom: 20,
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
    },
    modalPetImage: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        padding: 20,
        paddingTop: 15,
        gap: 16,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    detailCard: {
        width: '47%',
        backgroundColor: '#F8F8F8',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardLabel: {
        fontSize: 14,
        color: '#666',
        marginLeft: 8,
        fontWeight: '500',
    },
    cardValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginTop: 4,
        marginLeft: 30,
    },
    notesContainer: {
        backgroundColor: '#F8F8F8',
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
        fontSize: 15,
        color: '#333',
        lineHeight: 22,
        marginLeft: 30,
    },
});

export default PetDetailsModal; 