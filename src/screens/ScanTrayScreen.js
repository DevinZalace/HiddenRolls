import { useState } from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import { parseTrayQr } from "../../services/provisioningService";
import { styles } from "../theme/styles";

export function ScanTrayScreen({ navigation,
  pendingTray,
  setPendingTray }) {
  const [permission, requestPermission] =
    useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [scanError, setScanError] = useState(null);

  function handleBarcodeScanned({ data }) {
    if (scanned) {
      return;
    }

    setScanned(true);
    setScanError(null);

    try {
      const tray = parseTrayQr(data);
      setPendingTray(tray);
    } catch (error) {
      console.error("Tray QR parsing failed:", error);

      setScanError(
        "This QR code is not a valid Hidden Rolls tray."
      );
    }
  }

  if (!permission) {
    return (
      <View style={styles.setupRoot}>
        <Text style={styles.helpBody}>
          Checking camera permission...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.setupRoot}>
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>
            Camera permission required
          </Text>

          <Text style={styles.helpBody}>
            Hidden Rolls uses your camera to scan the
            setup QR code included with your tray.
          </Text>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 14 }]}
            onPress={requestPermission}
          >
            <Text style={styles.primaryBtnText}>
              Allow Camera
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  if (pendingTray) {
    return (
      <View style={styles.setupRoot}>
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>
            Tray Found
          </Text>

          <Text style={styles.helpBody}>
            Hidden Rolls {pendingTray.trayId}
          </Text>

          <Text style={styles.helpBody}>
            {pendingTray.hostname}
          </Text>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 14 }]}
            onPress={() => navigation.replace("Connecting")}
          >
            <Text style={styles.primaryBtnText}>
              Continue
            </Text>
          </Pressable>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 10 }]}
            onPress={() => {
                setPendingTray(null);
                setScanned(false);
            }}
            >
            <Text style={styles.primaryBtnText}>
                Scan Again
            </Text>
            </Pressable>

            <Pressable
                style={[styles.primaryBtn, { marginTop: 10 }]}
                onPress={() => {
                    setPendingTray(null);
                    navigation.reset({
                        index: 1,
                        routes: [
                            { name: "Landing" },
                            { name: "Setup" },
                        ],
                    });
                }}
                >
                <Text style={styles.primaryBtnText}>
                    Back
                </Text>
                </Pressable>
            </View>
        </View>
    );
  }

  return (
    <View style={styles.setupRoot}>
      <Text style={styles.setupTitle}>
        Scan Your Tray
      </Text>

      <Text style={styles.helpBody}>
        Scan the QR code included with your Hidden Rolls tray.
      </Text>

      <CameraView
        style={{
          width: "100%",
          flex: 1,
          marginVertical: 20,
        }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={
          scanned ? undefined : handleBarcodeScanned
        }
      />

      {scanError ? (
        <View style={styles.helpCard}>
          <Text style={styles.helpBody}>
            {scanError}
          </Text>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 14 }]}
            onPress={() => {
              setPendingTray(null);
              setScanned(false);
              setScanError(null);
            }}
          >
            <Text style={styles.primaryBtnText}>
              Scan Again
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        style={styles.primaryBtn}
        onPress={() => {
            setPendingTray(null);

            navigation.reset({
            index: 1,
            routes: [
                { name: "Landing" },
                { name: "Setup" },
            ],
            });
        }}
        >
        <Text style={styles.primaryBtnText}>
            Back
        </Text>
        </Pressable>
    </View>
  );
}