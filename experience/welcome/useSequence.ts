import { useCallback, useEffect, useRef } from "react";

/**
 * Cancellable waits for JS-side choreography. `await wait(ms)` resolves `false`
 * (or never) once the component unmounts, so timelines stop cleanly.
 */
export function useSequence() {
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    const pending = timers.current;
    return () => {
      alive.current = false;
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const wait = useCallback(
    (ms: number) =>
      new Promise<boolean>((resolve) => {
        const t = setTimeout(() => {
          timers.current.delete(t);
          resolve(alive.current);
        }, ms);
        timers.current.add(t);
      }),
    [],
  );

  return { wait, alive };
}
