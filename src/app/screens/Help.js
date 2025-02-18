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
import BottomNavigation from '../components/BottomNavigation';
import CustomHeader from '../components/CustomHeader';

const HelpScreen = ({ navigation }) => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const categories = [
    'All',
    'Getting Started',
    'Pet Management',
    'Health & Care',
    'Account & Support'
  ];

  const mostFrequentFAQs = [
    {
      question: '👋 Welcome to Pet Fur Me!',
      answer: 'Pet Fur Me is your all-in-one pet care companion. We help you track your pet\'s health, schedule appointments, set reminders, and store important documents - everything you need to be a great pet parent!'
    },
    {
      question: '🐾 How do I add my first pet?',
      answer: 'Getting started is easy! After creating your account, tap the "Add Pet" button on your homepage to create your first pet profile. Add a photo, basic information, and you\'re ready to explore all our features!'
    },
    {
      question: '🏥 How do I schedule vet visits?',
      answer: 'To schedule a vet visit:\n\n1. Go to your pet\'s profile\n2. Tap "Appointments"\n3. Click the "+" button\n4. Select date, time, and clinic\n5. Add any notes\n6. Save the appointment'
    }
  ];

  const helpSections = {
    'All': [
      ...mostFrequentFAQs,
      {
        question: '🐈 Can I add multiple pets?',
        answer: 'Yes! You can add as many pets as you\'d like. Each pet gets their own profile where you can track their specific needs, appointments, and health records.'
      },
      {
        question: '💊 Setting up medication reminders',
        answer: 'Never miss a dose! Set up medication reminders by:\n\n1. Going to your pet\'s "Health" section\n2. Selecting "Medications"\n3. Tapping "Add Reminder"\n4. Entering medication details and schedule\n5. Enabling notifications'
      },
      {
        question: '👥 Can I share my pet\'s profile?',
        answer: 'Yes! Easily share your pet\'s profile with family members, pet sitters, or veterinarians. Go to your pet\'s profile settings, tap "Share Profile," and choose how you\'d like to share it.'
      },
      {
        question: '📋 How do I track vaccinations?',
        answer: 'Keep track of vaccinations in the "Health Records" section. You can add new vaccines, set reminder dates for boosters, and store vaccination certificates.'
      },
      {
        question: '📧 Need help? Contact us!',
        answer: 'We\'re here to help! Reach us at:\n\n• Email: support@petfurme.com\n• In-app chat: Available 9AM-5PM EST\n• Help Center: help.petfurme.com\n\nWe typically respond within 24 hours.'
      }
    ],
    'Getting Started': [
      {
        question: '🐾 How do I get started?',
        answer: 'Getting started is easy! After creating your account, tap the "Add Pet" button on your homepage to create your first pet profile. Add a photo, basic information, and you\'re ready to explore all our features!'
      },
      {
        question: '📱 What features are available?',
        answer: 'Pet Fur Me offers:\n\n• Digital pet profiles\n• Health record tracking\n• Vet appointment scheduling\n• Medication reminders\n• Vaccination records\n• Photo gallery\n• Emergency contact storage\n• Sharing capabilities with family & vets'
      }
    ],
    'Pet Management': [
      {
        question: '📸 How do I update my pet\'s photo?',
        answer: 'Simply go to your pet\'s profile, tap on their current photo or the photo placeholder, and choose to either take a new photo or select one from your gallery.'
      }
    ],
    'Health & Care': [
      {
        question: '🏥 How do I schedule vet visits?',
        answer: 'To schedule a vet visit:\n\n1. Go to your pet\'s profile\n2. Tap "Appointments"\n3. Click the "+" button\n4. Select date, time, and clinic\n5. Add any notes\n6. Save the appointment'
      },
      {
        question: '💊 Setting up medication reminders',
        answer: 'Never miss a dose! Set up medication reminders by:\n\n1. Going to your pet\'s "Health" section\n2. Selecting "Medications"\n3. Tapping "Add Reminder"\n4. Entering medication details and schedule\n5. Enabling notifications'
      },
      {
        question: '📋 How do I track vaccinations?',
        answer: 'Keep track of vaccinations in the "Health Records" section. You can add new vaccines, set reminder dates for boosters, and store vaccination certificates.'
      }
    ],
    'Account & Support': [
      {
        question: '🔑 Password or login issues?',
        answer: 'If you\'re having trouble logging in, tap "Forgot Password" on the login screen and follow the reset instructions sent to your email. For other account issues, please contact our support team.'
      },
      {
        question: '📧 Need help? Contact us!',
        answer: 'We\'re here to help! Reach us at:\n\n• Email: support@petfurme.com\n• In-app chat: Available 9AM-5PM EST\n• Help Center: help.petfurme.com\n\nWe typically respond within 24 hours.'
      }
    ]
  };

  const renderSection = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.section,
        expandedSection === index && styles.sectionExpanded,
      ]}
      onPress={() => toggleSection(index)}
      activeOpacity={0.7}
    >
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{item.question}</Text>
        <Ionicons
          name={expandedSection === index ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#8146C1"
        />
      </View>
      {expandedSection === index && (
        <View style={styles.sectionContent}>
          <Text style={styles.sectionText}>{item.answer}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  const renderContent = () => {
    if (selectedCategory === 'All') {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.helpDescriptionContainer}>
            <Text style={styles.helpDescription}>
              Having trouble? We’re here—just send us a quick message!
            </Text>
          </View>
          <FlatList
            data={helpSections[selectedCategory]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderSection}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      );
    }

    return (
      <FlatList
        data={helpSections[selectedCategory]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderSection}
        contentContainerStyle={styles.listContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Help Center"
        subtitle="We're here to help!"
        navigation={navigation}
        showBackButton={true}
        showDrawerButton={true}
      />

      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {renderContent()}

      <BottomNavigation activeScreen="Help" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  categoryContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#F0E6FA',
  },
  categoryButtonActive: {
    backgroundColor: '#8146C1',
  },
  categoryText: {
    fontSize: 14,
    color: '#8146C1',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  section: {
    backgroundColor: '#F8F8FC',
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E8E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionExpanded: {
    borderColor: '#8146C1',
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    marginRight: 10,
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0E6FA',
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666666',
  },
  sectionHeaderContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#F0E6FA',
    marginTop: 10,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8146C1',
  },
  contentContainer: {
    flex: 1,
  },
  helpDescriptionContainer: {
    backgroundColor: '#F0E6FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  helpDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});

export default HelpScreen;
