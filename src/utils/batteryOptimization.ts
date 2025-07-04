import { Capacitor } from '@capacitor/core';
import { BatteryOptimization } from '@capawesome-team/capacitor-android-battery-optimization';

export const ensureIgnoreBatteryOptimizations = async () => {
  if (Capacitor.getPlatform() !== 'android') return;

  try {
    const { enabled } = await BatteryOptimization.isBatteryOptimizationEnabled();

    if (enabled) {
      // ✅ ONLY show the system overlay (Allow / Deny)
      await BatteryOptimization.requestIgnoreBatteryOptimization();
    }
    // Else: already ignored or not required — do nothing
  } catch (err) {
    console.error('Battery optimization request failed:', err);
  }
};
