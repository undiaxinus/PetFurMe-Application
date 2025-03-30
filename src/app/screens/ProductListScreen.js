import React, { useState, useEffect, useCallback } from 'react';
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
  Platform,
  AsyncStorage,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../utils/config';
import BottomNavigation from '../components/BottomNavigation';
import CustomHeader from '../components/CustomHeader';
import { useRefresh } from '../hooks/useRefresh';

const ProductListScreen = ({ navigation, route }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userId, setUserId] = useState(route.params?.user_id);

  const categories = [
    { id: 'all', name: 'All' },
    { id: '1', name: 'Food' },
    { id: '2', name: 'Medicine' },
    { id: '3', name: 'Accessories' },
    { id: '4', name: 'Grooming' },
  ];

  useEffect(() => {
    const getUserId = async () => {
      if (!userId) {
        try {
          const storedUserId = await AsyncStorage.getItem('user_id');
          if (storedUserId) {
            setUserId(storedUserId);
          } else {
            console.error('No user_id found');
            navigation.navigate('LoginScreen');
          }
        } catch (error) {
          console.error('Error getting user_id:', error);
          Alert.alert('Error', 'Failed to get user session');
        }
      }
    };

    getUserId();
  }, [userId, navigation]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/api/products/get_products.php`;
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category_id', selectedCategory);
      }
      
      const finalUrl = params.toString() ? `${url}?${params.toString()}` : url;
      
      console.log('Fetching from URL:', finalUrl);

      const response = await fetch(finalUrl);
      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        if (data.success) {
          // Debug log to see what we're receiving
          console.log('Raw product data sample:', data.products?.[0] || 'No products received');
          
          if (Array.isArray(data.products)) {
            const transformedProducts = data.products.map(product => {
              const imageUri = product.product_image_data 
                ? `data:image/jpeg;base64,${product.product_image_data}`
                : product.product_image
                  ? `${API_BASE_URL}/PetFurMe-Application/${product.product_image}`
                  : `${API_BASE_URL}/PetFurMe-Application/uploads/defaults/product-placeholder.png`;
                
              return {
                id: product.id?.toString() || '',
                name: product.name || '',
                price: product.selling_price ? parseFloat(product.selling_price) / 100 : 0,
                image: { uri: imageUri },
                category: product.category_name || '',
                stock: parseInt(product.quantity) || 0,
                description: product.notes || '',
                category_id: product.category_id?.toString() || '',
              };
            });
            
            setProducts(transformedProducts);
          } else {
            console.error('Products data is not an array:', data.products);
            setProducts([]);
          }
        } else {
          throw new Error(data.message || 'Failed to fetch products');
        }
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Invalid JSON received:', responseText);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category_id?.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          onLoadStart={() => console.log('Starting to load image for:', item.name)}
          onLoadEnd={() => console.log('Finished loading image for:', item.name)}
          onError={(e) => {
            console.error('Image loading error for:', item.name, e.nativeEvent.error);
            const updatedProducts = products.map(p => {
              if (p.id === item.id) {
                return {
                  ...p,
                  image: { 
                    uri: `${API_BASE_URL}/PetFurMe-Application/uploads/defaults/product-placeholder.png` 
                  }
                };
              }
              return p;
            });
            setProducts(updatedProducts);
          }}
        />
        {item.stock === 0 ? (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        ) : item.stock < 10 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>Low Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.productPrice}>₱{item.price.toFixed(2)}</Text>
        <Text style={styles.stockCount}>In Stock: {item.stock}</Text>
      </View>
    </TouchableOpacity>
  );

  const refreshProducts = useCallback(async () => {
    console.log('Refreshing products...');
    setRefreshing(true);
    try {
      await fetchProducts();
    } catch (error) {
      console.error('Error refreshing products:', error);
      // Make sure to reset loading states even on error
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);
  
  const { refreshControlProps, RefreshButton, webProps } = useRefresh(refreshProducts);

  return (
    <View style={styles.container}>
      <CustomHeader 
        title="Pet Products"
        navigation={navigation}
        showBackButton={true}
      />
      
      <View style={styles.mainContent}>
        <View style={styles.scrollContent}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={22} color="#8146C1" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.categoriesContainer}>
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

          <View style={styles.content}>
            {loading ? (
              <ActivityIndicator size="large" color="#8146C1" style={styles.loader} />
            ) : (
              <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={item => item.id}
                numColumns={2}
                contentContainerStyle={styles.productList}
                refreshControl={
                  <RefreshControl
                    {...refreshControlProps}
                  />
                }
                {...webProps}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>No products found</Text>
                }
              />
            )}
          </View>
        </View>
      </View>

      <BottomNavigation 
        activeScreen="ProductListScreen" 
        user_id={userId} 
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mainContent: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: Platform.OS === 'ios' ? 1 : 0,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
    height: '100%',
    paddingVertical: 8,
  },
  categoriesContainer: {
    backgroundColor: '#F5F5F5',
    height: 60,
    zIndex: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  productList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    elevation: 3,
    overflow: 'hidden',
    maxWidth: '46%',
    minHeight: 225,
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
    aspectRatio: 1.2,
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
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 68, 68, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stockText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 10,
    height: 72,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    height: 30,
    lineHeight: 15,
    color: '#333',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#8146C1',
    marginBottom: 3,
  },
  stockCount: {
    fontSize: 11,
    color: '#666',
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
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    backgroundColor: '#FF4444',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
});

export default ProductListScreen; 