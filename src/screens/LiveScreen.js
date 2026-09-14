/**
 * LiveScreen.js
 *
 * Main live view screen displaying:
 * - Embedded camera video stream via WebView
 * - Light on/off toggle button
 * - Brightness slider for adjustable light intensity (0-255)
 * - Connection recovery with manual reload
 *
 * Uses WebView to embed the ESP32-CAM MJPEG stream directly.
 * Light control sends HTTP requests to the camera device.
 */

import { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { Alert, Platform, Pressable, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { WebView } from "react-native-webview";
import { CAMERA_CONFIG, buildCameraStreamUrl } from "../../config/camera";
import {
  checkCameraConnection,
  setCameraLightIntensity,
} from "../../services/cameraService";
import { styles } from "../theme/styles";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";


/**
 * LiveScreen Component
 *
 * Props:
 * - navigation: React Navigation object
 * - t: Localized text strings
 * - lightOn: Current light state (boolean)
 * - setLightOn: Function to update light state
 * - pairedTray: Object containing information about the paired tray
 */
export function LiveScreen({ navigation, t, lightOn, setLightOn, pairedTray }) {
  const cameraHost = pairedTray?.hostname;

  // ===== Stream State =====
  const [streamError, setStreamError] = useState(false);
  // Set after consecutive health checks fail.

  const [streamReloadKey, setStreamReloadKey] = useState(0);
  // Changing the key recreates the WebView after a retry.

  // ===== Light Control State =====
  const [lightIsChanging, setLightIsChanging] = useState(false);
  // Prevent overlapping light-control requests.

  const [lightIntensity, setLightIntensity] = useState(
    CAMERA_CONFIG.lightMinimumIntensity
  );
  // Last intensity confirmed by the tray.

  const [sliderValue, setSliderValue] = useState(
    CAMERA_CONFIG.lightMinimumIntensity
  );
  // Slider value shown while the user adjusts brightness.

  const [lastNonZeroIntensity, setLastNonZeroIntensity] = useState(
    CAMERA_CONFIG.lightDefaultIntensity
  );
  // Restore this value when the light is turned on again.

  const isAdjustingLight = useRef(false);
  // Avoid overwriting the slider while a drag is in progress.

  /**
   * Toggles camera light on/off.
   * When turning on, uses last non-zero intensity or default.
   * When turning off, sets intensity to minimum (0).
   */
  async function toggleCameraLight() {
  if (lightIsChanging) {
    return;
  }

  const requestedIntensity = lightOn
    ? CAMERA_CONFIG.lightMinimumIntensity
    : lastNonZeroIntensity;

  setLightIsChanging(true);

  try {
    const result = await setCameraLightIntensity(
      requestedIntensity,
      {
        host: cameraHost,
      }
    );

    if (!result.success) {
      Alert.alert(
        t.lightControlErrorTitle,
        t.lightControlErrorBody,
        [{ text: t.ok }]
      );

      return;
    }

    setLightIntensity(result.intensity);
    setSliderValue(result.intensity);
    setLightOn(result.intensity > 0);

    if (result.intensity > 0) {
      setLastNonZeroIntensity(result.intensity);
    }
  } catch (error) {
    console.error("Unexpected light control error:", error);

    Alert.alert(
      t.lightControlErrorTitle,
      t.lightControlErrorBody,
      [{ text: t.ok }]
    );
  } finally {
    setLightIsChanging(false);
  }
}

  /**
   * Updates camera light brightness from slider.
   * Sends HTTP request to camera to change LED intensity.
   * Updates UI to reflect new intensity level.
   */
  async function updateLightBrightness(value) {
  const requestedIntensity = Math.round(value);

  isAdjustingLight.current = false;
  setLightIsChanging(true);

  try {
    const result = await setCameraLightIntensity(
      requestedIntensity,
      {
        host: cameraHost,
      }
    );

    if (!result.success) {
      setSliderValue(lightIntensity);

      Alert.alert(
        t.lightControlErrorTitle,
        t.lightControlErrorBody,
        [{ text: t.ok }]
      );

      return;
    }

    setLightIntensity(result.intensity);
    setSliderValue(result.intensity);
    setLightOn(result.intensity > 0);

    if (result.intensity > 0) {
      setLastNonZeroIntensity(result.intensity);
    }
  } catch (error) {
    console.error("Unexpected brightness control error:", error);

    setSliderValue(lightIntensity);

    Alert.alert(
      t.lightControlErrorTitle,
      t.lightControlErrorBody,
      [{ text: t.ok }]
    );
  } finally {
    setLightIsChanging(false);
  }
}

  // Lock screen orientation to landscape while on this screen.
  useEffect(() => {
    void ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );

    if (Platform.OS === "android") {
      void NavigationBar.setVisibilityAsync("hidden");
    }

    return () => {
      void ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );

      if (Platform.OS === "android") {
        void NavigationBar.setVisibilityAsync("visible");
      }
    };
  }, []);

  useEffect(() => {
    if (!cameraHost) {
    return;
  }
  let isScreenActive = true;
  let nextCheckTimer = null;
  let consecutiveFailures = 0;

  async function checkCameraHealth() {
    const result = await checkCameraConnection({
      host: cameraHost,
      timeoutMs: 2000,
    });

    if (!isScreenActive) {
      return;
    }

    if (result.connected) {
  consecutiveFailures = 0;

  const reportedLightIntensity = Number(
  result.cameraStatus?.led_intensity
);

if (Number.isFinite(reportedLightIntensity)) {
  const normalizedIntensity = Math.min(
    CAMERA_CONFIG.lightMaximumIntensity,
    Math.max(
      CAMERA_CONFIG.lightMinimumIntensity,
      Math.round(reportedLightIntensity)
    )
  );

  setLightIntensity(normalizedIntensity);
  setLightOn(normalizedIntensity > 0);

  if (!isAdjustingLight.current) {
    setSliderValue(normalizedIntensity);
  }

  if (normalizedIntensity > 0) {
    setLastNonZeroIntensity(normalizedIntensity);
  }
}
} else {
  consecutiveFailures += 1;

  if (consecutiveFailures >= 2) {
    setStreamError(true);
  }
}

    nextCheckTimer = setTimeout(checkCameraHealth, 3000);
  }

  checkCameraHealth();

  return () => {
    isScreenActive = false;

    if (nextCheckTimer) {
      clearTimeout(nextCheckTimer);
    }
  };
}, [cameraHost]);

  async function retryStream() {
    const result = await checkCameraConnection({
    host: cameraHost,
  });

  if (!result.connected) {
    setStreamError(true);
    return;
  }

  setStreamError(false);
  setStreamReloadKey((currentKey) => currentKey + 1);
}

// Render Logic
if (!cameraHost) {
  return (
    <View style={styles.liveRoot}>
      <Text style={styles.streamErrorTitle}>
        {t.noTrayPairedTitle}
      </Text>

      <Text style={styles.streamErrorBody}>
        {t.noTrayPairedBody}
      </Text>

      <Pressable
        style={styles.controlBtn}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "Landing" }],
          })
        }
      >
        <Text style={styles.controlBtnText}>
          {t.back}
        </Text>
      </Pressable>
    </View>
  );
}

