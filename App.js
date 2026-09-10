/**
 * App.js - Root Application Component
 *
 * Hidden Rolls is a tabletop camera application that allows users to:
 * 1. Provision an ESP32 camera tray over Bluetooth
 * 2. Pair with an already-configured tray discovered on the local network
 * 3. Connect to the tray over Wi-Fi and view its live camera stream
 * 4. Control the tray light from the live view
 *
 * Navigation Flows:
 *
 * New or reset tray:
 * Landing -> Setup -> ScanTray -> Live
 *
 * Paired tray:
 * Landing -> Live
 *
 * The app uses React Navigation for screen management and supports
 * multi-language localization (English and Spanish).
 */

import { StatusBar } from "expo-status-bar";
import { View, Pressable, Animated } from "react-native";
import { useState, useEffect, useRef } from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { enableScreens } from "react-native-screens";
import { copy } from "./src/localization/copy";
import { styles } from "./src/theme/styles";
import { SetupScreen } from "./src/screens/SetupScreen";
import { LiveScreen } from "./src/screens/LiveScreen";
import { LandingScreen } from "./src/screens/LandingScreen";
import { ScanTrayScreen } from "./src/screens/ScanTrayScreen";
import {
  loadPairedTray,
} from "./services/pairedTrayService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Enable native screen optimizations for the navigation stack.
enableScreens(true);

// The app uses a single stack because onboarding and the live view share state.
const Stack = createNativeStackNavigator();
// The key used to persist the user's language choice in local storage.
const LANGUAGE_STORAGE_KEY = "hiddenRolls.language";

/**
 * Main application component that manages:
 * - Navigation stack and screen transitions
 * - Terms acceptance and onboarding state
 * - Paired-tray restoration from local storage
 * - Font loading, startup animation, and localized copy
 */
