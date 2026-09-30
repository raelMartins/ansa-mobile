import { Easing } from "react-native-reanimated";

export const motion = {
  spring: { damping: 18, stiffness: 140, mass: 0.9 },
  springSoft: { damping: 22, stiffness: 110, mass: 1 },
  duration: {
    splash: 3200,
    slide: 520,
    fade: 380,
    reveal: 780,
  },
  easing: Easing.bezier(0.22, 1, 0.36, 1),
};
