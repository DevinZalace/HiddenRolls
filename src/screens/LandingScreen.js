/**
 * LandingScreen.js
 *
 * Entry screen shown after startup.
 * Handles terms acceptance, direct access to the paired tray, and discovery
 * of already-configured trays on the local network.
 */

import { useState, useRef, useEffect } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";

import { styles } from "../theme/styles";

import {
  checkCameraConnection,
} from "../../services/cameraService";

import {
  forgetPairedTray,
} from "../../services/pairedTrayService";

import {
  findExistingTrays, cancelTraySetup,
} from "../../services/provisioningService";

import {
  verifyHiddenRollsTray,
} from "../../services/cameraService";

import {
  savePairedTray,
} from "../../services/pairedTrayService";
import AsyncStorage from "@react-native-async-storage/async-storage";
/**
 * LandingScreen Component
 *
 * Props:
 * - navigation: React Navigation object for screen navigation
 * - t: Localized text strings object
 * - language: Current language ("en" or "es")
 * - setLanguage: Function to change language (not used on this screen)
 * - showTerms: Boolean to show/hide terms modal
 * - setShowTerms: Function to toggle terms modal
 * - termsError: Error message if user declines terms
 * - setTermsError: Function to set error message
 * - termsAccepted: Boolean indicating if user has accepted terms
 * - setTermsAccepted: Function to mark terms as accepted
 */