export default function App() {
  // ===== Onboarding & Terms State =====
  const [introStage, setIntroStage] = useState("dnt"); // Show splash/intro animation on startup
  const introOpacity = useRef(new Animated.Value(0)).current; // Animated opacity for intro screens
  const [termsAccepted, setTermsAccepted] = useState(false); // User must accept terms before setup
  const [showTerms, setShowTerms] = useState(false); // Toggle terms modal visibility
  const [termsError, setTermsError] = useState(""); // Error message if terms not accepted

  // ===== Tray State =====
  const [pendingTray, setPendingTray] = useState(null); // Tray currently being scanned or provisioned
  const [pairedTray, setPairedTray] = useState(null); // Tray saved for direct access from Landing
  const [pairedTrayLoaded, setPairedTrayLoaded] = useState(false); // Prevent navigation before storage has been checked

  // ===== Font Loading (required before rendering text) =====
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold, // Used for titles
    Inter_400Regular, // Used for body text
  });

  // ===== Localization & UI State =====
  const [language, setLanguage] = useState("en"); // "en" or "es"; supports more languages
  const [languageChosen, setLanguageChosen] = useState(false); // User must choose a language before proceeding to setup or live view
  const [languageLoaded, setLanguageLoaded] = useState(false); // Prevent navigation before language has been loaded from storage
  const [lightOn, setLightOn] = useState(false); // Camera light on/off toggle for live view
  const [termsLoaded, setTermsLoaded] = useState(false); // Prevent navigation before terms acceptance has been loaded from storage

  // Get localized text strings for current language
  const t = copy[language];

  // ===== Constants =====
  const TERMS_STORAGE_KEY = "hiddenRolls.termsVersion";
  const CURRENT_TERMS_VERSION = "1";

  // Play each custom intro card, then advance to the next stage.
  useEffect(() => {
    if (introStage === "done") {
      return;
    }

    introOpacity.setValue(0);

    const animation = Animated.sequence([
      Animated.timing(introOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),

      Animated.delay(
      introStage === "hiddenRolls" ? 2000 : 1800
    ),

      Animated.timing(introOpacity, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (!finished) {
        return;
      }

      if (introStage === "dnt") {
        setIntroStage("hiddenRolls");
      } else {
        setIntroStage("done");
      }
    });

    return () => {
      animation.stop();
    };
  }, [introStage, introOpacity]);

  // Restore the user's saved language choice.
  useEffect(() => {
    let active = true;

    async function restoreLanguage() {
      try {
        const storedLanguage =
          await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

        if (!active) {
          return;
        }

        if (storedLanguage === "en" || storedLanguage === "es") {
          setLanguage(storedLanguage);
          setLanguageChosen(true);
        }
      } catch (error) {
        console.error(
          "Failed to restore language preference:",
          error
        );
      } finally {
        if (active) {
          setLanguageLoaded(true);
        }
      }
    }

    restoreLanguage();

    return () => {
      active = false;
    };
  }, []);

  // Restore accepted Terms version.
  useEffect(() => {
    let active = true;

    async function restoreTerms() {
      try {
        const storedTermsVersion =
          await AsyncStorage.getItem(TERMS_STORAGE_KEY);

        if (!active) {
          return;
        }

        if (storedTermsVersion === CURRENT_TERMS_VERSION) {
          setTermsAccepted(true);
        }
      } catch (error) {
        console.error(
          "Failed to restore Terms acceptance:",
          error
        );
      } finally {
        if (active) {
          setTermsLoaded(true);
        }
      }
    }

    restoreTerms();

    return () => {
      active = false;
    };
  }, []);

  // Restore the last paired tray before rendering the main navigation.
  useEffect(() => {
    let active = true;

    async function restorePairedTray() {
      const storedTray = await loadPairedTray();

      if (!active) {
        return;
      }

      setPairedTray(storedTray);
      setPairedTrayLoaded(true);
    }

    restorePairedTray();

    return () => {
      active = false;
    };
  }, []);

  // ===== Render Stages =====

  // Stage 1: Wait for fonts and persisted tray state.
  if (
    !fontsLoaded ||
    !pairedTrayLoaded ||
    !languageLoaded ||
    !termsLoaded
  ) {
  return (
    <View style={styles.loading}>
      <StatusBar style="light" />
    </View>
  );
}

  // Stage 2A: D&T Manufacturing intro.
  if (introStage === "dnt") {
    return (
      <Pressable
        style={styles.introContainer}
        onPress={() => setIntroStage("done")}
      >
        <Animated.Image
          source={require("./assets/DT-Intro.jpg")}
          resizeMode="contain"
          style={[
            styles.lottie,
            { opacity: introOpacity },
          ]}
        />

        <StatusBar style="light" />
      </Pressable>
    );
  }

  // Stage 2B: Hidden Rolls title card.
  if (introStage === "hiddenRolls") {
    return (
      <Pressable
        style={styles.introContainer}
        onPress={() => setIntroStage("done")}
      >
        <Animated.Image
          source={require("./assets/HR-Intro.jpg")}
          resizeMode="contain"
          style={{
            width: "100%",
            height: "100%",
            opacity: introOpacity,
          }}
        />

        <StatusBar style="light" />
      </Pressable>
    );
  }

  // Stage 3: Render the application navigation.
  return (
    <NavigationContainer theme={DarkTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // No native header; custom UI only
          animation: "slide_from_right", // Screen transitions slide in from right
          presentation: "card", // Screens presented as cards
          contentStyle: {
            backgroundColor: "#000", // Black background for all screens
          },
        }}
      >
        {/* Landing: terms acceptance, paired-tray access, and discovery. */}
        <Stack.Screen name="Landing">
          {({ navigation }) => (
            <LandingScreen
              navigation={navigation}
              t={t}
              language={language}
              setLanguage={setLanguage}
              languageChosen={languageChosen}
              setLanguageChosen={setLanguageChosen}
              showTerms={showTerms}
              setShowTerms={setShowTerms}
              termsError={termsError}
              setTermsError={setTermsError}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              pairedTray={pairedTray}
              setPairedTray={setPairedTray}
            />
          )}
        </Stack.Screen>

        {/* Setup: verify Bluetooth readiness before QR scanning. */}
        <Stack.Screen name="Setup">
          {({ navigation }) => (
            <SetupScreen
              navigation={navigation}
              t={t}
              language={language}
              setLanguage={setLanguage}
            />
          )}
        </Stack.Screen>

        {/* ScanTray: QR parsing, BLE discovery, BLE connection, and Wi-Fi setup. */}
        <Stack.Screen name="ScanTray">
          {(props) => (
            <ScanTrayScreen
              {...props}
              t={t}
              pendingTray={pendingTray}
              setPendingTray={setPendingTray}
              setPairedTray={setPairedTray}
            />
          )}
        </Stack.Screen>

        {/* ===== Screen 4 Live ===== */}
        {/* Main live view with video stream and light control */}
        <Stack.Screen name="Live">
          {({ navigation }) => (
            <LiveScreen
              navigation={navigation}
              t={t}
              lightOn={lightOn}
              setLightOn={setLightOn}
              pairedTray={pairedTray}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
