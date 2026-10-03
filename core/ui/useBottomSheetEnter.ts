import { useEffect, useState } from "react";
import { Easing, cancelAnimation, runOnJS, useSharedValue, withTiming } from "react-native-reanimated";
import { motion } from "../../experience/motion";

/**
 * Mounts a bottom sheet modal and runs slide-up on enter after layout (avoids instant appear when height was 0).
 */
export function useBottomSheetEnter(visible: boolean, sheetHeight: number, reduceMotion: boolean) {
  const [mounted, setMounted] = useState(visible);
  const t = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      cancelAnimation(t);
      t.value = withTiming(0, { duration: motion.duration.sheetClose, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) runOnJS(setMounted)(false);
      });
      return;
    }
    setMounted(true);
  }, [visible, t]);

  useEffect(() => {
    if (!mounted || !visible || sheetHeight <= 0) return;
    cancelAnimation(t);
    t.value = 0;
    const openMs = reduceMotion ? 180 : motion.duration.sheetOpen;
    const id = requestAnimationFrame(() => {
      t.value = withTiming(1, { duration: openMs, easing: Easing.out(Easing.cubic) });
    });
    return () => cancelAnimationFrame(id);
  }, [mounted, visible, sheetHeight, reduceMotion, t]);

  return { mounted, t };
}
