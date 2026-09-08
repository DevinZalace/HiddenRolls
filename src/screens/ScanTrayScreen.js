import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  Text,
  View,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";

import {
  verifyHiddenRollsTray,
  waitForTrayReady,
} from "../../services/cameraService";
import { parseTrayQr, findTray, connectTray, cancelTraySetup, scanWifiNetworks, provisionWifi, resetTrayWifi, } from "../../services/provisioningService";
import { styles } from "../theme/styles";
import {
  savePairedTray,
} from "../../services/pairedTrayService";
import { usePreventRemove } from "@react-navigation/native";

/**
 * ScanTrayScreen
 *
 * Tray setup screen that handles:
 * 1. QR parsing and tray identity verification
 * 2. Existing-tray detection over Wi-Fi
 * 3. BLE discovery and connection for unconfigured trays
 * 4. Wi-Fi selection and provisioning
 * 5. Wi-Fi reset and return to setup for existing trays
 *
 * Flow: Camera permission -> Scan QR -> verify Wi-Fi -> BLE setup -> Wi-Fi provisioning
 */
export function ScanTrayScreen({ navigation, pendingTray, setPendingTray, setPairedTray }) {
  // Identifies the current setup attempt.
  const setupAttemptRef = useRef(0);
  const savingPairingRef = useRef(false);
  const qrScanRef = useRef(false);
  const resettingTrayWifiRef = useRef(false);
  const readinessAbortRef = useRef(null);
  const [savingPairing, setSavingPairing] = useState(false);
  const verificationAbortRef = useRef(null);
  const cleanupPromiseRef = useRef(null);
  const stoppingSetupRef = useRef(false);
  const mountedRef = useRef(true);
  const navigationCleanupDoneRef = useRef(false);

  const [stoppingSetup, setStoppingSetup] = useState(false);
  const [cleanupError, setCleanupError] = useState(null);

  // Prevent leaving the screen while saving the pairing.
  usePreventRemove(true, ({ data }) => {
    if (
      savingPairingRef.current ||
      stoppingSetupRef.current
    ) {
      return;
    }

    void stopSetup().then((stopped) => {
      if (!stopped || !mountedRef.current) {
        return;
      }

      navigationCleanupDoneRef.current = true;

      // Keep old screen controls blocked during the transition.
      stoppingSetupRef.current = true;

      setPendingTray(null);
      navigation.dispatch(data.action);
    });
  });

  // Invalidate unfinished work when this screen is removed.
  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      invalidateSetupAttempt();

      if (!navigationCleanupDoneRef.current) {
        void stopSetup();
      }
    };
  }, []);
  // Camera permission state
  const [permission, requestPermission] =
    useCameraPermissions();

  // QR code scanning state
  const [scanned, setScanned] = useState(false);
  const [scanError, setScanError] = useState(null);

  // Tray setup state: idle, checking, existing, ready, or unreachable.
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

  // Finalization state while waiting for the tray to rejoin Wi-Fi.
  const [finalizingSetup, setFinalizingSetup] = useState(false);
  const [finalizationError, setFinalizationError] = useState(null);

  // State for the destructive reset-and-reprovision action.
  const [resettingTrayWifi, setResettingTrayWifi] =
    useState(false);

  const [resetWifiError, setResetWifiError] =
    useState(null);

    // Invalidate callbacks before aborting their network work.
  function invalidateSetupAttempt() {
    setupAttemptRef.current += 1;
    readinessAbortRef.current?.abort();
    readinessAbortRef.current = null;
    verificationAbortRef.current?.abort();
    verificationAbortRef.current = null;
  }

  // Stops the current tray setup process, including BLE disconnection and cleanup.
  // Returns a promise that resolves to true if cleanup succeeded, false otherwise.
  function stopSetup() {
  if (cleanupPromiseRef.current) {
    return cleanupPromiseRef.current;
  }

  invalidateSetupAttempt();
  stoppingSetupRef.current = true;

  if (mountedRef.current) {
    setStoppingSetup(true);
    setCleanupError(null);
  }

  const cleanup = cancelTraySetup()
    .then(
      () => {
        stoppingSetupRef.current = false;
        return true;
      },
      (error) => {
        console.error("Setup cleanup failed:", error);

        if (mountedRef.current) {
          setCleanupError(
            "Hidden Rolls could not stop the previous setup. Try again."
          );
        }

        return false;
      }
    )
    .finally(() => {
      if (cleanupPromiseRef.current === cleanup) {
        cleanupPromiseRef.current = null;
      }

      if (mountedRef.current) {
        setStoppingSetup(false);
      }
    });

  cleanupPromiseRef.current = cleanup;
  return cleanup;
}
  /**
   * Initiates Bluetooth discovery of the tray.
   * Calls the native provisioning service to scan for the device.
   */
  async function handleFindTray() {
  if (stoppingSetupRef.current) {
    return;
  }
  if (findingTray) {
    return;
  }

  const attemptId = setupAttemptRef.current;
  const isCurrentAttempt = () =>
    setupAttemptRef.current === attemptId;

  setFindingTray(true);
  setDiscoveryError(null);

  try {
    await findTray();
    if (!isCurrentAttempt()) {
      return;
    }

    setTrayFoundOverBle(true);
    setTraySetupState("ready");
  } catch (error) {
    if (!isCurrentAttempt()) {
      return;
    }
    console.error(
      "BLE tray discovery failed:",
      error
    );

    setTraySetupState("unreachable");

    setDiscoveryError(
      "Hidden Rolls could not find this tray nearby. Make sure the tray is powered on and ready for setup."
    );
  } finally {
    if (isCurrentAttempt()) {
      setFindingTray(false);
    }
  }
}

  /**
   * Processes a scanned QR code.
   * Parses the QR data and stores the tray information.
   * Prevents multiple scans in quick succession.
   */
  async function handleBarcodeScanned({ data }) {
    if (stoppingSetupRef.current) {
      return;
    }
    if (
      scanned ||
      qrScanRef.current ||
      savingPairingRef.current
    ) {
      return;
    }

    // Lock immediately, before another camera callback can enter.
    qrScanRef.current = true;

    const attemptId = setupAttemptRef.current;
    const isCurrentAttempt = () =>
      setupAttemptRef.current === attemptId;

    setScanned(true);
    setScanError(null);
    setDiscoveryError(null);
    setTraySetupState("checking");

    try {
      // Finish any cleanup left by an earlier screen instance.
      try {
        await cancelTraySetup();
      } catch (error) {
        if (!isCurrentAttempt()) {
          return;
        }

        stoppingSetupRef.current = true;
        setCleanupError(
          "Hidden Rolls could not stop the previous setup. Try again."
        );
        return;
      }

      if (!isCurrentAttempt()) {
        return;
      }
      const tray = parseTrayQr(data);
      setPendingTray(tray);

      const verificationController = new AbortController();
        verificationAbortRef.current = verificationController;

        let alreadyConfigured;

        try {
          alreadyConfigured = await verifyHiddenRollsTray(
            tray,
            3000,
            verificationController.signal
          );
        } finally {
          if (
            verificationAbortRef.current === verificationController
          ) {
            verificationAbortRef.current = null;
          }
        }

      if (!isCurrentAttempt()) {
        return;
      }

      if (alreadyConfigured) {
        setTraySetupState("existing");
        return;
      }

      try {
        await findTray();

        if (!isCurrentAttempt()) {
          return;
        }

        setTrayFoundOverBle(true);
        setTraySetupState("ready");
      } catch (error) {
        if (!isCurrentAttempt()) {
          return;
        }

        console.error(
          "Tray was not found over Wi-Fi or Bluetooth:",
          error
        );

        setTraySetupState("unreachable");
      }
    } catch (error) {
      if (!isCurrentAttempt()) {
        return;
      }

      console.error("Tray QR parsing failed:", error);

      setPendingTray(null);
      setTraySetupState("idle");

      // Keep scanning paused until the user presses Scan Again.
      setScanError(
        "This QR code is not a valid Hidden Rolls tray."
      );
    }
  }

