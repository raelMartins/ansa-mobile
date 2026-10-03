import Svg, { Path } from "react-native-svg";
import { iconCurveColor, iconSecondary } from "../brand/color";
import { ECOSYSTEM_PRIMARY } from "../brand/ecosystem";
import {
  ICON_CURVE,
  ICON_PRIMARY,
  ICON_SECONDARY_LENS,
  ICON_SECONDARY_RING,
  ICON_VIEW_BOX,
} from "../brand/brandGeometry.generated";

export const ICON_ASPECT = ICON_VIEW_BOX.w / ICON_VIEW_BOX.h;
export const ICON_VIEW_BOX_STRING = `${ICON_VIEW_BOX.x} ${ICON_VIEW_BOX.y} ${ICON_VIEW_BOX.w} ${ICON_VIEW_BOX.h}`;

type Props = {
  width: number;
  /**
   * `full` — primary, primary two steps lighter, adaptive light curve.
   * `mono` — single colour knockout (e.g. on a solid product primary).
   */
  variant?: "full" | "mono";
  primary?: string;
  /** Surface behind the mark; drives the light-curve colour in `full`. */
  background?: string;
  /** Mono fill. */
  color?: string;
  /** Mono only: keep the smile as a cut-out in this colour (usually the surface). */
  curveColor?: string;
};

/** ansa brand icon — interlocking rings + smile. Never retype the brand as text. */
export function BrandIcon({
  width,
  variant = "full",
  primary = ECOSYSTEM_PRIMARY,
  background = "#ffffff",
  color = "#ffffff",
  curveColor,
}: Props) {
  const height = width / ICON_ASPECT;
  const mono = variant === "mono";
  const fills = mono
    ? { primary: color, secondary: color, curve: curveColor ?? color }
    : { primary, secondary: iconSecondary(primary), curve: curveColor ?? iconCurveColor(primary, background) };

  return (
    <Svg width={width} height={height} viewBox={ICON_VIEW_BOX_STRING} accessibilityLabel="ansa">
      <Path d={ICON_PRIMARY.d} fill={fills.primary} fillRule="evenodd" />
      <Path d={ICON_SECONDARY_RING.d} fill={fills.secondary} fillRule="evenodd" />
      <Path d={ICON_SECONDARY_LENS.d} fill={fills.secondary} fillRule="evenodd" />
      <Path d={ICON_CURVE.d} fill={fills.curve} fillRule="evenodd" />
    </Svg>
  );
}
