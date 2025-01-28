import React, { useRef, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Fredoka_400Regular } from "@expo-google-fonts/fredoka";
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Roboto_900Black } from '@expo-google-fonts/roboto';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

// Add this constant for the brand color
const BRAND_PURPLE = '#4A4A8F';

const HomeScreen = () => {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const cardSlideAnim = useRef(new Animated.Value(100)).current;
  
  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
    Roboto_900Black,
  });

  useEffect(() => {
    // Splash screen animation sequence
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(cardSlideAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous rotation animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const renderBackgroundPaws = () => {
    return (
      <>
        {/* Top section */}
        <MaterialCommunityIcons 
          name="paw" 
          size={40} 
          color="rgba(255, 255, 255, 0.15)" 
          style={[styles.backgroundPaw, { top: '8%', left: '10%', transform: [{ rotate: '45deg' }] }]} 
        />
        <FontAwesome5 
          name="dog" 
          size={35} 
          color="rgba(255, 255, 255, 0.12)" 
          style={[styles.backgroundPaw, { top: '12%', right: '15%', transform: [{ rotate: '-20deg' }] }]} 
        />
        <MaterialCommunityIcons 
          name="paw" 
          size={25} 
          color="rgba(255, 255, 255, 0.1)" 
          style={[styles.backgroundPaw, { top: '20%', left: '30%', transform: [{ rotate: '120deg' }] }]} 
        />

        {/* Upper middle section */}
        <FontAwesome5 
          name="cat" 
          size={30} 
          color="rgba(255, 255, 255, 0.13)" 
          style={[styles.backgroundPaw, { top: '32%', left: '15%', transform: [{ rotate: '15deg' }] }]} 
        />
        <MaterialCommunityIcons 
          name="rabbit" 
          size={35} 
          color="rgba(255, 255, 255, 0.12)" 
          style={[styles.backgroundPaw, { top: '35%', right: '20%', transform: [{ rotate: '-15deg' }] }]} 
        />
        <MaterialCommunityIcons 
          name="paw" 
          size={20} 
          color="rgba(255, 255, 255, 0.15)" 
          style={[styles.backgroundPaw, { top: '45%', left: '40%', transform: [{ rotate: '45deg' }] }]} 
        />

        {/* Lower middle section */}
        <MaterialCommunityIcons 
          name="paw" 
          size={25} 
          color="rgba(255, 255, 255, 0.12)" 
          style={[styles.backgroundPaw, { bottom: '35%', left: '15%', transform: [{ rotate: '30deg' }] }]} 
        />
        <FontAwesome5 
          name="dog" 
          size={28} 
          color="rgba(255, 255, 255, 0.14)" 
          style={[styles.backgroundPaw, { bottom: '32%', right: '10%', transform: [{ rotate: '-25deg' }] }]} 
        />
        <MaterialCommunityIcons 
          name="paw" 
          size={22} 
          color="rgba(255, 255, 255, 0.11)" 
          style={[styles.backgroundPaw, { bottom: '40%', right: '35%', transform: [{ rotate: '90deg' }] }]} 
        />

        {/* Bottom section */}
        <FontAwesome5 
          name="cat" 
          size={22} 
          color="rgba(255, 255, 255, 0.13)" 
          style={[styles.backgroundPaw, { bottom: '15%', left: '30%', transform: [{ rotate: '20deg' }] }]} 
        />
        <MaterialCommunityIcons 
          name="paw" 
          size={20} 
          color="rgba(255, 255, 255, 0.15)" 
          style={[styles.backgroundPaw, { bottom: '10%', right: '25%', transform: [{ rotate: '70deg' }] }]} 
        />
        <MaterialCommunityIcons 
          name="paw" 
          size={18} 
          color="rgba(255, 255, 255, 0.12)" 
          style={[styles.backgroundPaw, { bottom: '5%', left: '15%', transform: [{ rotate: '-45deg' }] }]} 
        />
      </>
    );
  };

  // Add loading screen
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_PURPLE} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#537FE7', '#C2D9FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        {renderBackgroundPaws()}
        
        <View style={styles.content}>
          <Animated.View 
            style={[styles.brandContainer, {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
                { perspective: 1000 }
              ]
            }]}
          >
            <View style={styles.logoWrapper}>
              <Text style={styles.logoText}>
                <Text style={styles.vetText}>Vet</Text>
                <Text style={styles.careText}>Care</Text>
              </Text>
              <Animated.View 
                style={[styles.iconContainer, { transform: [{ rotate: spin }] }]}
              >
                <MaterialCommunityIcons 
                  name="paw" 
                  size={32} 
                  color="#FF5757" 
                  style={styles.pawIcon}
                />
              </Animated.View>
            </View>
            <Text style={styles.clinicText}>ANIMAL CLINIC</Text>
            <Text style={styles.tagline}>Where caring means more.</Text>
          </Animated.View>

          <Animated.View 
            style={[styles.cardContainer, {
              transform: [
                { translateY: cardSlideAnim },
                { perspective: 1000 }
              ],
              opacity: fadeAnim
            }]}
          >
            <View style={styles.card}>
              <View style={styles.cardDecoration} />
              <View style={styles.cardDecorationAccent} />
              <View style={styles.cardBackground} />
              <View style={styles.cardBackground2} />
              <CardPattern />
              
              <View style={styles.mainContent}>
                <View style={styles.welcomeContainer}>
                  <View style={styles.welcomeIcon}>
                    <MaterialCommunityIcons name="heart-pulse" size={24} color="#537FE7" />
                  </View>
                  <Text style={styles.welcomeText}>Great to see you!</Text>
                  <Text style={styles.subText}>
                    Continue your journey in providing the best care for your pets
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.loginButton} 
                  onPress={() => {
                    console.log('Continue button pressed');
                    navigation.navigate('Login');
                  }}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                  <View style={styles.buttonIconContainer}>
                    <MaterialCommunityIcons 
                      name="arrow-right" 
                      size={20} 
                      color="#FFFFFF" 
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Add this new component for the card pattern
const CardPattern = () => (
  <>
    <View style={styles.cardPatternTop}>
      <MaterialCommunityIcons name="paw" size={16} color="rgba(83, 127, 231, 0.1)" style={{ transform: [{ rotate: '45deg' }] }} />
      <MaterialCommunityIcons name="paw" size={14} color="rgba(83, 127, 231, 0.08)" style={{ transform: [{ rotate: '-15deg' }] }} />
      <MaterialCommunityIcons name="paw" size={12} color="rgba(83, 127, 231, 0.06)" style={{ transform: [{ rotate: '30deg' }] }} />
    </View>
    <View style={styles.cardPatternBottom}>
      <MaterialCommunityIcons name="paw" size={14} color="rgba(74, 74, 143, 0.08)" style={{ transform: [{ rotate: '-25deg' }] }} />
      <MaterialCommunityIcons name="paw" size={16} color="rgba(74, 74, 143, 0.06)" style={{ transform: [{ rotate: '20deg' }] }} />
    </View>
  </>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  decorativeCircle1: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -width * 0.2,
    right: -width * 0.2,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -width * 0.1,
    left: -width * 0.1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: height * 0.15,
    paddingBottom: height * 0.08,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: height * 0.04,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 52,
    fontFamily: 'Fredoka_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontWeight: '600',
    letterSpacing: 0,
  },
  vetText: {
    color: BRAND_PURPLE,
    fontFamily: 'Roboto_900Black',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  careText: {
    color: '#FF5757',
    fontFamily: 'Roboto_900Black',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  iconContainer: {
    marginLeft: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    width: 48,
    height: 48,
    overflow: 'hidden',
    position: 'relative',
  },
  pawIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [
      { translateX: -16 },
      { translateY: -16 },
    ],
  },
  clinicText: {
    fontSize: 32,
    color: BRAND_PURPLE,
    fontFamily: 'Roboto_900Black',
    marginTop: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontWeight: '900',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Fredoka_400Regular',
    marginTop: 8,
    letterSpacing: 0.2,
    fontWeight: '400',
    opacity: 0.9,
  },
  cardContainer: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 'auto',
    marginBottom: height * 0.05,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    position: 'relative',
    overflow: 'hidden',
  },
  cardDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#537FE7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cardDecorationAccent: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(83, 127, 231, 0.1)',
  },
  cardPatternTop: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    gap: 8,
  },
  cardPatternBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    gap: 8,
  },
  mainContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 2,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    position: 'relative',
  },
  welcomeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(83, 127, 231, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: 'Fredoka_400Regular',
    color: '#537FE7',
    marginBottom: 8,
    letterSpacing: 0,
  },
  subText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    fontFamily: 'Fredoka_400Regular',
    lineHeight: 20,
    paddingHorizontal: 16,
    letterSpacing: 0,
  },
  loginButton: {
    backgroundColor: '#537FE7',
    width: '100%',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#537FE7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Roboto_900Black',
    marginRight: 6,
    letterSpacing: 0.3,
  },
  buttonIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  backgroundPaw: {
    position: 'absolute',
  },
});

export default HomeScreen;