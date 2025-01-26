import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_LOGS = 50; // Maximum number of logs to keep

export const ACTIVITY_TYPES = {
    PET_ADDED: 'Added a new pet',
    PET_UPDATED: 'Updated pet profile',
    APPOINTMENT_BOOKED: 'Booked an appointment',
    PROFILE_UPDATED: 'Updated profile information',
    LOGIN: 'Logged in',
    LOGOUT: 'Logged out'
};

export const logActivity = async (type, userId, details) => {
    try {
        const timestamp = new Date().toISOString();
        const activity = {
            userId: userId,
            action: type,
            details: details,
            timestamp: timestamp
        };
        
        console.log('Activity logged:', activity);
        // Get existing logs
        const existingLogsString = await AsyncStorage.getItem('activityLogs');
        const existingLogs = existingLogsString ? JSON.parse(existingLogsString) : [];

        // Add new log to the beginning of the array
        const updatedLogs = [activity, ...existingLogs];

        // Keep only the latest MAX_LOGS entries
        const trimmedLogs = updatedLogs.slice(0, MAX_LOGS);

        // Save back to AsyncStorage
        await AsyncStorage.setItem('activityLogs', JSON.stringify(trimmedLogs));

        return true;
    } catch (error) {
        console.error('Error logging activity:', error);
        return false;
    }
};

export const getActivityLogs = async (userId = null) => {
    try {
        const logsString = await AsyncStorage.getItem('activityLogs');
        const logs = logsString ? JSON.parse(logsString) : [];
        
        // If userId is provided, filter logs for that user
        return userId ? logs.filter(log => log.userId === userId) : logs;
    } catch (error) {
        console.error('Error getting activity logs:', error);
        return [];
    }
};

export const clearActivityLogs = async () => {
    try {
        await AsyncStorage.removeItem('activityLogs');
        return true;
    } catch (error) {
        console.error('Error clearing activity logs:', error);
        return false;
    }
}; 