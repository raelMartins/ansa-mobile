/**
 * Motion: backdrop fade; sheet spring from bottom; list items press feedback.
 * Reduced motion: shorter timing on sheet travel.
 */
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { feedback } from "../../core/feedback/feedback";
import { useTheme } from "../../core/ui/ThemeContext";
import type { Merchant } from "../types";
import { merchantRadii } from "../ui/merchantUi";

type Props = {
  visible: boolean;
  merchants: Merchant[];
  activeId: string;
  onClose: () => void;
  onSelect: (merchant: Merchant) => void;
};

export function BusinessSwitcherSheet({ visible, merchants, activeId, onClose, onSelect }: Props) {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const t = useSharedValue(0);
  const sheetHeight = Math.min(height * 0.72, 420 + insets.bottom);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      t.value = reduceMotion ? withTiming(1, { duration: 220 }) : withSpring(1, { damping: 26, stiffness: 190 });
    } else {
      t.value = withTiming(0, { duration: 240, easing: Easing.in(Easing.quad) }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
    }
  }, [visible, reduceMotion, t]);

  const backdrop = useAnimatedStyle(() => ({ opacity: t.value * 0.45 }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - t.value) * sheetHeight }] }));

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close business switcher" />
        </Animated.View>
        <Animated.View style={[styles.sheet, { height: sheetHeight, backgroundColor: colors.bg, paddingBottom: insets.bottom + 12 }, sheet]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>Switch business</Text>
          <Text style={[styles.sub, { color: colors.textMuted, fontFamily: fonts.regular }]}>
            Choose which business you are managing right now.
          </Text>
          <ScrollView contentContainerStyle={{ gap: 8, paddingTop: 12 }} showsVerticalScrollIndicator={false}>
            {merchants.map((m) => {
              const active = m.id === activeId;
              return (
                <Pressable
                  key={m.id}
                  onPress={() => {
                    feedback.tap();
                    onSelect(m);
                    onClose();
                  }}
                  style={[
                    styles.row,
                    {
                      borderColor: colors.border,
                      backgroundColor: active ? "rgba(212, 220, 213, 0.5)" : colors.bg,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ fontFamily: fonts.semiBold, fontSize: 16, color: colors.text }}>{m.name}</Text>
                    <Text style={{ fontFamily: fonts.regular, fontSize: 13, color: colors.textMuted }}>
                      {[m.category, m.location].filter(Boolean).join(" · ") || "Merchant profile"}
                    </Text>
                    <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.textMuted }}>Owner</Text>
                  </View>
                  {active ? <Text style={{ fontFamily: fonts.bold, color: colors.accent }}>✓</Text> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { backgroundColor: "#000" },
  sheet: {
    borderTopLeftRadius: merchantRadii.card,
    borderTopRightRadius: merchantRadii.card,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  title: { fontSize: 20, letterSpacing: -0.3 },
  sub: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: merchantRadii.button,
    borderWidth: 1,
    gap: 12,
  },
});
