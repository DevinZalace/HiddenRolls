/**
 * LandingScreen.js
 *
 * Welcome/landing page shown at app start.
 * Displays brand welcome message, language selection option, and terms/conditions.
 * User must accept terms before proceeding to setup.
 */

import { ImageBackground, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { styles } from "../theme/styles";

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
}) {
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
        <Pressable
          style={styles.primaryBtn}
          onPress={() => {
            setTermsError("");
            if (!termsAccepted) setShowTerms(true);
            else navigation.navigate("Setup");
          }}
        >
          <Text style={styles.primaryBtnText}>{t.continue}</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </ImageBackground>
  );
}

            