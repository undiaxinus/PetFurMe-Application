import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Image, Platform, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../components/BottomNavigation';
import CustomHeader from '../components/CustomHeader';
import axios from 'axios';
import { SERVER_IP, API_BASE_URL, getApiUrl } from '../config/constants';  // Add getApiUrl here
import AsyncStorage from '@react-native-async-storage/async-storage';


const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  }
});

const logMessage = (message) => {
  console.log(`[ChatScreen] ${message}`);
};

const ChatScreen = ({ navigation, route }) => {
  const user_id = route.params?.user_id;
  const [isVerified, setIsVerified] = useState(false);

  // Start in live chat mode by default since we want to show database messages
  const [isAutomated, setIsAutomated] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Add polling interval state
  const [pollingInterval, setPollingInterval] = useState(null);

  // Add a new state for temporary message notice
  const [showTempNotice, setShowTempNotice] = useState(false);

  // Add separate states for bot and live messages
  const [botMessages, setBotMessages] = useState([]);
  const [liveMessages, setLiveMessages] = useState([]);

  // Add this useEffect to check verification status
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const storedVerification = await AsyncStorage.getItem('isVerified');
        if (storedVerification !== null) {
          setIsVerified(JSON.parse(storedVerification));
        }
      } catch (error) {
        console.error('Error reading verification status:', error);
      }
    };

    checkVerificationStatus();
  }, []);

  // Add this near your other state declarations
  const [error, setError] = useState(null);

  // Modify the fetchMessages function
  const fetchMessages = async () => {
    try {
      setError(null);
      
      // Use the direct URL to eliminate any path construction issues
      const url = `${API_BASE_URL}/messages/get_messages.php?user_id=${user_id}`;
      console.log('Fetching messages from:', url);
      
      const response = await axios.get(url, {
        timeout: 15000,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

      console.log('Messages response status:', response.status);
      console.log('Messages response data:', response.data);

      if (response.data && response.data.success) {
        if (!response.data.messages || response.data.messages.length === 0) {
          console.log('No messages found for user:', user_id);
          setLiveMessages([]);
          return;
        }

        console.log(`Received ${response.data.messages.length} messages`);
        
        // Map the messages to our UI format
        const formattedMessages = response.data.messages.map(msg => ({
          id: msg.id.toString(),
          text: msg.message || '',
          sender: parseInt(msg.sender_id) === parseInt(user_id) ? 'user' : 'other',
          senderName: msg.sender_name || 'Unknown',
          senderRole: msg.sender_role || 'user',
          type: 'database',
          timestamp: msg.sent_at,
          conversation_id: msg.conversation_id || null
        }));

        console.log(`Formatted ${formattedMessages.length} messages`);
        setLiveMessages(formattedMessages);
      } else {
        console.warn('Invalid response format:', response.data);
        setLiveMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  };

  // Initial load of messages
  useEffect(() => {
    fetchMessages();
  }, [user_id]);

  // Update the useEffect for polling to be more robust
  useEffect(() => {
    if (!isAutomated && user_id) {
      // Fetch messages immediately
      fetchMessages();
      
      // Set up polling
      const interval = setInterval(() => {
        if (!isAutomated) {  // Double check we're still in live mode
          fetchMessages();
        }
      }, 7000);  // Every 7 seconds
      
      setPollingInterval(interval);
      
      // Clean up
      return () => {
        if (interval) clearInterval(interval);
      };
    } else if (pollingInterval) {
      // Clear polling if we're in automated mode
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [isAutomated, user_id]);

  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Add this near the top of ChatScreen component
  const [admins, setAdmins] = useState([]);

  // Modify the fetchAdmins function
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/get_admins.php`);
        console.log('Admin response:', response.data); // Add logging
        if (response.data.success) {
          setAdmins(response.data.admins);
        }
      } catch (error) {
        console.error('Error fetching admins:', error.response?.data || error.message);
      }
    };

    fetchAdmins();
  }, []);

  // Add state for conversation
  const [currentConversation, setCurrentConversation] = useState(null);

  // Modify the startConversation function
  const startConversation = async () => {
    try {
      const adminResponse = await axios.get(
        `${API_BASE_URL}/users/get_admins.php`
      );

      if (!adminResponse.data.success || !adminResponse.data.admins.length) {
        throw new Error('No administrators available');
      }

      const availableAdmin = adminResponse.data.admins[0];

      const response = await axios.post(
        `${API_BASE_URL}/messages/start_conversation.php`,
        { 
          user_id: user_id,
          admin_id: availableAdmin.id
        }
      );
      
      if (response.data.success) {
        setCurrentConversation({
          id: response.data.conversation_id,
          admin_id: availableAdmin.id
        });
        return response.data.conversation_id;
      } else {
        throw new Error('Failed to start conversation');
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
      return null;
    }
  };

  // Chatbot response logic
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase().trim();
    
    // Define expanded response patterns
    const responses = {
      greeting: {
        patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'],
        response: "Hello! How can I assist you today? Feel free to ask about our pet care services!"
      },
      grooming: {
        patterns: ['grooming', 'groom', 'haircut', 'bath', 'nail trim', 'nail cutting', 'fur', 'brush', 'brushing', 'style'],
        responses: [
          "Our grooming services include:\n• Full bath and blow dry\n• Breed-specific haircuts\n• Nail trimming\n• Ear cleaning\n• Teeth brushing\n• De-matting\n\nWould you like to book a grooming appointment?",
          "Our professional groomers are certified and experienced with all breeds. Basic grooming starts at ₱500. Would you like to know more about pricing or book an appointment?",
          "Regular grooming is essential for your pet's health and appearance. We recommend grooming every 4-8 weeks depending on your pet's breed and coat type."
        ]
      },
      vaccination: {
        patterns: ['vaccine', 'vaccination', 'shot', 'immunization', 'booster', 'shots'],
        responses: [
          "We offer comprehensive vaccination services including:\n• Core vaccines\n• Rabies shots\n• Bordetella\n• DHPP\n• FVRCP\n\nWould you like to schedule a vaccination appointment?",
          "Vaccination schedule depends on your pet's age:\n• Puppies: 6-8 weeks onwards\n• Kittens: 6-8 weeks onwards\n• Adult pets: Annual boosters\n\nDo you need help planning a vaccination schedule?",
          "Keeping vaccinations up to date is crucial for your pet's health. Our vets can review your pet's vaccination history and recommend appropriate shots."
        ]
      },
      consultation: {
        patterns: ['consult', 'consultation', 'check up', 'checkup', 'vet', 'veterinary', 'doctor', 'examine', 'examination'],
        responses: [
          "Our veterinary consultations include:\n• Physical examination\n• Health assessment\n• Dietary advice\n• Behavior consultation\n\nWould you like to schedule an appointment?",
          "Regular check-ups are recommended every 6-12 months for healthy pets, and more frequently for seniors or pets with health conditions.",
          "Our experienced veterinarians can help with:\n• Preventive care\n• Disease diagnosis\n• Treatment plans\n• Health certificates\n• Travel requirements"
        ]
      },
      deworming: {
        patterns: ['deworm', 'deworming', 'worm', 'parasites', 'worming', 'antiparasitic'],
        responses: [
          "Our deworming services protect your pet from:\n• Roundworms\n• Tapeworms\n• Hookworms\n• Other internal parasites\n\nWould you like to schedule a deworming treatment?",
          "Recommended deworming schedule:\n• Puppies/Kittens: Every 2 weeks until 12 weeks\n• Adults: Every 3-6 months\n• Outdoor pets may need more frequent treatment",
          "Signs your pet might need deworming:\n• Weight loss\n• Bloated belly\n• Changes in appetite\n• Visible worms\nShall we schedule a check-up?"
        ]
      },
      booking: {
        patterns: ['book', 'appointment', 'schedule', 'reserve', 'booking', 'slot', 'available'],
        responses: [
          "I can help you book an appointment. Please specify which service you need:\n• Grooming\n• Vaccination\n• Consultation\n• Deworming",
          "Our clinic hours are:\nMonday-Saturday: 8:00 AM - 5:00 PM\nSunday: 9:00 AM - 3:00 PM\nWhen would you like to schedule your visit?",
          "For appointments, we'll need:\n• Pet's name and age\n• Type of service\n• Preferred date and time\nWould you like to proceed with booking?"
        ]
      },
      pricing: {
        patterns: ['price', 'cost', 'fee', 'charge', 'how much', 'rate', 'pricing'],
        responses: [
          "Our service prices (may vary by pet size):\n• Basic Grooming: ₱500-1000\n• Consultation: ₱400-600\n• Vaccination: ₱800-1500\n• Deworming: ₱300-500",
          "We offer package deals for multiple services. Would you like to know more about our current promotions?",
          "Prices may vary based on:\n• Pet size and breed\n• Service complexity\n• Additional treatments needed\nWould you like a detailed quote for a specific service?"
        ]
      },
      emergency: {
        patterns: ['emergency', 'urgent', 'critical', 'help', 'sick', 'injury', 'injured', 'bleeding', 'accident'],
        responses: [
          "For pet emergencies, please call our hotline immediately: (123) 456-7890. We have 24/7 emergency services available.",
          "Common emergency signs:\n• Difficulty breathing\n• Severe bleeding\n• Collapse\n• Seizures\n• Severe pain\nPlease seek immediate veterinary care if you notice these signs.",
          "Our emergency service is available 24/7. For urgent cases, please proceed directly to our clinic or call our emergency number."
        ]
      },
      location: {
        patterns: ['where', 'location', 'address', 'directions', 'find', 'clinic', 'shop'],
        response: "We're located at: 123 Pet Care Street, Manila. Landmarks:\n• Near Central Mall\n• Opposite City Park\n• 5 minutes from Metro Station\n\nWould you like directions?"
      },
      payment: {
        patterns: ['payment', 'pay', 'cash', 'card', 'gcash', 'installment'],
        response: "We accept various payment methods:\n• Cash\n• Credit/Debit Cards\n• GCash\n• PayMaya\n• Bank Transfer\n\nWe also offer installment plans for major treatments."
      },
      about: {
        patterns: ['about', 'clinic info', 'tell me about', 'what is', 'who are you', 'company', 'history', 'background'],
        responses: [
          "Welcome to PetFurMe! We are a full-service veterinary clinic and pet grooming center established in 2023. Our mission is to provide the highest quality care for your beloved pets.\n\nOur facility features:\n• Modern medical equipment\n• Dedicated surgical suite\n• Grooming stations\n• Pet pharmacy\n• Recovery rooms",
          
          "PetFurMe is your one-stop pet care destination. We offer:\n• Veterinary Services\n• Professional Grooming\n• Vaccinations\n• Preventive Care\n• Emergency Services\n\nOur team includes licensed veterinarians and certified pet groomers.",
          
          "Our Mission:\nTo provide comprehensive, high-quality pet care services with compassion and professionalism.\n\nOur Vision:\nTo be the most trusted partner in maintaining the health and happiness of your pets."
        ]
      },
      staff: {
        patterns: ['staff', 'team', 'doctors', 'veterinarians', 'groomers', 'employees', 'specialists'],
        responses: [
          "Our dedicated team includes:\n• Licensed Veterinarians\n• Certified Pet Groomers\n• Veterinary Technicians\n• Pet Care Specialists\n• Client Care Staff\n\nAll our staff undergo regular training to stay updated with the latest pet care practices.",
          
          "Meet our key team members:\n• Dr. Santos - Chief Veterinarian\n• Dr. Reyes - Surgery Specialist\n• Ms. Garcia - Head Groomer\n• Mr. Tan - Emergency Care Specialist\n\nWould you like to schedule an appointment with any of them?"
        ]
      },
      facilities: {
        patterns: ['facility', 'facilities', 'equipment', 'clinic features', 'amenities', 'services available'],
        response: "Our modern facility features:\n• State-of-the-art Medical Equipment\n• Digital X-ray & Laboratory\n• Surgical Suite\n• Isolation Ward\n• Recovery Rooms\n• Professional Grooming Stations\n• Pet Pharmacy\n• Comfortable Waiting Area\n\nWould you like a tour of our facility?"
      },
      specialties: {
        patterns: ['specialty', 'specialties', 'special services', 'expert', 'expertise'],
        response: "Our specialties include:\n• Preventive Care\n• Soft Tissue Surgery\n• Dental Care\n• Dermatology\n• Nutrition Counseling\n• Behavioral Medicine\n• Senior Pet Care\n• Emergency Medicine\n\nWould you like to know more about any specific service?"
      },
      safety: {
        patterns: ['safety', 'protocols', 'covid', 'sanitation', 'clean', 'hygiene'],
        response: "We maintain strict safety and hygiene protocols:\n• Regular sanitization\n• Medical-grade cleaning\n• Personal protective equipment\n• Social distancing measures\n• Temperature checks\n• Limited capacity\n\nYour pet's safety is our top priority!"
      },
      petcare_tips: {
        patterns: ['tips', 'advice', 'guide', 'help', 'care tips', 'how to'],
        responses: [
          "Essential pet care tips:\n• Regular vet check-ups\n• Maintain vaccination schedule\n• Proper nutrition\n• Regular exercise\n• Dental care\n• Grooming routine\n\nNeed specific advice for your pet?",
          
          "Daily pet care basics:\n• Fresh water always available\n• Quality pet food\n• Regular exercise\n• Grooming & hygiene\n• Love and attention\n\nWould you like detailed guidance on any of these?",
          
          "Health warning signs to watch for:\n• Changes in appetite\n• Unusual behavior\n• Lethargy\n• Excessive thirst\n• Difficulty breathing\n\nContact us immediately if you notice these signs."
        ]
      },
      insurance: {
        patterns: ['insurance', 'coverage', 'pet insurance', 'health card', 'payment plans'],
        response: "We work with various pet insurance providers:\n• Pet Insurance Co.\n• PawSecure\n• VetCare Plus\n\nWe also offer:\n• Flexible payment plans\n• Senior pet discounts\n• Multiple pet discounts\n\nWould you like to know more about insurance options?"
      },
      contact: {
        patterns: ['contact', 'phone', 'email', 'call', 'reach', 'message', 'social media', 'facebook', 'instagram', 'messenger'],
        responses: [
          "You can reach us through:\n\n📞 Phone Numbers:\n• Main Line: (02) 8123-4567\n• Emergency: 0917-123-4567\n\n📧 Email:\n• General Inquiries: info@petfurme.com\n• Appointments: booking@petfurme.com\n\n💬 Social Media:\n• Facebook: @PetFurMePH\n• Instagram: @petfurme\n• Messenger: m.me/PetFurMePH",
          
          "Our Customer Service Hours:\n\n🕒 Regular Hours:\nMonday-Saturday: 8:00 AM - 5:00 PM\nSunday: 9:00 AM - 3:00 PM\n\n🚨 Emergency Line:\n24/7 Available at 0917-123-4567",
          
          "Ways to Book an Appointment:\n\n• Call: (02) 8123-4567\n• WhatsApp: 0917-123-4567\n• Online: www.petfurme.com/book\n• Facebook Messenger\n• Through this chat\n\nHow would you like to proceed?"
        ]
      },
      feedback: {
        patterns: ['feedback', 'review', 'complaint', 'suggest', 'recommendation', 'improve'],
        responses: [
          "We value your feedback! You can share your experience:\n\n• Email: feedback@petfurme.com\n• Call: (02) 8123-4567\n• Leave a review on our Facebook page\n• Fill out our feedback form in the clinic\n\nYour input helps us improve our services!",
          
          "Have a suggestion or concern? Contact our Customer Care team:\n\n• Customer Care Hotline: (02) 8123-4567\n• Email: care@petfurme.com\n\nWe aim to respond within 24 hours."
        ]
      },
      branches: {
        patterns: ['branch', 'branches', 'other locations', 'near me', 'nearest'],
        response: "Our Branches:\n\n📍 Main Branch:\n123 Pet Care Street, Manila\n\n📍 North Branch:\nSM North EDSA, Quezon City\n\n📍 South Branch:\nAyala Malls South Park, Muntinlupa\n\n📍 East Branch:\nMarikina Heights, Marikina City\n\nAll branches are open during regular business hours. Would you like specific directions to any branch?"
      },
      partnership: {
        patterns: ['partner', 'partnership', 'collaborate', 'business', 'affiliate'],
        response: "For Business Partnerships:\n\n👥 Contact our Business Development Team:\n• Email: partnerships@petfurme.com\n• Phone: (02) 8123-4567\n\nWe collaborate with:\n• Pet Food Brands\n• Pet Accessory Suppliers\n• Veterinary Medicine Suppliers\n• Other Pet Care Services"
      }
    };

    // Check each category's patterns
    for (const category in responses) {
      const matchFound = responses[category].patterns.some(pattern => {
        return message.includes(pattern.toLowerCase());
      });

      if (matchFound) {
        // If the category has multiple responses, randomly select one
        if (Array.isArray(responses[category].responses)) {
          const randomIndex = Math.floor(Math.random() * responses[category].responses.length);
          return responses[category].responses[randomIndex];
        }
        // If it's a single response
        return responses[category].response;
      }
    }

    // If no match is found, return default response
    return "I'm not sure I understand. You can ask about:\n\n• Grooming services\n• Veterinary consultations\n• Vaccinations\n• Deworming\n• Appointments\n• Pricing\n• Emergency services\n• Location and payments";
  };

  // Add some test patterns at the start of your component
  useEffect(() => {
    // Test the bot response function
    const testMessages = [
      "hello",
      "I need grooming services",
      "what are your prices",
      "where are you located"
    ];

    testMessages.forEach(msg => {
      console.log(`Test message: "${msg}"`);
      console.log(`Bot response: "${getBotResponse(msg)}"`);
      console.log("---");
    });
  }, []);

  // Modify sendMessage function
  const sendMessage = async () => {
    if (input.trim()) {
      try {
        if (!isAutomated) {
          // Handle live chat message
          let conversationId = currentConversation?.id;
          if (!conversationId) {
            conversationId = await startConversation();
            if (!conversationId) {
              throw new Error('Could not start conversation');
            }
          }

          const messageText = input.trim();
          setInput('');

          const response = await axios.post(
            `${API_BASE_URL}/messages/save_message.php`,
            {
              sender_id: parseInt(user_id),
              message: messageText,
              conversation_id: conversationId,
              is_automated: 0
            }
          );

          if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to save message');
          }

          await fetchMessages();
        } else {
          // Handle bot chat message
          const userMessage = {
            id: Date.now().toString(),
            text: input.trim(),
            sender: 'user',
            type: 'automated'
          };

          const botResponseText = getBotResponse(input.trim());
          const botResponse = {
            id: (Date.now() + 1).toString(),
            text: botResponseText,
            sender: 'other',
            type: 'automated'
          };

          setBotMessages(prevMessages => [...prevMessages, userMessage, botResponse]);
          setInput('');
        }
      } catch (error) {
        console.error('Error in sendMessage:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    }
  };

  // Modify the toggle button style to make it more prominent
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => setIsAutomated(!isAutomated)}
          style={{ 
            marginRight: 15,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isAutomated ? '#4CAF50' : '#2196F3',
            padding: 10,
            borderRadius: 20,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <MaterialIcons 
            name={isAutomated ? "android" : "support-agent"} 
            size={24} 
            color="#FFFFFF" 
          />
          <Text style={{ 
            color: '#FFFFFF', 
            marginLeft: 8,
            fontWeight: 'bold',
            fontSize: 16,
          }}>
            {isAutomated ? 'Bot Active' : 'Live Chat'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isAutomated]);

  // Add this to verify mode changes
  useEffect(() => {
    console.log('Chat mode changed to:', isAutomated ? 'Automated' : 'Live Chat');
  }, [isAutomated]);

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? { justifyContent: 'flex-end' } : { justifyContent: 'flex-start' }
    ]}>
      {item.sender === 'other' && (
        <View style={styles.otherChatHead}>
          <MaterialIcons 
            name="support-agent"
            size={20}
            color="#9C27B0"
          />
        </View>
      )}

      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userMessage : styles.otherMessage
      ]}>
        <Text style={styles.messageText}>
          {item.text}
        </Text>
        {item.timestamp && (
          <Text style={styles.timestampText}>
            {new Date(item.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            })}
          </Text>
        )}
      </View>

      {item.sender === 'user' && (
        <View style={styles.userChatHead}>
          <MaterialIcons 
            name="person"
            size={20}
            color="#A259B5"
          />
        </View>
      )}
    </View>
  );

  // Add a toggle button component
  const ToggleButton = () => (
    <TouchableOpacity 
      onPress={() => setIsAutomated(!isAutomated)}
      style={styles.toggleButton}
    >
      <MaterialIcons 
        name={isAutomated ? "android" : "support-agent"} 
        size={24} 
        color="#FFFFFF" 
      />
      <Text style={styles.toggleButtonText}>
        {isAutomated ? 'Switch to Live Chat' : 'Switch to Bot'}
      </Text>
    </TouchableOpacity>
  );

  // Add this before the return statement in your ChatScreen component
  const renderToggleButton = () => (
    <View style={styles.toggleButtonContainer}>
      <ToggleButton />
    </View>
  );

  // Add the temporary message notice component
  const TempMessageNotice = () => (
    <View style={styles.tempNoticeContainer}>
      <MaterialIcons name="info" size={20} color="#fff" />
      <Text style={styles.tempNoticeText}>
        Bot chat messages are temporary and will be cleared when you refresh the page
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Chat Support"
        subtitle="Ask us anything about pet care"
        navigation={navigation}
        showBackButton={true}
        showDrawerButton={true}
      />

      {renderToggleButton()}

      {/* Temporary Message Notice */}
      {isAutomated && showTempNotice && <TempMessageNotice />}

      <View style={styles.chatWrapper}>
        <FlatList
          ref={flatListRef}
          data={isAutomated ? botMessages : liveMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          renderItem={renderMessage}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            placeholderTextColor="#999"
            multiline
            maxHeight={100}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!input.trim()}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={input.trim() ? '#FFFFFF' : '#CCCCCC'}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <BottomNavigation 
        activeScreen="ChatScreen" 
        user_id={user_id}
        isVerified={isVerified}
      />

      {/* Add this in your render method */}
      {console.log("Current mode:", isAutomated ? "Automated" : "Live Chat")}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  chatWrapper: {
    flex: 1,
    marginBottom: 80,
    backgroundColor: '#F8F9FA',
  },
  chatContainer: {
    padding: 12,
    paddingBottom: 24,
    paddingTop: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 8,
    paddingHorizontal: 8,
  },
  userMessage: {
    marginLeft: 'auto',
    backgroundColor: '#A259B5',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    marginRight: 'auto',
    backgroundColor: '#9C27B0',
    borderBottomLeftRadius: 4,
  },
  chatHead: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0E6F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userChatHead: {
    width: 24,
    height: 24,
    marginLeft: 6,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  otherChatHead: {
    width: 24,
    height: 24,
    marginRight: 6,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#A259B5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  inputContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    maxHeight: 80,
    paddingTop: 6,
    paddingBottom: 6,
    paddingRight: 10,
    minHeight: 36,
  },
  sendButton: {
    backgroundColor: '#A259B5',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  sendButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  systemBubble: {
    alignSelf: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginVertical: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  systemMessageText: {
    color: '#2C3E50',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  toggleButtonContainer: {
    padding: 10,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A259B5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestampText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    marginRight: 2,
    alignSelf: 'flex-end',
  },
  tempNoticeContainer: {
    backgroundColor: 'rgba(162, 89, 181, 0.4)',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 2,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  tempNoticeText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.2,
  }
});

export default ChatScreen;