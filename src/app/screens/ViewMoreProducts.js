import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL, SERVER_IP } from '../config/constants';
import CustomHeader from '../components/CustomHeader';
import BottomNavigation from '../components/BottomNavigation';

const API_BASE_URL = `http://${SERVER_IP}`;
const DEFAULT_PRODUCT_IMAGE = `${API_BASE_URL}/PetFurMe-Application/uploads/defaults/product.png`;

const ViewMoreProducts = ({ navigation, route }) => {
    const user_id = route.params?.user_id;
    const [petProducts, setPetProducts] = useState([]);
    const [isProductsLoading, setIsProductsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = [
        { id: 'all', name: 'All Products' },
        { id: '1', name: 'Food' },
        { id: '2', name: 'Medicine' },
        { id: '3', name: 'Accessories' },
        { id: '4', name: 'Grooming' },
    ];

    const fetchPetProducts = async (categoryId = 'all') => {
        try {
            setIsProductsLoading(true);
            let url = `${API_BASE_URL}/PetFurMe-Application/api/products/get_home_products.php`;
            if (categoryId !== 'all') {
                url += `?category_id=${categoryId}`;
            }
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();

            const categoryColors = {
                1: '#FFE8F7', // Food category
                2: '#E8F4FF', // Medicine category
                3: '#F0FFE8', // Accessories category
                4: '#FFF3E8', // Grooming category
                default: '#F5F5F5'
            };

            if (data.success) {
                const transformedProducts = data.products.map(product => {
                    // Handle image URL
                    let imageUrl;
                    if (product.product_image && product.product_image.trim() !== '') {
                        // If product has an image, construct full URL
                        imageUrl = `${API_BASE_URL}/PetFurMe-Application/${product.product_image}`;
                    } else {
                        // Use default image if no product image
                        imageUrl = DEFAULT_PRODUCT_IMAGE;
                    }

                    return {
                        id: product.id.toString(),
                        name: product.name,
                        code: product.code,
                        quantity: parseInt(product.quantity) || 0,
                        buyingPrice: parseFloat(product.buying_price) || 0,
                        sellingPrice: parseFloat(product.selling_price) || 0,
                        quantityAlert: parseInt(product.quantity_alert) || 0,
                        tax: parseFloat(product.tax) || 0,
                        notes: product.notes || '',
                        image: { uri: imageUrl },
                        categoryId: product.category_id,
                        type: product.category_name || 'Pet Product',
                        backgroundColor: categoryColors[product.category_id] || categoryColors.default
                    };
                });
                setPetProducts(transformedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchPetProducts(selectedCategory);
    }, [selectedCategory]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchPetProducts(selectedCategory).finally(() => {
            setRefreshing(false);
        });
    }, [selectedCategory]);

    return (
        <View style={styles.mainContainer}>
            {/* Fixed Header */}
            <CustomHeader
                title="Pet Products"
                subtitle="Find everything your pet needs"
                navigation={navigation}
                showBackButton={true}
                user_id={user_id}
            />

            {/* Scrollable Content */}
            <View style={styles.contentContainer}>
                {/* Category Filter */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryFilter}
                    contentContainerStyle={styles.categoryFilterContent}
                >
                    {categories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.id && styles.categoryButtonActive
                            ]}
                            onPress={() => setSelectedCategory(category.id)}
                        >
                            <Text style={[
                                styles.categoryButtonText,
                                selectedCategory === category.id && styles.categoryButtonTextActive
                            ]}>
                                {category.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <ScrollView
                    style={styles.mainScroll}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#8146C1']}
                            tintColor="#8146C1"
                        />
                    }
                >
                    {isProductsLoading ? (
                        <ActivityIndicator size="large" color="#8146C1" style={styles.loader} />
                    ) : (
                        <View style={styles.productsGrid}>
                            {petProducts.map((item) => (
                                <TouchableOpacity 
                                    key={item.id} 
                                    style={[styles.productCard, { backgroundColor: item.backgroundColor }]}
                                    onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
                                >
                                    <View style={styles.productImageContainer}>
                                        <View style={styles.productImageWrapper}>
                                            <Image 
                                                source={item.image} 
                                                style={styles.productImage}
                                                resizeMode="contain"
                                                onError={(e) => {
                                                    // If image fails to load, fallback to default image
                                                    e.target.src = DEFAULT_PRODUCT_IMAGE;
                                                }}
                                            />
                                        </View>
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{item.type}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.productDetails}>
                                        <Text style={styles.productName} numberOfLines={2}>
                                            {item.name}
                                        </Text>
                                        <View style={styles.productFooter}>
                                            <Text style={styles.productPrice}>
                                                ₱{item.sellingPrice.toLocaleString()}
                                            </Text>
                                            {item.quantity <= item.quantityAlert && (
                                                <Text style={styles.lowStock}>
                                                    {item.quantity === 0 ? 'Out of Stock' : `${item.quantity} left`}
                                                </Text>
                                            )}
                                        </View>
                                        {item.notes && (
                                            <Text style={styles.productNotes} numberOfLines={1}>
                                                {item.notes}
                                            </Text>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Fixed Bottom Navigation */}
            <BottomNavigation 
                activeScreen="HomePage" 
                user_id={user_id}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        overflow: 'hidden',
    },
    contentContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    mainScroll: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 20, // Reduced padding to account for bottom nav
    },
    categoryFilter: {
        maxHeight: 60,
        backgroundColor: '#F8F2FF',
        zIndex: 1,
    },
    categoryFilterContent: {
        padding: 12,
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#8146C1',
    },
    categoryButtonActive: {
        backgroundColor: '#8146C1',
    },
    categoryButtonText: {
        color: '#8146C1',
        fontWeight: '600',
    },
    categoryButtonTextActive: {
        color: '#FFFFFF',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    productCard: {
        width: '47%',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    productImageContainer: {
        position: 'relative',
        width: '100%',
        height: 150,
        backgroundColor: '#FFFFFF',
    },
    productImageWrapper: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: '#8146C1',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        opacity: 0.9,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    productDetails: {
        padding: 12,
        backgroundColor: '#FFFFFF',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 8,
        height: 40,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: '#8146C1',
    },
    lowStock: {
        fontSize: 10,
        color: '#FF4444',
        fontWeight: '500',
    },
    productNotes: {
        fontSize: 12,
        color: '#666666',
        marginTop: 4,
    },
    loader: {
        marginTop: 40,
    },
});

export default ViewMoreProducts; 