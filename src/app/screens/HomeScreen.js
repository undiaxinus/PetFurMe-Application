import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  Image,
  StyleSheet,
  View,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Fredoka_400Regular } from "@expo-google-fonts/fredoka";
import { MaterialIcons } from '@expo/vector-icons';
import { Path, Svg } from 'react-native-svg';
import { API_BASE_URL, getApiUrl } from '../../utils/config';

const { width, height } = Dimensions.get('window');

const PETS = ['paw'];

const HomeScreen = ({ navigation }) => {
  // Use refs for animations to prevent cleanup issues
  const gradientAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const pan = useRef(new Animated.ValueXY()).current;
  const backgroundY = useRef(new Animated.Value(0)).current;

  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
  });

  // Add state for pets
  const [pets, setPets] = useState([]);

  // Add useEffect to fetch pets
  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      const url = getApiUrl('pets/get_pets.php');
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Pet data:', data.pets);
      
      if (data.success) {
        const transformedPets = data.pets.map(pet => ({
          id: pet.id.toString(),
          name: pet.name,
          image: {
            uri: pet.photo 
              ? `${API_BASE_URL}/PetFurMe-Application/uploads/pet_photos/${pet.photo}`
              : `${API_BASE_URL}/PetFurMe-Application/uploads/defaults/paw.png`
          }
        }));
        setPets(transformedPets);
      }
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  // Cleanup function for animations
  useEffect(() => {
    const animations = [];

    // Start your animations
    const fadeIn = Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    });
    animations.push(fadeIn);

    const gradient = Animated.timing(gradientAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    });
    animations.push(gradient);

    // Start all animations
    Animated.parallel(animations).start();

    // Cleanup
    return () => {
      animations.forEach(anim => anim.stop());
      fadeAnimation.setValue(0);
      gradientAnimation.setValue(0);
      pan.setValue({ x: 0, y: 0 });
      backgroundY.setValue(0);
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy < 0) {
          pan.setValue({ x: 0, y: gesture.dy });
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -50) {
          Animated.timing(pan, {
            toValue: { x: 0, y: -height },
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            navigation.navigate("LoginScreen");
          });
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!fontsLoaded) return null;

  const backgroundColor1 = gradientAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#A259B5", "#7B66FF"],
  });

  const generateRandomPets = () => {
    const pets = [];
    const usedPositions = new Set();
    
    // Generate 20 random pets
    for (let i = 0; i < 20; i++) {
      let position;
      do {
        const gridX = Math.floor(Math.random() * 8);
        const gridY = Math.floor(Math.random() * 8);
        position = `${gridX},${gridY}`;
      } while (usedPositions.has(position));
      
      usedPositions.add(position);
      const [gridX, gridY] = position.split(',').map(Number);
      
      pets.push({
        type: PETS[Math.floor(Math.random() * PETS.length)],
        top: (gridY * 12.5) + Math.random() * 8,
        left: (gridX * 12.5) + Math.random() * 8,
        rotation: Math.random() * 360,
        size: Math.random() * 20 + 35,
        opacity: Math.random() * 0.03 + 0.02,
      });
    }
    return pets;
  };

  const renderPetIcons = () => {
    if (pets.length === 0) {
      return generateRandomPets().map((pet, index) => (
        <View
          key={index}
          style={[
            styles.backgroundIcon,
            {
              top: `${pet.top}%`,
              left: `${pet.left}%`,
              transform: [
                { rotate: `${pet.rotation}deg` },
                { scale: pet.size / 40 }
              ],
              opacity: pet.opacity
            }
          ]}
        >
          <Image
            source={require("../../../uploads/defaults/paw_solid.png")}
            style={[styles.petIcon, {
              transform: [{ scale: 0.8 }]
            }]}
          />
        </View>
      ));
    }

    return pets.map((pet, index) => (
      <View
        key={pet.id}
        style={[
          styles.backgroundIcon,
          {
            top: `${Math.random() * 80}%`,
            left: `${Math.random() * 80}%`,
            transform: [
              { rotate: `${Math.random() * 360}deg` },
              { scale: (Math.random() * 20 + 35) / 40 }
            ],
            opacity: Math.random() * 0.03 + 0.02
          }
        ]}
      >
        <Image
          source={pet.image}
          style={[styles.petIcon, {
            transform: [{ scale: 0.8 }]
          }]}
        />
      </View>
    ));
  };

  // Add this function to calculate responsive dimensions
  const getResponsiveDimension = (baseSize, minSize, maxSize) => {
    const calculatedSize = Math.min(width, height) * baseSize;
    return Math.max(minSize, Math.min(calculatedSize, maxSize));
  };

  return (
    <LinearGradient
      colors={["#A259B5", "#8245A5", "#5E3B96"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.15)", "rgba(0,0,0,0.15)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientOverlay}
      />
      
      <View style={styles.backgroundPets}>
        {renderPetIcons()}
      </View>
      
      <Animated.View 
        style={[
          styles.container,
          {
            opacity: fadeAnimation,
            transform: [{ translateY: pan.y }],
          }
        ]}
        {...panResponder.panHandlers}
      >
        <View style={[styles.logoContainer, { flex: 1 }]}>
          <Animated.View
            style={[
              styles.gradientCircle,
              { 
                backgroundColor: backgroundColor1,
                width: getResponsiveDimension(0.55, 160, 200),
                height: getResponsiveDimension(0.55, 160, 200),
                borderRadius: getResponsiveDimension(0.275, 80, 140),
              }
            ]}
          >
            <Image
              source={require("../../assets/images/finallogo.png")}
              style={[styles.image, {
                width: getResponsiveDimension(0.48, 140, 260),
                height: getResponsiveDimension(0.48, 140, 260),
              }]}
            />
          </Animated.View>
          
          <View style={[styles.vetcareContainer, {
            marginTop: height * 0.04,
            width: Math.min(width * 0.85, 400),
            transform: [{ scale: 1.1 }]
          }]}>
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vetcareBackground}
            />
            <Image
              source={require("../../assets/images/animal.png")}
              style={[styles.vetcare, {
                width: '100%',
                height: getResponsiveDimension(0.15, 45, 85),
              }]}
            />
          </View>
        </View>

        <View style={[styles.swipeContainer, {
          paddingVertical: getResponsiveDimension(0.025, 12, 20),
          paddingHorizontal: getResponsiveDimension(0.05, 20, 35),
          transform: [{ scale: 1.1 }]
        }]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.vetcareBackground}
          />
          <MaterialIcons 
            name="keyboard-arrow-up" 
            size={getResponsiveDimension(0.07, 28, 44)} 
            color="#fff" 
          />
          <Text style={[styles.swipeText, {
            fontSize: getResponsiveDimension(0.035, 14, 22),
          }]}>SWIPE UP TO START</Text>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.5,
  },
  backgroundPets: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  backgroundIcon: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petIcon: {
    width: 40,
    height: 40,
    tintColor: '#FFFFFF',
    resizeMode: 'contain',
    opacity: 0.8,
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: height * 0.1,
  },
  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: height * 0.05,
  },
  gradientCircle: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    borderWidth: 0.2,
    borderColor: 'rgba(182, 29, 176, 0.8)',
  },
  image: {
    resizeMode: "contain",
  },
  vetcareContainer: {
    position: 'relative',
    padding: Math.min(width * 0.035, 18),
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  vetcareBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    opacity: 0.7,
  },
  vetcare: {
    resizeMode: "contain",
    opacity: 1,
  },
  swipeContainer: {
    position: 'relative',
    alignItems: "center",
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: height * 0.06,
  },
  swipeText: {
    color: "#fff",
    fontFamily: "Fredoka_400Regular",
    letterSpacing: 2,
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default HomeScreen;