import { ANSA_PRODUCTS } from "../core/onboarding/products";

const RESTITUTION = 0.88;
const DAMPING = 0.998;
const MAX_SPEED = 220;

function clampSpeed(vx: number, vy: number): { vx: number; vy: number } {
  const sp = Math.sqrt(vx * vx + vy * vy);
  if (sp > MAX_SPEED) {
    const s = MAX_SPEED / sp;
    return { vx: vx * s, vy: vy * s };
  }
  return { vx, vy };
}

function resolveWall(
  x: number,
  y: number,
  vx: number,
  vy: number,
  r: number,
  w: number,
  h: number,
): { x: number; y: number; vx: number; vy: number } {
  let nx = x;
  let ny = y;
  let nvx = vx;
  let nvy = vy;
  if (nx - r < 0) {
    nx = r;
    nvx = -nvx * RESTITUTION;
  } else if (nx + r > w) {
    nx = w - r;
    nvx = -nvx * RESTITUTION;
  }
  if (ny - r < 0) {
    ny = r;
    nvy = -nvy * RESTITUTION;
  } else if (ny + r > h) {
    ny = h - r;
    nvy = -nvy * RESTITUTION;
  }
  return { x: nx, y: ny, vx: nvx, vy: nvy };
}

function resolvePair(
  xi: number,
  yi: number,
  vxi: number,
  vyi: number,
  ri: number,
  xj: number,
  yj: number,
  vxj: number,
  vyj: number,
  rj: number,
  iPinned: boolean,
  jPinned: boolean,
): {
  xi: number;
  yi: number;
  vxi: number;
  vyi: number;
  xj: number;
  yj: number;
  vxj: number;
  vyj: number;
} {
  const dx = xj - xi;
  const dy = yj - yi;
  const distSq = dx * dx + dy * dy;
  const minDist = ri + rj;
  if (distSq >= minDist * minDist || distSq < 1e-6) {
    return { xi, yi, vxi, vyi, xj, yj, vxj, vyj };
  }
  const dist = Math.sqrt(distSq);
  const nx = dx / dist;
  const ny = dy / dist;
  const overlap = minDist - dist;

  let nxi = xi;
  let nyi = yi;
  let nxj = xj;
  let nyj = yj;
  if (iPinned && !jPinned) {
    nxj += nx * overlap;
    nyj += ny * overlap;
  } else if (jPinned && !iPinned) {
    nxi -= nx * overlap;
    nyi -= ny * overlap;
  } else if (!iPinned && !jPinned) {
    nxi -= nx * overlap * 0.5;
    nyi -= ny * overlap * 0.5;
    nxj += nx * overlap * 0.5;
    nyj += ny * overlap * 0.5;
  }

  const dvx = vxj - vxi;
  const dvy = vyj - vyi;
  const vn = dvx * nx + dvy * ny;
  let nvxi = vxi;
  let nvyi = vyi;
  let nvxj = vxj;
  let nvyj = vyj;
  if (vn < 0 && !iPinned && !jPinned) {
    const impulse = (-(1 + RESTITUTION) * vn) / 2;
    nvxi -= impulse * nx;
    nvyi -= impulse * ny;
    nvxj += impulse * nx;
    nvyj += impulse * ny;
  } else if (vn < 0 && iPinned && !jPinned) {
    const impulse = -(1 + RESTITUTION) * vn;
    nvxj += impulse * nx;
    nvyj += impulse * ny;
  } else if (vn < 0 && jPinned && !iPinned) {
    const impulse = -(1 + RESTITUTION) * vn;
    nvxi -= impulse * nx;
    nvyi -= impulse * ny;
  }

  return { xi: nxi, yi: nyi, vxi: nvxi, vyi: nvyi, xj: nxj, yj: nyj, vxj: nvxj, vyj: nvyj };
}

export type BubblePhysicsState = {
  cx: number[];
  cy: number[];
  vx: number[];
  vy: number[];
};

