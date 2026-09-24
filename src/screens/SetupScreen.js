/**
 * SetupScreen.js
 *
 * Setup screen where users choose a language and verify Bluetooth readiness
 * before entering the QR-based tray provisioning flow.
 *
 * This is the first step after accepting terms.
 */

import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View, useWindowDimensions, ImageBackground } from "react-native";
import { styles } from "../theme/styles";
import {
  getBluetoothStatus,
  requestBluetoothPermissions,
} from "../../services/provisioningService";

/**
 * SetupScreen Component
 *
 * Props:
 * - navigation: React Navigation object for screen navigation
 * - t: Localized text strings object
 * - language: Current language ("en" or "es")
 * - setLanguage: Function to change language
 */
export function SetupScreen({ navigation, t, language, setLanguage }) {
  // Prevent duplicate readiness checks while permissions are being evaluated.
  const [checkingBluetooth, setCheckingBluetooth] = useState(false);
  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;

  const horizontalPadding = isTablet ? 32 : 24;

  const setupContentWidth = Math.min(
    width - horizontalPadding * 2,
    720
  );

  /**
  * Verifies Bluetooth readiness before opening the QR scanning screen.
   */
  async function handleConnect() {
    if (checkingBluetooth) {
      return;
    }

    setCheckingBluetooth(true);

    try {
      // Read the current adapter and permission state.
      let bluetoothStatus = getBluetoothStatus();

      // BLE hardware is required for tray setup.
      if (!bluetoothStatus.supported) {
        Alert.alert(
          t.bluetoothUnavailableTitle,
          t.bluetoothUnavailableBody,
          [{ text: t.ok }]
        );
        return;
      }

      // Request platform-specific BLE permissions when necessary.
      if (!bluetoothStatus.permissionsGranted) {
        bluetoothStatus = await requestBluetoothPermissions();
      }

      if (!bluetoothStatus.permissionsGranted) {
        Alert.alert(
          t.bluetoothPermissionTitle,
          t.bluetoothPermissionBody,
          [{ text: t.ok }]
        );
        return;
      }

      // The adapter must be enabled before scanning can begin.
      if (!bluetoothStatus.enabled) {
        Alert.alert(
          t.bluetoothOffTitle,
          t.bluetoothOffBody,
          [{ text: t.ok }]
        );
        return;
      }

      // All prerequisites passed; continue to QR scanning.
      navigation.navigate("ScanTray");
    } catch (error) {
      console.error("Bluetooth readiness check failed:", error);

      Alert.alert(
        t.bluetoothErrorTitle,
        t.bluetoothErrorBody,
        [{ text: t.ok }]
      );
    } finally {
      setCheckingBluetooth(false);
    }
  }

  const setupBackground = isLandscape
    ? require("../../assets/AdobeStock_2005453868.jpg")
    : require("../../assets/AdobeStock_200545386812.jpg");

  return (
    <ImageBackground
          source={setupBackground}
          style={styles.background}
          resizeMode="cover"
        >
          <View
            pointerEvents="none"
            style={styles.BackgroundOverlay}
          />
    <View style={styles.setupRoot}>
      <ScrollView
        style={styles.setupPageScroll}
        contentContainerStyle={[
          styles.setupPageScrollContent,
          isLandscape && styles.setupScrollLandscape,
          isTablet && styles.setupScrollTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.setupContent,
            { width: setupContentWidth },
          ]}
        >
      <View style={styles.setupTop}>
        <Text style={styles.setupTitle}>{t.setupTitle}</Text>

        {/* ===== Settings Cog ===== */}
        <Pressable
          style={styles.setupSettingsBtn}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.setupSettingsBtnText}>
            ⚙
          </Text>
        </Pressable>

        {/* ===== Connection Instructions & Button ===== */}
        <Text style={styles.setupSectionLabel}>{t.connectionTitle}</Text>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>{t.howToConnect}</Text>
          <Text style={styles.helpBody}>{t.connectSteps}</Text>

          {/* Connect button - triggers Bluetooth readiness check */}
          <Pressable
            style={[
              styles.primaryBtn,
              { marginTop: 14 },
              checkingBluetooth && { opacity: 0.6 },
            ]}
            onPress={handleConnect}
            disabled={checkingBluetooth}
          >
            <Text style={styles.primaryBtnText}>
              {checkingBluetooth ? t.checkingBluetooth : t.connectBtn}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* ===== Back Button ===== */}
      <View style={styles.setupBottom}>
        <Pressable style={[styles.primaryBtn, styles.backBtn]} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>{t.back}</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </View>
    </ScrollView>
    </View>
    </ImageBackground>
  );
}