import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { feedback } from "../feedback/feedback";
import { useTheme } from "./ThemeContext";

type Option<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  accent: string;
  onAccent: string;
  trackColor: string;
  height?: number;
  accessibilityLabel?: string;
};

/** Pill toggle with a sliding indicator. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accent,
  onAccent,
  trackColor,
  height = 50,
  accessibilityLabel,
}: Props<T>) {
  const { colors, fonts } = useTheme();
  const [width, setWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.id === value));
  const pos = useSharedValue(index);
  const segment = (width - 8) / options.length;

  useEffect(() => {
    pos.value = withSpring(index, { damping: 20, stiffness: 220 });
  }, [index, pos]);

  const indicator = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value * segment }],
  }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={[styles.track, { backgroundColor: trackColor, height, borderRadius: height * 0.32 }]}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {width > 0 ? (
        <Animated.View
          style={[styles.indicator, { width: segment, backgroundColor: accent, borderRadius: height * 0.24 }, indicator]}
        />
      ) : null}
      {options.map((option) => {
        const active = option.id === value;
        return (
          <Pressable
            key={option.id}
            style={styles.item}
            onPress={() => {
              if (!active) {
                feedback.tap();
                onChange(option.id);
              }
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, { fontFamily: fonts.semiBold, color: active ? onAccent : colors.textMuted }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", padding: 4 },
  indicator: { position: "absolute", top: 4, left: 4, bottom: 4 },
  item: { flex: 1, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 14.5 },
});