export function stepBubblePhysics(
  state: BubblePhysicsState,
  radii: number[],
  fieldW: number,
  fieldH: number,
  draggedIndex: number,
  dt: number,
): void {
  const n = radii.length;
  if (fieldW <= 0 || fieldH <= 0 || n === 0) return;

  const cx = state.cx;
  const cy = state.cy;
  const vx = state.vx;
  const vy = state.vy;

  for (let i = 0; i < n; i++) {
    if (i === draggedIndex) continue;
    vx[i] *= DAMPING;
    vy[i] *= DAMPING;
    cx[i] += vx[i] * dt;
    cy[i] += vy[i] * dt;
    const wall = resolveWall(cx[i], cy[i], vx[i], vy[i], radii[i], fieldW, fieldH);
    cx[i] = wall.x;
    cy[i] = wall.y;
    vx[i] = wall.vx;
    vy[i] = wall.vy;
    const clamped = clampSpeed(vx[i], vy[i]);
    vx[i] = clamped.vx;
    vy[i] = clamped.vy;
  }

  const iterations = 3;
  for (let pass = 0; pass < iterations; pass++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pair = resolvePair(
          cx[i],
          cy[i],
          vx[i],
          vy[i],
          radii[i],
          cx[j],
          cy[j],
          vx[j],
          vy[j],
          radii[j],
          i === draggedIndex,
          j === draggedIndex,
        );
        cx[i] = pair.xi;
        cy[i] = pair.yi;
        vx[i] = pair.vxi;
        vy[i] = pair.vyi;
        cx[j] = pair.xj;
        cy[j] = pair.yj;
        vx[j] = pair.vxj;
        vy[j] = pair.vyj;
      }
    }
    for (let i = 0; i < n; i++) {
      if (i === draggedIndex) continue;
      const wall = resolveWall(cx[i], cy[i], vx[i], vy[i], radii[i], fieldW, fieldH);
      cx[i] = wall.x;
      cy[i] = wall.y;
      vx[i] = wall.vx;
      vy[i] = wall.vy;
    }
  }
}

export function initialBubbleVelocity(phase: number): { vx: number; vy: number } {
  const speed = 48 + (phase % 3) * 12;
  return {
    vx: Math.cos(phase) * speed,
    vy: Math.sin(phase * 1.3) * speed,
  };
}

export function separateBubbles(
  state: BubblePhysicsState,
  radii: number[],
  fieldW: number,
  fieldH: number,
  iterations = 14,
): void {
  const n = radii.length;
  if (fieldW <= 0 || fieldH <= 0 || n === 0) return;

  const cx = state.cx;
  const cy = state.cy;
  const vx = state.vx;
  const vy = state.vy;

  for (let pass = 0; pass < iterations; pass++) {
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const pair = resolvePair(
          cx[i],
          cy[i],
          vx[i],
          vy[i],
          radii[i],
          cx[j],
          cy[j],
          vx[j],
          vy[j],
          radii[j],
          false,
          false,
        );
        cx[i] = pair.xi;
        cy[i] = pair.yi;
        cx[j] = pair.xj;
        cy[j] = pair.yj;
      }
    }
    for (let i = 0; i < n; i++) {
      const wall = resolveWall(cx[i], cy[i], 0, 0, radii[i], fieldW, fieldH);
      cx[i] = wall.x;
      cy[i] = wall.y;
    }
  }
}

export function createBubbleState(fieldW: number, fieldH: number): BubblePhysicsState {
  const cx = ANSA_PRODUCTS.map((p) => p.x * fieldW);
  const cy = ANSA_PRODUCTS.map((p) => p.y * fieldH);
  const vx = ANSA_PRODUCTS.map((p) => initialBubbleVelocity(p.driftPhase).vx);
  const vy = ANSA_PRODUCTS.map((p) => initialBubbleVelocity(p.driftPhase).vy);
  return { cx, cy, vx, vy };
}
