import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomePage = ({ navigation }) => {
  const categories = [
    { id: '1', label: 'Consultation', icon: 'ios-cart', backgroundColor: '#FF8ACF', screen: 'Consultation' },
    { id: '2', label: 'Vaccination', icon: 'ios-cut', backgroundColor: '#8146C1', screen: 'Vaccination' },
    { id: '3', label: 'Deworming', icon: 'ios-paw', backgroundColor: '#FF8ACF', screen: 'Deworming' },
    { id: '4', label: 'Grooming', icon: 'ios-home', backgroundColor: '#8146C1', screen: 'Grooming' },
  ];

  const petProducts = [
    { id: '1', name: 'Pedigree Adult', weight: '3kg', image: require('./assets/images/pedigree.png') },
    { id: '2', name: 'Meow Mix', weight: '2kg', image: require('./assets/images/meowmix.png') },
  ];

  const vets = [
    {
      id: '1',
      name: 'Dr. Iwan',
      specialty: 'Bachelor of Veterinary Science',
      rating: '5.0',
      reviews: '100 reviews',
      lastVisit: '25/07/2024',
      distance: '2.5km',
      image: require('./assets/images/doctor.png'),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <Image source={require('./assets/images/burger.png')} style={styles.burger} onPress={() => navigation.navigate(Burger)}/>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greetingText}>Hey Angge,</Text>
          <Text style={styles.questionText}>What are you looking for?</Text>
        </View>
        <Image source={require('./assets/images/profile.png')} style={styles.profileImage} />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.categoryItem, { backgroundColor: item.backgroundColor }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Ionicons name={item.icon} size={30} color="#FFFFFF" />
            <Text style={styles.categoryLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pet Products Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Pet Products</Text>
        <FlatList
          data={petProducts}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.petFoodItem}>
              <Image source={item.image} style={styles.petFoodImage} />
              <View>
                <Text style={styles.petFoodName}>{item.name}</Text>
                <Text style={styles.petFoodWeight}>{item.weight}</Text>
              </View>
              <Ionicons name="ios-cart" size={24} color="#8146C1" style={styles.cartIcon} />
            </View>
          )}
        />
      </View>

      {/* Vets Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Veterinary Doctor</Text>
        {vets.map((vet) => (
          <View key={vet.id} style={styles.vetCard}>
            <Image source={vet.image} style={styles.vetImage} />
            <View style={styles.vetDetails}>
              <Text style={styles.vetName}>{vet.name}</Text>
              <Text style={styles.vetSpecialty}>{vet.specialty}</Text>
              <Text style={styles.vetRating}>
                ⭐ {vet.rating} ({vet.reviews})
              </Text>
              <Text style={styles.vetDistance}>{vet.distance}</Text>
              <Text style={styles.lastVisit}>Last Visit: {vet.lastVisit}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('VetDetails', { vetId: vet.id })}>
                <Text style={styles.bookAppointmentText}>Book Appointment →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Ionicons name="ios-home" size={30} color="#FFFFFF" />
        <Ionicons name="ios-star" size={30} color="#FFFFFF" />
        <Ionicons name="ios-heart" size={30} color="#FFFFFF" />
        <Ionicons name="ios-person" size={30} color="#FFFFFF" />
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
   justifyContent: 'space-between',
   backgroundColor: '#8146C1',
   width: '400',
   paddingHorizontal: 20,
   paddingVertical: 14,
   top: 35,
  },
  menuIcon: {
    marginRight: 10,
  },
  headerTextContainer: {
    flex: 1,
  },
  greetingText: {
    fontSize: 18,
    color: '#9134A9',
    fontWeight: 'bold',
    top: 65,
    left: -40,
  },
  questionText: {
    fontSize: 16,
    color: '#000000',
    top: 81,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    right: 30,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 115,
  },
  categoryItem: {
    width: 70,
    height: 70,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    marginTop: 5,
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  burger: {
   left: -10,
   width: 25, // Adjusted width
  height: 25, // Adjusted height
  resizeMode: 'contain',
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8146C1',
    marginBottom: 10,
  },
  petFoodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    elevation: 2,
  },
  petFoodImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  petFoodName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  petFoodWeight: {
    fontSize: 12,
    color: '#888888',
  },
  cartIcon: {
    marginLeft: 'auto',
  },
  vetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  vetImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  vetDetails: {
    flex: 1,
  },
  vetName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  vetSpecialty: {
    fontSize: 12,
    color: '#888888',
  },
  vetRating: {
    fontSize: 12,
    color: '#FFD700',
  },
  vetDistance: {
    fontSize: 12,
    color: '#888888',
  },
  lastVisit: {
    fontSize: 12,
    color: '#888888',
    marginVertical: 5,
  },
  bookAppointmentText: {
    fontSize: 14,
    color: '#8146C1',
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#8146C1',
  },
});

export default HomePage;
