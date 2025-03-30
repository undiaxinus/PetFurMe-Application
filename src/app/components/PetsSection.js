import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    StyleSheet,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PetsSection = ({ 
    userPets, 
    isVerified, 
    isLoading,
    onPetPress,
    onAddNewPet,
    showVerificationAlert
}) => {
    // Add helper function to convert binary to base64
    const getBinaryPhotoSource = (pet) => {
        console.log('Pet data:', {
            id: pet.id,
            name: pet.name,
            hasPhoto: !!pet.photo,
            hasPhotoData: !!pet.photo_data,
            photoType: typeof pet.photo,
            photoDataType: typeof pet.photo_data
        });

        if (!pet.photo) return require("../../assets/images/doprof.png");
        
        try {
            // If it's already a base64 string, just use it
            return { uri: `data:image/jpeg;base64,${pet.photo}` };
        } catch (error) {
            console.error('Error processing photo:', error);
            return require("../../assets/images/doprof.png");
        }
    };

    return (
        <View style={styles.petsSection}>
            <View style={styles.petsSectionHeader}>
                <View style={styles.petsTitleContainer}>
                    <Ionicons name="paw" size={24} color="#8146C1" />
                    <Text style={styles.sectionTitle}>My Pets</Text>
                </View>
                <View style={styles.petsCountBadge}>
                    <Text style={styles.petsCountText}>{userPets.length}</Text>
                </View>
            </View>
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.petsScrollContainer}
            >
                {userPets.map((pet) => (
                    <TouchableOpacity 
                        onPress={() => onPetPress(pet)}
                        key={pet.id} 
                        style={[
                            styles.petItem,
                            !isVerified && styles.disabledItem
                        ]}
                    >
                        <View style={styles.petImageContainer}>
                            <Image
                                source={getBinaryPhotoSource(pet)}
                                style={styles.petImage}
                                defaultSource={require("../../assets/images/doprof.png")}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.petInfoContainer}>
                            <Text style={styles.petName}>{pet.name}</Text>
                            <View style={styles.petDetailsChip}>
                                <Text style={styles.petDetailsText}>Pet Details</Text>
                                <Ionicons name="paw" size={12} color="#8146C1" />
                            </View>
                        </View>
                        {!isVerified && (
                            <View style={styles.petLockOverlay}>
                                <Ionicons name="lock-closed" size={20} color="#FFFFFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
                <TouchableOpacity 
                    onPress={() => {
                        if (!isVerified) {
                            showVerificationAlert();
                            return;
                        }
                        onAddNewPet();
                    }}
                    style={[
                        styles.addPetItem,
                        !isVerified && styles.disabledItem
                    ]}
                >
                    <View style={styles.addPetContent}>
                        <View style={styles.addPetIconContainer}>
                            <Ionicons name="add-circle" size={32} color="#8146C1" />
                        </View>
                        <Text style={styles.addPetText}>Add New Pet</Text>
                        <Text style={styles.addPetSubtext}>Register your pet companion</Text>
                    </View>
                    {!isVerified && (
                        <View style={styles.verificationBadge}>
                            <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                        </View>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    petsSection: {
        marginTop: 20,
        marginBottom: 20,
        marginHorizontal: 16,
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF',
        paddingVertical: 20,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#8146C1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    petsSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        paddingHorizontal: 4,
    },
    petsTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333333",
        marginLeft: 0,
    },
    petsCountBadge: {
        backgroundColor: '#F8F2FF',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    petsCountText: {
        color: '#8146C1',
        fontSize: 14,
        fontWeight: 'bold',
    },
    petsScrollContainer: {
        paddingLeft: 4,
        paddingRight: 20,
        gap: 12,
    },
    petItem: {
        width: 140,
        height: 190,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        elevation: 3,
        shadowColor: '#8146C1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    petImageContainer: {
        width: '100%',
        height: 120,
        position: 'relative',
        backgroundColor: '#F8F2FF',
    },
    petImage: {
        width: '100%',
        height: '100%',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        resizeMode: 'contain',
    },
    petInfoContainer: {
        padding: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    petName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333333',
        marginBottom: 8,
        textAlign: 'center',
    },
    petDetailsChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F2FF',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
        alignSelf: 'center',
        gap: 4,
    },
    petDetailsText: {
        fontSize: 11,
        color: '#8146C1',
        fontWeight: '600',
    },
    disabledItem: {
        opacity: 0.7,
        position: 'relative',
    },
    petLockOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: -15 }],
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addPetItem: {
        width: 140,
        height: 190,
        borderRadius: 16,
        backgroundColor: '#F8F2FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#8146C1',
    },
    addPetContent: {
        alignItems: 'center',
        padding: 16,
    },
    addPetIconContainer: {
        marginBottom: 12,
    },
    addPetText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#8146C1',
        marginBottom: 4,
        textAlign: 'center',
    },
    addPetSubtext: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
    },
    verificationBadge: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -15 }, { translateY: -15 }],
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 15,
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PetsSection; 