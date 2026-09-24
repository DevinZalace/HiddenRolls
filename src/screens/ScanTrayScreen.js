import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  Text,
  View,
  ScrollView,
  TextInput,
  Alert,
  useWindowDimensions,
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

export function ScanTrayScreen({ navigation, t, pendingTray, setPendingTray, setPairedTray }) {
  // Identifies the current setup attempt.
  const { width } = useWindowDimensions();

  const scanContentWidth = Math.min(
    width - 48,
    720
  );
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
            "setupCleanupFailed"
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
      "trayDiscoveryFailed"
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
          "setupCleanupFailed"
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
        "invalidTrayQr"
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
    t.resetWifiTitle,
    t.resetWifiBody(pendingTray.trayId),
    [
      {
        text: t.cancel,
        style: "cancel",
      },
      {
        text:  t.resetWifiConfirm,
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
                "resetTrayNotFound",
                error
              );

              setTraySetupState("unreachable");
              setResetWifiError(
                "resetTrayNotFound"
              );
            }
          } catch (error) {
            if (!isCurrentAttempt()) {
              return;
            }

            console.error("Wi-Fi reset failed:", error);

            setResetWifiError(
              "resetWifiFailed"
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
        "trayConnectionFailed"
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
            "wifiScanTimedOut"
          );

          return;
        }

        setWifiScanError(
          "wifiScanFailed"
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
            "wifiProvisionTimedOut"
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
          "wifiFinalizationFailed"
        );
      } else {
        setProvisionError(
          "wifiProvisionFailed"
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
        <View
          style={[
            styles.scanStateContent,
            { width: scanContentWidth },
          ]}
        >
          <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>
            {cleanupError
              ? t.setupCleanupErrorTitle
              : t.setupStoppingTitle}
          </Text>

          {cleanupError ? (
            <>
              <Text style={styles.helpBody}>
                {t[cleanupError]}
              </Text>

              <Pressable
                style={[
                  styles.primaryBtn,
                  { marginTop: 14 },
                ]}
                onPress={resetProvisioningState}
              >
                <Text style={styles.primaryBtnText}>
                  {t.retry}
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>
    </View>
    );
  }

  // Loading state: Camera permission is being checked
  if (!permission) {
    return (
      <View style={styles.setupRoot}>
        <View
          style={[
            styles.scanStateContent,
            { width: scanContentWidth },
          ]}
        >
          <Text style={styles.helpBody}>
            {t.cameraCheckingPermission}
          </Text>
        </View>
      </View>
    );
  }

  // Permission denied: Show request screen
  if (!permission.granted) {
    return (
      <View style={styles.setupRoot}>
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>
            {t.cameraPermissionTitle}
          </Text>

          <Text style={styles.helpBody}>
            {t.cameraPermissionBody}
          </Text>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 14 }]}
            onPress={requestPermission}
          >
            <Text style={styles.primaryBtnText}>
              {t.allowCamera}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // QR scanned: Show provisioning flow (discovery -> connection -> Wi-Fi scan)
  if (pendingTray) {
  return (
    <View style={styles.scanRoot}>
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={styles.setupScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        <View
          style={[
            styles.scanProvisioningContent,
            { width: scanContentWidth },
          ]}
        >
          <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>
            {t.trayFoundTitle}
          </Text>

          <Text style={styles.helpBody}>
            Hidden Rolls {pendingTray.trayId}
          </Text>

          <Text style={styles.helpBody}>
            {pendingTray.hostname}
          </Text>
          {traySetupState === "checking" ? (
            <Text style={styles.helpBody}>
              {t.checkingTray}
            </Text>
          ) : null}

          {traySetupState === "existing" ? (
            <>
              <Text style={styles.helpBody}>
                {t.trayAlreadyConfigured}
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
                  {t.useThisTray}
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
                    ? t.resettingTray
                    : t.resetWifiAndSetup}
                </Text>
              </Pressable>
              {resetWifiError ? (
                <Text style={styles.helpBody}>
                  {t[resetWifiError]}
                </Text>
              ) : null}
            </>
          ) : null}

          {traySetupState === "ready" ? (
            <Text style={styles.helpBody}>
              {t.trayReady}
            </Text>
          ) : null}

          {traySetupState === "unreachable" ? (
            <Text style={styles.helpBody}>
              {t.trayUnreachable}
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
                {findingTray ? t.findingTray : t.findTray}
              </Text>
            </Pressable>
          ) : null}

          {trayFoundOverBle ? (
            <Text style={styles.helpBody}>
              {t.trayFoundBle}
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
                {connectingTray ? t.connectingTray : t.connectToTray}
              </Text>
            </Pressable>
          ) : null}

          {trayConnected ? (
            <Text style={styles.helpBody}>
              {t.trayConnectedBle}
            </Text>
          ) : null}

          {connectionError ? (
            <Text style={styles.helpBody}>
              {t[connectionError]}
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
                {scanningWifi ? t.scanningWifi : t.scanWifi}
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
                    {t.signalStrength(network.rssi)}
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
                {t.connectToNetwork(selectedNetwork.ssid)}
              </Text>

              <TextInput
                style={styles.wifiPasswordInput}
                value={wifiPassword}
                onChangeText={setWifiPassword}
                placeholder={t.wifiPassword}
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
                    ? t.connectingTray
                    : t.connectToWifi}
                </Text>
              </Pressable>
            </View>
          ) : null}

          {/* Display success message if Wi-Fi provisioning succeeded */}
          {wifiProvisioned ? (
            <Text style={styles.helpBody}>
              {t.wifiConnected}
            </Text>
          ) : null}

          {/* Finalization state: Show message while waiting for tray to be reachable over Wi-Fi */}
          {finalizingSetup ? (
            <Text style={styles.helpBody}>
              {t.startingTray}
            </Text>
          ) : null}

          {/* Display finalization error if the tray is not reachable after provisioning */}
          {finalizationError ? (
            <Text style={styles.helpBody}>
              {t[finalizationError]}
            </Text>
          ) : null}

          {/* Display provisioning error message if it failed */}
          {provisionError ? (
            <Text style={styles.helpBody}>
              {t[provisionError]}
            </Text>
          ) : null}

          {/* Error messages */}
          {wifiScanError ? (
            <Text style={styles.helpBody}>
              {t[wifiScanError]}
            </Text>
          ) : null}

          {discoveryError ? (
            <Text style={styles.helpBody}>
              {t[discoveryError]}
            </Text>
          ) : null}

          {/* Navigation buttons */}
          <Pressable
            style={[styles.primaryBtn, { marginTop: 10 }]}
            disabled={savingPairing}
            onPress={resetProvisioningState}
          >
            <Text style={styles.primaryBtnText}>
              {savingPairing ? t.savingTray : t.scanAgain}
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
              {t.back}
            </Text>
          </Pressable>
        </View>
        </View>
      </ScrollView>
    </View>
    );
  }

  // Initial state: Show camera for QR code scanning
  return (
    <View style={styles.scanRoot}>
      <View
        style={[
          styles.scanContent,
          { width: scanContentWidth },
        ]}
      >
        <Text style={styles.setupTitle}>
          {t.scanTitle}
        </Text>

        <Text style={styles.helpBody}>
          {t.scanInstructions}
        </Text>

      {/* Camera view for QR code scanning - disabled after first scan */}
      <CameraView
        style={styles.scanCamera}
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
            {t[scanError]}
          </Text>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 14 }]}
            disabled={savingPairing}
            onPress={resetProvisioningState}
          >
            <Text style={styles.primaryBtnText}>
              {savingPairing ? t.savingTray : t.scanAgain}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Back button to return to setup */}
      <Pressable
        style={[styles.primaryBtn, styles.backBtn]}
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
          {t.back}
        </Text>
      </Pressable>
    </View>
  </View>
  );
}