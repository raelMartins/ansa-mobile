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
  const cxArr = anchorX.slice();
  const cyArr = anchorY.slice();
  const vxArr = new Array<number>(n);
  const vyArr = new Array<number>(n);

  for (let i = 0; i < n; i++) {
    const vel = initialBubbleVelocity(driftPhases[i]);
    vxArr[i] = vel.vx;
    vyArr[i] = vel.vy;
  }

  separateBubbles({ cx: cxArr, cy: cyArr, vx: vxArr, vy: vyArr }, radii, fieldW, fieldH);

  cx.value = cxArr;
  cy.value = cyArr;
  vx.value = vxArr;
  vy.value = vyArr;
  simReady.value = 1;
}

export function publishBubblePositions(cx: SharedValue<number[]>, cy: SharedValue<number[]>) {
  "worklet";
  cx.value = cx.value.slice();
  cy.value = cy.value.slice();
}
