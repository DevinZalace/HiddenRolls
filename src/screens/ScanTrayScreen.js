import { useState } from "react";
import {
  Pressable,
  Text,
  View,
  ScrollView,
  TextInput,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import {
  verifyHiddenRollsTray,
  waitForTrayReady,
} from "../../services/cameraService";
import { parseTrayQr, findTray, connectTray, scanWifiNetworks, provisionWifi } from "../../services/provisioningService";
import { styles } from "../theme/styles";
import {
  savePairedTray,
} from "../../services/pairedTrayService";

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
export function ScanTrayScreen({ navigation, pendingTray, setPendingTray, setPairedTray }) {
  // Camera permission state
  const [permission, requestPermission] =
    useCameraPermissions();

  // QR code scanning state
  const [scanned, setScanned] = useState(false);
  const [scanError, setScanError] = useState(null);

  // Tray setup state (idle, checking, existing, ready, unreachable)
  const [traySetupState, setTraySetupState] =
  useState("idle");

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

  // Wi-Fi provisioning state
  const [wifiPassword, setWifiPassword] = useState("");
  const [provisioningWifi, setProvisioningWifi] = useState(false);
  const [provisionError, setProvisionError] = useState(null);
  const [wifiProvisioned, setWifiProvisioned] = useState(false);

  // Finalization state after provisioning
  const [finalizingSetup, setFinalizingSetup] = useState(false);
  const [finalizationError, setFinalizationError] = useState(null);

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
    setTraySetupState("ready");
  } catch (error) {
    console.error(
      "BLE tray discovery failed:",
      error
    );

    setTraySetupState("unreachable");

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
  async function handleBarcodeScanned({ data }) {
  if (scanned) {
    return;
  }

  setScanned(true);
  setScanError(null);
  setDiscoveryError(null);
  setTraySetupState("checking");

  try {
    const tray = parseTrayQr(data);

    setPendingTray(tray);

    // First determine whether this exact tray is already
    // configured and reachable over the local network.
    const alreadyConfigured =
      await verifyHiddenRollsTray(tray);

    if (alreadyConfigured) {
      setTraySetupState("existing");
      return;
    }

    // The tray is not reachable over Wi-Fi.
    // Check whether it is advertising its BLE provisioning service.
    try {
      await findTray();

      setTrayFoundOverBle(true);
      setTraySetupState("ready");
    } catch (error) {
      console.error(
        "Tray was not found over Wi-Fi or Bluetooth:",
        error
      );

      setTraySetupState("unreachable");
    }
  } catch (error) {
    console.error(
      "Tray QR parsing failed:",
      error
    );

    setPendingTray(null);
    setScanned(false);
    setTraySetupState("idle");

    setScanError(
      "This QR code is not a valid Hidden Rolls tray."
    );
  }
}

  /**
   * Uses the existing tray configuration.
   * Saves it as a paired tray and navigates to the live view.
   */
async function handleUseExistingTray() {
  if (!pendingTray) {
    return;
  }

  const pairedTray = {
    schemaVersion: 1,
    trayId: pendingTray.trayId,
    displayName:
      `Hidden Rolls ${pendingTray.trayId}`,
    hostname: pendingTray.hostname,
    provisioningName:
      pendingTray.provisioningName,
    pairedAt: new Date().toISOString(),
  };

  try {
    await savePairedTray(pairedTray);

    setPairedTray(pairedTray);
    setPendingTray(null);

    navigation.reset({
      index: 0,
      routes: [{ name: "Live" }],
    });
  } catch (error) {
    console.error(
      "Failed to save existing tray:",
      error
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

  // Handles selection of a Wi-Fi network from the scanned list.
  function handleSelectNetwork(network) {
  setSelectedNetwork(network);
  setWifiPassword("");
  setProvisionError(null);
}

  // Attempts to provision the tray with the selected Wi-Fi network and password.
  async function handleProvisionWifi() {
    if (!selectedNetwork || provisioningWifi) {
      return;
    }

    let provisioningSucceeded = false;

    setProvisioningWifi(true);
    setProvisionError(null);
    setFinalizationError(null);

    try {
      await provisionWifi(
        selectedNetwork.ssid,
        wifiPassword
      );

      provisioningSucceeded = true;
      setWifiProvisioned(true);
      setFinalizingSetup(true);

      await waitForTrayReady(
        pendingTray.hostname
      );

      const pairedTray = {
        schemaVersion: 1,
        trayId: pendingTray.trayId,
        displayName: `Hidden Rolls ${pendingTray.trayId}`,
        hostname: pendingTray.hostname,
        provisioningName: pendingTray.provisioningName,
        pairedAt: new Date().toISOString(),
      };

      await savePairedTray(pairedTray);
      setPairedTray(pairedTray);
      setPendingTray(null);

      navigation.reset({
        index: 0,
        routes: [{ name: "Live" }],
      });
    } catch (error) {
      console.error("Tray setup failed:", error);

      if (provisioningSucceeded) {
        setFinalizationError(
          "The tray joined Wi-Fi, but Hidden Rolls could not reach it yet."
        );
      } else {
        setProvisionError(
          "Hidden Rolls could not connect the tray to this Wi-Fi network. Check the password and try again."
        );
      }
    } finally {
      setProvisioningWifi(false);
      setFinalizingSetup(false);
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

    setWifiPassword("");
    setProvisioningWifi(false);
    setProvisionError(null);
    setWifiProvisioned(false);

    setFinalizingSetup(false);
    setFinalizationError(null);

    setTraySetupState("idle");
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
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={styles.setupScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
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
          {traySetupState === "checking" ? (
            <Text style={styles.helpBody}>
              Checking tray...
            </Text>
          ) : null}

          {traySetupState === "existing" ? (
            <>
              <Text style={styles.helpBody}>
                This tray is already connected to Wi-Fi.
              </Text>

              <Pressable
                style={[
                  styles.primaryBtn,
                  { marginTop: 14 },
                ]}
                onPress={handleUseExistingTray}
              >
                <Text style={styles.primaryBtnText}>
                  Use This Tray
                </Text>
              </Pressable>
            </>
          ) : null}

          {traySetupState === "ready" ? (
            <Text style={styles.helpBody}>
              This tray is ready for setup.
            </Text>
          ) : null}

          {traySetupState === "unreachable" ? (
            <Text style={styles.helpBody}>
              Hidden Rolls could not reach this tray over Wi-Fi or Bluetooth.
            </Text>
          ) : null}

          {/* Step 1: Discover tray over Bluetooth */}
          {traySetupState === "unreachable" &&
            !trayFoundOverBle ? (
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
          {wifiNetworks.map((network) => {
            const selected =
              selectedNetwork?.ssid === network.ssid;

            return (
              <Pressable
                key={network.ssid}
                style={[
                  styles.wifiNetworkRow,
                  selected && styles.wifiNetworkRowSelected,
                ]}
                onPress={() => handleSelectNetwork(network)}
                disabled={provisioningWifi || wifiProvisioned}
              >
                <View style={styles.wifiNetworkInfo}>
                  <Text style={styles.wifiNetworkName}>
                    {network.ssid}
                  </Text>

                  <Text style={styles.wifiNetworkSignal}>
                    Signal: {network.rssi} dBm
                  </Text>
                </View>

                {selected ? (
                  <Text style={styles.wifiNetworkCheck}>
                    ✓
                  </Text>
                ) : null}
              </Pressable>
            );
          })}

          {/* Display Wi-Fi provisioning form if a network is selected and not yet provisioned */}
          {selectedNetwork && !wifiProvisioned ? (
            <View style={styles.wifiCredentials}>
              <Text style={styles.helpTitle}>
                Connect to {selectedNetwork.ssid}
              </Text>

              <TextInput
                style={styles.wifiPasswordInput}
                value={wifiPassword}
                onChangeText={setWifiPassword}
                placeholder="Wi-Fi password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!provisioningWifi}
              />

              <Pressable
                style={[
                  styles.primaryBtn,
                  { marginTop: 14 },
                  provisioningWifi && { opacity: 0.6 },
                ]}
                onPress={handleProvisionWifi}
                disabled={provisioningWifi}
              >
                <Text style={styles.primaryBtnText}>
                  {provisioningWifi
                    ? "Connecting Tray..."
                    : "Connect to Wi-Fi"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Display success message if Wi-Fi provisioning succeeded */}
          {wifiProvisioned ? (
            <Text style={styles.helpBody}>
              Tray connected to Wi-Fi successfully.
            </Text>
          ) : null}

          {/* Finalization state: Show message while waiting for tray to be reachable over Wi-Fi */}
          {finalizingSetup ? (
            <Text style={styles.helpBody}>
              Wi-Fi connected. Starting your tray...
            </Text>
          ) : null}

          {/* Display finalization error if the tray is not reachable after provisioning */}
          {finalizationError ? (
            <Text style={styles.helpBody}>
              {finalizationError}
            </Text>
          ) : null}

          {/* Display provisioning error message if it failed */}
          {provisionError ? (
            <Text style={styles.helpBody}>
              {provisionError}
            </Text>
          ) : null}

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
      </ScrollView>
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