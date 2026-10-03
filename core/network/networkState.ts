/** Shared offline logic for hooks and tests. */
export function computeOfflineForTest(state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}): boolean {
  if (state.isConnected === false) return true;
  if (state.isInternetReachable === false) return true;
  return false;
}
