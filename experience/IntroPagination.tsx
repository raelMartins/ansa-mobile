import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { StyleSheet, View } from "react-native";
import { brand } from "../core/ui/brandColors";

const DOT = 8;
const ACTIVE = 32;

type Props = {
  count: number;
  scrollX: SharedValue<number>;
  pageWidth: number;
};

function Dot({ index, scrollX, pageWidth }: { index: number; scrollX: SharedValue<number>; pageWidth: number }) {
  const style = useAnimatedStyle(() => {
    const page = scrollX.value / pageWidth;
    const width = interpolate(page, [index - 1, index, index + 1], [DOT, ACTIVE, DOT], Extrapolation.CLAMP);
    const opacity = interpolate(page, [index - 1, index, index + 1], [0.35, 1, 0.35], Extrapolation.CLAMP);
    return {
      width,
      opacity,
      backgroundColor: brand.honey,
    };
  });

  return <Animated.View style={[styles.dot, style]} />;
}

export function IntroPagination({ count, scrollX, pageWidth }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} scrollX={scrollX} pageWidth={pageWidth} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 12,
  },
  dot: {
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: "rgba(147, 160, 151, 0.35)",
  },
});
