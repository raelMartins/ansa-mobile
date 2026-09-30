let listener: (() => void) | null = null;

export function registerWelcomeReplay(handler: () => void): () => void {
  listener = handler;
  return () => {
    if (listener === handler) {
      listener = null;
    }
  };
}

export function requestWelcomeReplay(): void {
  listener?.();
}
