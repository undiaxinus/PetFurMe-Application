import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const ActivityHistoryScreen = ({ navigation }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadActivities = async () => {
        try {
            const logs = await AsyncStorage.getItem('activityLogs');
            if (logs) {
                setActivities(JSON.parse(logs));
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading activity logs:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        loadActivities();
        // Refresh activities when screen is focused
        const unsubscribe = navigation.addListener('focus', loadActivities);
        return unsubscribe;
    }, [navigation]);

    const renderActivityItem = ({ item, index }) => (
        <View style={styles.activityItem}>
            <View style={styles.activityHeader}>
                <Text style={styles.activityText}>{item.action}</Text>
                <Text style={styles.timestamp}>
                    {new Date(item.timestamp).toLocaleString()}
                </Text>
            </View>
        </View>
    );

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
        backgroundColor: '#F8F8F8',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#8146C1',
    },
    activityHeader: {
        marginBottom: 4,
    },
    activityText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
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
});

export default ActivityHistoryScreen; 