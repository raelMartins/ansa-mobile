import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";

const SOURCES = {
  tick: require("../../assets/sounds/tick.wav"),
  chime: require("../../assets/sounds/chime.wav"),
  select: require("../../assets/sounds/select.wav"),
  deny: require("../../assets/sounds/deny.wav"),
  whoosh: require("../../assets/sounds/whoosh.wav"),
  success: require("../../assets/sounds/success.wav"),
} as const;

type SoundName = keyof typeof SOURCES;

const VOLUME: Record<SoundName, number> = {
  tick: 0.35,
  chime: 0.45,
  select: 0.5,
  deny: 0.5,
  whoosh: 0.28,
  success: 0.5,
};

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let audioModeSet = false;

function getPlayer(name: SoundName): AudioPlayer | null {
  try {
    if (!audioModeSet) {
      audioModeSet = true;
      // UI sounds respect the silent switch and never interrupt the user's audio.
      void setAudioModeAsync({ playsInSilentMode: false, interruptionMode: "mixWithOthers" }).catch(() => {});
    }
    let player = players[name];
    if (!player) {
      player = createAudioPlayer(SOURCES[name]);
      player.volume = VOLUME[name];
      players[name] = player;
    }
    return player;
  } catch {
    return null;
  }
}

function play(name: SoundName): void {
  const player = getPlayer(name);
  if (!player) return;
  try {
    void player.seekTo(0);
    player.play();
  } catch {
    /* audio is decorative */
  }
}

function impact(style: Haptics.ImpactFeedbackStyle): void {
  void Haptics.impactAsync(style).catch(() => {});
}

function notify(type: Haptics.NotificationFeedbackType): void {
  void Haptics.notificationAsync(type).catch(() => {});
}

/** Warm the players so the first cinematic beat isn't late. */
export function prepareFeedback(): void {
  (Object.keys(SOURCES) as SoundName[]).forEach((name) => getPlayer(name));
}

/** Paired haptic + sound for each choreographed moment (see docs/mobile-welcome-motion-spec.md §9). */
export const feedback = {
  bounce() {
    impact(Haptics.ImpactFeedbackStyle.Light);
    play("tick");
  },
  markComplete() {
    impact(Haptics.ImpactFeedbackStyle.Medium);
    play("chime");
  },
  wordmarkComplete() {
    impact(Haptics.ImpactFeedbackStyle.Soft);
  },
  select() {
    impact(Haptics.ImpactFeedbackStyle.Medium);
    play("select");
  },
  deny() {
    notify(Haptics.NotificationFeedbackType.Warning);
    play("deny");
  },
  sheet() {
    impact(Haptics.ImpactFeedbackStyle.Light);
    play("whoosh");
  },
  success() {
    notify(Haptics.NotificationFeedbackType.Success);
    play("success");
  },
  error() {
    notify(Haptics.NotificationFeedbackType.Error);
  },
  tap() {
    void Haptics.selectionAsync().catch(() => {});
  },
};
