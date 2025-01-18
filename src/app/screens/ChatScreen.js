import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Image, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';

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
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  }
});

const ChatScreen = ({ navigation, route }) => {
  const user_id = route.params?.user_id;
  
  // Add this useEffect to log the user_id
  useEffect(() => {
    console.log("ChatScreen user_id:", user_id);
  }, [user_id]);

  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! How can I help you today? You can ask me about:\n\n• Pet grooming services\n• Veterinary consultations\n• Vaccination schedules\n• Deworming services\n• Booking appointments', sender: 'other' },
  ]);
  const [input, setInput] = useState('');
  const flatListRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Chatbot response logic
  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
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

    // Check for matches and return appropriate response
    for (const category in responses) {
      if (responses[category].patterns.some(pattern => message.includes(pattern))) {
        // If the category has multiple responses, randomly select one
        if (Array.isArray(responses[category].responses)) {
          const randomIndex = Math.floor(Math.random() * responses[category].responses.length);
          return responses[category].responses[randomIndex];
        }
        // If it's a single response
        return responses[category].response;
      }
    }

    // Default response if no pattern matches
    return "I'm not sure I understand. You can ask about:\n\n• Grooming services\n• Veterinary consultations\n• Vaccinations\n• Deworming\n• Appointments\n• Pricing\n• Emergency services\n• Location and payments";
  };

  const sendMessage = () => {
    if (input.trim()) {
      // Add user message
      const newMessage = { id: Date.now().toString(), text: input, sender: 'user' };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInput('');
      
      // Generate and add bot response
      setTimeout(() => {
        const botResponse = {
          id: Date.now().toString(),
          text: getBotResponse(input),
          sender: 'other'
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
      }, 1000);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.otherBubble,
      ]}
    >
      <Text style={[
        styles.messageText,
        item.sender === 'other' && styles.otherMessageText
      ]}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Chat with PetFurMe</Text>
          <Text style={styles.headerSubtitle}>Customer Service</Text>
        </View>
      </View>

      <View style={styles.chatWrapper}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current.scrollToEnd()}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'position' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <MaterialIcons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('HomePage', { user_id })}
        >
            <Ionicons name="home-outline" size={24} color="#8146C1" />
            <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
            <Ionicons name="chatbubble" size={24} color="#8146C1" />
            <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('NotificationScreen', { user_id })}
        >
            <Ionicons name="notifications-outline" size={24} color="#8146C1" />
            <Text style={styles.navText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Help', { user_id })}
        >
            <Ionicons name="help-circle-outline" size={24} color="#8146C1" />
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
    borderBottomColor: '#DDD',
    backgroundColor: '#FFF',
  },
  headerTitleContainer: {
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chatWrapper: {
    flex: 1,
    marginBottom: 100, // Account for input container and bottom nav
  },
  chatContainer: {
    padding: 15,
    paddingTop: 10, // Reduced since we now have a header
  },
  messageBubble: {
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    maxWidth: '75%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#A259B5',
  },
  otherBubble: {
    alignSelf: 'flex-start', 
    backgroundColor: '#8146C1',
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#DDD',
    position: 'absolute',
    bottom: 60, // Height of bottom nav
    left: 0,
    right: 0,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#A259B5',
    borderRadius: 20,
    padding: 10,
  },
  bottomNav: {
    height: 60,  // Explicit height
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",  // Center items vertically
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,  // Ensure it stays on top
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

export default ChatScreen;