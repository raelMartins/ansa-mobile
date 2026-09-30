import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path, Rect, G } from "react-native-svg";
import { BrandInline } from "../core/ui/BrandInline";
import { brand } from "../core/ui/brandColors";
import type { EcosystemSlide } from "./ecosystemSlides";

type Props = {
  slide: EcosystemSlide;
  width: number;
};

export function IntroSlideVisual({ slide, width }: Props) {
  const h = 200;
  const accent = slide.accent;

  return (
    <View style={[styles.frame, { width, height: h }]}>
      <View style={[styles.glass, { borderColor: `${accent}44` }]}>
        {slide.key === "platform" ? (
          <View style={styles.wordmarkCenter} pointerEvents="none">
            <BrandInline height={34} inverse />
          </View>
        ) : null}
        <Svg width={width - 32} height={h - 24} viewBox="0 0 320 176">
          {slide.key === "platform" ? (
            <G opacity={0.85}>
              <Circle cx="160" cy="88" r="52" stroke={brand.honey} strokeWidth={1.5} fill="none" />
              <Circle cx="100" cy="60" r="8" fill={brand.mist} />
              <Circle cx="220" cy="55" r="8" fill={brand.sage} />
              <Circle cx="240" cy="110" r="8" fill={brand.honey} />
              <Circle cx="90" cy="115" r="8" fill={brand.linen} />
              <Line x1="100" y1="60" x2="160" y2="88" stroke={brand.sage} strokeWidth={1} opacity={0.6} />
              <Line x1="220" y1="55" x2="160" y2="88" stroke={brand.sage} strokeWidth={1} opacity={0.6} />
              <Line x1="240" y1="110" x2="160" y2="88" stroke={brand.sage} strokeWidth={1} opacity={0.6} />
              <Line x1="90" y1="115" x2="160" y2="88" stroke={brand.sage} strokeWidth={1} opacity={0.6} />
            </G>
          ) : null}
          {slide.key === "merchant" ? (
            <G>
              <Rect x="108" y="24" width="104" height="128" rx="18" fill={brand.inkFooter} stroke={brand.mist} strokeWidth={1.5} />
              <Rect x="118" y="40" width="84" height="48" rx="8" fill={brand.forest} />
              <Rect x="118" y="98" width="36" height="36" rx="8" fill={accent} />
              <Rect x="162" y="98" width="36" height="36" rx="8" fill={brand.mist} opacity={0.5} />
            </G>
          ) : null}
          {slide.key === "delivery" ? (
            <G>
              <Path
                d="M 40 120 Q 120 40 200 90 T 280 70"
                stroke={brand.honey}
                strokeWidth={2.5}
                fill="none"
                strokeLinecap="round"
              />
              <Circle cx="40" cy="120" r="10" fill={brand.honey} />
              <Circle cx="280" cy="70" r="10" fill={brand.linen} />
              <Path d="M 255 55 L 280 70 L 268 88 Z" fill={brand.sage} opacity={0.8} />
            </G>
          ) : null}
          {slide.key === "jobs" ? (
            <G>
              <Rect x="95" y="50" width="130" height="76" rx="12" fill={brand.forest} stroke={accent} strokeWidth={1.5} />
              <Path d="M 125 78 L 145 98 L 195 62" stroke={brand.honey} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </G>
          ) : null}
          {slide.key === "trust" ? (
            <G>
              <Path
                d="M 160 40 L 210 62 L 210 108 Q 210 138 160 152 Q 110 138 110 108 L 110 62 Z"
                fill={brand.forest}
                stroke={accent}
                strokeWidth={1.5}
              />
              <Path d="M 142 108 L 155 122 L 182 92" stroke={brand.honey} strokeWidth={3} fill="none" strokeLinecap="round" />
            </G>
          ) : null}
          {slide.key === "start" ? (
            <G>
              <Circle cx="160" cy="88" r="34" fill={brand.honey} opacity={0.95} />
              <Circle cx="90" cy="70" r="18" fill={brand.mist} opacity={0.35} />
              <Circle cx="230" cy="65" r="16" fill={brand.mist} opacity={0.35} />
              <Circle cx="100" cy="125" r="14" fill={brand.mist} opacity={0.25} />
              <Circle cx="220" cy="120" r="15" fill={brand.mist} opacity={0.25} />
            </G>
          ) : null}
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  glass: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    borderWidth: 1,
    backgroundColor: "rgba(39, 41, 48, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  wordmarkCenter: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
});
