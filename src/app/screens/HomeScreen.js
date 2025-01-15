import React, { useState, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useFonts } from "expo-font";
import { Fredoka_400Regular } from "@expo-google-fonts/fredoka";

const HomeScreen = ({ navigation }) => {
  const [gradientAnimation] = useState(new Animated.Value(0));

  const [fontsLoaded] = useFonts({
    Fredoka_400Regular,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Handle navigation without rotation
  const handlePress = () => {
    navigation.navigate("LoginScreen");
  };

  // Start the gradient animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(gradientAnimation, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  // Interpolate gradient colors
  const backgroundColor1 = gradientAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#A259B5", "#537FE7"],
  });
  const backgroundColor2 = gradientAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["#537FE7", "#A259B5"],
  });

  return (
    <LinearGradient
      colors={["#A259B5", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <View style={styles.outerCircle}>
        <Animated.View
          style={[
            styles.gradientCircle,
            {
              backgroundColor: backgroundColor1,
            },
          ]}
        >
          <View style={styles.imageWrapper}>
            <Image
              source={require("../../assets/images/finallogo.png")}
              style={styles.image}
            />
          </View>
        </Animated.View>
      </View>

      <Image
        source={require("../../assets/images/animal.png")}
        style={styles.vetcare}
      />

      <TouchableOpacity onPress={handlePress}>
        <Image
          source={require("../../assets/images/footprint.png")}
          style={[styles.image2, { transform: [{ rotate: "12deg" }] }]}
        />
        <Text style={styles.registerText}>GET STARTED</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  outerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 9,
    borderColor: "#2A27AE",
    marginBottom: 80,
  },
  gradientCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 12,
    borderColor: "#B61DB0",
    overflow: 'hidden',
  },
  image: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  image2: {
    width: 160,
    height: 160,
    marginTop: 60,
  },
  vetcare: {
    width: 200,
    height: 70,
    top: -70,
  },
  registerText: {
    position: "absolute",
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "Fredoka_400Regular",
    alignSelf: "center",
    width: "100%",
    textAlign: "center",
    top: 170,
  },
});

export default HomeScreen;
//huhu
