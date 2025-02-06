import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CompleteProfileBar = ({ onPress, style }) => {
    return (
        <TouchableOpacity 
            style={[styles.setupBanner, styles.setupBannerHighlight, style]}
            onPress={onPress}
        >
            <View style={styles.setupBannerContent}>
                <View style={styles.setupIconContainer}>
                    <Ionicons name="person-circle-outline" size={40} color="#8146C1" />
                    <View style={styles.setupIconBadge}>
                        <Ionicons name="alert-circle" size={20} color="#FF8ACF" />
                    </View>
                </View>
                <View style={styles.setupTextContainer}>
                    <Text style={styles.setupTitle}>Complete Profile</Text>
                    <Text style={styles.setupSubtitle}>Required to access all features</Text>
                </View>
                <Ionicons name="chevron-forward-circle" size={24} color="#8146C1" />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    setupBanner: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        marginVertical: 10,
        borderRadius: 12,
        padding: 12,
        elevation: 3,
        borderWidth: 2,
        borderColor: '#8146C1',
        shadowColor: '#8146C1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    setupBannerHighlight: {
        transform: [{ scale: 1.02 }],
    },
    setupBannerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    setupIconContainer: {
        position: 'relative',
        width: 45,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
    },
    setupIconBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 2,
    },
    setupTextContainer: {
        flex: 1,
        marginHorizontal: 12,
    },
    setupTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#8146C1',
        marginBottom: 2,
    },
    setupSubtitle: {
        fontSize: 12,
        color: '#666666',
        fontWeight: '500',
    },
});

export default CompleteProfileBar; 