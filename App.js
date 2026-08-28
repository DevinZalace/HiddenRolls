import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useState } from "react";
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
import { ConnectingScreen } from "./src/screens/ConnectingScreen";
import { LiveScreen } from "./src/screens/LiveScreen";
import { LandingScreen } from "./src/screens/LandingScreen";
import { ScanTrayScreen } from "./src/screens/ScanTrayScreen";

// Enable native screen optimizations for smoother navigation performance.
enableScreens(true);

const Stack = createNativeStackNavigator();

export default function App() {
  // App-level state for onboarding, terms acceptance, and simple UI toggles.
  const [showIntro, setShowIntro] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [pendingTray, setPendingTray] = useState(null);

  // Hooks must be called before any return
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Inter_400Regular,
  });
  const [language, setLanguage] = useState("en"); // en | es (we can add more)
  const [lightOn, setLightOn] = useState(false);

  const t = copy[language];

  // Render a lightweight loading screen until custom fonts are ready.
  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <StatusBar style="light" />
      </View>
    );
  }

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

 // Main navigation shell for the landing, setup, connection, and live-view screens.
  return (
  <NavigationContainer theme={DarkTheme}>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        presentation: "card",
        contentStyle: {
          backgroundColor: "#000",
        },
      }}
    >
      
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
          />
        )}
      </Stack.Screen>

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

      <Stack.Screen name="ScanTray">
        {(props) => (
          <ScanTrayScreen
            {...props}
            pendingTray={pendingTray}
            setPendingTray={setPendingTray}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Connecting">
        {({ navigation }) => (
          <ConnectingScreen
            navigation={navigation}
            t={t}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Live">
        {({ navigation }) => (
          <LiveScreen
            navigation={navigation}
            t={t}
            lightOn={lightOn}
            setLightOn={setLightOn}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  </NavigationContainer>
);
}
