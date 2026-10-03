/**
 * Motion spec — product switcher (More tab):
 * - Enter: backdrop fades in; sheet slides up from the bottom; tiles stagger in.
 * - Exit: sheet slides down with an ease-in, backdrop fades, then the modal unmounts.
 * - Primary interaction: tiles spring on press; disabled tiles shake.
 * - Reduced motion: tiles fade only (ProductTile); sheet keeps a short slide.
 */
import { useBottomSheetEnter } from "../ui/useBottomSheetEnter";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../ui/ThemeContext";
import { bentoLayout } from "./bento";
import { ANSA_PRODUCTS, type AnsaProduct, type AnsaProductId } from "./catalog";
import { ProductGrid } from "./ProductGrid";

type Props = {
  visible: boolean;
  currentId: AnsaProductId | null;
  onClose: () => void;
  onSwitch: (product: AnsaProduct) => void;
};

const INSET = 20;

export function ProductSwitcherSheet({ visible, currentId, onClose, onSwitch }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { colors, fonts } = useTheme();
  const reduceMotion = useReducedMotion();

  const gridWidth = width - INSET * 2;
  const gridHeight = bentoLayout(ANSA_PRODUCTS, gridWidth, true).height;
  const sheetHeight = Math.min(height * 0.9, gridHeight + 132 + insets.bottom);

  const { mounted, t } = useBottomSheetEnter(visible, sheetHeight, !!reduceMotion);

  const backdrop = useAnimatedStyle(() => ({ opacity: t.value * 0.45 }));
  const sheet = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - t.value) * sheetHeight }] }));

  return (
    <Modal visible={mounted} transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdrop]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        </Animated.View>
        <Animated.View style={[styles.sheet, { height: sheetHeight, backgroundColor: colors.bg }, sheet]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text, fontFamily: fonts.bold }]}>Switch product</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted, fontFamily: fonts.regular }]}>
              Each product has its own space and colours. More are on the way.
            </Text>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: INSET, paddingBottom: insets.bottom + 20 }}
          >
            <ProductGrid
              width={gridWidth}
              compact
              visible={visible && mounted}
              selectedId={currentId}
              reduceMotion={reduceMotion}
              onSelect={(product) => (product.id === currentId ? onClose() : onSwitch(product))}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { backgroundColor: "#000" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3, marginTop: 10 },
  header: { paddingHorizontal: INSET, paddingTop: 16, paddingBottom: 18, gap: 6 },
  title: { fontSize: 22, letterSpacing: -0.4 },
  subtitle: { fontSize: 14.5, lineHeight: 20 },
});
