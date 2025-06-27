export async function ensureIgnoreBatteryOptimizations() {
  if (window.Capacitor?.getPlatform?.() !== "android") return;

  try {
    const ignoring = await (window as any).BatteryHelper.isIgnoringBatteryOptimizations();
    if (!ignoring) {
      // You can optionally show a custom dialog here before requesting
      (window as any).BatteryHelper.requestIgnoreBatteryOptimizations();
    }
  } catch (err) {
    console.error("Battery optimization check failed:", err);
  }
}
