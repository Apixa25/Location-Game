package com.virostarterkit
import com.viromedia.bridge.ReactViroPackage

import android.app.Application
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

class MainApplication : Application(), ReactApplication {

  // ViroReact only has native libraries for ARM architectures
  // Check if we're running on an ARM device (not x86/x86_64 emulator)
  private fun isARMArchitecture(): Boolean {
    val supportedAbis = Build.SUPPORTED_ABIS
    return supportedAbis.any { it.startsWith("arm") || it.startsWith("aarch") }
  }

  override val reactNativeHost: ReactNativeHost =
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              
              // ViroReact packages - only add on ARM devices since ViroReact doesn't have x86 libs
              // https://viro-community.readme.io/docs/installation-instructions#5-now-add-the-viro-package-to-your-mainapplication
              if (isARMArchitecture()) {
                add(ReactViroPackage(ReactViroPackage.ViroPlatform.GVR))
                add(ReactViroPackage(ReactViroPackage.ViroPlatform.AR))
              } else {
                android.util.Log.w("BlackBartsGold", "ViroReact disabled - x86/x86_64 architecture detected. AR features require ARM device.")
              }
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      }

  override val reactHost: ReactHost
    get() = getDefaultReactHost(this.applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    // Initialize SoLoader with merged SO mapping for React Native 0.81+
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
  }
}
