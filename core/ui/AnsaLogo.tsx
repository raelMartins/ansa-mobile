import Svg, { Path } from "react-native-svg";
import { WORDMARK_ASPECT, WORDMARK_PATH, WORDMARK_VIEW_BOX } from "../brand/wordmarkGeometry";

type AnsaLogoProps = {
  height: number;
  color: string;
};

export function AnsaLogo({ height, color }: AnsaLogoProps) {
  const width = height * WORDMARK_ASPECT;

  return (
    <Svg width={width} height={height} viewBox={WORDMARK_VIEW_BOX} accessibilityLabel="ansa">
      <Path fill={color} fillRule="evenodd" d={WORDMARK_PATH} />
    </Svg>
  );
}
