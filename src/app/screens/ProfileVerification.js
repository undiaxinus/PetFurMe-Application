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

const API_BASE_URL = 'http://192.168.1.3';

const ProfileVerification = ({ navigation, route }) => {
    const { user_id } = route.params;
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [address, setAddress] = useState('');
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
            const url = `${API_BASE_URL}/PetFurMe-Application/api/users/get_user_data.php?user_id=${user_id}`;
            console.log("Fetching user data from:", url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
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
                setAddress(userData.address || '');
                setPhoneNumber(userData.phone || '');
                setEmail(userData.email || '');

                // Handle the photo data
                if (userData.photo) {
                    try {
                        const cleanBase64 = userData.photo.replace(/[\r\n\s]/g, '');
                        
                        // Check if it's a valid base64 string
                        if (cleanBase64.match(/^[A-Za-z0-9+/=]+$/)) {
                            setProfilePhoto({
                                uri: `data:image/jpeg;base64,${cleanBase64}`,
                                base64: cleanBase64,
                                width: 120,
                                height: 120
                            });
                            console.log("Photo loaded successfully as base64");
                        } else {
                            // If not base64, treat as URL
                            const photoUrl = cleanBase64.startsWith('http') 
                                ? cleanBase64 
                                : `${API_BASE_URL}/PetFurMe-Application/${cleanBase64}`;
                            
                            setProfilePhoto({
                                uri: photoUrl,
                                width: 120,
                                height: 120
                            });
                            console.log("Photo loaded successfully as URL:", photoUrl);
                        }
                    } catch (error) {
                        console.error("Error setting photo:", error);
                        setProfilePhoto(null);
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
                base64: true,
            });

            if (!result.canceled) {
                const base64Size = result.assets[0].base64.length * 0.75;
                const maxSize = 2 * 1024 * 1024;

                if (base64Size > maxSize) {
                    Alert.alert(
                        'Image Too Large',
                        'Please select an image smaller than 2MB',
                        [{ text: 'OK' }]
                    );
                    return;
                }

                setProfilePhoto({
                    uri: result.assets[0].uri,
                    base64: result.assets[0].base64,
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
            if (profilePhoto?.base64) {
                // Create a Blob from base64
                const imageData = profilePhoto.base64;
                formData.append('photo', {
                    uri: profilePhoto.uri,
                    type: 'image/jpeg',
                    name: 'profile_photo.jpg'
                });
            }

            // Add user data
            const userData = {
                user_id,
                name,
                age: age ? parseInt(age) : null,
                address,
                phone: phoneNumber,
                email
            };
            formData.append('data', JSON.stringify(userData));

            console.log('Sending form data:', formData._parts);

            const response = await fetch(
                `${API_BASE_URL}/PetFurMe-Application/api/users/update_user_data.php`,
                {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            const result = await response.json();
            console.log('Update response:', result);

            if (result.success) {
                Alert.alert('Success', 'Profile updated successfully');
                navigation.goBack();
            } else {
                throw new Error(result.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', 'Failed to update profile');
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
                            profilePhoto?.uri
                                ? {
                                    uri: profilePhoto.uri,
                                    cache: 'force-cache',
                                    headers: {
                                        Pragma: 'no-cache'
                                    }
                                }
                                : require('../../assets/images/profile.png')
                        }
                                style={styles.profilePhotoImage}
                        resizeMode="cover"
                        defaultSource={require('../../assets/images/profile.png')}
                        onError={(error) => {
                            console.error('Image loading error:', error.nativeEvent);
                            console.log('Current photoSource:', profilePhoto);
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
                        value={address}
                        onChangeText={setAddress}
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