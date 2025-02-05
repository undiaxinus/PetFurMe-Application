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

// Update the PET_PATHS with more recognizable pet icons
const PET_PATHS = {
  dogFace: "M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M8.5,9C9.3,9,10,9.7,10,10.5 S9.3,12,8.5,12S7,11.3,7,10.5S7.7,9,8.5,9z M15.5,9c0.8,0,1.5,0.7,1.5,1.5s-0.7,1.5-1.5,1.5s-1.5-0.7-1.5-1.5S14.7,9,15.5,9z M12,18 c-2.2,0-4-1.8-4-4h8C16,16.2,14.2,18,12,18z",
  catFace: "M12,2C6.5,2,2,6.5,2,12c0,5.5,4.5,10,10,10s10-4.5,10-10C22,6.5,17.5,2,12,2z M8,11c0.6,0,1,0.4,1,1s-0.4,1-1,1s-1-0.4-1-1 S7.4,11,8,11z M16,11c0.6,0,1,0.4,1,1s-0.4,1-1,1s-1-0.4-1-1S15.4,11,16,11z M12,17c-1.7,0-3-1.3-3-3h6C15,15.7,13.7,17,12,17z",
  bone: "M20.5,4.5c-1.5-1.5-3.8-1.5-5.3,0L14,5.7l-4-4L8.8,3C7.3,1.5,5,1.5,3.5,3S1.5,6.8,3,8.3L5.7,11l-4,4l1.2,1.2 c-1.5,1.5-1.5,3.8,0,5.3s3.8,1.5,5.3,0l4-4l4,4c1.5,1.5,3.8,1.5,5.3,0s1.5-3.8,0-5.3L20.5,15l-4-4l1.2-1.2 C19.2,8.3,22,5.5,20.5,4.5z",
  bunny: "M12,2C9.2,2,7,4.2,7,7c0,1.9,1.1,3.5,2.6,4.3L7,14.8V19c0,1.1,0.9,2,2,2h6c1.1,0,2-0.9,2-2v-4.2l-2.6-3.5 C15.9,10.5,17,8.9,17,7C17,4.2,14.8,2,12,2z M9.5,8C8.7,8,8,7.3,8,6.5S8.7,5,9.5,5s1.5,0.7,1.5,1.5S10.3,8,9.5,8z M14.5,8 C13.7,8,13,7.3,13,6.5S13.7,5,14.5,5S16,5.7,16,6.5S15.3,8,14.5,8z",
  bird: "M20,12c0-4.4-3.6-8-8-8s-8,3.6-8,8s3.6,8,8,8S20,16.4,20,12z M11,9c0.6,0,1,0.4,1,1s-0.4,1-1,1s-1-0.4-1-1S10.4,9,11,9z M8,12 c0-1.1,0.9-2,2-2s2,0.9,2,2s-0.9,2-2,2S8,13.1,8,12z M12,18c-2.2,0-4-1.8-4-4h8C16,16.2,14.2,18,12,18z",
  pawPrint: "M17,4c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S19.2,4,17,4z M7,4C4.8,4,3,5.8,3,8s1.8,4,4,4s4-1.8,4-4S9.2,4,7,4z M12,10 c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S14.2,10,12,10z",
  fishBowl: "M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,18c-3.3,0-6-2.7-6-6s2.7-6,6-6s6,2.7,6,6 S15.3,18,12,18z M14,11c-0.6,0-1,0.4-1,1s0.4,1,1,1s1-0.4,1-1S14.6,11,14,11z"
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
    
    // Generate 15 random pets
    for (let i = 0; i < 15; i++) {
      let position;
      do {
        const gridX = Math.floor(Math.random() * 6);
        const gridY = Math.floor(Math.random() * 6);
        position = `${gridX},${gridY}`;
      } while (usedPositions.has(position));
      
      usedPositions.add(position);
      const [gridX, gridY] = position.split(',').map(Number);
      
      pets.push({
        type: petTypes[Math.floor(Math.random() * petTypes.length)],
        top: (gridY * 16.66) + Math.random() * 10,
        left: (gridX * 16.66) + Math.random() * 10,
        rotation: Math.random() * 360,
        size: Math.random() * 15 + 25,
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
            opacity={0.15}
            strokeWidth="0.3"
            stroke="#FFFFFF"
          />
        </Svg>
      </View>
    ));
  };

  return (
    <LinearGradient
      colors={["#A259B5", "#8245A5", "#5E3B96"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <LinearGradient
        colors={["rgba(255,255,255,0.1)", "rgba(0,0,0,0.2)"]}
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
          
          <View style={styles.vetcareContainer}>
            <LinearGradient
              colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vetcareBackground}
            />
            <Image
              source={require("../../assets/images/animal.png")}
              style={styles.vetcare}
            />
          </View>
        </View>

        <View style={styles.swipeContainer}>
          <LinearGradient
            colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.vetcareBackground}
          />
          <MaterialIcons name="keyboard-arrow-up" size={32} color="#fff" />
          <Text style={styles.swipeText}>SWIPE UP TO START</Text>
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
    opacity: 0.12,
  },
  petIcon: {
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.15,
    shadowRadius: 1,
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
  vetcareContainer: {
    position: 'relative',
    marginTop: height * 0.02,
    padding: 15,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  vetcareBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 15,
    opacity: 0.5,
  },
  vetcare: {
    width: width * 0.75,
    height: height * 0.1,
    resizeMode: "contain",
    opacity: 1,
  },
  swipeContainer: {
    position: 'relative',
    alignItems: "center",
    marginBottom: height * 0.08,
    padding: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  swipeText: {
    fontSize: width * 0.035,
    color: "#fff",
    fontFamily: "Fredoka_400Regular",
    letterSpacing: 2,
    marginTop: 5,
  },
});

export default HomeScreen;