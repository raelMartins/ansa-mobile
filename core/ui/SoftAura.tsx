import { useId } from "react";
import Svg, { Defs, Ellipse, RadialGradient, Stop } from "react-native-svg";

type Props = {
  width: number;
  height: number;
  color: string;
  opacity?: number;
};

/** Feathered radial glow — separates a mark from a low-contrast surface on both platforms. */
export function SoftAura({ width, height, color, opacity = 1 }: Props) {
  const id = `aura-${useId().replace(/:/g, "")}`;
  return (
    <Svg width={width} height={height} pointerEvents="none">
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.55" stopColor={color} stopOpacity={opacity * 0.45} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={width / 2} cy={height / 2} rx={width / 2} ry={height / 2} fill={`url(#${id})`} />
    </Svg>
  );
}
