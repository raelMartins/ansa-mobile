import NetInfo, { type NetInfoState } from "@react-native-community/netinfo";
import { useEffect, useRef, useState } from "react";
import { computeOfflineForTest } from "./networkState";

function computeOffline(state: NetInfoState): boolean {
  return computeOfflineForTest({
    isConnected: state.isConnected,
    isInternetReachable: state.isInternetReachable,
  });
}

export type NetworkStatus = {
  /** True when the device has no usable connection. */
  isOffline: boolean;
  /** False until NetInfo has reported at least once. */
  isReady: boolean;
};

/**
 * Subscribes to connectivity. Treats `isInternetReachable: null` as online when `isConnected` is true.
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({ isOffline: false, isReady: false });

  useEffect(() => {
    const apply = (state: NetInfoState) => {
      setStatus({ isOffline: computeOffline(state), isReady: state.isConnected != null });
    };
    const sub = NetInfo.addEventListener(apply);
    void NetInfo.fetch().then(apply);
    return () => sub();
  }, []);

  return status;
}

/** Fires once when connectivity returns after being offline. */
export function useReconnectEffect(onReconnect: () => void): void {
  const { isOffline, isReady } = useNetworkStatus();
  const wasOffline = useRef(false);
  const callback = useRef(onReconnect);
  callback.current = onReconnect;

  useEffect(() => {
    if (!isReady) return;
    if (isOffline) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      callback.current();
    }
  }, [isOffline, isReady]);
}
