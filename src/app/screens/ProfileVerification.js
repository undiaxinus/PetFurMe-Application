import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BASE_URL, SERVER_IP, SERVER_PORT } from '../config/constants';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = `http://${SERVER_IP}`;

const ProfileVerification = ({ navigation, route }) => {
    const { user_id } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [store_address, setStoreAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('••••••••••');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, [user_id]);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const url = `${API_BASE_URL}/PetFurMe-Application/api/users/get_user_data.php?user_id=${user_id}&t=${Date.now()}`;
            console.log("Fetching user data from:", url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("User data response:", data);

            if (data.success) {
                const userData = data.profile || data.data;
                setName(userData.name || '');
                setAge(userData.age ? userData.age.toString() : '');
                setStoreAddress(userData.store_address || userData.address || '');
                setPhoneNumber(userData.phone || '');
                setEmail(userData.email || '');

                // Handle the photo data
                if (userData.photo) {
                    if (userData.photo.startsWith('data:image')) {
                        // It's a base64 image
                        setProfilePhoto({
                            uri: userData.photo,
                            isBase64: true,
                            width: 120,
                            height: 120
                        });
                    } else if (userData.photo.startsWith('http')) {
                        // It's a URL
                        setProfilePhoto({
                            uri: userData.photo,
                            width: 120,
                            height: 120
                        });
                    } else {
                        // It's a relative path
                        const photoUrl = `${API_BASE_URL}/PetFurMe-Application/uploads/${userData.photo}`;
                        setProfilePhoto({
                            uri: photoUrl,
                            width: 120,
                            height: 120
                        });
                    }
                } else {
                    setProfilePhoto(null);
                }
            } else {
                throw new Error(data.message || 'Failed to load user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert('Error', 'Failed to fetch user data');
        } finally {
            setIsLoading(false);
        }
    };

    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            
            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'You need to grant access to your photos to upload a profile picture.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
            });

            if (!result.canceled) {
                const asset = result.assets[0];
                setProfilePhoto({
                    uri: asset.uri,
                    width: 120,
                    height: 120
                });
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleUpdateInfo = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            
            // Add photo if selected
            if (profilePhoto?.uri && !profilePhoto.uri.startsWith('data:image')) {
                const localUri = profilePhoto.uri;
                const filename = localUri.split('/').pop();
                
                formData.append('photo', {
                    uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
                    type: 'image/jpeg',
                    name: filename || 'profile_photo.jpg'
                });
            }

            // Add user data
            const userData = {
                user_id: user_id,
                name: name.trim(),
                age: age ? parseInt(age) : null,
                store_address: store_address.trim(),
                phone: phoneNumber.trim(),
                email: email.trim()
            };

            formData.append('data', JSON.stringify(userData));
            console.log('Sending form data:', JSON.stringify(userData));

            const response = await fetch(
                `${API_BASE_URL}/PetFurMe-Application/api/users/update_user_data.php`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const result = await response.json();

            if (result.success) {
                // Log the activity
                await logActivity(
                    ACTIVITY_TYPES.PROFILE_UPDATED,
                    user_id,
                    {
                        name: name.trim(),
                        updatedFields: [
                            'name',
                            age && 'age',
                            store_address && 'address',
                            phoneNumber && 'phone number',
                            profilePhoto && 'profile photo'
                        ].filter(Boolean)
                    }
                );

                // Fetch updated user data
                const updatedDataResponse = await fetch(
                    `${API_BASE_URL}/PetFurMe-Application/api/users/get_user_data.php?user_id=${user_id}&t=${Date.now()}`,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache, no-store, must-revalidate'
                        }
                    }
                );

                const updatedData = await updatedDataResponse.json();
                
                if (updatedData.success) {
                    // Store the updated profile data in local storage
                    try {
                        const storedUserData = await AsyncStorage.getItem('userData');
                        const currentUserData = storedUserData ? JSON.parse(storedUserData) : {};
                        
                        const newUserData = {
                            ...currentUserData,
                            user_id: user_id, // Ensure user_id is included
                            ...updatedData.profile,
                            photo: updatedData.profile.photo || currentUserData.photo
                        };

                        console.log('Storing updated user data:', newUserData);
                        
                        await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
                        console.log('Updated profile stored in local storage');
                    } catch (storageError) {
                        console.error('Error storing updated profile:', storageError);
                    }
                }

                Alert.alert('Success', 'Profile updated successfully', [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (route.params?.onComplete) {
                                route.params.onComplete();
                            }
                            navigation.goBack();
                        }
                    }
                ]);
            } else {
                throw new Error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCredentials = async () => {
        setIsLoading(true);
        try {
            // Validate passwords match if updating password
            if (isEditingPassword && newPassword !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/PetFurMe-Application/api/users/update_credentials.php`,
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_id,
                        email: isEditingEmail ? email : undefined,
                        password: isEditingPassword ? newPassword : undefined
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Log the credentials update activity
                await logActivity(
                    ACTIVITY_TYPES.PROFILE_UPDATED,
                    user_id,
                    {
                        updatedFields: [
                            isEditingEmail && 'email',
                            isEditingPassword && 'password'
                        ].filter(Boolean)
                    }
                );

                Alert.alert('Success', 'Credentials updated successfully');
                setIsEditingEmail(false);
                setIsEditingPassword(false);
                setNewPassword('');
                setConfirmPassword('');
            } else {
                Alert.alert('Error', data.message || 'Failed to update credentials');
            }
        } catch (error) {
            console.error('Error updating credentials:', error);
            Alert.alert('Error', 'Failed to update credentials: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#8146C1" />
                </View>
            )}
            
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Account Information</Text>
            </View>

            {/* Profile Image Section */}
            <View style={styles.profileImageContainer}>
                <View style={styles.profileImage}>
                    <Image
                        source={
                            profilePhoto?.isBase64 
                                ? { uri: profilePhoto.uri }
                                : profilePhoto?.uri 
                                    ? { 
                                        uri: profilePhoto.uri,
                                        headers: {
                                            'Cache-Control': 'no-cache'
                                        }
                                    } 
                                    : require('../../assets/images/defphoto.png')
                        }
                        style={styles.profilePhotoImage}
                        resizeMode="cover"
                        onError={(error) => {
                            console.error('Image loading error:', error.nativeEvent.error);
                            setProfilePhoto(null); // Reset on error
                        }}
                    />
                </View>
                <TouchableOpacity
                    style={styles.editPhotoButton}
                    onPress={pickImage}
                >
                    <Ionicons name="camera" size={20} color="#8146C1" />
                </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                        style={styles.input}
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Address</Text>
                    <TextInput
                        style={styles.input}
                        value={store_address}
                        onChangeText={setStoreAddress}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.emailContainer}>
                        <TextInput
                            style={[styles.input, styles.emailInput]}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            editable={isEditingEmail}
                        />
                        <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => setIsEditingEmail(!isEditingEmail)}
                        >
                            <Ionicons 
                                name={isEditingEmail ? "checkmark" : "pencil"} 
                                size={20} 
                                color="#8146C1" 
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.emailContainer}>
                        <TextInput
                            style={[styles.input, styles.emailInput]}
                            value={isEditingPassword ? newPassword : '••••••••••'}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            editable={isEditingPassword}
                            placeholder={isEditingPassword ? "Enter new password" : ""}
                        />
                        <TouchableOpacity 
                            style={styles.editButton}
                            onPress={() => setIsEditingPassword(!isEditingPassword)}
                        >
                            <Ionicons 
                                name={isEditingPassword ? "checkmark" : "pencil"} 
                                size={20} 
                                color="#8146C1" 
                            />
                        </TouchableOpacity>
                    </View>
                    {isEditingPassword && (
                        <TextInput
                            style={[styles.input, { marginTop: 8 }]}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="Confirm new password"
                        />
                    )}
                </View>

                {(isEditingEmail || isEditingPassword) && (
                    <TouchableOpacity 
                        style={[styles.updateButton, { marginTop: 16 }]}
                        onPress={handleUpdateCredentials}
                    >
                        <Text style={styles.updateButtonText}>Update Credentials</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity 
                    style={styles.updateButton}
                    onPress={handleUpdateInfo}
                >
                    <Text style={styles.updateButtonText}>Update Account Information</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    backButton: {
        padding: 8,
        marginLeft: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        marginLeft: 24,
        color: '#333333',
    },
    profileImageContainer: {
        alignItems: 'center',
        marginVertical: 24,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#8146C1',
    },
    formContainer: {
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        backgroundColor: '#FAFAFA',
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderWidth: 1.5,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingRight: 8,
    },
    emailInput: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    editButton: {
        padding: 8,
        backgroundColor: '#F0E6FA',
        borderRadius: 8,
    },
    updateButton: {
        backgroundColor: '#8146C1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    editPhotoButton: {
        position: 'absolute',
        right: 120,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 10,
        borderWidth: 2,
        borderColor: '#8146C1',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    profilePhotoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 60,
    },
    loadingOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1000,
    },
});

export default ProfileVerification; 