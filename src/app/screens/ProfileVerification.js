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
const API_BASE_URL = `http://${SERVER_IP}/PetFurMe-Application`;

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
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user_id) {
            console.error('No user_id provided');
            Alert.alert('Error', 'User ID is missing');
            navigation.goBack();
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
            console.log("Fetching user data from:", url);

            const response = await axios.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                params: {
                    t: Date.now() // Cache busting
                }
            });

            console.log("Full API Response:", response.data);

            if (response.data.success && response.data.profile) {
                const userData = response.data.profile;
                
                // Update state with user data
                setName(userData.name || '');
                setEmail(userData.email || '');
                setPhoneNumber(userData.phone || '');
                setAge(userData.age ? userData.age.toString() : '');
                setStoreAddress(userData.address || '');

                // Handle photo
                if (userData.photo) {
                    const photoUrl = `${API_BASE_URL}/uploads/${userData.photo}`;
                    console.log("Photo URL:", photoUrl);
                    
                    setProfilePhoto({
                        uri: photoUrl,
                        headers: {
                            'Cache-Control': 'no-cache'
                        }
                    });
                }

                // Store in AsyncStorage
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
        setIsLoading(true);
        try {
            const formData = new FormData();
            
            if (profilePhoto?.uri && !profilePhoto.uri.startsWith('data:image')) {
                const localUri = profilePhoto.uri;
                const filename = localUri.split('/').pop();
                
                formData.append('photo', {
                    uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
                    type: 'image/jpeg',
                    name: filename || 'profile_photo.jpg'
                });
            }

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
                `${API_BASE_URL}/api/users/update_user_data.php`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            const result = await response.json();
            console.log('Profile update response:', result);

            if (result.success) {
                const activityResult = await logActivity(
                    ACTIVITY_TYPES.PROFILE_UPDATED,
                    user_id,
                    {
                        name: name.trim(),
                        email: email,
                        phone: phoneNumber,
                        age: age,
                        address: store_address,
                        hasPhoto: !!profilePhoto,
                        updatedFields: Object.entries({
                            name: name.trim(),
                            age: age,
                            address: store_address,
                            phone: phoneNumber,
                            email: email,
                            photo: profilePhoto ? 'photo' : null
                        })
                        .filter(([_, value]) => value)
                        .map(([key]) => key)
                    }
                );
                console.log('Activity logging result:', activityResult);

                const updatedDataResponse = await fetch(
                    `${API_BASE_URL}/api/users/get_user_data.php`,
                    {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache'
                        },
                        body: JSON.stringify({ user_id: user_id })
                    }
                );

                const updatedData = await updatedDataResponse.json();
                
                if (updatedData.success) {
                    await AsyncStorage.setItem('userData', JSON.stringify({
                        user_id,
                        ...updatedData.profile
                    }));
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
            Alert.alert('Error', 'Failed to update profile');
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

    return (
        <View style={styles.mainContainer}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#8146C1" />
                </View>
            )}
            
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile Settings</Text>
            </View>

            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
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

                    <View style={styles.rowInputs}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={styles.label}>Age</Text>
                            <View style={styles.inputWrapper}>
                                <Ionicons name="calendar-outline" size={20} color="#666" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                    placeholder="Age"
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { flex: 2 }]}>
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
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address</Text>
                        <View style={styles.inputWrapper}>
                            <Ionicons name="location-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={store_address}
                                onChangeText={setStoreAddress}
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
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        marginLeft: 16,
        color: '#333333',
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
    rowInputs: {
        flexDirection: 'row',
        alignItems: 'center',
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