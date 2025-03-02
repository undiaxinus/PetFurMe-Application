import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVER_IP } from '../config/constants';

const API_BASE_URL = `http://${SERVER_IP}`;

console.log('SERVER_IP:', SERVER_IP);
console.log('Full API URL:', `${API_BASE_URL}/PetFurMe-Application/api/products/get_home_products.php`);

const categoryColors = {
    '1': { bg: '#FFE8E8', tag: '#FF4444', text: '#FFFFFF' }, // Food
    '2': { bg: '#E8FFF1', tag: '#44FF88', text: '#FFFFFF' }, // Medicine
    '3': { bg: '#E8F1FF', tag: '#4488FF', text: '#FFFFFF' }, // Accessories
    '4': { bg: '#FFE8FF', tag: '#FF44FF', text: '#FFFFFF' }, // Grooming
    'default': { bg: '#F8F8F8', tag: '#8146C1', text: '#FFFFFF' }
};

const PetProductsSection = ({ navigation, user_id }) => {
    const [petProducts, setPetProducts] = useState([]);
    const [isProductsLoading, setIsProductsLoading] = useState(false);

    const fetchPetProducts = async () => {
        try {
            setIsProductsLoading(true);
            
            const response = await fetch(
                `${API_BASE_URL}/PetFurMe-Application/api/products/get_home_products.php`,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );

            const responseText = await response.text();
            console.log('Response status:', response.status);

            if (!responseText.trim()) {
                throw new Error('Empty response from server');
            }

            const data = JSON.parse(responseText);
            
            if (!data || !data.success) {
                throw new Error(data.message || 'Failed to fetch products');
            }

            if (!Array.isArray(data.products)) {
                throw new Error('Invalid products data structure');
            }

            const transformedProducts = data.products.map(product => ({
                id: product.id?.toString() || '',
                name: product.name || '',
                code: product.code || '',
                quantity: parseInt(product.quantity) || 0,
                sellingPrice: parseInt(product.selling_price || 0) / 100,
                quantityAlert: parseInt(product.quantity_alert) || 5,
                notes: product.notes || '',
                image: { 
                    uri: product.product_image_data
                        ? `data:image/jpeg;base64,${product.product_image_data}`
                        : `${API_BASE_URL}/PetFurMe-Application/uploads/defaults/product-placeholder.png`
                },
                categoryId: product.category_id?.toString() || 'default',
                type: product.category_name || 'Pet Product'
            }));

            console.log(`Transformed ${transformedProducts.length} products`);
            setPetProducts(transformedProducts);

        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert(
                'Error',
                'Failed to load products. Please check your connection and try again.'
            );
        } finally {
            setIsProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchPetProducts();
    }, []);

    const renderProduct = (item) => (
        <TouchableOpacity 
            key={item.id}
            style={styles.productCard}
            onPress={() => navigation.navigate("ProductDetails", { product: item })}
            activeOpacity={0.7}
        >
            <View style={styles.imageContainer}>
                <Image 
                    source={item.image} 
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={(e) => {
                        console.error('Image loading error:', e.nativeEvent.error);
                        // Update the product's image to default if loading fails
                        const updatedProducts = petProducts.map(p => {
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
                        setPetProducts(updatedProducts);
                    }}
                />
                {item.quantity === 0 ? (
                    <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                ) : item.quantity <= item.quantityAlert && (
                    <View style={styles.stockBadge}>
                        <Text style={styles.stockText}>Low Stock</Text>
                    </View>
                )}
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.productPrice}>
                    ₱{item.sellingPrice.toFixed(2)}
                </Text>
                <Text style={styles.stockCount}>In Stock: {item.quantity}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.petProductsBox}>
            <View style={styles.sectionHeader}>
                <View style={styles.leftHeader}>
                    <Ionicons name="bag" size={24} color="#8146C1" style={styles.productIcon} />
                    <Text style={styles.petproducts}>Pet Products</Text>
                </View>
                <TouchableOpacity 
                    style={styles.viewMoreButton}
                    onPress={() => navigation.navigate("ProductListScreen", { user_id })}
                >
                    <Text style={styles.viewmore}>View More</Text>
                </TouchableOpacity>
            </View>

            {isProductsLoading ? (
                <ActivityIndicator size="large" color="#8146C1" style={styles.loader} />
            ) : petProducts.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No products available</Text>
                </View>
            ) : (
                <View style={styles.productsGrid}>
                    {petProducts.slice(0, 4).map(renderProduct)}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    petProductsBox: {
        backgroundColor: "#F8F2FF",
        borderRadius: 15,
        padding: 20,
        marginHorizontal: 16,
        marginBottom: 30,
        marginTop: 15,
        elevation: 3,
        shadowColor: '#8146C1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
        paddingHorizontal: 4,
    },
    leftHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    productIcon: {
        marginRight: 4,
    },
    petproducts: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        letterSpacing: 0.3,
    },
    viewMoreButton: {
        backgroundColor: '#8146C1',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#8146C1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    viewmore: {
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 12,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
        paddingHorizontal: 4,
    },
    productCard: {
        width: '48%',
        backgroundColor: '#FFF',
        borderRadius: 12,
        elevation: 3,
        overflow: 'hidden',
        marginBottom: 16,
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
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    productInfo: {
        padding: 12,
        height: 90,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        height: 36,
        lineHeight: 18,
        color: '#333',
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#8146C1',
        marginBottom: 4,
    },
    stockCount: {
        fontSize: 12,
        color: '#666',
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
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        backgroundColor: '#FF4444',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
    },
    loader: {
        padding: 20,
    },
    emptyState: {
        padding: 20,
        alignItems: 'center',
    },
    emptyStateText: {
        fontSize: 16,
        color: '#666',
        fontStyle: 'italic',
    },
});

export default PetProductsSection; 