/**
 * LandingScreen.js
 *
 * Welcome/landing page shown at app start.
 * Displays brand welcome message, language selection option, and terms/conditions.
 * User must accept terms before proceeding to setup.
 */

import { useState } from "react";
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
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
  findExistingTrays,
} from "../../services/provisioningService";

import {
  verifyHiddenRollsTray,
} from "../../services/cameraService";

import {
  savePairedTray,
} from "../../services/pairedTrayService";
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
  showTerms,
  setShowTerms,
  termsError,
  setTermsError,
  termsAccepted,
  setTermsAccepted,
  pairedTray,
  setPairedTray,
}) {

  const [openingTray, setOpeningTray] = useState(false);
  const [findingExistingTray, setFindingExistingTray] =
   useState(false);

  const [findTrayError, setFindTrayError] =
    useState("");

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
          "Tray Not Found",
          "Make sure your Hidden Rolls tray is powered on and connected to the same Wi-Fi network."
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
        "Tray Not Found",
        "Hidden Rolls could not connect to your paired tray."
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
      "Forget Tray?",
      "This removes the tray from this app. It will not erase the Wi-Fi settings stored on the tray.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Forget",
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
                "Could Not Forget Tray",
                "Please try again."
              );
            }
          },
        },
      ]
    );
  }

  {/* Handler for finding existing trays on the network */}
  async function handleFindExistingTray() {
    if (findingExistingTray) {
      return;
    }

    setFindingExistingTray(true);
    setFindTrayError("");

    try {
      const discoveredTrays =
        await findExistingTrays();

      if (discoveredTrays.length === 0) {
        setFindTrayError(
          "No Hidden Rolls trays were found. Make sure your tray is powered on and connected to the same Wi-Fi network."
        );

        return;
      }

      const verifiedTrays = [];

      for (const tray of discoveredTrays) {
        const verified =
          await verifyHiddenRollsTray(tray);

        if (verified) {
          verifiedTrays.push(tray);
        }
      }

      if (verifiedTrays.length === 0) {
        setFindTrayError(
          "A device was discovered, but Hidden Rolls could not verify it."
        );

        return;
      }

      if (verifiedTrays.length > 1) {
        setFindTrayError(
          "Multiple Hidden Rolls trays were found. Tray selection will be added next."
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

      setPairedTray(restoredTray);

      navigation.reset({
        index: 0,
        routes: [{ name: "Live" }],
      });
    } catch (error) {
      console.error(
        "Existing tray discovery failed:",
        error
      );

      setFindTrayError(
        "Hidden Rolls could not search for existing trays."
      );
    } finally {
      setFindingExistingTray(false);
    }
  }

  return (
    <ImageBackground
      source={require("../../assets/Open.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Title */}
        <Text style={styles.landingTitle}>{t.landingTitle}</Text>

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
                  By using Hidden Rolls, you agree to the following:
                  {"\n\n"}
                  • This app is intended for tabletop gameplay entertainment.
                  {"\n"}
                  • Camera feeds are intended to be local. (No cloud storage by
                  default.)
                  {"\n"}
                  • You are responsible for complying with local laws and table
                  rules.
                  {"\n"}
                  • Use at your own risk. No warranties.
                  {"\n\n"}
                  (Will replace this placeholder with real terms later.)
                </Text>
              </ScrollView>

              {/* Error message if user declined */}
              {!!termsError && (
                <Text style={styles.modalError}>{termsError}</Text>
              )}

              {/* Modal action buttons */}
              <View style={styles.modalBtnRow}>
                <Pressable
                  style={[styles.modalBtn, styles.modalBtnGhost]}
                  onPress={() => {
                    setTermsError(
                      "You must agree to continue using the app."
                    );
                    setShowTerms(false);
                  }}
                >
                  <Text style={styles.modalBtnText}>{t.dontagree}</Text>
                </Pressable>

                <Pressable
                  style={[styles.modalBtn, styles.modalBtnPrimary]}
                  onPress={() => {
                    setTermsAccepted(true);
                    setShowTerms(false);
                    navigation.navigate("Setup");
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
                  ? "Opening Tray..."
                  : "Open Tray"}
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
                Forget Tray
              </Text>
            </Pressable>
          </View>
        ) : (
          <View>
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
                Set Up New Tray
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
              onPress={handleFindExistingTray}
              disabled={findingExistingTray}
            >
              <Text style={styles.primaryBtnText}>
                {findingExistingTray
                  ? "Searching..."
                  : "Find Existing Tray"}
              </Text>
            </Pressable>

            {!!findTrayError && (
              <Text style={styles.modalError}>
                {findTrayError}
              </Text>
            )}
          </View>
        )}
      </View>

      <StatusBar style="light" />
    </ImageBackground>
  );
}

            