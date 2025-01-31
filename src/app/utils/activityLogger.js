import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_LOGS = 50; // Maximum number of logs to keep

export const ACTIVITY_TYPES = {
    PET_ADDED: 'Added a new pet',
    PET_UPDATED: 'Updated pet profile',
    APPOINTMENT_BOOKED: 'Appointment Booked',
    PROFILE_UPDATED: 'Updated profile information',
    LOGIN: 'Logged in',
    LOGOUT: 'Logged out'
};

export const logActivity = async (type, userId, details) => {
    try {
        console.log('Logging activity:', { type, userId, details }); // Debug log
        
        // Validate inputs
        if (!type || !userId) {
            console.error('Missing required fields:', { type, userId });
            return false;
        }

        // Get existing logs
        const existingLogsString = await AsyncStorage.getItem('activityLogs');
        console.log('Existing logs:', existingLogsString); // Debug log
        
        const existingLogs = existingLogsString ? JSON.parse(existingLogsString) : [];
        
        if (!Array.isArray(existingLogs)) {
            console.error('Existing logs is not an array:', existingLogs);
            await AsyncStorage.removeItem('activityLogs'); // Reset corrupted data
        }

        const newActivity = {
            userId: userId,
            type: type,
            timestamp: new Date().toISOString(),
            details: details
        };

        // Keep only the last MAX_LOGS entries
        const updatedLogs = [...(Array.isArray(existingLogs) ? existingLogs : []), newActivity]
            .slice(-MAX_LOGS);

        console.log('Saving updated logs:', updatedLogs); // Debug log

        await AsyncStorage.setItem('activityLogs', JSON.stringify(updatedLogs));
        console.log('Activity logged successfully:', newActivity);
        
        // Verify the save
        const savedLogs = await AsyncStorage.getItem('activityLogs');
        console.log('Verified saved logs:', savedLogs); // Debug log
        
        return true;
    } catch (error) {
        console.error('Error logging activity:', error);
        return false;
    }
};

// Helper function to format details based on activity type
const formatDetails = (type, details) => {
    if (!details) return 'No details available';
    
    try {
        switch (type) {
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
                    message: `Booked appointment for ${details.petName}\nDate: ${details.date}\nTime: ${details.time}\nReason: ${details.reasons}`
                };
                
            case ACTIVITY_TYPES.PET_ADDED:
                return {
                    title: 'New Pet Added',
                    message: `Added new pet: ${details.petName}\n` +
                            `Type: ${details.petType}\n` +
                            `Breed: ${details.petBreed}\n` +
                            `Age: ${details.petAge}\n` +
                            `Gender: ${details.petGender}\n` +
                            `Size: ${details.details.size}\n` +
                            `Weight: ${details.details.weight}\n` +
                            `Allergies: ${details.details.allergies}\n` +
                            `Notes: ${details.details.notes}`
                };
                
            case ACTIVITY_TYPES.PROFILE_UPDATED:
                const fields = details.updatedFields || [];
                return {
                    title: 'Profile Updated',
                    message: fields.length > 0
                        ? `Updated fields:\n${fields
                            .map(field => `• ${field.charAt(0).toUpperCase() + field.slice(1)}`)
                            .join('\n')}`
                        : 'Profile information updated'
                };
                
            case ACTIVITY_TYPES.LOGIN:
                return {
                    title: 'Login Activity',
                    message: 'Successfully logged in'
                };
                
            case ACTIVITY_TYPES.LOGOUT:
                return {
                    title: 'Logout Activity',
                    message: 'Successfully logged out'
                };
                
            default:
                const detailsStr = typeof details === 'object' 
                    ? JSON.stringify(details, null, 2)
                    : String(details);
                return {
                    title: type || 'Activity',
                    message: detailsStr
                };
        }
    } catch (error) {
        console.error('Error formatting activity details:', error);
        return {
            title: type || 'Activity',
            message: 'Error displaying details'
        };
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

// Get activities for a specific user
export const getUserActivities = async (userId) => {
    try {
        const logsString = await AsyncStorage.getItem('activityLogs');
        const logs = logsString ? JSON.parse(logsString) : [];
        return logs.filter(log => log.userId === userId);
    } catch (error) {
        console.error('Error getting user activities:', error);
        return [];
    }
};

// Clear all activities for a specific user
export const clearUserActivities = async (userId) => {
    try {
        const logsString = await AsyncStorage.getItem('activityLogs');
        const logs = logsString ? JSON.parse(logsString) : [];
        const updatedLogs = logs.filter(log => log.userId !== userId);
        await AsyncStorage.setItem('activityLogs', JSON.stringify(updatedLogs));
        return true;
    } catch (error) {
        console.error('Error clearing user activities:', error);
        return false;
    }
}; 