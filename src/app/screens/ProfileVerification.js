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

const API_BASE_URL = 'http://192.168.0.110';

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

            // Get the raw response text first
            const responseText = await response.text();
            console.log("Raw response:", responseText);

            // Try to parse it as JSON
            let data;
            try {
                data = JSON.parse(responseText);
                console.log("Parsed data:", data);
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                console.error("Received non-JSON response:", responseText);
                throw new Error("Server returned invalid JSON");
            }

            if (data.success) {
                const userData = data.profile || data.data;
                setName(userData.name || '');
                setAge(userData.age ? userData.age.toString() : '');
                setAddress(userData.address || '');
                setPhoneNumber(userData.phone || '');
                setEmail(userData.email || '');
            } else {
                throw new Error(data.message || 'Failed to fetch user data');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            Alert.alert(
                'Error',
                'Failed to load user information. Please check your connection and try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPhoto = async () => {
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
                // Check file size
                const response = await fetch(result.assets[0].uri);
                const blob = await response.blob();
                const fileSize = blob.size;
                const maxSize = 2 * 1024 * 1024; // 2MB in bytes

                if (fileSize > maxSize) {
                    Alert.alert(
                        'Image Too Large',
                        'Please select an image smaller than 2MB. You can try reducing the image size or selecting a different image.',
                        [{ text: 'OK' }]
                    );
                    return;
                }

                console.log('Selected photo:', {
                    uri: result.assets[0].uri,
                    size: fileSize / 1024 / 1024 + 'MB'
                });
                setProfilePhoto(result.assets[0]);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image. Please try again with a smaller image.');
        }
    };

    const handleUpdateInfo = async () => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            
            // Add photo if selected
            if (profilePhoto) {
                const localUri = profilePhoto.uri;
                const filename = localUri.split('/').pop();
                
                formData.append('photo', {
                    uri: Platform.OS === 'android' ? localUri : localUri.replace('file://', ''),
                    type: 'image/jpeg',
                    name: filename
                });
                
                console.log('Photo being uploaded:', {
                    uri: localUri,
                    type: 'image/jpeg',
                    name: filename
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
                    }
                }
            );

            // Log response headers and status
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            const responseText = await response.text();
            console.log('Raw response:', responseText);

            try {
                const data = JSON.parse(responseText);
                if (data.success) {
                    Alert.alert('Success', 'Profile updated successfully');
                    navigation.goBack();
                } else {
                    Alert.alert('Error', data.message || 'Failed to update profile');
                }
            } catch (parseError) {
                console.error('Error parsing response:', parseError);
                Alert.alert('Error', 'Invalid server response');
            }
        } catch (error) {
            console.error('Error updating user data:', error);
            Alert.alert('Error', 'Failed to update profile. Please try again.');
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
                <TouchableOpacity onPress={handleSelectPhoto}>
                    <View style={styles.profileImage}>
                        {profilePhoto ? (
                            <Image
                                source={{ uri: profilePhoto.uri }}
                                style={styles.profilePhotoImage}
                            />
                        ) : (
                            <Ionicons name="person-circle-outline" size={100} color="#8146C1" />
                        )}
                    </View>
                    <View style={styles.editPhotoButton}>
                        <Ionicons name="camera" size={20} color="#8146C1" />
                    </View>
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
        paddingTop: 40,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F0F0F0',
    },
    editImageButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 8,
        borderWidth: 1,
        borderColor: '#FF1493',
    },
    formContainer: {
        padding: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#333333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    emailContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emailInput: {
        flex: 1,
        marginRight: 8,
    },
    editButton: {
        padding: 8,
    },
    updateButton: {
        backgroundColor: '#FF1493',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
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
    profilePhotoImage: {
        width: '100%',
        height: '100%',
        borderRadius: 75,
    },
    editPhotoButton: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 5,
        borderWidth: 1,
        borderColor: '#8146C1',
    }
});

export default ProfileVerification; 