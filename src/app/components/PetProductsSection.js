import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SERVER_IP } from '../config/constants';

const API_BASE_URL = `http://${SERVER_IP}`;

const PetProductsSection = ({ navigation, user_id }) => {
    const [petProducts, setPetProducts] = useState([]);
    const [isProductsLoading, setIsProductsLoading] = useState(false);

    const fetchPetProducts = async () => {
        try {
            setIsProductsLoading(true);
            const response = await fetch(`${API_BASE_URL}/PetFurMe-Application/api/products/get_home_products.php`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            console.log('Received products data:', data);

            const categoryColors = {
                1: {
                    bg: '#FFF5F9',
                    tag: '#FF4D8D',
                    text: '#FFFFFF'
                }, // Food category
                2: {
                    bg: '#F0F5FF',
                    tag: '#4D79FF',
                    text: '#FFFFFF'
                }, // Medicine category
                3: {
                    bg: '#F2FFF5',
                    tag: '#4DAF6E',
                    text: '#FFFFFF'
                }, // Accessories category
                4: {
                    bg: '#FFF8F0',
                    tag: '#FF8B4D',
                    text: '#FFFFFF'
                }, // Grooming category
                default: {
                    bg: '#F5F5F5',
                    tag: '#8146C1',
                    text: '#FFFFFF'
                }
            };

            if (data.success) {
                const transformedProducts = data.products.map(product => ({
                    id: product.id.toString(),
                    name: product.name,
                    code: product.code,
                    quantity: parseInt(product.quantity) || 0,
                    buyingPrice: parseFloat(product.buying_price) || 0,
                    sellingPrice: parseFloat(product.selling_price) || 0,
                    quantityAlert: parseInt(product.quantity_alert) || 0,
                    tax: parseFloat(product.tax) || 0,
                    notes: product.notes || '',
                    image: product.product_image 
                        ? { uri: `${API_BASE_URL}/PetFurMe-Application/${product.product_image}` }
                        : require("../../assets/images/meowmix.png"),
                    categoryId: product.category_id,
                    type: product.category_name || 'Pet Product',
                    backgroundColor: categoryColors[product.category_id]?.bg || categoryColors.default.bg,
                    tagColor: categoryColors[product.category_id]?.tag || categoryColors.default.tag,
                    tagTextColor: categoryColors[product.category_id]?.text || categoryColors.default.text
                }));
                setPetProducts(transformedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsProductsLoading(false);
        }
    };

    useEffect(() => {
        fetchPetProducts();
    }, []);

    return (
        <View style={styles.petProductsBox}>
            <View style={styles.sectionHeader}>
                <View style={styles.leftHeader}>
                    <Ionicons 
                        name="bag" 
                        size={24} 
                        color="#8146C1" 
                        style={styles.productIcon}
                    />
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
                <ActivityIndicator size="small" color="#8146C1" />
            ) : (
                <View style={styles.productsGrid}>
                    {petProducts.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={[styles.petProductCard, { backgroundColor: item.backgroundColor }]}
                            onPress={() => navigation.navigate("ProductDetails", { productId: item.id })}
                        >
                            <View style={styles.productImageContainer}>
                                <View style={styles.productImageWrapper}>
                                    <Image 
                                        source={item.image} 
                                        style={styles.productImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View style={[styles.badge, { backgroundColor: item.tagColor }]}>
                                    <Text style={[styles.badgeText, { color: item.tagTextColor }]}>{item.type}</Text>
                                </View>
                            </View>
                            <View style={styles.productDetails}>
                                <Text style={styles.productName} numberOfLines={1}>
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
        gap: 12,
        paddingHorizontal: 4,
    },
    petProductCard: {
        borderRadius: 12,
        width: '47%',
        overflow: 'hidden',
        elevation: 4,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    productImageContainer: {
        position: 'relative',
        width: '100%',
        height: 130,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    productImageWrapper: {
        width: '90%',
        height: '90%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        padding: 8,
    },
    badge: {
        position: 'absolute',
        top: 8,
        left: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.3,
    },
    productDetails: {
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    productName: {
        fontSize: 14,
        fontWeight: "600",
        color: '#333',
        marginBottom: 6,
        lineHeight: 18,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productPrice: {
        fontSize: 15,
        fontWeight: "700",
        color: '#8146C1',
    },
    productNotes: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    lowStock: {
        fontSize: 10,
        color: '#FF4444',
        fontWeight: '600',
        backgroundColor: 'rgba(255,68,68,0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
});

export default PetProductsSection; 