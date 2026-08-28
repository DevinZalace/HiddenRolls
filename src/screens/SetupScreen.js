// Setup screen for selecting language and guiding the user through device connection.
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { styles } from "../theme/styles";
import {
  getBluetoothStatus,
  requestBluetoothPermissions,
} from "../../services/provisioningService";

export function SetupScreen({ navigation, t, language, setLanguage}) {
  const [checkingBluetooth, setCheckingBluetooth] = useState(false);
  async function handleConnect() {
  if (checkingBluetooth) {
    return;
  }

  setCheckingBluetooth(true);

  try {
    let bluetoothStatus = getBluetoothStatus();

    if (!bluetoothStatus.supported) {
      Alert.alert(
        t.bluetoothUnavailableTitle,
        t.bluetoothUnavailableBody
      );
      return;
    }

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

    if (!bluetoothStatus.enabled) {
      Alert.alert(
        t.bluetoothOffTitle,
        t.bluetoothOffBody
      );
      return;
    }

    navigation.navigate("Connecting");
  } catch (error) {
    console.error("Bluetooth readiness check failed:", error);

    Alert.alert(
      t.bluetoothErrorTitle,
      t.bluetoothErrorBody
    );
  } finally {
    setCheckingBluetooth(false);
  }
}
  
  
  return (
    <View style={styles.setupRoot}>
      <View style={styles.setupTop}>
        <Text style={styles.setupTitle}>{t.setupTitle}</Text>

        <Text style={styles.sectionLabel}>{t.languageLabel}</Text>
        <View style={styles.langRow}>
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

        <Text style={styles.sectionLabel}>{t.connectionTitle}</Text>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>{t.howToConnect}</Text>
          <Text style={styles.helpBody}>{t.connectSteps}</Text>

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

      <View style={styles.setupBottom}>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>{t.back}</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </View>
  );
}