const esp32StreamUrl =
  buildCameraStreamUrl(cameraHost);

  return (
    <View style={styles.liveRoot}>
      <StatusBar hidden />

      <View style={styles.videoArea}>
        <View style={styles.cameraFrame}>
          <WebView
          key={streamReloadKey}
          source={{ uri: esp32StreamUrl }}
          originWhitelist={["http://*"]}
          javaScriptEnabled={false}
          domStorageEnabled={false}
          cacheEnabled={false}
          scrollEnabled={false}
          bounces={false}
          onShouldStartLoadWithRequest={(request) =>
            request.url === esp32StreamUrl ||
            request.url === "about:blank"
          }
          onError={() => setStreamError(true)}
          onHttpError={() => setStreamError(true)}
          style={styles.cameraStream}
        />

        {streamError && (
          <View style={styles.streamErrorOverlay}>
            <Text style={styles.streamErrorTitle}>
              {t.connectionLostTitle}
            </Text>

            <Text style={styles.streamErrorBody}>
              {t.connectionLost}
            </Text>

            <Pressable
              style={[styles.controlBtn, styles.streamRetryBtn]}
              onPress={retryStream}
            >
              <Text style={styles.controlBtnText}>
                {t.retry}
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.liveHud}>
        {lightOn && (
          <Slider
            style={styles.liveBrightnessSlider}
            minimumValue={CAMERA_CONFIG.lightMinimumIntensity}
            maximumValue={CAMERA_CONFIG.lightMaximumIntensity}
            step={1}
            value={sliderValue}
            disabled={lightIsChanging || streamError}
            onSlidingStart={() => {
              isAdjustingLight.current = true;
            }}
            onValueChange={(value) => {
              setSliderValue(value);
            }}
            onSlidingComplete={updateLightBrightness}
            minimumTrackTintColor="#00e426"
            maximumTrackTintColor="rgba(255,255,255,0.28)"
            thumbTintColor="#ffffff"
          />
        )}
        <Pressable
          disabled={lightIsChanging}
          style={[
            styles.liveHudBtn,
            lightOn && styles.liveHudBtnOn,
            lightIsChanging && styles.controlBtnDisabled,
          ]}
          onPress={toggleCameraLight}
        >
          <Text style={styles.liveHudBtnText}>
            {lightIsChanging
              ? t.lightUpdating
              : `${t.light}: ${lightOn ? t.on : t.off}`}
          </Text>
        </Pressable>

        <Pressable
          style={styles.liveHudBtn}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: "Landing" }],
            })
          }
        >
          <Text style={styles.liveHudBtnText}>
            {t.back}
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
</View>
);
}