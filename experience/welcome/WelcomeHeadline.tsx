import { useCallback, useRef } from "react";
import { StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { fontFamily } from "../../core/ui/theme";

const WORDS_BEFORE = ["What"];
const WORDS_AFTER = ["are", "you", "looking", "for", "today?"];

export type HeadlineMeasure = {
  /** Slot centre relative to the headline block. */
  slotCx: number;
  slotCy: number;
  height: number;
};

function Word({ text, index, progress, style }: { text: string; index: number; progress: SharedValue<number>; style: object }) {
  const animated = useAnimatedStyle(() => {
    const t = Math.min(Math.max((progress.value - index * 0.08) / 0.5, 0), 1);
    const e = t * t * (3 - 2 * t);
    return { opacity: e, transform: [{ translateY: (1 - e) * 14 }] };
  });
  return <Animated.Text style={[style, animated]}>{text}</Animated.Text>;
}

type Props = {
  fontSize: number;
  color: string;
  /** Inline wordmark slot size — the hero wordmark docks here. */
  slot: { width: number; height: number; offsetY: number };
  /** 0 → 1 staggered word entrance. */
  progress: SharedValue<number>;
  onMeasure: (m: HeadlineMeasure) => void;
};

/**
 * "What [wordmark] are you looking for today?" — words stagger in around an empty slot;
 * the traced hero wordmark flies into the slot (it is never typed as text).
 */
export function WelcomeHeadline({ fontSize, color, slot, progress, onMeasure }: Props) {
  const layout = useRef<{ slot?: { x: number; y: number; w: number; h: number }; height?: number }>({});

  const report = useCallback(() => {
    const { slot: s, height } = layout.current;
    if (s && height !== undefined) {
      onMeasure({ slotCx: s.x + s.w / 2, slotCy: s.y + s.h / 2 + slot.offsetY, height });
    }
  }, [onMeasure, slot.offsetY]);

  const onSlotLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { x, y, width, height } = e.nativeEvent.layout;
      layout.current.slot = { x, y, w: width, h: height };
      report();
    },
    [report],
  );

  const onRowLayout = useCallback(
    (e: LayoutChangeEvent) => {
      layout.current.height = e.nativeEvent.layout.height;
      report();
    },
    [report],
  );

  const text = {
    fontFamily: fontFamily.semiBold,
    fontSize,
    lineHeight: Math.round(fontSize * 1.28),
    letterSpacing: -0.6,
    color,
  };

  return (
    <View style={[styles.row, { columnGap: fontSize * 0.26 }]} onLayout={onRowLayout} accessibilityRole="header">
      {WORDS_BEFORE.map((w, i) => (
        <Word key={w} text={w} index={i} progress={progress} style={text} />
      ))}
      <View
        onLayout={onSlotLayout}
        style={{ width: slot.width, height: slot.height, transform: [{ translateY: slot.offsetY }] }}
        accessible
        accessibilityLabel="ansa"
      />
      {WORDS_AFTER.map((w, i) => (
        <Word key={w} text={w} index={i + WORDS_BEFORE.length + 1} progress={progress} style={text} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
});
