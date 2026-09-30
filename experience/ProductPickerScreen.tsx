import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { FadeIn, makeMutable, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AnsaProductId } from "../core/onboarding/onboardingStorage";
import { ANSA_PRODUCTS, type AnsaProductOption } from "../core/onboarding/products";
import { BrandInline } from "../core/ui/BrandInline";
import { brand } from "../core/ui/brandColors";
import { fontFamily } from "../core/ui/theme";
import {
  createBubbleState,
  separateBubbles,
  stepBubblePhysics,
  type BubblePhysicsState,
} from "./bubblePhysics";
import { ProductBubbleIcon } from "./ProductBubbleIcon";

const { width: W } = Dimensions.get("window");
const TITLE_SIZE = 30;
const BASE_DIAMETER = Math.min(W, 700) * 0.32;
const BUBBLE_COUNT = ANSA_PRODUCTS.length;
const BUBBLE_RADII = ANSA_PRODUCTS.map((p) => (BASE_DIAMETER * p.scale) / 2);

type Props = {
  onSelect: (product: AnsaProductId, layout: { x: number; y: number; size: number }) => void;
};

type BubbleMotion = {
  x: SharedValue<number>;
  y: SharedValue<number>;
};

function ProductBubble({
  index,
  product,
  diameter,
  motion,
  fieldSizeRef,
  simRef,
  dragIndexRef,
  dragStartRef,
  onTap,
}: {
  index: number;
  product: AnsaProductOption;
  diameter: number;
  motion: BubbleMotion;
  fieldSizeRef: RefObject<{ w: number; h: number }>;
  simRef: RefObject<BubblePhysicsState>;
  dragIndexRef: RefObject<number>;
  dragStartRef: RefObject<{ x: number; y: number }>;
  onTap: (id: AnsaProductId, centerX: number, centerY: number, size: number) => void;
}) {
  const radius = diameter / 2;
  const iconSize = diameter * 0.36;
  const enabled = product.enabled;

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart(() => {
      dragIndexRef.current = index;
      dragStartRef.current = { x: simRef.current.cx[index], y: simRef.current.cy[index] };
      simRef.current.vx[index] = 0;
      simRef.current.vy[index] = 0;
    })
    .onUpdate((e) => {
      const { w, h } = fieldSizeRef.current;
      let nx = dragStartRef.current.x + e.translationX;
      let ny = dragStartRef.current.y + e.translationY;
      nx = Math.max(radius, Math.min(w - radius, nx));
      ny = Math.max(radius, Math.min(h - radius, ny));
      simRef.current.cx[index] = nx;
      simRef.current.cy[index] = ny;
      motion.x.value = nx;
      motion.y.value = ny;
    })
    .onEnd((e) => {
      simRef.current.vx[index] = e.velocityX * 0.45;
      simRef.current.vy[index] = e.velocityY * 0.45;
      dragIndexRef.current = -1;
    })
    .onFinalize(() => {
      if (dragIndexRef.current === index) dragIndexRef.current = -1;
    });

  const tap = Gesture.Tap()
    .runOnJS(true)
    .maxDuration(280)
    .onEnd(() => {
      if (!enabled) return;
      onTap(product.id, motion.x.value, motion.y.value, diameter);
    });

  const gesture = Gesture.Exclusive(pan, tap);

  const anim = useAnimatedStyle(() => ({
    left: motion.x.value - radius,
    top: motion.y.value - radius,
    width: diameter,
    height: diameter,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        entering={FadeIn.delay(100 + index * 70).duration(480)}
        style={[styles.bubbleWrap, anim]}
      >
        <View
          style={[
            styles.bubble,
            enabled ? styles.bubbleLive : styles.bubbleLocked,
            { width: diameter, height: diameter, borderRadius: radius },
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !enabled }}
          accessibilityLabel={product.label}
          accessibilityHint={enabled ? "Drag to move or tap to open" : "Coming soon"}
        >
          <ProductBubbleIcon
            id={product.id}
            size={iconSize}
            color={enabled ? brand.forest : brand.inkMuted}
            muted={!enabled}
          />
          <Text style={[styles.bubbleLabel, !enabled && styles.bubbleLabelMuted]}>{product.label}</Text>
          <Text style={[styles.tagline, !enabled && styles.taglineMuted]} numberOfLines={1}>
            {enabled ? product.tagline : "Soon"}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const FIELD_MIN_H = 420;

function useBubbleMotions(): BubbleMotion[] {
  return useMemo(
    () =>
      ANSA_PRODUCTS.map((p) => ({
        x: makeMutable(p.x * W),
        y: makeMutable(p.y * FIELD_MIN_H),
      })),
    [],
  );
}

export function ProductPickerScreen({ onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const motions = useBubbleMotions();
  const [simReady, setSimReady] = useState(false);
  const fieldWindowY = useRef(0);
  const fieldRef = useRef<View>(null);
  const fieldSizeRef = useRef({ w: W, h: FIELD_MIN_H });
  const simRef = useRef<BubblePhysicsState>(createBubbleState(W, FIELD_MIN_H));
  const dragIndexRef = useRef(-1);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const seededRef = useRef(false);

  const syncMotionsFromSim = useCallback(() => {
    const sim = simRef.current;
    for (let i = 0; i < BUBBLE_COUNT; i++) {
      motions[i].x.value = sim.cx[i];
      motions[i].y.value = sim.cy[i];
    }
  }, [motions]);

  const layoutField = useCallback(
    (w: number, h: number) => {
      if (h < 80 || seededRef.current) return;
      seededRef.current = true;
      fieldSizeRef.current = { w, h };
      simRef.current = createBubbleState(w, h);
      separateBubbles(simRef.current, BUBBLE_RADII, w, h);
      syncMotionsFromSim();
      setSimReady(true);
    },
    [syncMotionsFromSim],
  );

  useEffect(() => {
    if (!simReady) return;
    let frame = 0;
    let last = Date.now();
    const loop = () => {
      const now = Date.now();
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;
      const { w, h } = fieldSizeRef.current;
      stepBubblePhysics(simRef.current, BUBBLE_RADII, w, h, dragIndexRef.current, dt);
      for (let i = 0; i < BUBBLE_COUNT; i++) {
        motions[i].x.value = simRef.current.cx[i];
        motions[i].y.value = simRef.current.cy[i];
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [simReady, motions]);

  const handleTap = useCallback(
    (id: AnsaProductId, centerX: number, centerY: number, size: number) => {
      const product = ANSA_PRODUCTS.find((p) => p.id === id);
      if (!product?.enabled) return;
      onSelect(id, { x: centerX, y: centerY + fieldWindowY.current, size });
    },
    [onSelect],
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <LinearGradient colors={["#ffffff", brand.linen, brand.mist]} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Choose your</Text>
          <BrandInline fontSize={TITLE_SIZE} color={brand.forest} />
        </View>
        <Text style={styles.subtitle}>One account. Many products. Start with Merchant today.</Text>
      </View>
      <View
        ref={fieldRef}
        style={styles.field}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout;
          if (height > 0) layoutField(width, height);
          fieldRef.current?.measureInWindow((_x, y) => {
            fieldWindowY.current = y;
          });
        }}
      >
        {ANSA_PRODUCTS.map((p, index) => (
          <ProductBubble
            key={p.id}
            index={index}
            product={p}
            diameter={BUBBLE_RADII[index] * 2}
            motion={motions[index]}
            fieldSizeRef={fieldSizeRef}
            simRef={simRef}
            dragIndexRef={dragIndexRef}
            dragStartRef={dragStartRef}
            onTap={handleTap}
          />
        ))}
      </View>
      <Text style={[styles.hint, { paddingBottom: insets.bottom + 16 }]}>
        Drag bubbles around · tap Merchant to continue
      </Text>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 24,
    zIndex: 2,
    gap: 8,
  },
  titleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    gap: 8,
  },
  title: {
    color: brand.forest,
    fontFamily: fontFamily.semiBold,
    fontSize: TITLE_SIZE,
    letterSpacing: -0.4,
    lineHeight: TITLE_SIZE * 1.1,
  },
  subtitle: {
    color: brand.inkMuted,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 320,
  },
  field: {
    flex: 1,
    minHeight: FIELD_MIN_H,
    overflow: "hidden",
  },
  bubbleWrap: {
    position: "absolute",
  },
  bubble: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderWidth: 1.5,
    gap: 4,
  },
  bubbleLive: {
    backgroundColor: "#ffffff",
    borderColor: brand.honey,
    shadowColor: brand.forest,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  bubbleLocked: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderColor: "#cdd5ce",
  },
  bubbleLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: brand.forest,
    textAlign: "center",
    marginTop: 4,
  },
  bubbleLabelMuted: {
    color: brand.inkMuted,
    fontFamily: fontFamily.medium,
  },
  tagline: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: brand.sage,
    textAlign: "center",
  },
  taglineMuted: {
    fontFamily: fontFamily.medium,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    fontSize: 11,
  },
  hint: {
    textAlign: "center",
    color: brand.sage,
    fontFamily: fontFamily.regular,
    fontSize: 14,
  },
});
