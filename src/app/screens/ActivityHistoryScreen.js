import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ACTIVITY_TYPES } from '../utils/activityLogger';

const formatDetails = (type, details) => {
    if (!details) return { title: type, message: 'No details available' };
    
    try {
        switch (type) {
            case ACTIVITY_TYPES.PET_ADDED:
                return {
                    title: 'New Pet Added',
                    message: `Added new pet: ${details.petName}\n` +
                            `Type: ${details.petType}\n` +
                            `Breed: ${details.petBreed}\n` +
                            `Age: ${details.petAge}\n` +
                            `Gender: ${details.petGender}\n` +
                            `Size: ${details.details?.size || 'Not specified'}\n` +
                            `Weight: ${details.details?.weight || 'Not specified'}\n` +
                            `Allergies: ${details.details?.allergies || 'None'}\n` +
                            `Notes: ${details.details?.notes || 'None'}`
                };
            
            case ACTIVITY_TYPES.PET_UPDATED:
                const updatedFields = details.updatedFields || [];
                return {
                    title: `Updated ${details.name}'s Profile`,
                    message: updatedFields.length > 0 
                        ? `Changed fields:\n${updatedFields
                            .map(field => `• ${field.charAt(0).toUpperCase() + field.slice(1)}`)
                            .join('\n')}`
                        : 'Profile updated'
                };
            
            case ACTIVITY_TYPES.APPOINTMENT_BOOKED:
                return {
                    title: 'Appointment Booked',
                    message: `Booked appointment for ${details.petName}\n` +
                            `Date: ${details.date}\n` +
                            `Time: ${details.time}\n` +
                            `Reason: ${details.reasons}`
                };
            
            case ACTIVITY_TYPES.PROFILE_UPDATED:
                const profileFields = details.updatedFields || [];
                return {
                    title: 'Profile Updated',
                    message: profileFields.length > 0
                        ? `Updated fields:\n${profileFields
                            .map(field => `• ${field.charAt(0).toUpperCase() + field.slice(1)}`)
                            .join('\n')}`
                        : 'Profile information updated'
                };
            
            default:
                return {
                    title: type,
                    message: typeof details === 'object' ? JSON.stringify(details, null, 2) : String(details)
                };
        }
    } catch (error) {
        console.error('Error formatting details:', error);
        return {
            title: type || 'Activity',
            message: 'Error displaying details'
        };
    }
};

const ActivityHistoryScreen = ({ navigation, route }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = route.params?.user_id;

    useEffect(() => {
        console.log('ActivityHistoryScreen mounted with userId:', userId);
    }, []);

    const loadActivities = async () => {
        try {
            console.log('Loading activities for user:', userId);
            const logs = await AsyncStorage.getItem('activityLogs');
            console.log('Raw logs from storage:', logs);
            
            if (!userId) {
                console.error('No userId provided to ActivityHistoryScreen');
                setLoading(false);
                return;
            }

            if (logs) {
                const allActivities = JSON.parse(logs);
                console.log('All activities:', allActivities);
                
                if (!Array.isArray(allActivities)) {
                    console.error('Stored activities is not an array:', allActivities);
                    setActivities([]);
                    setLoading(false);
                    return;
                }

                const userActivities = allActivities.filter(activity => {
                    console.log('Comparing activity.userId:', activity.userId, 'with userId:', userId);
                    return String(activity.userId) === String(userId);
                });
                
                console.log('Filtered activities for user:', userActivities);
                
                const sortedActivities = userActivities.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                
                setActivities(sortedActivities);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading activity logs:', error);
            setLoading(false);
            setActivities([]);
        }
    };

    useEffect(() => {
        if (!userId) {
            console.log('No userId provided'); // Debug log
            return;
        }
        loadActivities();
        const unsubscribe = navigation.addListener('focus', loadActivities);
        return unsubscribe;
    }, [navigation, userId]);

    const renderActivityItem = ({ item, index }) => {
        const getFormattedDetails = () => {
            try {
                return formatDetails(item.type, item.details);
            } catch (error) {
                console.error('Error formatting details:', error);
                return {
                    title: item.type || 'Activity',
                    message: 'Error displaying details'
                };
            }
        };

        const formattedInfo = getFormattedDetails();

        return (
            <TouchableOpacity 
                style={styles.activityItem}
                onPress={() => {
                    Alert.alert(
                        formattedInfo.title,
                        `${formattedInfo.message}\n\nDate: ${new Date(item.timestamp).toLocaleString()}`,
                        [{ text: 'OK' }]
                    );
                }}
            >
                <View style={styles.activityHeader}>
                    <Text style={styles.activityType}>{formattedInfo.title}</Text>
                    <Text style={styles.timestamp}>
                        {new Date(item.timestamp).toLocaleString()}
                    </Text>
                </View>
                <Text style={styles.detailsPreview} numberOfLines={2}>
                    {formattedInfo.message}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Activity History</Text>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8146C1" />
                </View>
            ) : (
                <FlatList
                    data={activities}
                    renderItem={renderActivityItem}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={styles.listContainer}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No activities yet</Text>
                        </View>
                    )}
                />
            )}
        </View>
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
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginLeft: 16,
    },
    listContainer: {
        padding: 16,
    },
    activityItem: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    activityHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    activityType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8146C1',
        flex: 1,
    },
    timestamp: {
        fontSize: 12,
        color: '#666',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
    detailsPreview: {
        fontSize: 14,
        color: '#444',
        marginTop: 5,
    },
    touchIndicator: {
        marginTop: 8,
        alignItems: 'flex-end',
    },
    touchIndicatorText: {
        fontSize: 12,
        color: '#8146C1',
        fontStyle: 'italic',
    },
});

export default ActivityHistoryScreen;

// Add this function somewhere in your app for testing
const checkStoredActivities = async () => {
    try {
        const logs = await AsyncStorage.getItem('activityLogs');
        console.log('Stored Activities:', logs ? JSON.parse(logs) : 'No logs found');
    } catch (error) {
        console.error('Error checking stored activities:', error);
    }
}; 