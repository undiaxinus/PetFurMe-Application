import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HelpScreen = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const helpSections = [
    {
      question: 'What is "Pet Fur Me"?',
      answer:
        'Pet Fur Me is an app designed to help you manage your pet\'s needs, including medical records, appointments, and more.',
    },
    {
      question: 'Can I add multiple pets?',
      answer:
        'Yes, you can add multiple pets to your account and manage their information individually.',
    },
    {
      question: 'Can I edit or delete a pet\'s information?',
      answer:
        'Absolutely! You can edit or delete pet information anytime from the app.',
    },
    {
      question: 'How is my data protected?',
      answer:
        'We prioritize your privacy by using secure servers and encrypting your data to ensure its safety.',
    },
    {
      question: 'How do I schedule a vet appointment?',
      answer:
        'Go to your pet\'s profile, tap on "Appointments," and click the "+" button to schedule a new appointment. You can select the date, time, and vet clinic from the available options.',
    },
    {
      question: 'Can I share my pet\'s profile with others?',
      answer:
        'Yes! You can share your pet\'s profile with family members, pet sitters, or veterinarians. Just go to your pet\'s profile settings and use the "Share Profile" option.',
    },
    {
      question: 'How do I set medication reminders?',
      answer:
        'Navigate to your pet\'s "Health" section, select "Medications," and tap "Add Reminder." You can set the medication name, dosage, frequency, and reminder times.',
    },
    {
      question: 'What should I do if I forget my password?',
      answer:
        'Click on the "Forgot Password" link on the login screen. Enter your registered email address, and we\'ll send you instructions to reset your password.',
    },
    {
      question: 'How can I contact customer support?',
      answer:
        'You can reach our support team through the "Contact Us" section in the app, or email us at petfurme@gmail.com. We typically respond within 24 hours.',
    },
  ];

  const renderSection = ({ item, index }) => (
    <View
      style={[
        styles.section,
        expandedSection === index && styles.sectionExpanded,
      ]}
    >
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(index)}
      >
        <Text style={styles.sectionTitle}>{item.question}</Text>
        <Ionicons
          name={
            expandedSection === index ? 'chevron-up' : 'chevron-down'
          }
          size={20}
          color="#888888"
        />
      </TouchableOpacity>
      {expandedSection === index && (
        <View style={[styles.sectionContent, styles.expandedContentBorder]}>
          <Text style={styles.sectionText}>{item.answer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" top={15}/>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Help Center</Text>
          <Text style={styles.headerSubtitle}>Frequently Asked Questions</Text>
        </View>
      </View>

      {/* Help Sections */}
      <FlatList
        data={helpSections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderSection}
        contentContainerStyle={styles.listContainer}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('HomePage')}
        >
          <Ionicons name="home-outline" size={24} color="#8146C1" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('ChatScreen')}
        >
          <Ionicons name="chatbubble-outline" size={24} color="#8146C1" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('NotificationScreen')}
        >
          <Ionicons name="notifications-outline" size={24} color="#8146C1" />
          <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="help-circle" size={24} color="#8146C1" />
          <Text style={styles.navText}>Help</Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    borderBottomWidth: 1,
    backgroundColor: '#8146C1',
    height: 120,
  },
  headerTitleContainer: {
    alignContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    left: 85,
    top: 18,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#cccccc',
    marginTop: 2,
    top: 15,
    left: 85,
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  section: {
    backgroundColor: '#EDEDF5',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDEDF5',
    overflow: 'hidden',
  },
  sectionExpanded: {
    borderColor: '#8146C1',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  sectionContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  expandedContentBorder: {
    borderTopWidth: 1,
    borderColor: '#8146C1',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#000',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: '#8146C1',
  },
  navIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#8146C1',
    marginTop: 4,
  },
});

export default HelpScreen;
