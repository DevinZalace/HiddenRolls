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
import { Alert, Platform, Pressable, Text, useWindowDimensions, View, ScrollView, ImageBackground } from "react-native";
import Slider from "@react-native-community/slider";
import { WebView } from "react-native-webview";
import { CAMERA_CONFIG, buildCameraStreamUrl } from "../../config/camera";
import {
  checkCameraConnection,
  setCameraLightIntensity,
  setCameraSetting,
} from "../../services/cameraService";
import { styles } from "../theme/styles";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";

// Camera effect options for the ESP32-CAM device.
const CAMERA_EFFECT_OPTIONS = [
  { labelKey: "cameraEffectNormal", value: 0 },
  { labelKey: "cameraEffectNegative", value: 1 },
  { labelKey: "cameraEffectGrayscale", value: 2 },
  { labelKey: "cameraEffectRedTint", value: 3 },
  { labelKey: "cameraEffectGreenTint", value: 4 },
  { labelKey: "cameraEffectBlueTint", value: 5 },
  { labelKey: "cameraEffectSepia", value: 6 },
];
const CAMERA_ASPECT_RATIO = 3 / 2;
const CAMERA_SETTINGS_HUD_CLEARANCE = 50;

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
  const {
    width: screenWidth,
    height: screenHeight,
  } = useWindowDimensions();

  const cameraFrameWidth = Math.min(
    screenWidth,
    screenHeight * CAMERA_ASPECT_RATIO
  );

  const cameraFrameHeight =
    cameraFrameWidth / CAMERA_ASPECT_RATIO;

  const liveEdgeInset = Math.max(
    8,
    Math.min(16, cameraFrameWidth * 0.02)
  );

  const cameraSettingsWidth = Math.min(
    300,
    cameraFrameWidth - liveEdgeInset * 2
  );

  const cameraSettingsMaxHeight = Math.max(
    0,
    cameraFrameHeight -
      CAMERA_SETTINGS_HUD_CLEARANCE -
      liveEdgeInset * 2
  );
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

  const [cameraSettingsOpen, setCameraSettingsOpen] = useState(false);
  const [cameraBrightness, setCameraBrightness] = useState(0);
  const [cameraContrast, setCameraContrast] = useState(0);
  const [cameraSaturation, setCameraSaturation] = useState(0);
  const [cameraEffect, setCameraEffect] = useState(0);
  const [effectMenuOpen, setEffectMenuOpen] = useState(false);
  const [cameraMirror, setCameraMirror] = useState(false);
  const [cameraFlip, setCameraFlip] = useState(false);

  const isAdjustingLight = useRef(false);
  // Avoid overwriting the slider while a drag is in progress.

  // Track whether the user is actively adjusting camera settings.
  const isAdjustingBrightness = useRef(false);
  const isAdjustingContrast = useRef(false);
  const isAdjustingSaturation = useRef(false);

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

// Updates camera brightness setting on the ESP32 device.
async function updateCameraBrightness(value) {
  const requestedValue = Math.round(value);

  try {
    const result = await setCameraSetting(
      "brightness",
      requestedValue,
      {
        host: cameraHost,
      }
    );

    if (!result.success) {
      console.error(
        "Failed to update camera brightness:",
        result.reason
      );

      return;
    }

    setCameraBrightness(result.value);
  } finally {
    isAdjustingBrightness.current = false;
  }
}

// Updates camera contrast setting on the ESP32 device.
async function updateCameraContrast(value) {
  const requestedValue = Math.round(value);

  try {
    const result = await setCameraSetting(
      "contrast",
      requestedValue,
      {
        host: cameraHost,
      }
    );

    if (!result.success) {
      console.error(
        "Failed to update camera contrast:",
        result.reason
      );

      return;
    }

    setCameraContrast(result.value);
  } finally {
    isAdjustingContrast.current = false;
  }
}

// Updates camera saturation setting on the ESP32 device.
async function updateCameraSaturation(value) {
  const requestedValue = Math.round(value);

  try {
    const result = await setCameraSetting(
      "saturation",
      requestedValue,
      {
        host: cameraHost,
      }
    );

    if (!result.success) {
      console.error(
        "Failed to update camera saturation:",
        result.reason
      );

      return;
    }

    setCameraSaturation(result.value);
  } finally {
    isAdjustingSaturation.current = false;
  }
}

