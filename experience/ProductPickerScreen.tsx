import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useRef } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  FadeIn,
  runOnJS,
  runOnUI,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { AnsaProductId } from "../core/onboarding/onboardingStorage";
import { ANSA_PRODUCTS, type AnsaProductOption } from "../core/onboarding/products";
import { BrandInline } from "../core/ui/BrandInline";
import { brand } from "../core/ui/brandColors";
import { fontFamily } from "../core/ui/theme";
import { stepBubblePhysics } from "./bubblePhysics";
import { publishBubblePositions, seedBubbleSimulation, setBubblePositionAt } from "./bubbleSimShared";
import { ProductBubbleIcon } from "./ProductBubbleIcon";

const { width: W } = Dimensions.get("window");
const TITLE_SIZE = 30;
const BASE_DIAMETER = Math.min(W, 700) * 0.32;
const BUBBLE_COUNT = ANSA_PRODUCTS.length;
const BUBBLE_RADII = ANSA_PRODUCTS.map((p) => (BASE_DIAMETER * p.scale) / 2);

type Props = {
  onSelect: (product: AnsaProductId, layout: { x: number; y: number; size: number }) => void;
};

function ProductBubble({
  index,
  product,
  diameter,
  cx,
  cy,
  vx,
  vy,
  fieldW,
  fieldH,
  dragIndex,
  dragStartX,
  dragStartY,
  onTap,
}: {
  index: number;
  product: AnsaProductOption;
  diameter: number;
  cx: SharedValue<number[]>;
  cy: SharedValue<number[]>;
  vx: SharedValue<number[]>;
  vy: SharedValue<number[]>;
  fieldW: SharedValue<number>;
  fieldH: SharedValue<number>;
  dragIndex: SharedValue<number>;
  dragStartX: SharedValue<number>;
  dragStartY: SharedValue<number>;
  onTap: (id: AnsaProductId, centerX: number, centerY: number, size: number) => void;
}) {
  const radius = diameter / 2;
  const iconSize = diameter * 0.36;
  const enabled = product.enabled;

  const pan = Gesture.Pan()
    .onStart(() => {
      dragIndex.value = index;
      dragStartX.value = cx.value[index];
      dragStartY.value = cy.value[index];
      const zvx = vx.value.slice();
      const zvy = vy.value.slice();
      zvx[index] = 0;
      zvy[index] = 0;
      vx.value = zvx;
      vy.value = zvy;
    })
    .onUpdate((e) => {
      const r = radius;
      const w = fieldW.value;
      const h = fieldH.value;
      let nx = dragStartX.value + e.translationX;
      let ny = dragStartY.value + e.translationY;
      nx = Math.max(r, Math.min(w - r, nx));
      ny = Math.max(r, Math.min(h - r, ny));
      setBubblePositionAt(cx, cy, index, nx, ny);
    })
    .onEnd((e) => {
      const nextVx = vx.value.slice();
      const nextVy = vy.value.slice();
      nextVx[index] = e.velocityX * 0.45;
      nextVy[index] = e.velocityY * 0.45;
      vx.value = nextVx;
      vy.value = nextVy;
      dragIndex.value = -1;
    })
    .onFinalize(() => {
      if (dragIndex.value === index) dragIndex.value = -1;
    });

  const tap = Gesture.Tap()
    .maxDuration(280)
    .onEnd(() => {
      if (!enabled) return;
      runOnJS(onTap)(product.id, cx.value[index], cy.value[index], diameter);
    });

  const gesture = Gesture.Exclusive(pan, tap);

  const anim = useAnimatedStyle(() => {
    const centersX = cx.value;
    const centersY = cy.value;
    const x = centersX[index] - radius;
    const y = centersY[index] - radius;
    return {
      left: x,
      top: y,
      width: diameter,
      height: diameter,
    };
  });

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

export function ProductPickerScreen({ onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const initialized = useRef(false);
  const fieldWindowY = useRef(0);
  const fieldRef = useRef<View>(null);

  const fieldW = useSharedValue(W);
  const fieldH = useSharedValue(FIELD_MIN_H);
  const cx = useSharedValue<number[]>(ANSA_PRODUCTS.map((p) => p.x * W));
  const cy = useSharedValue<number[]>(ANSA_PRODUCTS.map((p) => p.y * FIELD_MIN_H));
  const vx = useSharedValue<number[]>(new Array(BUBBLE_COUNT).fill(0));
  const vy = useSharedValue<number[]>(new Array(BUBBLE_COUNT).fill(0));
  const simReady = useSharedValue(0);
  const dragIndex = useSharedValue(-1);
  const dragStartX = useSharedValue(0);
  const dragStartY = useSharedValue(0);

  const layoutField = useCallback(
    (w: number, h: number) => {
      if (h < 80) return;
      fieldW.value = w;
      fieldH.value = h;
      if (initialized.current) return;
      initialized.current = true;

      const anchorX = ANSA_PRODUCTS.map((p) => p.x * w);
      const anchorY = ANSA_PRODUCTS.map((p) => p.y * h);
      const phases = ANSA_PRODUCTS.map((p) => p.driftPhase);

      runOnUI(seedBubbleSimulation)(cx, cy, vx, vy, anchorX, anchorY, phases, BUBBLE_RADII, w, h, simReady);
    },
    [cx, cy, vx, vy, fieldW, fieldH, simReady],
  );

  useFrameCallback((frame) => {
    "worklet";
    if (simReady.value === 0) return;
    const dt = Math.min((frame.timeSincePreviousFrame ?? 16) / 1000, 0.032);
    stepBubblePhysics(
      { cx: cx.value, cy: cy.value, vx: vx.value, vy: vy.value },
      BUBBLE_RADII,
      fieldW.value,
      fieldH.value,
      dragIndex.value,
      dt,
    );
    publishBubblePositions(cx, cy);
  });

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
            cx={cx}
            cy={cy}
            vx={vx}
            vy={vy}
            fieldW={fieldW}
            fieldH={fieldH}
            dragIndex={dragIndex}
            dragStartX={dragStartX}
            dragStartY={dragStartY}
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
