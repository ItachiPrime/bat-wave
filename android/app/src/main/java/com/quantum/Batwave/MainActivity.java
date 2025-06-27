package com.quantum.Batwave;

import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.net.Uri;
import android.provider.Settings;
import android.webkit.JavascriptInterface;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  // Expose battery optimization check to JavaScript
  @JavascriptInterface
  public boolean isIgnoringBatteryOptimizations() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
      return pm.isIgnoringBatteryOptimizations(getPackageName());
    }
    return true; // Older Android versions don't have this restriction
  }

  // Expose battery optimization request to JavaScript
  @JavascriptInterface
  public void requestIgnoreBatteryOptimizations() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
      intent.setData(Uri.parse("package:" + getPackageName()));
      startActivity(intent);
    }
  }

  // Attach the JavaScript interface when the WebView is ready
  @Override
  public void onStart() {
    super.onStart();
    getBridge().getWebView().addJavascriptInterface(this, "BatteryHelper");
  }
}