export function LandingScreen({
  navigation,
  t,
  language,
  setLanguage,
  languageChosen,
  setLanguageChosen,
  showTerms,
  setShowTerms,
  termsError,
  setTermsError,
  termsAccepted,
  setTermsAccepted,
  pairedTray,
  setPairedTray,
}) {


  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;

  const horizontalPadding = isTablet ? 32 : 24;

  const landingContentWidth = Math.min(
    width - horizontalPadding * 2,
    720
  );

  const landingBackground = isLandscape
    ? require("../../assets/AdobeStock_2180823407.png")
    : require("../../assets/AdobeStock_218082340712.png");

  const existingTrayAttemptRef = useRef(0);
  const existingTrayAbortRef = useRef(null);
  const [openingTray, setOpeningTray] = useState(false);
  const [findingExistingTray, setFindingExistingTray] =
   useState(false);

  const [findTrayError, setFindTrayError] =
    useState("");

    // Cleanup existing tray search on unmount or navigation blur.
  useEffect(() => {
  function cancelExistingSearch() {
    existingTrayAttemptRef.current += 1;

    const controller = existingTrayAbortRef.current;
    existingTrayAbortRef.current = null;

    controller?.abort();

    // Cancel native work only when Landing owned a search.
    if (controller) {
      void cancelTraySetup().catch((error) => {
        console.error(
          "Existing tray search cleanup failed:",
          error
        );
      });
    }
  }

  const unsubscribe = navigation.addListener(
    "blur",
    () => {
      cancelExistingSearch();

      // Landing can remain mounted while another screen opens.
      setFindingExistingTray(false);
    }
  );

  return () => {
    unsubscribe();
    cancelExistingSearch();
  };
}, [navigation]);

  async function handleOpenTray() {
    if (!pairedTray || openingTray) {
      return;
    }

    setOpeningTray(true);

    try {
      const result = await checkCameraConnection({
        host: pairedTray.hostname,
        timeoutMs: 3000,
      });

      if (!result.connected) {
        Alert.alert(
          t.connectionFailedTitle,
          t.pairedTrayUnavailable,
          [{ text: t.ok }]
        );

        return;
      }

      navigation.navigate("Live");
    } catch (error) {
      console.error(
        "Failed to open paired tray:",
        error
      );

      Alert.alert(
        t.connectionFailedTitle,
        t.pairedTrayConnectionFailed,
        [{ text: t.ok }]
      );
    } finally {
      setOpeningTray(false);
    }
  }

  function handleForgetTray() {
    if (!pairedTray) {
      return;
    }

    Alert.alert(
      t.forgetTrayTitle,
      t.forgetTrayBody,
      [
        {
          text: t.cancel,
          style: "cancel",
        },
        {
          text: t.forgetTrayConfirm,
          style: "destructive",
          onPress: async () => {
            try {
              await forgetPairedTray();
              setPairedTray(null);
            } catch (error) {
              console.error(
                "Failed to forget paired tray:",
                error
              );

              Alert.alert(
                t.forgetTrayFailedTitle,
                t.pleaseTryAgain,
                [{ text: t.ok }]
              );
            }
          },
        },
      ]
    );
  }

  // Discover and verify trays that are already configured on the local network.
 async function handleFindExistingTray() {
  if (findingExistingTray) {
    return;
  }

  const attemptId =
    ++existingTrayAttemptRef.current;

  const isCurrentAttempt = () =>
    existingTrayAttemptRef.current === attemptId;

  const abortController =
    new AbortController();

  existingTrayAbortRef.current =
    abortController;

  setFindingExistingTray(true);
  setFindTrayError("");

  try {
    const discoveredTrays =
      await findExistingTrays();

    if (!isCurrentAttempt()) {
      return;
    }

    if (discoveredTrays.length === 0) {
      setFindTrayError(
        "existingTraysNotFound"
      );

      return;
    }

    const verifiedTrays = [];

    for (const tray of discoveredTrays) {
      if (!isCurrentAttempt()) {
        return;
      }

      const verified =
        await verifyHiddenRollsTray(
          tray,
          3000,
          abortController.signal
        );

      if (!isCurrentAttempt()) {
        return;
      }

      if (verified) {
        verifiedTrays.push(tray);
      }
    }

    if (verifiedTrays.length === 0) {
      setFindTrayError(
        "existingTrayUnverified"
      );

      return;
    }

    if (verifiedTrays.length > 1) {
      setFindTrayError(
        "multipleExistingTrays"
      );

      return;
    }

    const discoveredTray =
      verifiedTrays[0];

    const restoredTray = {
      schemaVersion: 1,
      trayId: discoveredTray.trayId,
      displayName:
        discoveredTray.displayName ||
        `Hidden Rolls ${discoveredTray.trayId}`,
      hostname: discoveredTray.hostname,
      provisioningName:
        discoveredTray.provisioningName,
      pairedAt: new Date().toISOString(),
    };

    await savePairedTray(restoredTray);

    if (!isCurrentAttempt()) {
      return;
    }

    setPairedTray(restoredTray);

    navigation.reset({
      index: 0,
      routes: [{ name: "Live" }],
    });
  } catch (error) {
    if (
      !isCurrentAttempt() ||
      error?.name === "AbortError" ||
      error?.code === "ERR_SETUP_CANCELLED"
    ) {
      return;
    }

    console.error(
      "Existing tray discovery failed:",
      error
    );

    setFindTrayError(
      "existingTraySearchFailed"
    );
  } finally {
    if (
      existingTrayAbortRef.current ===
      abortController
    ) {
      existingTrayAbortRef.current = null;
    }

    if (isCurrentAttempt()) {
      setFindingExistingTray(false);
    }
  }
}

  return (
    <ImageBackground
          source={landingBackground}
          style={styles.background}
          resizeMode="cover"
        >
          <View
            pointerEvents="none"
            style={styles.BackgroundOverlay}
          />
      <View style={styles.overlay}>
        <View
          style={[
            styles.landingContent,
            { width: landingContentWidth },
          ]}
        >
        {/* Title */}
        <Text style={styles.landingTitle}>{t.landingTitle}</Text>

        {/* First-launch language selection */}
        <Modal
          visible={!languageChosen}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                Choose Language / Elige idioma
              </Text>

              <View style={styles.modalBtnRow}>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={async () => {
                    setLanguage("en");
                    setLanguageChosen(true);
                    setShowTerms(true);

                    try {
                      await AsyncStorage.setItem(
                        "hiddenRolls.language",
                        "en"
                      );
                    } catch (error) {
                      console.error(
                        "Failed to save language preference:",
                        error
                      );
                    }
                  }}
                >
                  <Text style={styles.modalBtnText}>
                    English
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={async () => {
                    setLanguage("es");
                    setLanguageChosen(true);
                    setShowTerms(true);

                    try {
                      await AsyncStorage.setItem(
                        "hiddenRolls.language",
                        "es"
                      );
                    } catch (error) {
                      console.error(
                        "Failed to save language preference:",
                        error
                      );
                    }
                  }}
                >
                  <Text style={styles.modalBtnText}>
                    Español
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Terms & Conditions Modal */}
        <Modal
          visible={showTerms}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTerms(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t.termsAndConditions}</Text>

              {/* Scrollable terms content */}
              <ScrollView style={styles.modalScroll}>
                <Text style={styles.modalText}>
                  {t.termsBody}
                </Text>
              </ScrollView>

              {/* Error message if user declined */}
              {!!termsError && (
                <Text style={styles.modalError}>{t[termsError]}</Text>
              )}

              {/* Modal action buttons */}
              <View style={styles.modalBtnRow}>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnGhost]}
                  onPress={() => {
                    setTermsError(
                      "termsRequired"
                    );
                    setShowTerms(false);
                  }}
                >
                  <Text style={styles.modalBtnText}>{t.dontagree}</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={async () => {
                    try {
                      await AsyncStorage.setItem(
                        "hiddenRolls.termsVersion",
                        "1"
                      );

                      setTermsAccepted(true);
                      setTermsError("");
                      setShowTerms(false);
                    } catch (error) {
                      console.error(
                        "Failed to save Terms acceptance:",
                        error
                      );
                    }
                  }}
                >
                  <Text style={styles.modalBtnText}>{t.agree}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Continue Button - shows terms modal if not accepted, else navigates to setup */}
        {pairedTray ? (
          <View style={styles.helpCard}>
            <Text style={styles.helpTitle}>
              {pairedTray.displayName}
            </Text>

            <Text style={styles.helpBody}>
              {pairedTray.hostname}
            </Text>

            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 14 },
                openingTray && { opacity: 0.6 },
              ]}
              onPress={handleOpenTray}
              disabled={openingTray}
            >
              <Text style={styles.primaryBtnText}>
                {openingTray
                  ? t.openingTray
                  : t.openTray}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 10 },
              ]}
              onPress={handleForgetTray}
            >
              <Text style={styles.primaryBtnText}>
                {t.forgetTray}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.landingActions}>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => {
                setTermsError("");

                if (!termsAccepted) {
                  setShowTerms(true);
                } else {
                  navigation.navigate("Setup");
                }
              }}
            >
              <Text style={styles.primaryBtnText}>
                {t.setupNewTray}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.primaryBtn,
                { marginTop: 12 },
                findingExistingTray && {
                  opacity: 0.6,
                },
              ]}
              onPress={() => {
                setTermsError("");

                if (!termsAccepted) {
                  setShowTerms(true);
                  return;
                }

                handleFindExistingTray();
              }}
              disabled={findingExistingTray}
            >
              <Text style={styles.primaryBtnText}>
                {findingExistingTray
                  ? t.searchingTrays
                  : t.findExistingTray}
              </Text>
            </Pressable>

            {!!findTrayError && (
              <Text style={styles.modalError}>
                {t[findTrayError]}
              </Text>
            )}
          </View>
        )}
      </View>
      </View>
        {/* ===== Settings Cog ===== */}
        <Pressable
          style={styles.setupSettingsBtn}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.setupSettingsBtnText}>
            ⚙
          </Text>
        </Pressable>
      <StatusBar style="light" />
    </ImageBackground>
  );
}

            