// Saves the pairing for the current setup attempt if it is still valid.
async function savePairingForAttempt(tray, attemptId) {
  if (
    setupAttemptRef.current !== attemptId ||
    savingPairingRef.current
  ) {
    return false;
  }

  savingPairingRef.current = true;
  setSavingPairing(true);

  try {
    await savePairedTray(tray);

    return setupAttemptRef.current === attemptId;
  } finally {
    savingPairingRef.current = false;

    if (setupAttemptRef.current === attemptId) {
      setSavingPairing(false);
    }
  }
}

  /**
   * Uses the existing tray configuration.
   * Saves it as a paired tray and navigates to the live view.
   */
async function handleUseExistingTray() {
  if (stoppingSetupRef.current) {
    return;
  }
  if (
    !pendingTray ||
    resettingTrayWifiRef.current ||
    savingPairingRef.current
  ) {
    return;
  }
  const attemptId = setupAttemptRef.current;
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
    const saved = await savePairingForAttempt(
      pairedTray,
      attemptId
    );

    if (
      !saved ||
      setupAttemptRef.current !== attemptId
    ) {
      return;
    }
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

  // Ask for confirmation, clear saved Wi-Fi, and return the tray to BLE setup.
function handleResetTrayWifi() {
  if (stoppingSetupRef.current) {
    return;
  }
  if (
    !pendingTray ||
    resettingTrayWifiRef.current ||
    savingPairingRef.current
  ) {
    return;
  }

  // Capture the attempt when the dialog opens.
  const attemptId = setupAttemptRef.current;
  const isCurrentAttempt = () =>
    setupAttemptRef.current === attemptId;

  Alert.alert(
    "Reset Wi-Fi?",
    `This will remove the Wi-Fi network saved on Hidden Rolls ${pendingTray.trayId} and restart the tray. You will need to set up Wi-Fi again.`,
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Reset & Continue",
        style: "destructive",
        onPress: async () => {
          if (
            !isCurrentAttempt() ||
            resettingTrayWifiRef.current ||
            savingPairingRef.current
          ) {
            return;
          }

          resettingTrayWifiRef.current = true;
          setResettingTrayWifi(true);
          setResetWifiError(null);

          try {
            await resetTrayWifi();

            if (!isCurrentAttempt()) {
              return;
            }

            setTraySetupState("checking");

            await new Promise((resolve) =>
              setTimeout(resolve, 3000)
            );

            if (!isCurrentAttempt()) {
              return;
            }

            try {
              await findTray();

              if (!isCurrentAttempt()) {
                return;
              }

              setTrayFoundOverBle(true);
              setTraySetupState("ready");
            } catch (error) {
              if (!isCurrentAttempt()) {
                return;
              }

              console.error(
                "Tray restarted but was not found over Bluetooth:",
                error
              );

              setTraySetupState("unreachable");
              setResetWifiError(
                "The tray restarted, but Hidden Rolls could not find it over Bluetooth yet. Try Find Tray again."
              );
            }
          } catch (error) {
            if (!isCurrentAttempt()) {
              return;
            }

            console.error("Wi-Fi reset failed:", error);

            setResetWifiError(
              "Hidden Rolls could not reset this tray's Wi-Fi."
            );
          } finally {
            if (isCurrentAttempt()) {
              resettingTrayWifiRef.current = false;
              setResettingTrayWifi(false);
            }
          }
        },
      },
    ]
  );
}

  /**
   * Attempts to establish a Bluetooth connection to the discovered tray.
   * Requires the tray to be found via findTray() first.
   */
  async function handleConnectTray() {
    if (stoppingSetupRef.current) {
      return;
    }
    if (connectingTray) {
      return;
    }

    const attemptId = setupAttemptRef.current;
    const isCurrentAttempt = () =>
      setupAttemptRef.current === attemptId;

    setConnectingTray(true);
    setConnectionError(null);

    try {
      await connectTray();

      if (!isCurrentAttempt()) {
        return;
      }

      setTrayConnected(true);
    } catch (error) {
      if (!isCurrentAttempt()) {
        return;
      }

      console.error("BLE tray connection failed:", error);

      setConnectionError(
        "Hidden Rolls found the tray, but could not connect to it."
      );
    } finally {
      if (isCurrentAttempt()) {
        setConnectingTray(false);
      }
    }
  }
  /**
   * Scans for available Wi-Fi networks visible to the tray.
   * Requires the tray to be connected via connectTray() first.
   */
  async function handleScanWifi() {
    if (stoppingSetupRef.current) {
      return;
    }
    if (
      scanningWifi ||
      provisioningWifi ||
      finalizingSetup ||
      wifiProvisioned ||
      savingPairingRef.current
    ) {
      return;
    }

    const attemptId = setupAttemptRef.current;
    const isCurrentAttempt = () =>
      setupAttemptRef.current === attemptId;

    setScanningWifi(true);
    setWifiScanError(null);
    setWifiNetworks([]);
    setSelectedNetwork(null);
    setWifiPassword("");

    try {
      const networks = await scanWifiNetworks();

      if (!isCurrentAttempt()) {
        return;
      }

      setWifiNetworks(networks);
    } catch (error) {
        if (!isCurrentAttempt()) {
          return;
        }

        console.error("Tray Wi-Fi scan failed:", error);

        if (error?.code === "ERR_WIFI_SCAN_TIMEOUT") {
          setTrayConnected(false);

          setWifiScanError(
            "The Wi-Fi scan timed out. Reconnect to the tray and try again."
          );

          return;
        }

        setWifiScanError(
          "Hidden Rolls could not find nearby Wi-Fi networks."
        );
      } finally {
      if (isCurrentAttempt()) {
        setScanningWifi(false);
      }
    }
  }
  // Handles selection of a Wi-Fi network from the scanned list.
  function handleSelectNetwork(network) {
    if (stoppingSetupRef.current) {
      return;
    }
  setSelectedNetwork(network);
  setWifiPassword("");
  setProvisionError(null);
}

  // Attempts to provision the tray with the selected Wi-Fi network and password.
  async function handleProvisionWifi() {
    if (stoppingSetupRef.current) {
      return;
    }
    if (!selectedNetwork || provisioningWifi) {
      return;
    }

    const attemptId = setupAttemptRef.current;

    const isCurrentAttempt = () =>
      setupAttemptRef.current === attemptId;
    let provisioningSucceeded = false;

    setProvisioningWifi(true);
    setProvisionError(null);
    setFinalizationError(null);

    try {
      await provisionWifi(
        selectedNetwork.ssid,
        wifiPassword
      );

      if (!isCurrentAttempt()) {
        return;
      }

      provisioningSucceeded = true;
      setWifiProvisioned(true);
      setFinalizingSetup(true);

      const readinessController = new AbortController();
        readinessAbortRef.current = readinessController;

        await waitForTrayReady(
          pendingTray.hostname,
          {
            signal: readinessController.signal,
          }
        );

      if (!isCurrentAttempt()) {
        return;
      }
      const pairedTray = {
        schemaVersion: 1,
        trayId: pendingTray.trayId,
        displayName: `Hidden Rolls ${pendingTray.trayId}`,
        hostname: pendingTray.hostname,
        provisioningName: pendingTray.provisioningName,
        pairedAt: new Date().toISOString(),
      };

      const saved = await savePairingForAttempt(
        pairedTray,
        attemptId
      );

      if (
        !saved ||
        setupAttemptRef.current !== attemptId
      ) {
        return;
      }
      setPairedTray(pairedTray);
      setPendingTray(null);

      navigation.reset({
        index: 0,
        routes: [{ name: "Live" }],
      });
    } catch (error) {
      if (!isCurrentAttempt()) {
        return;
      }
      console.error("Tray setup failed:", error);

      if (error?.code === "ERR_PROVISION_TIMEOUT") {
        setTrayConnected(false);
        setFinalizingSetup(true);

        const readinessController = new AbortController();
        readinessAbortRef.current = readinessController;

        try {
          await waitForTrayReady(
            pendingTray.hostname,
            {
              timeoutMs: 15000,
              intervalMs: 1500,
              signal: readinessController.signal,
            }
          );

          if (!isCurrentAttempt()) {
            return;
          }

          setWifiProvisioned(true);

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

          const saved = await savePairingForAttempt(
            pairedTray,
            attemptId
          );

          if (
            !saved ||
            setupAttemptRef.current !== attemptId
          ) {
            return;
          }

          setPairedTray(pairedTray);
          setPendingTray(null);

          navigation.reset({
            index: 0,
            routes: [{ name: "Live" }],
          });

          return;
        } catch {
          if (!isCurrentAttempt()) {
            return;
          }

          setProvisionError(
            "The tray did not confirm Wi-Fi setup and could not be reached on the network. Reconnect to the tray and try again."
          );

          return;
        } finally {
          if (
            readinessAbortRef.current ===
            readinessController
          ) {
            readinessAbortRef.current = null;
          }

          if (isCurrentAttempt()) {
            setFinalizingSetup(false);
          }
        }
            } // End ERR_PROVISION_TIMEOUT handling.

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
      if (isCurrentAttempt()) {
        readinessAbortRef.current = null;
        setProvisioningWifi(false);
        setFinalizingSetup(false);
      }
    }
  }
  async function resetProvisioningState() {
  if (savingPairingRef.current) {
    return false;
  }

  const stopped = await stopSetup();

  if (
    !stopped ||
    !mountedRef.current ||
    navigationCleanupDoneRef.current
  ) {
    return false;
  }
    qrScanRef.current = false;
    resettingTrayWifiRef.current = false;

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
    setWifiScanError(null);
    setWifiNetworks([]);
    setSelectedNetwork(null);

    setWifiPassword("");
    setProvisioningWifi(false);
    setProvisionError(null);
    setWifiProvisioned(false);

    setFinalizingSetup(false);
    setFinalizationError(null);

    setTraySetupState("idle");

    setResettingTrayWifi(false);
    setResetWifiError(null);
    return true;
  }

  // Stopping setup or cleanup error: Show appropriate message
  if (stoppingSetup || cleanupError) {
    return (
      <View style={styles.setupRoot}>
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>
            {cleanupError
              ? "Setup could not stop"
              : "Stopping previous setup..."}
          </Text>

          {cleanupError ? (
            <>
              <Text style={styles.helpBody}>
                {cleanupError}
              </Text>

              <Pressable
                style={[
                  styles.primaryBtn,
                  { marginTop: 14 },
                ]}
                onPress={resetProvisioningState}
              >
                <Text style={styles.primaryBtnText}>
                  Try Again
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    );
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
                disabled={resettingTrayWifi || savingPairing}
              >
                <Text style={styles.primaryBtnText}>
                  Use This Tray
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.primaryBtn,
                  { marginTop: 10 },
                  resettingTrayWifi && { opacity: 0.6 },
                ]}
                onPress={handleResetTrayWifi}
                disabled={resettingTrayWifi || savingPairing}
              >
                <Text style={styles.primaryBtnText}>
                  {resettingTrayWifi
                    ? "Resetting Tray..."
                    : "Reset Wi-Fi & Set Up Again"}
                </Text>
              </Pressable>
              {resetWifiError ? (
                <Text style={styles.helpBody}>
                  {resetWifiError}
                </Text>
              ) : null}
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
              disabled={
                scanningWifi ||
                provisioningWifi ||
                finalizingSetup ||
                wifiProvisioned ||
                savingPairing
              }
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
            disabled={savingPairing}
            onPress={resetProvisioningState}
          >
            <Text style={styles.primaryBtnText}>
              {savingPairing ? "Saving Tray..." : "Scan Again"}
            </Text>
          </Pressable>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 10 }]}
            disabled={savingPairing}
            onPress={() => {
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
            disabled={savingPairing}
            onPress={resetProvisioningState}
          >
            <Text style={styles.primaryBtnText}>
              {savingPairing ? "Saving Tray..." : "Scan Again"}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Back button to return to setup */}
      <Pressable
        style={styles.primaryBtn}
        disabled={savingPairing}
        onPress={() => {
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