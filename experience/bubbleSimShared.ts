import type { SharedValue } from "react-native-reanimated";
import { initialBubbleVelocity, separateBubbles } from "./bubblePhysics";

export function setBubblePositionAt(
  cx: SharedValue<number[]>,
  cy: SharedValue<number[]>,
  index: number,
  x: number,
  y: number,
) {
  "worklet";
  const nextCx = cx.value.slice();
  const nextCy = cy.value.slice();
  nextCx[index] = x;
  nextCy[index] = y;
  cx.value = nextCx;
  cy.value = nextCy;
}

export function seedBubbleSimulation(
  cx: SharedValue<number[]>,
  cy: SharedValue<number[]>,
  vx: SharedValue<number[]>,
  vy: SharedValue<number[]>,
  anchorX: number[],
  anchorY: number[],
  driftPhases: number[],
  radii: number[],
  fieldW: number,
  fieldH: number,
  simReady: SharedValue<number>,
) {
  "worklet";
  const n = radii.length;
  const cxArr = anchorX.slice(0, n);
  const cyArr = anchorY.slice(0, n);
  const phases = driftPhases.slice(0, n);
  const radiiLocal = radii.slice(0, n);
  const vxArr = new Array<number>(n);
  const vyArr = new Array<number>(n);

  for (let i = 0; i < n; i++) {
    const vel = initialBubbleVelocity(phases[i]);
    vxArr[i] = vel.vx;
    vyArr[i] = vel.vy;
  }

  separateBubbles({ cx: cxArr, cy: cyArr, vx: vxArr, vy: vyArr }, radiiLocal, fieldW, fieldH);

  cx.value = cxArr;
  cy.value = cyArr;
  vx.value = vxArr;
  vy.value = vyArr;
  simReady.value = 1;
}
