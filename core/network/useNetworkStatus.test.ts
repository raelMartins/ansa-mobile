import { computeOfflineForTest } from "./networkState";

describe("network offline detection", () => {
  it("is offline when not connected", () => {
    expect(computeOfflineForTest({ isConnected: false, isInternetReachable: null })).toBe(true);
  });

  it("is offline when internet is explicitly unreachable", () => {
    expect(computeOfflineForTest({ isConnected: true, isInternetReachable: false })).toBe(true);
  });

  it("is online when connected and reachability is unknown", () => {
    expect(computeOfflineForTest({ isConnected: true, isInternetReachable: null })).toBe(false);
  });
});
