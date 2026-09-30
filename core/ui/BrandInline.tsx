import { View, type StyleProp, type ViewStyle } from "react-native";
import { AnsaLogo } from "./AnsaLogo";
import { wordmarkHeightForFontSize } from "./brandInlineSizing";
import { useTheme } from "./ThemeContext";
import { brand } from "./brandColors";

type Props = {
  /** Explicit cap height in px. */
  height?: number;
  /** Match wordmark height to companion text `fontSize`. */
  fontSize?: number;
  color?: string;
  inverse?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Wordmark at inline copy size — use instead of typing “ansa” in UI. */
export function BrandInline({ height, fontSize, color, inverse, style }: Props) {
  const { colors } = useTheme();
  const fill = color ?? (inverse ? brand.linen : colors.text);
  const h = height ?? (fontSize !== undefined ? wordmarkHeightForFontSize(fontSize) : 14);

  return (
    <View style={[{ height: h, justifyContent: "center" }, style]}>
      <AnsaLogo height={h} color={fill} />
    </View>
  );
}
