import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ListRenderItem,
} from "react-native";
import Animated, {
  FadeInUp,
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandInline } from "../core/ui/BrandInline";
import { brand } from "../core/ui/brandColors";
import { fontFamily } from "../core/ui/theme";
import { ECOSYSTEM_SLIDES, type EcosystemSlide } from "./ecosystemSlides";
import { IntroPagination } from "./IntroPagination";
import { IntroSlideVisual } from "./IntroSlideVisual";

const { width: SCREEN_W } = Dimensions.get("window");
const AnimatedFlatList = Animated.FlatList<EcosystemSlide>;

type Props = {
  onComplete: () => void;
};

export function EcosystemIntroScreen({ onComplete }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<Animated.FlatList<EcosystemSlide>>(null);
  const [index, setIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const last = ECOSYSTEM_SLIDES.length - 1;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  const onMomentumEnd = useCallback((offsetX: number) => {
    const i = Math.round(offsetX / SCREEN_W);
    setIndex(i);
  }, []);

  const goNext = useCallback(() => {
    if (index >= last) {
      onComplete();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  }, [index, last, onComplete]);

  const renderItem: ListRenderItem<EcosystemSlide> = useCallback(({ item }) => (
    <View style={[styles.slide, { width: SCREEN_W }]}>
      <Animated.View entering={FadeInUp.duration(480)} style={styles.slideInner}>
        <IntroSlideVisual slide={item} width={SCREEN_W - 56} />
        <Text style={styles.eyebrow}>{item.eyebrow}</Text>
        {item.titleWithBrand ? (
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <BrandInline fontSize={32} inverse />
          </View>
        ) : (
          <Text style={styles.title}>{item.title}</Text>
        )}
        {item.bodyWithBrandId ? (
          <View style={styles.bodyRow}>
            <Text style={styles.body}>{item.body}</Text>
            <BrandInline fontSize={17} inverse />
            <Text style={styles.bodyId}>ID</Text>
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
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topSpacer} />
        <Pressable onPress={onComplete} hitSlop={12} accessibilityRole="button">
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <AnimatedFlatList
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
        onMomentumScrollEnd={(e) => onMomentumEnd(e.nativeEvent.contentOffset.x)}
        contentContainerStyle={{ paddingTop: insets.top + 48 }}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <IntroPagination count={ECOSYSTEM_SLIDES.length} scrollX={scrollX} pageWidth={SCREEN_W} />
        <Pressable style={styles.cta} onPress={goNext} accessibilityRole="button">
          <Text style={styles.ctaText}>{index >= last ? "Continue to sign in" : "Next"}</Text>
        </Pressable>
      </View>
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
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 22,
  },
  topSpacer: { flex: 1 },
  skip: {
    color: brand.sage,
    fontFamily: fontFamily.medium,
    fontSize: 15,
  },
  slide: {
    paddingHorizontal: 28,
    paddingBottom: 168,
  },
  slideInner: { gap: 12 },
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
    fontSize: 32,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  body: {
    color: brand.sage,
    fontFamily: fontFamily.regular,
    fontSize: 17,
    lineHeight: 25,
    maxWidth: 340,
  },
  bodyId: {
    color: brand.sage,
    fontFamily: fontFamily.regular,
    fontSize: 17,
    lineHeight: 25,
    marginLeft: 6,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 10,
  },
  bodyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    maxWidth: 340,
    gap: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    gap: 20,
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
