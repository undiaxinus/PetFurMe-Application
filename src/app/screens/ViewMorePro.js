import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Image,
	StyleSheet,
	FlatList,
	Alert,
	ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../utils/config"; // Make sure this path is correct

const ProductPage = ({ navigation }) => {
	const [products, setProducts] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchProducts();
	}, []);

	const fetchProducts = async () => {
		try {
			setIsLoading(true);
			const response = await fetch(`${API_BASE_URL}/PetFurMe-Application/api/products/get_products.php`);
			
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();
			console.log("Products data:", data); // For debugging
			
			if (data.success) {
				if (!data.products || data.products.length === 0) {
					console.log("No products found");
					return;
				}

				console.log(`Found ${data.products.length} products`);
				
				const transformedProducts = data.products.map(product => {
					console.log("Processing product:", product); // Debug individual product
					return {
						id: product.id.toString(),
						name: product.name || '',
						price: product.selling_price ? product.selling_price.toString() : '0',
						weight: product.notes || 'N/A',
						image: product.product_image 
							? { uri: `${API_BASE_URL}/PetFurMe-Application/${product.product_image}` }
							: require("../../assets/images/meowmix.png"),
						tag: product.category_name || null,
						discount: null,
						quantity: product.quantity || 0
					};
				});
				
				console.log("Transformed products:", transformedProducts);
				setProducts(transformedProducts);
			} else {
				throw new Error(data.message || 'Failed to fetch products');
			}
		} catch (error) {
			console.error('Error fetching products:', error);
			Alert.alert(
				'Error',
				'Failed to load products. Please try again later.'
			);
		} finally {
			setIsLoading(false);
		}
	};

	// Filter products based on search query
	const filteredProducts = products.filter(product => 
		product.name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const renderProduct = ({ item }) => (
		<View style={styles.productCard}>
			<View style={styles.tagContainer}>
				{item.tag && <Text style={styles.tagText}>{item.tag}</Text>}
				{item.discount && (
					<Text style={styles.discountText}>{item.discount}</Text>
				)}
			</View>
			<Image source={item.image} style={styles.productImage} />
			<Text style={styles.productPrice}>Rs {item.price}</Text>
			<Text style={styles.productName}>{item.name}</Text>
			{item.weight && <Text style={styles.productWeight}>{item.weight}</Text>}
			<View style={styles.actionContainer}>
				<TouchableOpacity style={styles.addToCartButton}>
					<Text style={styles.addToCartText}>
						Stocks: {item.quantity || 0}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<TouchableOpacity 
					style={styles.menuButton}
					onPress={() => navigation.openDrawer()}
				>
					<Ionicons name="menu" size={30} color="#FFFFFF" />
				</TouchableOpacity>

				<View style={styles.searchContainer}>
					<TextInput
						style={styles.searchBar}
						placeholder="Search"
						placeholderTextColor="#888888"
						value={searchQuery}
						onChangeText={setSearchQuery}
					/>
					<TouchableOpacity style={styles.searchButton}>
						<Image
							source={require("../../assets/images/search.png")}
							style={styles.search}
						/>
					</TouchableOpacity>
				</View>
			</View>

			{/* Show loading indicator */}
			{isLoading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#8146C1" />
				</View>
			) : products.length === 0 ? (
				<View style={styles.noProductsContainer}>
					<Text style={styles.noProductsText}>No products found</Text>
				</View>
			) : (
				<FlatList
					data={filteredProducts}
					keyExtractor={(item) => item.id}
					renderItem={renderProduct}
					contentContainerStyle={styles.productList}
					numColumns={2}
				/>
			)}

			{/* Bottom Navigation */}
			<View style={styles.bottomNav}>
        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('HomePage')}
        >
            <Ionicons name="home-outline" size={24} color="#8146C1" />
            <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('ChatScreen')}
        >
            <Ionicons name="chatbubble-outline" size={24} color="#8146C1" />
            <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>

		<TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('NotificationScreen')}
        >
			<Ionicons name="notifications-outline" size={24} color="#8146C1" />
			<Text style={styles.navText}>Notifications</Text>
		</TouchableOpacity>

        <TouchableOpacity 
            style={styles.navItem}
            onPress={() => navigation.navigate('Help')}
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
		backgroundColor: "#FFFFFF",
		paddingTop: 40,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 15,
		backgroundColor: '#8146C1',
		height: 100,
		paddingTop: 20,
		top: -40,
	},
	menuButton: {
		padding: 5,
	},
	searchContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 10,
		backgroundColor: '#D9D9D9',
		borderRadius: 8,
		paddingRight: 10,
	},
	searchBar: {
		flex: 1,
		paddingHorizontal: 15,
		paddingVertical: 8,
		fontSize: 14,
		color: "#000",
		fontWeight: "bold",
	},
	searchButton: {
		padding: 5,
	},
	search: {
		width: 20,
		height: 20,
		resizeMode: "contain",
	},
	productList: {
		padding: 10,
	},
	productCard: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		elevation: 3,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 15,
		marginHorizontal: 5,
		padding: 10,
	},
	tagContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: -15,
	},
	tagText: {
		backgroundColor: "#FF8ACF",
		color: "#FFFFFF",
		fontSize: 10,
		paddingHorizontal: 5,
		borderRadius: 5,
		marginBottom: 5,
	},
	discountText: {
		backgroundColor: "#FFC107",
		color: "#FFFFFF",
		fontSize: 10,
		paddingHorizontal: 5,
		borderRadius: 5,
		marginBottom: 5,
	},
	productImage: {
		width: "80%",
		height: 80,
		resizeMode: "contain",
		marginBottom: 10,
	},
	productName: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#000",
		textAlign: "center",
	},
	productPrice: {
		fontSize: 13,
		color: "#5CB15A",
		fontWeight: "bold",
		marginBottom: 5,
	},
	productWeight: {
		fontSize: 10,
		color: "#868889",
		marginBottom: 10,
		textAlign: "center",
	},
	actionContainer: {
		flexDirection: "column",
		alignItems: "center",
	},
	addToCartButton: {
		flexDirection: "row",
		borderRadius: 10,
		padding: 5,
		alignItems: "center",
		justifyContent: "center",
		marginTop: 5,
	},
	addToCartText: {
		color: "#808080",
		marginLeft: 5,
		fontSize: 12,
		fontWeight: "bold",
	},
	bottomNav: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'space-around',
		paddingVertical: 10,
		backgroundColor: '#FFFFFF',
		borderTopWidth: 1,
		borderTopColor: 'rgba(0,0,0,0.1)',
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
	navIcon: {
		width: 30,
		height: 30,
		resizeMode: "contain",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	noProductsContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	noProductsText: {
		fontSize: 16,
		color: '#666',
	},
});

export default ProductPage;
