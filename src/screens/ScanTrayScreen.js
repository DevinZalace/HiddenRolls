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

import { parseTrayQr, findTray, connectTray, scanWifiNetworks } from "../../services/provisioningService";
import { styles } from "../theme/styles";

/**
 * ScanTrayScreen
 *
 * Main provisioning flow screen that handles:
 * 1. QR code scanning to extract tray information
 * 2. Bluetooth discovery of the tray
 * 3. Bluetooth connection establishment
 * 4. Wi-Fi network scanning for provisioning
 *
 * Flow: Camera permission -> Scan QR -> Find Tray (BLE) -> Connect to Tray (BLE) -> Scan Wi-Fi networks
 */
export function ScanTrayScreen({ navigation, pendingTray, setPendingTray }) {
  // Camera permission state
  const [permission, requestPermission] =
    useCameraPermissions();

  // QR code scanning state
  const [scanned, setScanned] = useState(false);
  const [scanError, setScanError] = useState(null);

  // Bluetooth tray discovery state
  const [findingTray, setFindingTray] = useState(false);
  const [trayFoundOverBle, setTrayFoundOverBle] = useState(false);
  const [discoveryError, setDiscoveryError] = useState(null);

  // Bluetooth tray connection state
  const [connectingTray, setConnectingTray] = useState(false);
  const [trayConnected, setTrayConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Wi-Fi network scanning and selection state
  const [scanningWifi, setScanningWifi] = useState(false);
  const [wifiNetworks, setWifiNetworks] = useState([]);
  const [wifiScanError, setWifiScanError] = useState(null);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

  /**
   * Initiates Bluetooth discovery of the tray.
   * Calls the native provisioning service to scan for the device.
   */
  async function handleFindTray() {
    if (findingTray) {
      return;
    }

    setFindingTray(true);
    setDiscoveryError(null);

    try {
      await findTray();
      setTrayFoundOverBle(true);
    } catch (error) {
      console.error("BLE tray discovery failed:", error);

      setDiscoveryError(
        "Hidden Rolls could not find this tray nearby. Make sure the tray is powered on and ready for setup."
      );
    } finally {
      setFindingTray(false);
    }
  }

  /**
   * Processes a scanned QR code.
   * Parses the QR data and stores the tray information.
   * Prevents multiple scans in quick succession.
   */
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

  /**
   * Attempts to establish a Bluetooth connection to the discovered tray.
   * Requires the tray to be found via findTray() first.
   */
  async function handleConnectTray() {
    if (connectingTray) return;

    setConnectingTray(true);
    setConnectionError(null);

    try {
      await connectTray();
      setTrayConnected(true);
    } catch (error) {
      console.error("BLE tray connection failed:", error);

      setConnectionError(
        "Hidden Rolls found the tray, but could not connect to it."
      );
    } finally {
      setConnectingTray(false);
    }
  }

  /**
   * Scans for available Wi-Fi networks visible to the tray.
   * Requires the tray to be connected via connectTray() first.
   */
  async function handleScanWifi() {
    if (scanningWifi) return;

    setScanningWifi(true);
    setWifiScanError(null);
    setWifiNetworks([]);
    setSelectedNetwork(null);

    try {
      const networks = await scanWifiNetworks();
      setWifiNetworks(networks);
    } catch (error) {
      console.error("Tray Wi-Fi scan failed:", error);

      setWifiScanError(
        "Hidden Rolls could not find nearby Wi-Fi networks."
      );
    } finally {
      setScanningWifi(false);
    }
  }

  function resetProvisioningState() {
    setPendingTray(null);

    setScanned(false);
    setScanError(null);

    setFindingTray(false);
    setTrayFoundOverBle(false);
    setDiscoveryError(null);

    setConnectingTray(false);
    setTrayConnected(false);
    setConnectionError(null);

    setScanningWifi(false);
    setWifiNetworks([]);
    setWifiScanError(null);
    setSelectedNetwork(null);
  }

  // Loading state: Camera permission is being checked
  if (!permission) {
    return (
      <View style={styles.setupRoot}>
        <Text style={styles.helpBody}>
          Checking camera permission...
        </Text>
      </View>
    );
  }

  // Permission denied: Show request screen
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

  // QR scanned: Show provisioning flow (discovery -> connection -> Wi-Fi scan)
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

          {/* Step 1: Discover tray over Bluetooth */}
          {!trayFoundOverBle ? (
            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 14 },
                findingTray && { opacity: 0.6 },
              ]}
              onPress={handleFindTray}
              disabled={findingTray}
            >
              <Text style={styles.primaryBtnText}>
                {findingTray ? "Finding Tray..." : "Find Tray"}
              </Text>
            </Pressable>
          ) : null}

          {trayFoundOverBle ? (
            <Text style={styles.helpBody}>
              Tray found over Bluetooth.
            </Text>
          ) : null}

          {/* Step 2: Connect to tray once discovered */}
          {trayFoundOverBle && !trayConnected ? (
            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 14 },
                connectingTray && { opacity: 0.6 },
              ]}
              onPress={handleConnectTray}
              disabled={connectingTray}
            >
              <Text style={styles.primaryBtnText}>
                {connectingTray ? "Connecting..." : "Connect to Tray"}
              </Text>
            </Pressable>
          ) : null}

          {trayConnected ? (
            <Text style={styles.helpBody}>
              Tray connected over Bluetooth.
            </Text>
          ) : null}

          {connectionError ? (
            <Text style={styles.helpBody}>
              {connectionError}
            </Text>
          ) : null}

          {/* Step 3: Scan Wi-Fi networks available to the tray */}
          {trayConnected ? (
            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 14 },
                scanningWifi && { opacity: 0.6 },
              ]}
              onPress={handleScanWifi}
              disabled={scanningWifi}
            >
              <Text style={styles.primaryBtnText}>
                {scanningWifi ? "Scanning Wi-Fi..." : "Scan Wi-Fi"}
              </Text>
            </Pressable>
          ) : null}

          {/* Display discovered Wi-Fi networks with signal strength */}
          {wifiNetworks.map((network) => (
            <Pressable
              key={network.ssid}
              onPress={() => setSelectedNetwork(network)}
            >
              <Text style={styles.helpBody}>
                {network.ssid} ({network.rssi} dBm)
                {selectedNetwork?.ssid === network.ssid ? " ✓" : ""}
              </Text>
            </Pressable>
          ))}

          {/* Error messages */}
          {wifiScanError ? (
            <Text style={styles.helpBody}>
              {wifiScanError}
            </Text>
          ) : null}

          {discoveryError ? (
            <Text style={styles.helpBody}>
              {discoveryError}
            </Text>
          ) : null}

          {/* Navigation buttons */}
          <Pressable
            style={[styles.primaryBtn, { marginTop: 10 }]}
            onPress={resetProvisioningState}
          >
            <Text style={styles.primaryBtnText}>
              Scan Again
            </Text>
          </Pressable>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 10 }]}
            onPress={() => {
              resetProvisioningState();
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

  // Initial state: Show camera for QR code scanning
  return (
    <View style={styles.setupRoot}>
      <Text style={styles.setupTitle}>
        Scan Your Tray
      </Text>

      <Text style={styles.helpBody}>
        Scan the QR code included with your Hidden Rolls tray.
      </Text>

      {/* Camera view for QR code scanning - disabled after first scan */}
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

      {/* Error message if QR scan fails */}
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

      {/* Back button to return to setup */}
      <Pressable
        style={styles.primaryBtn}
        onPress={() => {
          resetProvisioningState();

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