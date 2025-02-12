import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../utils/config';
import BottomNavigation from '../components/BottomNavigation';

const ProductListScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: '1', name: 'Food' },
    { id: '2', name: 'Medicine' },
    { id: '3', name: 'Accessories' },
    { id: '4', name: 'Grooming' },
  ];

  const user_id = route.params?.user_id;

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/PetFurMe-Application/api/products/get_products.php`;
      
      if (selectedCategory !== 'all') {
        url += `?category_id=${selectedCategory}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      if (data.success) {
        const transformedProducts = data.products.map(product => ({
          id: product.id.toString(),
          name: product.name,
          price: product.selling_price ? parseFloat(product.selling_price) : 0,
          image: { 
            uri: product.product_image 
              ? `${API_BASE_URL}/PetFurMe-Application/${product.product_image}`
              : `${API_BASE_URL}/PetFurMe-Application/uploads/defaults/product-placeholder.png`
          },
          category: product.category_name,
          stock: product.quantity || 0,
          description: product.notes || '',
          category_id: product.category_id,
        }));
        setProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetails', { product: item })}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={item.image} 
          style={styles.productImage}
        />
        {item.stock < 10 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>Low Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productCategory} numberOfLines={1}>{item.category}</Text>
        <Text style={styles.productPrice}>₱{item.price.toFixed(2)}</Text>
        <Text style={styles.stockCount}>In Stock: {item.stock}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pet Products</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.content}>
        <View style={{ height: 60 }}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={categories}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.categoriesList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  selectedCategory === item.id && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(item.id)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.categoryText,
                    selectedCategory === item.id && styles.selectedCategoryText,
                  ]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#8146C1" style={styles.loader} />
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={[
              styles.productList,
              { paddingBottom: 100 }
            ]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchProducts();
                }}
                colors={['#8146C1']}
              />
            }
            ListEmptyComponent={
              <Text style={styles.emptyText}>No products found</Text>
            }
          />
        )}
      </View>

      <BottomNavigation activeScreen="HomePage" user_id={user_id} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#8146C1',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    paddingTop: 48,
    height: 90,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 12,
    borderRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
    height: 60,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 12,
    elevation: 1,
    minWidth: 100,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    transform: [{ scale: 1 }],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
  },
  selectedCategory: {
    backgroundColor: '#8146C1',
    borderColor: '#8146C1',
    elevation: 3,
    transform: [{ scale: 1.05 }],
    shadowColor: '#8146C1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  categoryText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  selectedCategoryText: {
    color: '#FFF',
  },
  productList: {
    padding: 8,
    paddingBottom: 90,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    maxWidth: '46%',
    minHeight: 280,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  stockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 12,
    height: 110,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    height: 36,
    lineHeight: 18,
    color: '#333',
  },
  productCategory: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    height: 16,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8146C1',
    marginBottom: 4,
    height: 24,
  },
  stockCount: {
    fontSize: 12,
    color: '#666',
    height: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
    marginBottom: 80,
  },
});

export default ProductListScreen; 