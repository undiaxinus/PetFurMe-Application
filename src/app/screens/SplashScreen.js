import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const BRAND_PURPLE = '#4A4A8F';

const SplashScreen = ({ onFinish }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const moveAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setTimeout(() => {
        navigation.replace('Login');
      }, 500);
    });
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const moveY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return (
    <LinearGradient colors={['#537FE7', '#C2D9FF']} style={styles.container}>
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      <MaterialCommunityIcons 
        name="paw" 
        size={40} 
        color="rgba(74, 74, 143, 0.2)" 
        style={[styles.backgroundPaw, { top: '15%', left: '15%', transform: [{ rotate: '45deg' }] }]} 
      />
      <FontAwesome5 
        name="dog" 
        size={35} 
        color="rgba(83, 127, 231, 0.25)" 
        style={[styles.backgroundPaw, { top: '25%', right: '20%', transform: [{ rotate: '-20deg' }] }]} 
      />
      <FontAwesome5 
        name="cat" 
        size={30} 
        color="rgba(255, 87, 87, 0.2)" 
        style={[styles.backgroundPaw, { top: '45%', left: '25%', transform: [{ rotate: '15deg' }] }]} 
      />
      <MaterialCommunityIcons 
        name="rabbit" 
        size={35} 
        color="rgba(74, 74, 143, 0.2)" 
        style={[styles.backgroundPaw, { bottom: '35%', right: '15%', transform: [{ rotate: '-15deg' }] }]} 
      />
      <MaterialCommunityIcons 
        name="paw" 
        size={25} 
        color="rgba(83, 127, 231, 0.25)" 
        style={[styles.backgroundPaw, { bottom: '20%', left: '20%', transform: [{ rotate: '30deg' }] }]} 
      />
      <FontAwesome5 
        name="dog" 
        size={28} 
        color="rgba(255, 87, 87, 0.2)" 
        style={[styles.backgroundPaw, { bottom: '15%', right: '25%', transform: [{ rotate: '-25deg' }] }]} 
      />
      
      <Animated.View
        style={[styles.content, {
          transform: [
            { scale: scaleAnim },
            { translateY: moveY },
            { perspective: 1000 },
          ],
        }]}
      >
        <View style={styles.brandContainer}>
          <Text style={styles.logoText}>
            <Text style={styles.vetText}>Vet</Text>
            <Text style={styles.careText}>Care</Text>
          </Text>
          <Text style={styles.clinicText}>Animal Clinic</Text>
        </View>
        
        <Animated.View
          style={[styles.iconWrapper, {
            transform: [{ rotate: rotation }],
          }]}
        >
          <MaterialCommunityIcons name="paw" size={50} color="#FF5757" />
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -width * 0.4,
    right: -width * 0.4,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width * 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -width * 0.3,
    left: -width * 0.3,
  },
  content: {
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    transform: [{ perspective: 1000 }],
  },
  logoText: {
    fontSize: 72,
    fontFamily: 'Fredoka_400Regular',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 6,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  vetText: {
    color: BRAND_PURPLE,
    fontWeight: '500',
    letterSpacing: -1,
  },
  careText: {
    color: '#FF5757',
    fontWeight: '500',
    letterSpacing: -1,
  },
  clinicText: {
    fontSize: 44,
    color: BRAND_PURPLE,
    fontFamily: 'Fredoka_400Regular',
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  iconWrapper: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  backgroundPaw: {
    position: 'absolute',
    opacity: 0.12,
  },
});

export default SplashScreen; 