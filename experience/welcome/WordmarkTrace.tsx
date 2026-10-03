import Animated, { useAnimatedProps, type SharedValue } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { WORDMARK_LETTERS } from "../../core/brand/brandGeometry.generated";
import { WORDMARK_VIEW_BOX } from "../../core/brand/wordmarkGeometry";
import { LETTER_DRAW_SHARE } from "./introValues";

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** Stroke width in wordmark user units (~2px at hero size). */
const STROKE = 6;

function Letter({
  index,
  d,
  length,
  color,
  progress,
}: {
  index: number;
  d: string;
  length: number;
  color: string;
  progress: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => {
    const local = progress.value - index;
    const p = Math.min(Math.max(local / LETTER_DRAW_SHARE, 0), 1);
    const f = Math.min(Math.max((local - 0.45) / 0.6, 0), 1);
    return {
      strokeDashoffset: length * (1 - p),
      strokeOpacity: p > 0.001 ? 1 - f : 0,
      fillOpacity: f,
    };
  });

  return (
    <AnimatedPath
      d={d}
      fill={color}
      fillRule="evenodd"
      fillOpacity={0}
      stroke={color}
      strokeOpacity={0}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={[length, length]}
      animatedProps={animatedProps}
    />
  );
}

type Props = {
  width: number;
  height: number;
  color: string;
  /** 0 → `WORDMARK_DONE`: letters a · n · s · a, one unit each. */
  progress: SharedValue<number>;
};

export function WordmarkTrace({ width, height, color, progress }: Props) {
  return (
    <Svg width={width} height={height} viewBox={WORDMARK_VIEW_BOX} accessibilityLabel="ansa">
      {WORDMARK_LETTERS.map((letter, i) => (
        <Letter key={i} index={i} d={letter.d} length={letter.length} color={color} progress={progress} />
      ))}
    </Svg>
  );
}
