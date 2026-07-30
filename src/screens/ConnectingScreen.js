import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import {ActivityIndicator,Pressable,Text,View,} from "react-native";
import { checkCameraConnection } from "../../services/cameraService";
import { styles } from "../theme/styles";

// Checks for the physical HiddenRolls camera before opening the live view.
export function ConnectingScreen({ navigation, t }) {
  const [connectionState, setConnectionState] = useState("checking");
  const [failureReason, setFailureReason] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(0);

  useEffect(() => {
    let isScreenActive = true;

    async function attemptConnection() {
  const maximumAttempts = 3;
  const retryDelayMs = 1500;

  setConnectionState("checking");
  setFailureReason(null);

  let lastFailureReason = "network-error";

  for (
    let currentAttempt = 1;
    currentAttempt <= maximumAttempts;
    currentAttempt += 1
  ) {
    const result = await checkCameraConnection();

    if (!isScreenActive) {
      return;
    }

    if (result.connected) {
      setConnectionState("connected");
      navigation.replace("Live");
      return;
    }

    lastFailureReason = result.reason;

    const hasAnotherAttempt =
      currentAttempt < maximumAttempts;

    if (hasAnotherAttempt) {
      await new Promise((resolve) => {
        setTimeout(resolve, retryDelayMs);
      });

      if (!isScreenActive) {
        return;
      }
    }
  }

  setConnectionState("failed");
  setFailureReason(lastFailureReason);
}

    attemptConnection();

    return () => {
      isScreenActive = false;
    };
  }, [attemptNumber, navigation]);

  const isChecking = connectionState === "checking";

  const failureMessage =
    failureReason === "timeout"
      ? t.connectionTimeout
      : t.connectionFailed;

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