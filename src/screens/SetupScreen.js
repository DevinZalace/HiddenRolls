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
  // Prevent duplicate readiness checks while permissions are being evaluated.
  const [checkingBluetooth, setCheckingBluetooth] = useState(false);

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
          t.bluetoothUnavailableBody
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
          t.bluetoothPermissionBody
        );
        return;
      }

      // The adapter must be enabled before scanning can begin.
      if (!bluetoothStatus.enabled) {
        Alert.alert(t.bluetoothOffTitle, t.bluetoothOffBody);
        return;
      }

      // All prerequisites passed; continue to QR scanning.
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