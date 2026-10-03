import { View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useThemedStyles } from "../../core/ui/themedStyles";
import { merchantRadii } from "../ui/merchantUi";

function Block({ height, flex }: { height: number; flex?: number }) {
  const styles = useThemedStyles((c) => ({
    block: {
      height,
      flex,
      borderRadius: merchantRadii.button,
      backgroundColor: "rgba(147, 160, 151, 0.22)",
    },
  }));
  return <View style={styles.block} />;
}

export function OverviewSkeleton() {
  const styles = useThemedStyles(() => ({
    root: { gap: 14, paddingVertical: 8 },
    row: { flexDirection: "row", gap: 10 },
  }));

  return (
    <Animated.View entering={FadeIn.duration(280)} style={styles.root}>
      <Block height={120} />
      <View style={styles.row}>
        <Block height={88} flex={1} />
        <Block height={88} flex={1} />
      </View>
      <Block height={48} />
      <Block height={48} />
      <Block height={140} />
      <Block height={200} />
    </Animated.View>
  );
}
