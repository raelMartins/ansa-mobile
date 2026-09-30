import { AnsaLogo } from "./AnsaLogo";
import { useTheme } from "./ThemeContext";
import { brand } from "./brandColors";

type Props = {
  height?: number;
  color?: string;
  inverse?: boolean;
};

/** Wordmark at inline copy size — use instead of typing “ansa” in UI. */
export function BrandInline({ height = 14, color, inverse }: Props) {
  const { colors } = useTheme();
  const fill = color ?? (inverse ? brand.linen : colors.text);
  return <AnsaLogo height={height} color={fill} />;
}
