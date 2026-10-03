import Svg, { Path } from "react-native-svg";

type Props = { color: string; size: number };

/** Outline bell for merchant chrome (notifications entry). */
export function IconNotificationBell({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3a5 5 0 0 0-5 5v2.1c0 .5-.2 1-.5 1.4L5.2 13.8A1.5 1.5 0 0 0 6.5 16h11a1.5 1.5 0 0 0 1.3-2.2l-1.3-2.3a2 2 0 0 1-.5-1.4V8a5 5 0 0 0-5-5z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path
        d="M10 18a2 2 0 0 0 4 0"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconWifiOff({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M2 8l2 2M22 8l-2 2M5 11l2 2M19 11l-2 2M8.5 14.5l2 2M15.5 14.5l-2 2M12 18h.01"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M2 2l20 20" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}
