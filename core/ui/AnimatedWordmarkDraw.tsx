import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  type SharedValue,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import {
  WORDMARK_ASPECT,
  WORDMARK_LETTER_PATHS,
  WORDMARK_VIEW_BOX,
} from "../brand/wordmarkGeometry";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const STROKE_FALLBACK = 920;

type Props = {
  height: number;
  color: string;
  quick?: boolean;
  onLettersDrawn?: () => void;
};

function LetterStroke({
  d,
  length,
  color,
  progress,
}: {
  d: string;
  length: number;
  color: string;
  progress: SharedValue<number>;
}) {
  const dash = length > 0 ? length : STROKE_FALLBACK;

  const animatedProps = useAnimatedProps(() => {
    const p = Math.min(1, Math.max(0, progress.value));
    return {
      strokeDashoffset: dash * (1 - p),
      fill: p >= 0.99 ? color : "transparent",
    };
  });

  return (
    <AnimatedPath
      d={d}
      fill="transparent"
      stroke={color}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dash}
      animatedProps={animatedProps}
    />
  );
}

export function AnimatedWordmarkDraw({ height, color, quick, onLettersDrawn }: Props) {
  const width = height * WORDMARK_ASPECT;
  const pathRefs = useRef<(Path | null)[]>([]);
  const [lengths, setLengths] = useState<number[] | null>(null);

  const progress0 = useSharedValue(0);
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);
  const progresses: SharedValue<number>[] = [progress0, progress1, progress2, progress3];

  const measurePaths = useCallback(() => {
    const next = WORDMARK_LETTER_PATHS.map((_, i) => {
      const node = pathRefs.current[i] as { getTotalLength?: () => number } | null;
      const len = node?.getTotalLength?.() ?? 0;
      return len > 0 ? len : STROKE_FALLBACK;
    });
    setLengths(next);
  }, []);

  useEffect(() => {
    if (!lengths) {
      return;
    }
    const strokeMs = quick ? 420 : 780;
    const staggerMs = quick ? 110 : 220;
    const easing = Easing.bezier(0.45, 0, 0.2, 1);

    WORDMARK_LETTER_PATHS.forEach((_, i) => {
      const progress = progresses[i];
      if (!progress) {
        return;
      }
      progress.value = withDelay(
        i * staggerMs,
        withTiming(1, { duration: strokeMs, easing }, (finished) => {
          if (finished && i === WORDMARK_LETTER_PATHS.length - 1 && onLettersDrawn) {
            runOnJS(onLettersDrawn)();
          }
        }),
      );
    });
  }, [lengths, quick, onLettersDrawn, progress0, progress1, progress2, progress3]);

  const drawing = lengths !== null;

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height} viewBox={WORDMARK_VIEW_BOX} onLayout={measurePaths}>
        {WORDMARK_LETTER_PATHS.map((d, i) => (
          <Path
            key={`measure-${i}`}
            d={d}
            opacity={0}
            ref={(el) => {
              pathRefs.current[i] = el;
            }}
          />
        ))}
        {drawing
          ? WORDMARK_LETTER_PATHS.map((d, i) => (
              <LetterStroke
                key={`draw-${i}`}
                d={d}
                length={lengths[i] ?? STROKE_FALLBACK}
                color={color}
                progress={progresses[i] ?? progress0}
              />
            ))
          : null}
      </Svg>
    </View>
  );
}
