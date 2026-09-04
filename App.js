/**
 * App.js - Root Application Component
 *
 * Hidden Rolls is a tabletop camera application that allows users to:
 * 1. Set up a Bluetooth-enabled ESP32 camera tray via provisioning
 * 2. Connect to the camera over Wi-Fi
 * 3. View a live video stream with controllable lighting
 *
 * Navigation Flows:
 *
 * New tray:
 * Landing -> Setup -> ScanTray -> Live
 *
 * Existing tray:
 * Landing -> Live
 *
 * The app uses React Navigation for screen management and supports
 * multi-language localization (English and Spanish).
 */

import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useState, useEffect } from "react";
import LottieView from "lottie-react-native";
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

// Enable native screen optimizations for smoother navigation performance.
enableScreens(true);

// Create navigation stack for screen management
const Stack = createNativeStackNavigator();

/**
 * Main application component that manages:
 * - Navigation stack and screen transitions
 * - Global app state (onboarding, language, light control)
 * - Font loading and initial animation
 * - Localized copy based on selected language
 */
export default function App() {
  // ===== Onboarding & Terms State =====
  const [showIntro, setShowIntro] = useState(true); // Show splash/intro animation on startup
  const [termsAccepted, setTermsAccepted] = useState(false); // User must accept terms before setup
  const [showTerms, setShowTerms] = useState(false); // Toggle terms modal visibility
  const [termsError, setTermsError] = useState(""); // Error message if terms not accepted

  // ===== Device Provisioning State =====
  const [pendingTray, setPendingTray] = useState(null); // Holds tray info from scanned QR code
  const [pairedTray, setPairedTray] = useState(null); // Holds tray info after successful Bluetooth connection
  const [pairedTrayLoaded, setPairedTrayLoaded] = useState(false); // Flag to indicate if paired tray info has been loaded from storage

  // ===== Font Loading (required before rendering text) =====
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold, // Used for titles
    Inter_400Regular, // Used for body text
  });

  // ===== Localization & UI State =====
  const [language, setLanguage] = useState("en"); // "en" or "es"; supports more languages
  const [lightOn, setLightOn] = useState(false); // Camera light on/off toggle for live view

  // Get localized text strings for current language
  const t = copy[language];

  // Load paired tray information from AsyncStorage on app startup
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

  // Stage 1: Fonts loading - show blank screen while loading fonts
  if (!fontsLoaded || !pairedTrayLoaded) {
  return (
    <View style={styles.loading}>
      <StatusBar style="light" />
    </View>
  );
}

  // Stage 2: Intro animation - show branded splash screen
  if (showIntro) {
    return (
      <View style={styles.introContainer}>
        <LottieView
          source={require("./assets/Lottie animation D&T.json")}
          autoPlay
          loop={false}
          resizeMode="center"
          onAnimationFinish={() => setShowIntro(false)}
          style={styles.lottie}
        />
        <StatusBar style="light" />
      </View>
    );
  }

  // Stage 3: Main navigation - render the full app with all screens
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
        {/* ===== Screen 1: Landing ===== */}
        {/* Welcome screen with language selection and terms acceptance */}
        <Stack.Screen name="Landing">
          {({ navigation }) => (
            <LandingScreen
              navigation={navigation}
              t={t}
              language={language}
              setLanguage={setLanguage}
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

        {/* ===== Screen 2: Setup ===== */}
        {/* Bluetooth setup and permissions check before QR scanning */}
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

        {/* ===== Screen 3: ScanTray ===== */}
        {/* QR code scanning -> Bluetooth discovery -> Bluetooth connection -> Wi-Fi scan */}
        <Stack.Screen name="ScanTray">
          {(props) => (
            <ScanTrayScreen
              {...props}
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
