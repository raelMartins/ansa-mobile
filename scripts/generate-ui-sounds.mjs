/**
 * Synthesises the short UI sounds in `assets/sounds/` (mono 16-bit WAV).
 * Placeholder brand-safe tones until a sound identity exists: `pnpm brand:sounds`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RATE = 22050;
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "assets", "sounds");

function wav(samples) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((s, i) => data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, s)) * 32767), i * 2));
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(RATE, 24);
  header.writeUInt32LE(RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function buffer(seconds) {
  return new Float32Array(Math.ceil(seconds * RATE));
}

/** Bell-ish partial stack with exponential decay. */
function tone(out, { start = 0, freq, dur, gain = 0.3, decay = 8, attack = 0.004, partials = [1, 0.35, 0.12] }) {
  const s0 = Math.floor(start * RATE);
  const n = Math.floor(dur * RATE);
  for (let i = 0; i < n && s0 + i < out.length; i++) {
    const t = i / RATE;
    const env = Math.min(1, t / attack) * Math.exp(-decay * t);
    let v = 0;
    partials.forEach((amp, k) => {
      v += amp * Math.sin(2 * Math.PI * freq * (k + 1) * t);
    });
    out[s0 + i] += v * env * gain;
  }
}

function fadeTail(out, seconds = 0.02) {
  const n = Math.floor(seconds * RATE);
  for (let i = 0; i < n; i++) {
    out[out.length - 1 - i] *= i / n;
  }
  return out;
}

const sounds = {
  tick() {
    const out = buffer(0.09);
    tone(out, { freq: 1180, dur: 0.09, gain: 0.22, decay: 60, attack: 0.002, partials: [1, 0.2] });
    tone(out, { freq: 240, dur: 0.06, gain: 0.18, decay: 70, attack: 0.002, partials: [1] });
    return fadeTail(out);
  },
  chime() {
    const out = buffer(0.75);
    tone(out, { freq: 659.25, dur: 0.7, gain: 0.2, decay: 5 });
    tone(out, { start: 0.09, freq: 987.77, dur: 0.62, gain: 0.16, decay: 6 });
    return fadeTail(out, 0.06);
  },
  select() {
    const out = buffer(0.22);
    tone(out, { freq: 587.33, dur: 0.12, gain: 0.2, decay: 22 });
    tone(out, { start: 0.06, freq: 880, dur: 0.16, gain: 0.2, decay: 18 });
    return fadeTail(out);
  },
  deny() {
    const out = buffer(0.14);
    tone(out, { freq: 150, dur: 0.14, gain: 0.34, decay: 30, attack: 0.003, partials: [1, 0.25] });
    tone(out, { start: 0.05, freq: 120, dur: 0.09, gain: 0.22, decay: 40, attack: 0.003, partials: [1] });
    return fadeTail(out);
  },
  whoosh() {
    const out = buffer(0.32);
    let lp = 0;
    let seed = 7;
    for (let i = 0; i < out.length; i++) {
      const t = i / out.length;
      seed = (seed * 16807) % 2147483647;
      const noise = seed / 2147483647 - 0.5;
      const cutoff = 0.04 + 0.22 * Math.sin(Math.PI * t);
      lp += cutoff * (noise - lp);
      out[i] = lp * Math.sin(Math.PI * t) ** 1.5 * 0.9;
    }
    return fadeTail(out);
  },
  success() {
    const out = buffer(0.62);
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      tone(out, { start: i * 0.075, freq, dur: 0.5, gain: 0.16, decay: 7 });
    });
    return fadeTail(out, 0.05);
  },
};

mkdirSync(outDir, { recursive: true });
for (const [name, make] of Object.entries(sounds)) {
  writeFileSync(join(outDir, `${name}.wav`), wav(make()));
}
console.log("wrote", Object.keys(sounds).map((n) => `${n}.wav`).join(", "));
