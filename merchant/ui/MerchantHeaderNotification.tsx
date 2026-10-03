import { Platform, Pressable } from "react-native";
import { feedback } from "../../core/feedback/feedback";
import { useTheme } from "../../core/ui/ThemeContext";
import { IconNotificationBell } from "./MerchantHeaderIcons";

/** Aligned with stack/tab header wordmark (height 16) via standard headerRight slot. */
export function MerchantHeaderNotificationButton() {
  const { colors } = useTheme();
  return (
    <Pressable
      style={{
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        marginRight: Platform.OS === "android" ? 4 : 0,
      }}
      onPress={() => feedback.tap()}
      accessibilityRole="button"
      accessibilityLabel="Notifications"
    >
      <IconNotificationBell color={colors.textMuted} size={22} />
    </Pressable>
  );
}
