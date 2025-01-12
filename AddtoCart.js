import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductDetailsPage = ({ navigation }) => {
  const [quantity, setQuantity] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddToCart = () => {
    setIsModalVisible(true); // Show the pop-up
    setTimeout(() => {
      setIsModalVisible(false); // Hide the pop-up after 2 seconds
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
         <Image source={require('./assets/images/background.png')} style={styles.background}/>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={30} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Product Image */}
      <Image
        source={require('./assets/images/specialdog.png')} // Replace with your product image
        style={styles.productImage}
      />

      {/* Product Info */}
      <View style={styles.infoCard}>
        <Text style={styles.productName}>Special Dog - 20lbs</Text>
        <Text style={styles.brand}>Brand: Branded</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>4.5</Text>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.reviews}>(89 reviews)</Text>
        </View>
        <Text style={styles.price}>Rs 340.00</Text>
        <Text style={styles.description}>
          A premium brand of dog food that focuses on providing high-quality
          nutrition tailored to the unique needs of dogs. Known for its
          carefully selected ingredients, Special Dog offers a range of
          products designed to support various aspects of a dog's health,
          including skin and coat condition, digestive health, and overall
          vitality.
        </Text>

        {/* Quantity Selector */}
        <Text style={styles.recommendedFor}>Recommended For:</Text>
        <Text style={styles.quan}>Quantity</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={handleDecrease}>
            <Ionicons name="remove-circle" size={24} color="#8146C1" />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity onPress={handleIncrease}>
            <Ionicons name="add-circle" size={24} color="#8146C1" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add to Cart Button */}
      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
        <Text style={styles.addToCartText}>Add to cart</Text>
      </TouchableOpacity>

      {/* Modal for Pop-Up */}
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={60} color="#8146C1" />
            <Text style={styles.modalText}>Added to cart</Text>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Image source={require('./assets/images/homee.png')} style={styles.navIcon} />
        <Image source={require('./assets/images/cart.png')} style={styles.navIcon} />
        <Image source={require('./assets/images/notif.png')} style={styles.navIcon} />
        <Image source={require('./assets/images/circle.png')} style={styles.navIcon} />
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
    height: 40,
    paddingHorizontal: 20,
    top: 38,
  },
  productImage: {
    width: 150,
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
    left: 100,
    top: 20,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // White with 80% opacity
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 15,
    elevation: 5,
    marginBottom: 10,
    marginTop: 20,
    alignItems: 'center',
},
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    left: 10,
  },
  brand: {
    fontSize: 14,
    color: '#064E57',
    marginVertical: 5,
    left: -99,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    left: -90,
  },
  ratingText: {
    fontSize: 14,
    color: '#FFD700',
    marginRight: 5,
  },
  reviews: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 5,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5CB15A',
    marginVertical: 10,
    left: 220,
    top: -65,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
    marginVertical: -25,
    textAlign: 'center',
  },
  quan: {
    left: -105,
    top: 18,
    fontSize: 18,
  },
  recommendedFor: {
    fontSize: 14,
    color: '#888888',
    marginVertical: 20,
    top: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    marginVertical: -5,
    right: -120,
  },
  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  addToCartButton: {
    flexDirection: 'row',
    backgroundColor: '#8146C1',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  background: {
    top: 250,
    left: -20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8146C1',
    marginTop: 10,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#8146C1',
  },
  navIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
});

export default ProductDetailsPage;
