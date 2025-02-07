import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import CustomHeader from '../components/CustomHeader';

const NotificationHelpScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <CustomHeader
        title="Notification Help"
        navigation={navigation}
        showBackButton={true}
      />
      <ScrollView style={styles.content}>
        <Text style={styles.title}>How to Enable Notifications</Text>
        
        {Platform.OS === 'web' ? (
          <>
            <Text style={styles.subtitle}>For Chrome:</Text>
            <Text style={styles.instruction}>1. Click the lock icon in the address bar</Text>
            <Text style={styles.instruction}>2. Find "Notifications" in the permissions list</Text>
            <Text style={styles.instruction}>3. Select "Allow"</Text>
            
            <Text style={styles.subtitle}>For Firefox:</Text>
            <Text style={styles.instruction}>1. Click the shield icon in the address bar</Text>
            <Text style={styles.instruction}>2. Select "Permissions"</Text>
            <Text style={styles.instruction}>3. Find and enable "Notifications"</Text>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>For iOS:</Text>
            <Text style={styles.instruction}>1. Open device Settings</Text>
            <Text style={styles.instruction}>2. Scroll down and find our app</Text>
            <Text style={styles.instruction}>3. Tap Notifications</Text>
            <Text style={styles.instruction}>4. Enable Allow Notifications</Text>
            
            <Text style={styles.subtitle}>For Android:</Text>
            <Text style={styles.instruction}>1. Open device Settings</Text>
            <Text style={styles.instruction}>2. Tap Apps & notifications</Text>
            <Text style={styles.instruction}>3. Find our app</Text>
            <Text style={styles.instruction}>4. Tap Notifications</Text>
            <Text style={styles.instruction}>5. Enable Show notifications</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
});

export default NotificationHelpScreen; 