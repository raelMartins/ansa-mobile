import Svg, { Circle, Path, Rect } from "react-native-svg";

type Props = { color: string; size: number };

export function TabIconOverview({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth={1.8} fill="none" />
      <Rect x="13" y="3" width="8" height="5" rx="1.5" stroke={color} strokeWidth={1.8} fill="none" />
      <Rect x="13" y="11" width="8" height="10" rx="2" stroke={color} strokeWidth={1.8} fill="none" />
      <Rect x="3" y="14" width="8" height="7" rx="2" stroke={color} strokeWidth={1.8} fill="none" />
    </Svg>
  );
}

export function TabIconProducts({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 7 L12 3 L20 7 V17 L12 21 L4 17 Z"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinejoin="round"
      />
      <Path d="M12 3 V21" stroke={color} strokeWidth={1.8} />
      <Path d="M4 7 L20 7" stroke={color} strokeWidth={1.8} />
    </Svg>
  );
}

export function TabIconOrders({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4" y="5" width="16" height="16" rx="2.5" stroke={color} strokeWidth={1.8} fill="none" />
      <Path d="M8 3 H16 V7 H8 Z" stroke={color} strokeWidth={1.8} strokeLinejoin="round" fill="none" />
      <Path d="M8 11 H16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Path d="M8 15 H13" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function TabIconCustomers({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="3.5" stroke={color} strokeWidth={1.8} fill="none" />
      <Path
        d="M5 20 C5 16.5 8 14 12 14 C16 14 19 16.5 19 20"
        stroke={color}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function TabIconMore({ color, size }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="6" cy="12" r="1.6" fill={color} />
      <Circle cx="12" cy="12" r="1.6" fill={color} />
      <Circle cx="18" cy="12" r="1.6" fill={color} />
    </Svg>
  );
}
