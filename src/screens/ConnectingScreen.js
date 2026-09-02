/**
 * ConnectingScreen.js
 *
 * Intermediate screen that attempts to establish a Wi-Fi connection to the camera.
 * Performs up to 3 connection attempts with retries before giving up.
 * User can manually retry or go back to setup if connection fails.
 */

import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { checkCameraConnection } from "../../services/cameraService";
import { styles } from "../theme/styles";

/**
 * ConnectingScreen Component
 *
 * Props:
 * - navigation: React Navigation object for screen navigation
 * - t: Localized text strings object
 *
 * This screen is shown after QR scanning completes and runs automatically
 * to establish connection. User sees a loading spinner while connecting.
 */
export function ConnectingScreen({ navigation, t }) {
  // Connection attempt state tracking
  const [connectionState, setConnectionState] = useState("checking");
  // "checking" = attempting connection
  // "connected" = successful, navigating to live view
  // "failed" = all retries exhausted

  const [failureReason, setFailureReason] = useState(null);
  // Reason for failure: "timeout", "network-error", "http-error", etc.

  const [attemptNumber, setAttemptNumber] = useState(0);
  // Used to trigger useEffect retries when user clicks "Try Again"

  /**
   * Main connection attempt logic.
   * Runs automatically when component mounts or when user retries.
   */
  useEffect(() => {
    let isScreenActive = true; // Flag to prevent state updates after unmount

    async function attemptConnection() {
      const maximumAttempts = 3; // Total number of retry attempts
      const retryDelayMs = 1500; // Wait time between retries

      setConnectionState("checking");
      setFailureReason(null);

      let lastFailureReason = "network-error";

      // Attempt connection up to maximumAttempts times
      for (
        let currentAttempt = 1;
        currentAttempt <= maximumAttempts;
        currentAttempt += 1
      ) {
        // Call camera service to check if camera is reachable
        const result = await checkCameraConnection();

        // Exit if screen was unmounted during async call
        if (!isScreenActive) {
          return;
        }

        // Success! Navigate to live view
        if (result.connected) {
          setConnectionState("connected");
          navigation.reset({
            index: 0,
            routes: [{ name: "Live" }],
          });
          return;
        }

        // Track failure reason for UI display
        lastFailureReason = result.reason;

        const hasAnotherAttempt = currentAttempt < maximumAttempts;

        // Wait before next retry (except on last attempt)
        if (hasAnotherAttempt) {
          await new Promise((resolve) => {
            setTimeout(resolve, retryDelayMs);
          });

          if (!isScreenActive) {
            return;
          }
        }
      }

      // All retries exhausted
      setConnectionState("failed");
      setFailureReason(lastFailureReason);
    }

    attemptConnection();

    // Cleanup: mark screen as inactive if unmounted
    return () => {
      isScreenActive = false;
    };
  }, [attemptNumber, navigation]);

  // Determine which error message to display
  const isChecking = connectionState === "checking";

  const failureMessage =
    failureReason === "timeout" ? t.connectionTimeout : t.connectionFailed;

  return (
    <View style={styles.connectingRoot}>
      <StatusBar style="light" />

      <View style={styles.connectingCard}>
        <Text style={styles.connectingTitle}>
          {isChecking ? t.connecting : t.connectionFailedTitle}
        </Text>

        <Text style={styles.connectingBody}>
          {isChecking ? t.connectingbody : failureMessage}
        </Text>

        <View style={{ height: 18 }} />

        {isChecking && (
          <View style={styles.spinnerWrap}>
            <ActivityIndicator size="large" color="#00e426" />
          </View>
        )}

        {connectionState === "failed" && (
          <Pressable
            style={styles.primaryBtn}
            onPress={() => setAttemptNumber((current) => current + 1)}
          >
            <Text style={styles.primaryBtnText}>{t.retry}</Text>
          </Pressable>
        )}

        <View style={{ height: 18 }} />

        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryBtnText}>{t.back}</Text>
        </Pressable>
      </View>
    </View>
  );
}