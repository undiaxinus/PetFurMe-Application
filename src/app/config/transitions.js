import { Animated, Easing } from 'react-native';

export const screenTransitionConfig = {
  animation: 'timing',
  config: {
    duration: 300,
    easing: Easing.bezier(0.2, 0.65, 0.32, 0.99),
  },
};

export const forSlide = ({ current, next, inverted, layouts: { screen } }) => {
  const progress = Animated.add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      : 0
  );

  return {
    cardStyle: {
      transform: [
        {
          translateX: Animated.multiply(
            progress.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [
                screen.width, // Translate from right
                0, // Translate to center
                screen.width * -0.3, // Translate to left
              ],
            }),
            inverted
          ),
        },
      ],
      opacity: progress.interpolate({
        inputRange: [0, 1, 2],
        outputRange: [0.8, 1, 0.8],
      }),
    },
  };
}; 