import React, { useState, useEffect } from "react";
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

const { width, height } = Dimensions.get('window');

// Update the PET_PATHS with more pet-like silhouettes
const PET_PATHS = {
  pawPrint: "M17.5,12.5c2.5,0,4.5-2,4.5-4.5c0-2.5-2-4.5-4.5-4.5C15,3.5,13,5.5,13,8C13,10.5,15,12.5,17.5,12.5z M6.5,12.5 c2.5,0,4.5-2,4.5-4.5c0-2.5-2-4.5-4.5-4.5C4,3.5,2,5.5,2,8C2,10.5,4,12.5,6.5,12.5z M6.5,14.5C4,14.5,0,16.5,0,19v2h13v-2 C13,16.5,9,14.5,6.5,14.5z M17.5,14.5c-0.3,0-0.7,0-1.1,0.1c1.3,1,2.1,2.4,2.1,3.9v2h6v-2C24.5,16.5,20.5,14.5,17.5,14.5z",
  dogFace: "M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M7.5,9c0.8,0,1.5,0.7,1.5,1.5S8.3,12,7.5,12 S6,11.3,6,10.5S6.7,9,7.5,9z M16.5,9c0.8,0,1.5,0.7,1.5,1.5S17.3,12,16.5,12S15,11.3,15,10.5S15.7,9,16.5,9z M12,17.5 c-2.3,0-4.3-1.5-5.1-3.5h10.2C16.3,16,14.3,17.5,12,17.5z",
  catFace: "M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M8,13c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2 S9.1,13,8,13z M12,18c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,18,12,18z M16,13c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2 S17.1,13,16,13z",
  bone: "M20.5,3.5c-1.4-1.4-3.6-1.4-5,0c-0.6,0.6-1,1.5-1,2.5H9.5c0-0.9-0.4-1.8-1-2.5c-1.4-1.4-3.6-1.4-5,0s-1.4,3.6,0,5 c0.6,0.6,1.5,1,2.5,1v5c-0.9,0-1.8,0.4-2.5,1c-1.4,1.4-1.4,3.6,0,5s3.6,1.4,5,0c0.6-0.6,1-1.5,1-2.5h5c0,0.9,0.4,1.8,1,2.5 c1.4,1.4,3.6,1.4,5,0s1.4-3.6,0-5c-0.6-0.6-1.5-1-2.5-1v-5c0.9,0,1.8-0.4,2.5-1C21.9,7.1,21.9,4.9,20.5,3.5z",
};

const HomeScreen = ({ navigation }) => {
  const [gradientAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));
  const pan = useState(new Animated.ValueXY())[0];
  const backgroundY = useState(new Animated.Value(0))[0];

  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
  });

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      if (gesture.dy < 0) { // Only allow upward swipe
        pan.setValue({ x: 0, y: gesture.dy });
      }
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dy < -50) { // Threshold for navigation
        Animated.timing(pan, {
          toValue: { x: 0, y: -height },
          duration: 300,
          useNativeDriver: true,
        }).start(() => navigation.navigate("LoginScreen"));
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    // Background animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(backgroundY, {
          toValue: -20,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundY, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Gradient and fade animations
    Animated.parallel([
      Animated.loop(
        Animated.sequence([
          Animated.timing(gradientAnimation, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false,
          }),
          Animated.timing(gradientAnimation, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: false,
          }),
        ])
      ),
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (!fontsLoaded) return null;

  const backgroundColor1 = gradientAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#A259B5", "#7B66FF"],
  });

  const generateRandomPets = () => {
    const petTypes = Object.keys(PET_PATHS);
    const pets = [];
    const usedPositions = new Set();
    
    // Generate 12 random pets
    for (let i = 0; i < 12; i++) {
      let position;
      do {
        const gridX = Math.floor(Math.random() * 5);
        const gridY = Math.floor(Math.random() * 5);
        position = `${gridX},${gridY}`;
      } while (usedPositions.has(position));
      
      usedPositions.add(position);
      const [gridX, gridY] = position.split(',').map(Number);
      
      pets.push({
        type: petTypes[Math.floor(Math.random() * petTypes.length)],
        top: (gridY * 20) + Math.random() * 15,
        left: (gridX * 20) + Math.random() * 15,
        rotation: Math.random() * 360,
        size: Math.random() * 20 + 30, // Slightly smaller for better look
      });
    }
    return pets;
  };

  const renderPetIcons = () => {
    const pets = generateRandomPets();
    return pets.map((pet, index) => (
      <View
        key={index}
        style={[
          styles.backgroundIcon,
          {
            top: `${pet.top}%`,
            left: `${pet.left}%`,
            transform: [{ rotate: `${pet.rotation}deg` }],
          }
        ]}
      >
        <Svg
          width={pet.size}
          height={pet.size}
          viewBox="0 0 24 24"
          style={styles.petIcon}
        >
          <Path
            d={PET_PATHS[pet.type]}
            fill="#FFFFFF"
            opacity={0.12}
            strokeWidth="0.5"
            stroke="#FFFFFF"
          />
        </Svg>
      </View>
    ));
  };

  return (
    <View style={styles.background}>
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.2)"]}
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
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.gradientCircle,
              { backgroundColor: backgroundColor1 },
            ]}
          >
            <Image
              source={require("../../assets/images/finallogo.png")}
              style={styles.image}
            />
          </Animated.View>
          
          <Image
            source={require("../../assets/images/animal.png")}
            style={styles.vetcare}
          />
        </View>

        <View style={styles.swipeContainer}>
          <MaterialIcons name="keyboard-arrow-up" size={32} color="#fff" />
          <Text style={styles.swipeText}>SWIPE UP TO START</Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#A259B5', // Solid background color
  },
  gradientOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.6,
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
    opacity: 0.15,
  },
  petIcon: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  container: {
    flex: 1,
    width: width,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: height * 0.15,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: -height * 0.05, // Move logo up slightly
  },
  gradientCircle: {
    width: width * 0.48, // Slightly larger
    height: width * 0.48,
    borderRadius: width * 0.24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    elevation: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 1.5, // Thinner border
    borderColor: '#B61DB0',
  },
  image: {
    width: "90%", // Larger logo
    height: "90%",
    resizeMode: "contain",
  },
  vetcare: {
    width: width * 0.75, // Larger text
    height: height * 0.1,
    resizeMode: "contain",
    marginTop: height * 0.02,
    opacity: 0.95, // Slightly more visible
  },
  swipeContainer: {
    alignItems: "center",
    marginBottom: height * 0.08,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  swipeText: {
    fontSize: width * 0.035,
    color: "#fff",
    fontFamily: "Fredoka_400Regular",
    letterSpacing: 2,
    marginTop: 5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default HomeScreen;