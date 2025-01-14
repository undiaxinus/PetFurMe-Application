import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProductPage = ({ navigation }) => {
  const [products, setProducts] = useState([
    {
      id: '1',
      name: 'Special Dog',
      price: '380.00',
      weight: '20lbs',
      image: require('./assets/images/specialdog.png'),
      tag: 'Furry',
    },
    {
      id: '2',
      name: 'Pedigree',
      price: '530.00',
      weight: '3kg',
      image: require('./assets/images/pedigree.png'),
      tag: 'Bestseller',
      discount: '-15%',
    },
    {
      id: '3',
      name: 'Wagners',
      price: '3500.00',
      weight: '3kg',
      image: require('./assets/images/wagners.png'),
    },
    {
      id: '4',
      name: 'Kaytee Fiesta',
      price: '11450.00',
      weight: '3kg',
      image: require('./assets/images/kaytee.png'),
    },
    {
      id: '5',
      name: 'Vetality',
      price: '800.00',
      weight: '5kg',
      image: require('./assets/images/vetality.png'),
    },
    {
      id: '6',
      name: 'Royal Canin',
      price: '700.00',
      weight: '3kg',
      image: require('./assets/images/royalcanin.png'),
    },
    {
      id: '7',
      name: 'Purina Pro Plan',
      price: '2200.00',
      weight: '2kg',
      image: require('./assets/images/meowmix.png'),
      tag: 'Premium',
    },
    {
      id: '8',
      name: 'Hill’s Science Diet',
      price: '4500.00',
      weight: '4kg',
      image: require('./assets/images/meowmix.png'),
      discount: '-10%',
    },
    {
      id: '9',
      name: 'Iams Proactive Health',
      price: '3200.00',
      weight: '6kg',
      image: require('./assets/images/meowmix.png'),
    },
    {
      id: '10',
      name: 'Blue Buffalo Life',
      price: '5600.00',
      weight: '2.5kg',
      image: require('./assets/images/meowmix.png'),
    },
    {
      id: '11',
      name: 'Taste of the Wild',
      price: '4800.00',
      weight: '2kg',
      image: require('./assets/images/meowmix.png'),
      tag: 'New Arrival',
    },
    {
      id: '12',
      name: 'Canidae Pure',
      price: '5200.00',
      weight: '3kg',
      image: require('./assets/images/meowmix.png'),
    },
  ]);

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.tagContainer}>
        {item.tag && <Text style={styles.tagText}>{item.tag}</Text>}
        {item.discount && <Text style={styles.discountText}>{item.discount}</Text>}
      </View>
      <Image source={item.image} style={styles.productImage} />
      <Text style={styles.productPrice}>Rs {item.price}</Text>
      <Text style={styles.productName}>{item.name}</Text>
      {item.weight && <Text style={styles.productWeight}>{item.weight}</Text>}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text
            style={styles.addToCartText}
            onPress={() => navigation.navigate('AddtoCart')}
          >
            Add to cart
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu" size={30} color="#FFFFFF" />
        </TouchableOpacity>

        <TextInput
          style={styles.searchBar}
          placeholder="Search"
          placeholderTextColor="#888888"
        />
        <TouchableOpacity>
          <Image
            source={require('./assets/images/search.png')}
            style={styles.search}
          />
        </TouchableOpacity>
      </View>

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.productList}
        numColumns={2}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Image source={require('./assets/images/homee.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('./assets/images/cart.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('./assets/images/notif.png')} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={require('./assets/images/circle.png')} style={styles.navIcon} />
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
    justifyContent: 'space-between',
    backgroundColor: '#8146C1',
    width: '100%',
    paddingHorizontal: 20,
    top: 30,
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 20,
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
    top: 50,
  },
  search: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
    right: 293,
    top: 50,
  },
  productList: {
    padding: 10,
    top: 80,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginHorizontal: 5,
    padding: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -15,
  },
  tagText: {
    backgroundColor: '#FF8ACF',
    color: '#FFFFFF',
    fontSize: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  discountText: {
    backgroundColor: '#FFC107',
    color: '#FFFFFF',
    fontSize: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    marginBottom: 5,
  },
  productImage: {
    width: '80%',
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 13,
    color: '#5CB15A',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productWeight: {
    fontSize: 10,
    color: '#868889',
    marginBottom: 10,
    textAlign: 'center',
  },
  actionContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  addToCartButton: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },
  addToCartText: {
    color: '#010101',
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
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

export default ProductPage;
