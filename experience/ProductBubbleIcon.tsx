import Svg, { Circle, Path, Rect, G } from "react-native-svg";
import type { AnsaProductId } from "../core/onboarding/onboardingStorage";
import { brand } from "../core/ui/brandColors";

type Props = {
  id: AnsaProductId;
  size: number;
  color: string;
  muted?: boolean;
};

export function ProductBubbleIcon({ id, size, color, muted }: Props) {
  const c = muted ? brand.sage : color;
  const s = size;

  return (
    <Svg width={s} height={s} viewBox="0 0 48 48">
      {id === "merchant" ? (
        <G>
          <Rect x="10" y="14" width="28" height="22" rx="4" stroke={c} strokeWidth={2} fill="none" />
          <Path d="M10 20 H38" stroke={c} strokeWidth={2} />
          <Rect x="16" y="24" width="8" height="8" rx="2" fill={c} opacity={0.35} />
          <Rect x="26" y="24" width="8" height="8" rx="2" fill={c} opacity={0.35} />
        </G>
      ) : null}
      {id === "delivery" ? (
        <G>
          <Path
            d="M8 32 H34 L38 24 H28 L24 14 H14 L10 24 H8 Z"
            stroke={c}
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
          />
          <Circle cx="16" cy="34" r="3" fill={c} />
          <Circle cx="30" cy="34" r="3" fill={c} />
        </G>
      ) : null}
      {id === "jobs" ? (
        <G>
          <Rect x="12" y="16" width="24" height="20" rx="3" stroke={c} strokeWidth={2} fill="none" />
          <Path d="M18 16 V13 C18 11 20 10 24 10 C28 10 30 11 30 13 V16" stroke={c} strokeWidth={2} fill="none" />
          <Path d="M20 26 L23 29 L30 22" stroke={c} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      ) : null}
      {id === "check" ? (
        <G>
          <Path
            d="M24 8 L36 14 V24 C36 32 24 38 24 38 C24 38 12 32 12 24 V14 Z"
            stroke={c}
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
          />
          <Path d="M18 24 L22 28 L30 20" stroke={c} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </G>
      ) : null}
      {id === "locate" ? (
        <G>
          <Path
            d="M24 6 C17 6 12 12 12 19 C12 28 24 40 24 40 C24 40 36 28 36 19 C36 12 31 6 24 6 Z"
            stroke={c}
            strokeWidth={2}
            fill="none"
          />
          <Circle cx="24" cy="19" r="5" fill={c} opacity={0.4} />
        </G>
      ) : null}
      {id === "meets" ? (
        <G>
          <Circle cx="18" cy="22" r="7" stroke={c} strokeWidth={2} fill="none" />
          <Circle cx="30" cy="22" r="7" stroke={c} strokeWidth={2} fill="none" />
          <Path d="M11 36 C13 31 17 28 18 28 H30 C31 28 35 31 37 36" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" />
        </G>
      ) : null}
    </Svg>
  );
}
