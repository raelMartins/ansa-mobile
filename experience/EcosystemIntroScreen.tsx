import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandInline } from "../core/ui/BrandInline";
import { Wordmark } from "../core/ui/Wordmark";
import { brand } from "../core/ui/brandColors";
import { fontFamily } from "../core/ui/theme";
import { ECOSYSTEM_SLIDES, type EcosystemSlide } from "./ecosystemSlides";

const { width: SCREEN_W } = Dimensions.get("window");

type Props = {
  onComplete: () => void;
};

export function EcosystemIntroScreen({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<EcosystemSlide>>(null);
  const [index, setIndex] = useState(0);
  const last = ECOSYSTEM_SLIDES.length - 1;

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (i !== index) setIndex(i);
  }, [index]);

  const goNext = useCallback(() => {
    if (index >= last) {
      onComplete();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [index, last, onComplete]);

  const renderItem: ListRenderItem<EcosystemSlide> = useCallback(({ item, index: i }) => (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <Animated.View entering={FadeInUp.delay(80).duration(500)} style={styles.slideInner}>
        <View style={[styles.accentOrb, { backgroundColor: item.accent }]} />
        {item.brandEyebrow ? (
          <Wordmark height={20} badge={false} inverse />
        ) : (
          <Text style={styles.eyebrow}>{item.eyebrow}</Text>
        )}
        {item.titleWithBrand ? (
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <BrandInline height={30} inverse />
          </View>
        ) : (
          <Text style={styles.title}>{item.title}</Text>
        )}
        {item.bodyWithBrandId ? (
          <View style={styles.bodyRow}>
            <Text style={styles.body}>{item.body} </Text>
            <BrandInline height={15} inverse />
            <Text style={styles.body}> ID.</Text>
          </View>
        ) : (
          <Text style={styles.body}>{item.body}</Text>
        )}
      </Animated.View>
    </View>
  ), []);

  return (
    <View style={styles.root}>
      <LinearGradient colors={[brand.inkFooter, brand.forest, "#1a2820"]} style={StyleSheet.absoluteFill} />
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Wordmark height={18} badge={false} inverse />
        <Pressable onPress={onComplete} hitSlop={12} accessibilityRole="button">
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={ECOSYSTEM_SLIDES}
        keyExtractor={(s) => s.key}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      <Animated.View entering={FadeInDown.duration(400)} style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dots}>
          {ECOSYSTEM_SLIDES.map((s, i) => (
            <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <Pressable style={styles.cta} onPress={goNext} accessibilityRole="button">
          <Text style={styles.ctaText}>{index >= last ? "Continue to sign in" : "Next"}</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  skip: {
    color: brand.sage,
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 100,
    paddingBottom: 160,
  },
  slideInner: { gap: 14 },
  accentOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    opacity: 0.55,
    marginBottom: 8,
  },
  eyebrow: {
    color: brand.honey,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    letterSpacing: 2,
    textTransform: "lowercase",
  },
  title: {
    color: brand.linen,
    fontFamily: fontFamily.semiBold,
    fontSize: 34,
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  body: {
    color: brand.sage,
    fontFamily: fontFamily.regular,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 340,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 8,
  },
  bodyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    maxWidth: 340,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    gap: 18,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(147, 160, 151, 0.35)",
  },
  dotActive: {
    width: 28,
    backgroundColor: brand.honey,
  },
  cta: {
    backgroundColor: brand.honey,
    borderRadius: 16,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: {
    color: brand.forest,
    fontFamily: fontFamily.semiBold,
    fontSize: 17,
  },
});
