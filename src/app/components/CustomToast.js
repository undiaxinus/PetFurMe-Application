import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const CustomToast = ({ message, type = 'success', onHide }) => {
    const translateY = new Animated.Value(-100);

    useEffect(() => {
        // Slide in
        Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
        }).start();

        // Auto hide after 3 seconds
        const timer = setTimeout(() => {
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start(() => onHide());
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateY }] },
                type === 'success' ? styles.success : styles.info
            ]}
        >
            <Text style={styles.message}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 16,
        margin: 16,
        borderRadius: 8,
        elevation: 4,
        zIndex: 1000,
    },
    success: {
        backgroundColor: '#4CAF50',
    },
    info: {
        backgroundColor: '#2196F3',
    },
    message: {
        color: '#FFFFFF',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default CustomToast; 