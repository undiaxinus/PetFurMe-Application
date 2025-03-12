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
import axios from 'axios';
import CustomHeader from '../components/CustomHeader';
const API_BASE_URL = `http://${SERVER_IP}/PetFurMe-Application`;

const ProfileVerification = ({ navigation, route }) => {
    const user_id = route.params?.user_id || 
                   route.params?.initial?.user_id || 
                   new URLSearchParams(window.location.search).get('user_id');
    
    const isTestMode = route.params?.testing || 
                      new URLSearchParams(window.location.search).get('testing') === 'true';

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('••••••••••');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!navigation) {
            console.error('Navigation prop is undefined');
            return;
        }
    }, [navigation]);

    useEffect(() => {
        if (!user_id) {
            console.error('No user_id provided');
            Alert.alert('Error', 'User ID is missing');
            return;
        }
        
        console.log('Initializing ProfileVerification with user_id:', user_id);
        fetchUserData();
    }, [user_id]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if (user_id) {
                fetchUserData();
            }
        });

        return unsubscribe;
    }, [navigation, user_id]);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const url = `${API_BASE_URL}/api/users/get_user_data.php?user_id=${user_id}`;
            const response = await axios.get(url);

            if (response.data.success && response.data.profile) {
                const userData = response.data.profile;
                
                setName(userData.name || '');
                setEmail(userData.email || '');
                setPhoneNumber(userData.phone || '');
                setAddress(userData.address || '');

                // Handle blob photo
                if (userData.photo) {
                    // Convert blob to base64
                    const base64Image = `data:image/jpeg;base64,${userData.photo}`;
                    setProfilePhoto({
                        uri: base64Image
                    });
                } else {
                    setProfilePhoto(null);
                }

                await AsyncStorage.setItem('userData', JSON.stringify({
                    user_id,
                    ...userData
                }));
            } else {
                throw new Error(response.data.message || 'Failed to load user data');
            }
        } catch (error) {
            console.error('Error in fetchUserData:', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError('Failed to fetch user data. Please try again.');
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
        try {
            setIsLoading(true);
            console.log('Starting update process...');

            // Validate only the truly required fields
            if (!name.trim()) {
                Alert.alert("Error", "Name is required.");
                return;
            }

            if (!email.trim()) {
                Alert.alert("Error", "Email is required.");
                return;
            }

            if (!phoneNumber.trim()) {
                Alert.alert("Error", "Phone number is required.");
                return;
            }

            console.log('Starting profile update');

            const formData = new FormData();
            const userData = {
                user_id: user_id,
                name: name?.trim(),
                address: address?.trim(),
                phone: phoneNumber?.trim(),
                email: email?.trim()
            };

            // Handle profile photo
            if (profilePhoto?.uri) {
                // For local files (from image picker)
                if (profilePhoto.uri.startsWith('file://')) {
                    formData.append('photo', {
                        uri: profilePhoto.uri,
                        type: 'image/jpeg',
                        name: 'user_photo.jpg'
                    });
                } 
                // For base64 images (from API or previous upload)
                else if (profilePhoto.uri.startsWith('data:image')) {
                    userData.photo_base64 = profilePhoto.uri.split(',')[1];
                }
            }

            formData.append('data', JSON.stringify(userData));

            const updateUrl = `${API_BASE_URL}/api/users/update_user_data.php`;
            const response = await axios.post(
                updateUrl,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('Profile update response:', response.data);

            if (response.data.success) {
                // Show success popup with different messages based on profile completion
                Alert.alert(
                    'Success',
                    response.data.updated_data?.complete_credentials === 1
                        ? '🎉 Hooray! Your profile is now complete! All features are now unlocked!'
                        : '✅ Profile updated successfully! Complete all fields to unlock all features.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navigate to HomePage after user clicks OK
                                if (navigation && !route.params?.testing) {
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ 
                                            name: 'DrawerNavigator',
                                            params: {
                                                screen: 'HomePage',
                                                params: { user_id: user_id }
                                            }
                                        }],
                                    });
                                }
                            }
                        }
                    ]
                );
                
                // Refresh user data to confirm update
                await fetchUserData();
            } else {
                throw new Error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateCredentials = async () => {
        setIsLoading(true);
        try {
            if (isEditingPassword && newPassword !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }

            const response = await fetch(
                `${API_BASE_URL}/api/users/update_credentials.php`,
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

    const handleNavigation = () => {
        if (navigation && !route.params?.testing) {
            navigation.navigate('DrawerNavigator', {
                screen: 'HomePage',
                params: { user_id: user_id }
            });
        }
    };

    return (
        <View style={styles.mainContainer}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#8146C1" />
                </View>
            )}
            
            <CustomHeader
                title="Profile Settings"
                onBack={handleNavigation}
                navigation={navigation}
            />

            <ScrollView 
                style={styles.container}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={true}
                bounces={true}
            >
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileImage}>
                            <Image
                                source={
                                    profilePhoto?.uri
                                        ? {
                                            uri: profilePhoto.uri,
                                            headers: profilePhoto.headers,
                                            cache: 'reload'
                                        }
                                        : require('../../assets/images/defphoto.png')
                                }
                                style={[styles.profilePhotoImage, { borderRadius: 70 }]}
                                onLoadStart={() => console.log('Starting image load:', profilePhoto?.uri)}
                                onLoadEnd={() => console.log('Finished image load')}
                                onError={(error) => {
                                    console.error('Image loading error:', error.nativeEvent.error);
                                    console.error('Failed URL:', profilePhoto?.uri);
                                    setProfilePhoto(null);
                                }}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.editPhotoButton}
                            onPress={pickImage}
                        >
                            <Ionicons name="camera" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your full name"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                                placeholder="Phone number"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Enter your address"
                            />
                        </View>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Account Settings</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                editable={isEditingEmail}
                                placeholder="Enter your email"
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
                        <View style={styles.inputWrapper}>
                            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1 }]}
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
                            <View style={[styles.inputWrapper, { marginTop: 8 }]}>
                                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={[styles.input, { flex: 1 }]}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    placeholder="Confirm new password"
                                />
                            </View>
                        )}
                    </View>

                    {(isEditingEmail || isEditingPassword) && (
                        <TouchableOpacity 
                            style={[styles.updateButton, styles.credentialsButton]}
                            onPress={handleUpdateCredentials}
                        >
                            <Text style={styles.updateButtonText}>Update Credentials</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={styles.updateButton}
                        onPress={handleUpdateInfo}
                    >
                        <Text style={styles.updateButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => {
                            setError(null);
                            fetchUserData();
                        }}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flexGrow: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#F9F5FF',
    },
    profileImageContainer: {
        position: 'relative',
    },
    profileImage: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#F5F5F5',
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: '#FFFFFF',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    profilePhotoImage: {
        width: '100%',
        height: '100%',
    },
    editPhotoButton: {
        position: 'absolute',
        right: -4,
        bottom: 8,
        backgroundColor: '#8146C1',
        borderRadius: 20,
        padding: 10,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        elevation: 4,
    },
    formContainer: {
        padding: 24,
        paddingTop: 0,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginVertical: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666666',
        marginBottom: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
    inputIcon: {
        padding: 12,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    editButton: {
        padding: 8,
        marginRight: 8,
        backgroundColor: '#F0E6FA',
        borderRadius: 8,
    },
    updateButton: {
        backgroundColor: '#8146C1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 24,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    credentialsButton: {
        backgroundColor: '#F0E6FA',
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 1000,
    },
    errorContainer: {
        padding: 16,
        backgroundColor: '#FFE5E5',
        margin: 16,
        borderRadius: 8,
    },
    errorText: {
        color: '#D32F2F',
        marginBottom: 8,
    },
    retryButton: {
        backgroundColor: '#8146C1',
        padding: 8,
        borderRadius: 4,
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default ProfileVerification; 