// Updates camera special effect setting on the ESP32 device.
async function updateCameraEffect(value) {
  setCameraEffect(value);
  setEffectMenuOpen(false);

  const result = await setCameraSetting(
    "special_effect",
    value,
    {
      host: cameraHost,
    }
  );

  if (!result.success) {
    console.error(
      "Failed to update camera effect:",
      result.reason
    );
  }
}

// Updates camera horizontal mirror setting on the ESP32 device.
async function updateCameraMirror() {
  const nextValue = !cameraMirror;

  setCameraMirror(nextValue);

  const result = await setCameraSetting(
    "hmirror",
    nextValue ? 1 : 0,
    {
      host: cameraHost,
    }
  );

  if (!result.success) {
    setCameraMirror(!nextValue);

    console.error(
      "Failed to update camera mirror:",
      result.reason
    );
  }
}

// Updates camera vertical flip setting on the ESP32 device.
async function updateCameraFlip() {
  const nextValue = !cameraFlip;

  setCameraFlip(nextValue);

  const result = await setCameraSetting(
    "vflip",
    nextValue ? 1 : 0,
    {
      host: cameraHost,
    }
  );

  if (!result.success) {
    setCameraFlip(!nextValue);

    console.error(
      "Failed to update camera flip:",
      result.reason
    );
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
      void ScreenOrientation.unlockAsync();

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

const reportedCameraBrightness = Number(
    result.cameraStatus?.brightness
  );

if (
  Number.isFinite(reportedCameraBrightness) &&
  !isAdjustingBrightness.current
) {
  setCameraBrightness(reportedCameraBrightness);
}

const reportedCameraContrast = Number(
  result.cameraStatus?.contrast
);

if (
  Number.isFinite(reportedCameraContrast) &&
  !isAdjustingContrast.current
) {
  setCameraContrast(reportedCameraContrast);
}

const reportedCameraSaturation = Number(
  result.cameraStatus?.saturation
);

if (
  Number.isFinite(reportedCameraSaturation) &&
  !isAdjustingSaturation.current
) {
  setCameraSaturation(reportedCameraSaturation);
}

const reportedCameraEffect = Number(
  result.cameraStatus?.special_effect
);

if (Number.isFinite(reportedCameraEffect)) {
  setCameraEffect(reportedCameraEffect);
}

const reportedCameraMirror = Number(
  result.cameraStatus?.hmirror
);

if (Number.isFinite(reportedCameraMirror)) {
  setCameraMirror(reportedCameraMirror === 1);
}

const reportedCameraFlip = Number(
  result.cameraStatus?.vflip
);

if (Number.isFinite(reportedCameraFlip)) {
  setCameraFlip(reportedCameraFlip === 1);
}

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
    <ImageBackground
      source={require("../../assets/AdobeStock_1424312367.jpg")}
      style={styles.liveRoot}
      resizeMode="cover"
    >
      <StatusBar hidden />
      <View style={styles.videoArea}>
        <View
          style={[
            styles.cameraFrame,
            {
              width: cameraFrameWidth,
              height: cameraFrameHeight,
            },
          ]}
        >
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
          style={[
            styles.cameraStream,
            styles.cameraStreamZoom,
          ]}
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

        {cameraSettingsOpen && (
          <View
            style={[
              styles.cameraSettingsPanel,
              {
                right: liveEdgeInset,
                bottom: liveEdgeInset + CAMERA_SETTINGS_HUD_CLEARANCE,
                width: cameraSettingsWidth,
                maxHeight: cameraSettingsMaxHeight,
              },
            ]}
          >
            <View style={styles.cameraSettingsHeader}>
              <Text style={styles.cameraSettingsTitle}>
                {t.cameraSettings}
              </Text>

              <Pressable
                onPress={() => setCameraSettingsOpen(false)}
              >
                <Text style={styles.cameraSettingsClose}>
                  ×
                </Text>
              </Pressable>
            </View>
            <ScrollView
              style={{ flexShrink: 1 }}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
            <View style={styles.cameraSettingCompactRow}>
              <Text style={styles.cameraSettingCompactLabel}>
                {t.imageBrightness}
              </Text>

              <Slider
                style={styles.cameraSettingCompactSlider}
                minimumValue={-2}
                maximumValue={2}
                step={1}
                value={cameraBrightness}
                onSlidingStart={() => {
                  isAdjustingBrightness.current = true;
                }}
                onValueChange={setCameraBrightness}
                onSlidingComplete={updateCameraBrightness}
                minimumTrackTintColor="#ffffff"
                maximumTrackTintColor="rgba(255,255,255,0.25)"
                thumbTintColor="#ffffff"
              />

              <Text style={styles.cameraSettingCompactValue}>
                {cameraBrightness}
              </Text>
            </View>

            <View style={styles.cameraSettingCompactRow}>
              <Text style={styles.cameraSettingCompactLabel}>
                {t.cameraContrast}
              </Text>

              <Slider
                style={styles.cameraSettingCompactSlider}
                minimumValue={-2}
                maximumValue={2}
                step={1}
                value={cameraContrast}
                onSlidingStart={() => {
                  isAdjustingContrast.current = true;
                }}
                onValueChange={setCameraContrast}
                onSlidingComplete={updateCameraContrast}
                minimumTrackTintColor="#ffffff"
                maximumTrackTintColor="rgba(255,255,255,0.25)"
                thumbTintColor="#ffffff"
              />

              <Text style={styles.cameraSettingCompactValue}>
                {cameraContrast}
              </Text>
            </View>

            <View style={styles.cameraSettingCompactRow}>
              <Text style={styles.cameraSettingCompactLabel}>
                {t.cameraSaturation}
              </Text>

              <Slider
                style={styles.cameraSettingCompactSlider}
                minimumValue={-2}
                maximumValue={2}
                step={1}
                value={cameraSaturation}
                onSlidingStart={() => {
                  isAdjustingSaturation.current = true;
                }}
                onValueChange={setCameraSaturation}
                onSlidingComplete={updateCameraSaturation}
                minimumTrackTintColor="#ffffff"
                maximumTrackTintColor="rgba(255,255,255,0.25)"
                thumbTintColor="#ffffff"
              />

              <Text style={styles.cameraSettingCompactValue}>
                {cameraSaturation}
              </Text>
            </View>

            <View style={styles.cameraEffectSection}>
              <Text style={styles.cameraSettingLabel}>
                {t.cameraEffect}
              </Text>

              <Pressable
                style={styles.cameraEffectSelector}
                onPress={() =>
                  setEffectMenuOpen((current) => !current)
                }
              >
                <Text style={styles.cameraEffectSelectorText}>
                  {
                    t[
                      CAMERA_EFFECT_OPTIONS.find(
                        (effect) => effect.value === cameraEffect
                      )?.labelKey ?? "cameraEffectNormal"
                    ]
                  }
                </Text>

                <Text style={styles.cameraEffectArrow}>
                  {effectMenuOpen ? "▲" : "▼"}
                </Text>
              </Pressable>

              {effectMenuOpen && (
                <View style={styles.cameraEffectMenu}>
                  {CAMERA_EFFECT_OPTIONS.map((effect) => (
                    <Pressable
                      key={effect.value}
                      style={[
                        styles.cameraEffectOption,
                        cameraEffect === effect.value &&
                          styles.cameraEffectOptionActive,
                      ]}
                      onPress={() =>
                        updateCameraEffect(effect.value)
                      }
                    >
                      <Text style={styles.cameraEffectOptionText}>
                        {t[effect.labelKey]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <View style={styles.cameraToggleRow}>
                <Pressable
                  style={[
                    styles.cameraToggleBtn,
                    cameraMirror && styles.cameraToggleBtnActive,
                  ]}
                  onPress={updateCameraMirror}
                >
                  <Text style={styles.cameraToggleText}>
                    {t.cameraMirror}: {cameraMirror ? t.on : t.off}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.cameraToggleBtn,
                    cameraFlip && styles.cameraToggleBtnActive,
                  ]}
                  onPress={updateCameraFlip}
                >
                      <Text style={styles.cameraToggleText}>
                        {t.cameraFlip}: {cameraFlip ? t.on : t.off}
                      </Text>
                </Pressable>
              </View>
            </View>
            </ScrollView>
          </View>
        )}

        <View
          style={[
            styles.liveHud,
            {
              left: liveEdgeInset,
              right: liveEdgeInset,
              bottom: liveEdgeInset,
            },
          ]}
>
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
            setCameraSettingsOpen((current) => !current)
          }
        >
          <Text style={styles.liveHudBtnText}>
            ⚙
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
</ImageBackground>
);
}