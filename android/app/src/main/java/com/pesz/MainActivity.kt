package com.pesz

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView

class MainActivity : ReactActivity() {
  override fun getMainComponentName(): String = "Pesz"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null) // ensure ReactActivity doesn’t reuse old state on re-creation
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate {
    return object : DefaultReactActivityDelegate(
      this,
      mainComponentName,
      fabricEnabled
    ) {
      override fun createRootView(): ReactRootView {
        // Wrap in RNGestureHandlerEnabledRootView so react-native-gesture-handler works
        return RNGestureHandlerEnabledRootView(this@MainActivity)
      }
    }
  }
}
