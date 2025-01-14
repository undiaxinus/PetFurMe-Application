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
    { id: '1', label: 'Consultation', backgroundColor: '#FF8ACF', screen: 'Consultation', image: require('./assets/images/consultation.png') },
    { id: '2', label: 'Vaccination', backgroundColor: '#8146C1', screen: 'Vaccination', image: require('./assets/images/vaccination.png') },
    { id: '3', label: 'Deworming', backgroundColor: '#FF8ACF', screen: 'Deworming', image: require('./assets/images/deworming.png') },
    { id: '4', label: 'Grooming', backgroundColor: '#8146C1', screen: 'Grooming', image: require('./assets/images/grooming.png') },
  ];

  const petProducts = [
    { id: '1', name: 'Pedigree Adult', weight: '3kg', image: require('./assets/images/pedigree.png'), type: 'Dog' },
    { id: '2', name: 'Meow Mix', weight: '726g', image: require('./assets/images/meowmix.png'), type: 'Cat' },
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
      
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
    <Image
    source={require('./assets/images/burger.png')}
    style={styles.burger}
    />
    </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.greetingText}>Hey Angge,</Text>
          <Text style={styles.questionText}>What are you looking for?</Text>
          
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        {categories.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.categoryItem, { backgroundColor: item.backgroundColor }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <Image source={item.image} style={styles.categoryImage} />
            <Text style={styles.categoryLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pet Products Section */}
      <View style={styles.petProductsBox}>
        <View style={styles.sectionHeader}>
        <Image source={require('./assets/images/petpro.png')} style={styles.vetcare}/>
          <Text style={styles.sectionTitle}>Pet Products</Text>
          <Text style={styles.viewmore} onPress={() => navigation.navigate('ViewMorePro')}>View More</Text>
        </View>
        
        {petProducts.map((item) => (
          <View key={item.id} style={styles.petProductCard}>
            <Image source={item.image} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productWeight}>{item.weight}</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.type}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.cartButton}>
              <Image
                  source={require('./assets/images/basket.png')}
                  style={styles.vetcare}
              />
            </TouchableOpacity>
            
          </View>
        ))}
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

              <TouchableOpacity onPress={() => navigation.navigate('BookAppointment', { vetId: vet.id })}>
                <Text style={styles.bookAppointmentText}>Book Appointment →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Image source={require('./assets/images/homee.png')} style={styles.vetcare}/>
        <Image source={require('./assets/images/cart.png')} style={styles.vetcare}/>
        <Image source={require('./assets/images/notif.png')} style={styles.vetcare}/>
        <Image source={require('./assets/images/circle.png')} style={styles.vetcare}/>
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
    width: '100%',
    paddingHorizontal: 20,
    top: 32,
  },
  burger: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  greetingText: {
    fontSize: 18,
    color: '#9134A9',
    fontWeight: 'bold',
    top: 50,
    left: -40,
  },
  questionText: {
    fontSize: 14,
    color: '#141415',
    fontWeight: 'bold',
    top: 50,
    left: 0,
  },
  categoriesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 65,
    paddingHorizontal: 10,
    top: 40,
  },
  categoryItem: {
    alignItems: 'center',
    borderRadius: 10,
    width: 80, // Increased size
    height: 90, // Increased size
  },
  categoryImage: {
    width: 60, // Adjusted size
    height: 60, // Adjusted size
    marginBottom: 9,
    top: 5,
  },
  categoryLabel: {
    fontSize: 12, // Adjusted font size
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  petProductsBox: {
    backgroundColor: '#F7F7F7',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: -10,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8146C1',
    marginLeft: 5,
  },
  petProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 10,
  },
  productDetails: {
    flex: 1,
  },
  viewmore: {
    left: 95,
    top: 210,
    color: '#808080',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  productWeight: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 5,
  },
  badge: {
    backgroundColor: '#FFD700',
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  cartButton: {
    padding: -10,
    borderRadius: 20,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginBottom: 6,
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
    paddingVertical: 15,
    backgroundColor: '#8146C1',
  },
});

export default HomePage;
