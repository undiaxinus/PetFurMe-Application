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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { API_BASE_URL } from '../../utils/config';
import { logActivity, ACTIVITY_TYPES } from '../utils/activityLogger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomHeader from '../components/CustomHeader';

const getApiUrl = (endpoint, params = {}) => {
    const queryString = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    return `${API_BASE_URL}/api/${endpoint}${queryString ? `?${queryString}` : ''}`;
};

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
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [error, setError] = useState(null);
    const [isVerified, setIsVerified] = useState(false);
    const [isSaveDisabled, setSaveDisabled] = useState(false);

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
            console.log("Fetching user data from:", url);

            const response = await axios.get(url);
            console.log("Full API Response:", response.data);

            if (response.data.success && response.data.profile) {
                const userData = response.data.profile;
                
                // Debug logs to verify the data
                console.log("Verification status:", {
                    verified_by: userData.verified_by,
                    isVerified: Boolean(userData.verified_by)
                });

                // Update state with user data
                setName(userData.name || '');
                setEmail(userData.email || '');
                setPhoneNumber(userData.phone || '');
                setAddress(userData.address || '');
                
                // Explicitly check verification status
                const verificationStatus = userData.verified_by !== null && userData.verified_by !== undefined;
                console.log("Setting verification status to:", verificationStatus);
                setIsVerified(verificationStatus);
                setSaveDisabled(verificationStatus);

                // Update photo handling logic
                try {
                    if (userData.photo_data || userData.photo) {  // Check for either photo_data or blob photo
                        console.log("Loading photo from database");
                        const photoData = userData.photo_data || userData.photo;
                        
                        if (typeof photoData === 'string' && photoData.startsWith('data:image')) {
                            // If it's already a base64 data URL
                            setProfilePhoto({
                                uri: photoData,
                                headers: {
                                    'Cache-Control': 'no-cache'
                                }
                            });
                        } else {
                            // Convert blob/binary data to base64
                            setProfilePhoto({
                                uri: `data:image/jpeg;base64,${photoData}`,
                                headers: {
                                    'Cache-Control': 'no-cache'
                                }
                            });
                        }
                        console.log("Successfully loaded photo from database");
                    } else {
                        console.log("No photo data in database");
                        setProfilePhoto(null);
                    }
                } catch (error) {
                    console.error("Error setting user photo:", error);
                    setProfilePhoto(null);
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
            console.log('Starting profile update with data:', {
                name,
                address,
                phoneNumber,
                email,
                profilePhoto: profilePhoto ? 'Present (not shown)' : null
            });

            const formData = new FormData();
            
            // Only include fields that have values
            const userData = {};
            
            if (name !== undefined) userData.name = name.trim();
            if (address !== undefined) userData.address = address.trim();
            if (phoneNumber !== undefined) userData.phone = phoneNumber.trim();
            if (email !== undefined) userData.email = email.trim();
            userData.user_id = user_id;

            // Handle profile photo - store as binary data in photo_data column
            if (profilePhoto?.uri) {
                const localUri = profilePhoto.uri;
                
                // Handle base64 image
                if (localUri.startsWith('data:image')) {
                    // Image is already in base64 format
                    const base64Data = localUri.split(',')[1];
                    userData.photo_data = base64Data; // Send base64 data directly
                    userData.photo_data_format = 'base64';
                    console.log("Base64 image data length:", base64Data.length);
                } else {
                    // Convert file URI to base64
                    try {
                        let response;
                        if (Platform.OS === 'web') {
                            // For web, fetch the image and convert to base64
                            response = await fetch(localUri);
                            const blob = await response.blob();
                            console.log("Image blob size:", blob.size, "bytes");
                            
                            const reader = new FileReader();
                            
                            // Create a promise to handle the FileReader async operation
                            const base64 = await new Promise((resolve) => {
                                reader.onloadend = () => {
                                    const base64data = reader.result;
                                    // Get just the base64 part without the prefix
                                    const base64Only = base64data.split(',')[1];
                                    console.log("Converted image to base64, length:", base64Only.length);
                                    resolve(base64Only);
                                };
                                reader.readAsDataURL(blob);
                            });
                            
                            userData.photo_data = base64;
                            userData.photo_data_format = 'base64';
                        } else {
                            // For native apps, use react-native-fs or similar libraries 
                            // to read the file as base64
                            // This is a placeholder - actual implementation depends on available libraries
                            console.log('Converting image to base64 on native platform');
                            
                            // Still include file in formData for fallback
                            const filename = localUri.split('/').pop();
                            formData.append('photo', {
                                uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
                                type: 'image/jpeg',
                                name: filename
                            });
                            
                            // Set flag to use fallback method if base64 conversion isn't available
                            userData.use_fallback_photo = true;
                        }
                    } catch (error) {
                        console.error('Error converting image to base64:', error);
                        // Fallback to traditional file upload
                        const filename = localUri.split('/').pop();
                        formData.append('photo', {
                            uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
                            type: 'image/jpeg',
                            name: filename
                        });
                        userData.use_fallback_photo = true;
                    }
                }
                
                console.log('Photo data prepared for database storage');
            }

            // Test sending image data directly to fix script if binary data is available
            if (userData.photo_data) {
                console.log("Sending photo data to fix script...");
                
                try {
                    // Create a simpler form with just the base64 data for our fix script
                    const testFormData = new FormData();
                    testFormData.append('photo_data', userData.photo_data);
                    
                    const fixUrl = `${API_BASE_URL}/api/users/fix_photo_data.php?user_id=${user_id}`;
                    console.log("Posting to fix script:", fixUrl);
                    
                    const testResponse = await axios.post(fixUrl, testFormData);
                    console.log("Fix script response:", testResponse.data);
                    
                    if (testResponse.data.success) {
                        console.log("Photo data fixed successfully! Length in DB:", testResponse.data.data_length);
                        // Continue with the rest of profile update without photo
                        delete userData.photo_data;
                    }
                } catch (error) {
                    console.error("Error in fix script:", error);
                    // Continue with regular update
                }
            }

            console.log('Sending user data:', {
                ...userData, 
                photo_data: userData.photo_data ? 
                    `[BINARY_DATA (${userData.photo_data.length} chars)]` : null
            });
            
            formData.append('data', JSON.stringify(userData));

            const updateUrl = `${API_BASE_URL}/api/users/update_user_data.php`;
            console.log('Sending update request to:', updateUrl);

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
            
            // Add additional response debugging
            if (response.data.photo_data_size) {
                console.log('Photo binary size stored in database:', 
                    response.data.photo_data_size, 'bytes');
            }

            if (response.data.success) {
                // Prepare update details
                const updatedFields = [];
                if (name) updatedFields.push('name');
                if (address) updatedFields.push('address');
                if (phoneNumber) updatedFields.push('phone number');
                if (email) updatedFields.push('email');
                if (profilePhoto) updatedFields.push('profile photo');

                // Navigate to HomePage with update details
                if (navigation && !route.params?.testing) {
                    navigation.reset({
                        index: 0,
                        routes: [{ 
                            name: 'DrawerNavigator',
                            params: {
                                screen: 'HomePage',
                                params: { 
                                    user_id: user_id,
                                    updateDetails: `Updated fields: ${updatedFields.join(', ')}`
                                }
                            }
                        }],
                    });
                }
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
                        email: undefined,
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
                            isEditingPassword && 'password'
                        ].filter(Boolean)
                    }
                );

                Alert.alert('Success', 'Credentials updated successfully');
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

    const validateProfileData = () => {
        const requiredFields = [
            { field: name, name: 'Name' },
            { field: email, name: 'Email' },
            { field: phoneNumber, name: 'Phone number' },
            { field: address, name: 'Address' }  // Changed from profilePhoto to address
        ];
        
        const missingFields = requiredFields
            .filter(item => !item.field || item.field.trim() === '')
            .map(item => item.name);
        
        if (missingFields.length > 0) {
            Alert.alert(
                'Incomplete Profile',
                `Please fill in the following required fields: ${missingFields.join(', ')}`
            );
            return false;
        }
        
        return true;
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
                showsVerticalScrollIndicator={true}
                bounces={true}
            >
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <View style={styles.profileImage}>
                            {profilePhoto ? (
                                <Image
                                    source={profilePhoto}
                                    style={styles.profilePhotoImage}
                                    onLoad={() => console.log('Finished image load')}
                                    onError={(e) => console.error('Error loading image:', e.nativeEvent.error)}
                                />
                            ) : (
                                <Image
                                    source={require('../../../uploads/defaults/avatar.png')}
                                    style={styles.profilePhotoImage}
                                />
                            )}
                        </View>
                        <TouchableOpacity
                            style={styles.editPhotoButton}
                            onPress={pickImage}
                            disabled={isVerified}
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
                        <View style={[styles.inputWrapper, styles.nonEditableInput]}>
                            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { flex: 1, color: '#666' }]}
                                value={email}
                                editable={false}
                                placeholder="Enter your email"
                            />
                            <Ionicons 
                                name="lock-closed" 
                                size={16} 
                                color="#666" 
                                style={styles.lockIcon}
                            />
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
                                <MaterialCommunityIcons 
                                    name={isEditingPassword ? "check-circle" : "pencil-circle"} 
                                    size={24} 
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

                    {(isEditingPassword) && (
                        <TouchableOpacity 
                            style={[styles.updateButton, styles.credentialsButton]}
                            onPress={handleUpdateCredentials}
                        >
                            <Text style={styles.updateButtonText}>Update Credentials</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity 
                        style={[
                            styles.updateButton,
                            (isVerified || isSaveDisabled) && styles.disabledButton
                        ]}
                        onPress={handleUpdateInfo}
                        disabled={isVerified || isSaveDisabled}
                    >
                        <Text style={[
                            styles.updateButtonText,
                            (isVerified || isSaveDisabled) && styles.disabledButtonText
                        ]}>
                            {isVerified ? 'Account Verified' : 'Save Changes'}
                        </Text>
                        {isVerified && (
                            <View style={styles.verificationBadge}>
                                <Ionicons name="checkmark-circle" size={20} color="#666666" style={styles.verifiedIcon} />
                            </View>
                        )}
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
    nonEditableInput: {
        backgroundColor: '#F5F5F5',
        borderColor: '#E0E0E0',
    },
    lockIcon: {
        marginRight: 12,
        opacity: 0.5
    },
    disabledButton: {
        backgroundColor: '#E0E0E0',
        elevation: 0,
        opacity: 0.7,
        borderWidth: 1,
        borderColor: '#D0D0D0',
    },
    disabledButtonText: {
        color: '#666666',
    },
    verificationBadge: {
        position: 'absolute',
        right: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    verifiedIcon: {
        marginLeft: 8,
    }
});

export default ProfileVerification; 