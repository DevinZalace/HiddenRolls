/**
 * SetupScreen.js
 *
 * Setup screen where users:
 * - Select their language preference (English/Spanish)
 * - Check Bluetooth status and request permissions if needed
 * - Begin the tray provisioning flow
 *
 * This is the first step after accepting terms.
 */

import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
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
  // Loading state while checking Bluetooth availability
  const [checkingBluetooth, setCheckingBluetooth] = useState(false);

  /**
   * Handles Connect button press.
   * Checks Bluetooth support, permissions, and enabled state.
   * Navigates to QR scanning screen if all checks pass.
   */
  async function handleConnect() {
    if (checkingBluetooth) {
      return;
    }

    setCheckingBluetooth(true);

    try {
      // Check current Bluetooth status
      let bluetoothStatus = getBluetoothStatus();

      // Check 1: Device supports Bluetooth
      if (!bluetoothStatus.supported) {
        Alert.alert(
          t.bluetoothUnavailableTitle,
          t.bluetoothUnavailableBody
        );
        return;
      }

      // Check 2: Request permissions if not granted
      if (!bluetoothStatus.permissionsGranted) {
        bluetoothStatus = await requestBluetoothPermissions();
      }

      if (!bluetoothStatus.permissionsGranted) {
        Alert.alert(
          t.bluetoothPermissionTitle,
          t.bluetoothPermissionBody
        );
        return;
      }

      // Check 3: Bluetooth is enabled on device
      if (!bluetoothStatus.enabled) {
        Alert.alert(t.bluetoothOffTitle, t.bluetoothOffBody);
        return;
      }

      // All checks passed - proceed to QR scanning
      navigation.navigate("ScanTray");
    } catch (error) {
      console.error("Bluetooth readiness check failed:", error);

      Alert.alert(t.bluetoothErrorTitle, t.bluetoothErrorBody);
    } finally {
      setCheckingBluetooth(false);
    }
  }
  return (
    <View style={styles.setupRoot}>
      <View style={styles.setupTop}>
        <Text style={styles.setupTitle}>{t.setupTitle}</Text>

        {/* ===== Language Selection ===== */}
        <Text style={styles.sectionLabel}>{t.languageLabel}</Text>
        <View style={styles.langRow}>
          {/* English button */}
          <Pressable
            onPress={() => setLanguage("en")}
            style={[
              styles.chip,
              language === "en" ? styles.chipActive : styles.chipInactive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                language === "en"
                  ? styles.chipTextActive
                  : styles.chipTextInactive,
              ]}
            >
              {t.english}
            </Text>
          </Pressable>

          {/* Spanish button */}
          <Pressable
            onPress={() => setLanguage("es")}
            style={[
              styles.chip,
              language === "es" ? styles.chipActive : styles.chipInactive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                language === "es"
                  ? styles.chipTextActive
                  : styles.chipTextInactive,
              ]}
            >
              {t.spanish}
            </Text>
          </Pressable>
        </View>

        {/* ===== Connection Instructions & Button ===== */}
        <Text style={styles.sectionLabel}>{t.connectionTitle}</Text>

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
        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>{t.back}</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </View>
  );
}