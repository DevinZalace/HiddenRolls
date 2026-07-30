import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Pressable, ImageBackground, ActivityIndicator, Modal, ScrollView, Alert} from "react-native";
import { useEffect, useState } from "react";
import LottieView from "lottie-react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { enableScreens } from "react-native-screens";
import { WebView } from "react-native-webview";

import {
  buildCameraStreamUrl,
} from "./config/camera";

import {
  checkCameraConnection,
  setCameraLight,
} from "./services/cameraService";

// Enable native screen optimizations for smoother navigation performance.
enableScreens(true);

const Stack = createNativeStackNavigator();

// Uses the known working camera address for now.
// Runtime discovery will replace this default later.
const ESP32_STREAM_URL = buildCameraStreamUrl();

// Setup screen for selecting language and guiding the user through device connection.
function SetupScreen({ navigation, t, language, setLanguage}) {
  return (
    <View style={styles.setupRoot}>
      <View style={styles.setupTop}>
        <Text style={styles.setupTitle}>{t.setupTitle}</Text>

        <Text style={styles.sectionLabel}>{t.languageLabel}</Text>
        <View style={styles.langRow}>
          <Pressable
            onPress={() => setLanguage("en")}
            style={[
              styles.chip,
              language === "en" ? styles.chipActive : styles.chipInactive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                language === "en"
                  ? styles.chipTextActive
                  : styles.chipTextInactive,
              ]}
            >
              {t.english}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setLanguage("es")}
            style={[
              styles.chip,
              language === "es" ? styles.chipActive : styles.chipInactive,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                language === "es"
                  ? styles.chipTextActive
                  : styles.chipTextInactive,
              ]}
            >
              {t.spanish}
            </Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>{t.connectionTitle}</Text>

        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>{t.howToConnect}</Text>
          <Text style={styles.helpBody}>{t.connectSteps}</Text>

          <Pressable
            style={[styles.primaryBtn, { marginTop: 14 }]}
            onPress={() => navigation.navigate("Connecting")}
          >
            <Text style={styles.primaryBtnText}>{t.connectBtn}</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.setupBottom}>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>{t.back}</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </View>
  );
}

// Checks for the physical HiddenRolls camera before opening the live view.
function ConnectingScreen({ navigation, t }) {
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

// Primary live-view screen that embeds the camera stream and basic controls.
// Primary live-view screen that embeds the camera stream and basic controls.
function LiveScreen({ navigation, t, lightOn, setLightOn }) {
  const [streamError, setStreamError] = useState(false);
  const [streamReloadKey, setStreamReloadKey] = useState(0);
  const [lightIsChanging, setLightIsChanging] = useState(false);

  async function toggleCameraLight() {
  if (lightIsChanging) {
    return;
  }

  const requestedState = !lightOn;

  setLightIsChanging(true);

  try {
    const result = await setCameraLight(requestedState);

    if (!result.success) {
      Alert.alert(
        t.lightControlErrorTitle,
        t.lightControlErrorBody
      );

      return;
    }

    setLightOn(requestedState);
  } catch (error) {
    console.error("Unexpected light control error:", error);

    Alert.alert(
      t.lightControlErrorTitle,
      t.lightControlErrorBody
    );
  } finally {
    setLightIsChanging(false);
  }
}

  useEffect(() => {
  let isScreenActive = true;
  let nextCheckTimer = null;
  let consecutiveFailures = 0;

  async function checkCameraHealth() {
    const result = await checkCameraConnection({
      timeoutMs: 2000,
    });

    if (!isScreenActive) {
      return;
    }

    if (result.connected) {
  consecutiveFailures = 0;

  const reportedLightIntensity = Number(
    result.cameraStatus?.led_intensity
  );

  if (Number.isFinite(reportedLightIntensity)) {
    setLightOn(reportedLightIntensity > 0);
  }
} else {
  consecutiveFailures += 1;

  if (consecutiveFailures >= 2) {
    setStreamError(true);
  }
}

    nextCheckTimer = setTimeout(checkCameraHealth, 3000);
  }

  checkCameraHealth();

  return () => {
    isScreenActive = false;

    if (nextCheckTimer) {
      clearTimeout(nextCheckTimer);
    }
  };
}, []);

  async function retryStream() {
  const result = await checkCameraConnection();

  if (!result.connected) {
    setStreamError(true);
    return;
  }

  setStreamError(false);
  setStreamReloadKey((currentKey) => currentKey + 1);
}

  return (
    <View style={styles.liveRoot}>
      <StatusBar style="light" />

      <View style={styles.videoArea}>
        <WebView
          key={streamReloadKey}
          source={{ uri: ESP32_STREAM_URL }}
          originWhitelist={["http://*"]}
          javaScriptEnabled={false}
          domStorageEnabled={false}
          cacheEnabled={false}
          onShouldStartLoadWithRequest={(request) =>
            request.url === ESP32_STREAM_URL ||
            request.url === "about:blank"
          }
          onError={() => setStreamError(true)}
          onHttpError={() => setStreamError(true)}
          style={styles.cameraStream}
        />

        {streamError && (
          <View style={styles.streamErrorOverlay}>
            <Text style={styles.streamErrorTitle}>
              {t.connectionLostTitle}
            </Text>

            <Text style={styles.streamErrorBody}>
              {t.connectionLost}
            </Text>

            <Pressable
              style={[styles.controlBtn, styles.streamRetryBtn]}
              onPress={retryStream}
            >
              <Text style={styles.controlBtnText}>
                {t.retry}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.controlsBar}>
        <Pressable
          disabled={lightIsChanging}
          style={[
            styles.controlBtn,
            lightOn ? styles.controlBtnOn : null,
            lightIsChanging ? styles.controlBtnDisabled : null,
          ]}
          onPress={toggleCameraLight}
        >
          <Text style={styles.controlBtnText}>
            {lightIsChanging
              ? t.lightUpdating
              : `${t.light}: ${lightOn ? t.on : t.off}`}
          </Text>
        </Pressable>

        <Pressable
          style={styles.controlBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.controlBtnText}>
            {t.back}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}



export default function App() {
  // App-level state for onboarding, terms acceptance, and simple UI toggles.
  const [showIntro, setShowIntro] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  // Hooks must be called before any return
  const [fontsLoaded] = useFonts({
    Cinzel_700Bold,
    Inter_400Regular,
  });
  const [language, setLanguage] = useState("en"); // en | es (we can add more)
  const [lightOn, setLightOn] = useState(false);
  const [cameraIp, setCameraIp] = useState("");

// Localized copy used by the onboarding and connection experience.
const copy = {
  en: {
    setupTitle: "Setup",
    languageLabel: "Language",
    next: "Next",
    back: "Back",
    english: "English",
    spanish: "Español",
    continue: "Continue",
    landingTitle: "Welcome to Hidden Rolls",
    connectionTitle: "Connection",
    howToConnect: "How to connect",
    connectSteps: "1) Power on the tray camera.\n2) Join the tray’s Wi-Fi on your phone.\n3) Tap Connect to view the feed.",
    connectBtn: "Connect to Camera Feed",
    connecting: "Connecting...",
    connectingbody: "Make sure you’re on the tray’s Wi-Fi.",
    light: "Light",
    on: "On",
    off: "Off",
    camerafeed: "Camera Feed",
    dontagree: "Don't Agree",
    agree: "Agree",
    termsAndConditions: "Terms and Conditions",
    connecting: "Connecting...",
    connectingbody: "Searching for your HiddenRolls tray on the local network.",
    connectionFailedTitle: "Tray Not Found",
    connectionFailed:
    "HiddenRolls could not find the tray. Make sure it is powered on and connected to the same Wi-Fi network.",
    connectionTimeout:
    "The tray did not answer in time. Check its power and Wi-Fi connection, then try again.",
    retry: "Try Again",
    connectionLostTitle: "Camera Feed Unavailable",
    connectionLost:
    "The live feed could not be loaded. Check the tray's power and Wi-Fi connection, then try again.",
    lightUpdating: "Updating...",
    lightControlErrorTitle: "Light Control Failed",
    lightControlErrorBody:
    "HiddenRolls could not reach the tray light. Check the tray's power and Wi-Fi connection, then try again.",
  
  },
  es: {
    setupTitle: "Configuración",
    languageLabel: "Idioma",
    next: "Siguiente",
    back: "Atrás",
    english: "Inglés",
    spanish: "Español",
    continue: "Continuar",
    landingTitle: "Bienvenido a Hidden Rolls",
    connectionTitle: "Conexión",
    howToConnect: "Cómo conectar",
    connectSteps:"1) Enciende la cámara.\n2) Conecta tu teléfono al Wi-Fi de la bandeja.\n3) Pulsa Conectar para ver el video.",
    connectBtn: "Conectar a la cámara",
    connecting: "Conectando...",
    connectingbody: "Asegúrate de estar conectado al Wi-Fi de la bandeja.",
    light: "Luz",
    on: "Activa",
    off: "Inactiva",
    camerafeed: "Video de la cámara",
    dontagree: "No Aceptar",
    agree: "Aceptar",
    termsAndConditions: "Términos y Condiciones",
    connecting: "Conectando...",
    connectingbody:
    "Buscando tu bandeja HiddenRolls en la red local.",
    connectionFailedTitle: "Bandeja No Encontrada",
    connectionFailed:
    "HiddenRolls no pudo encontrar la bandeja. Asegúrate de que esté encendida y conectada a la misma red Wi-Fi.",
    connectionTimeout:
    "La bandeja no respondió a tiempo. Revisa la alimentación y la conexión Wi-Fi, e inténtalo de nuevo.",
    retry: "Intentar de Nuevo",
    connectionLostTitle: "Transmisión No Disponible",
    connectionLost:
    "No se pudo cargar la transmisión en vivo. Revisa la alimentación y la conexión Wi-Fi de la bandeja, e inténtalo de nuevo.",
    lightUpdating: "Actualizando...",
    lightControlErrorTitle: "Error al Controlar la Luz",
    lightControlErrorBody:
    "HiddenRolls no pudo comunicarse con la luz de la bandeja. Revisa la alimentación y la conexión Wi-Fi, e inténtalo de nuevo.",
  
  },
};

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


  return (
  // Main navigation shell for the intro, setup, connection, and live-view screens.
  <NavigationContainer theme={DarkTheme}>
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right", presentation: "card", contentStyle: { backgroundColor: "#000" } }}>
      <Stack.Screen name="Landing">
        {({ navigation }) => (
          <ImageBackground
            source={require("./assets/Open.png")}
            style={styles.background}
            resizeMode="cover"
          >
            <View style={styles.overlay}>
              <Text style={styles.landingTitle}>{t.landingTitle}</Text>
              <Modal
  visible={showTerms}
  transparent
  animationType="fade"
  onRequestClose={() => setShowTerms(false)}
>
  <View style={styles.modalBackdrop}>
    <View style={styles.modalCard}>
      <Text style={styles.modalTitle}>{t.termsAndConditions}</Text>

      <ScrollView style={styles.modalScroll}>
        <Text style={styles.modalText}>
          By using Hidden Rolls, you agree to the following:
          {"\n\n"}
          • This app is intended for tabletop gameplay entertainment.
          {"\n"}
          • Camera feeds are intended to be local. (No cloud storage by default.)
          {"\n"}
          • You are responsible for complying with local laws and table rules.
          {"\n"}
          • Use at your own risk. No warranties.
          {"\n\n"}
          (Will replace this placeholder with real terms later.)
        </Text>
      </ScrollView>

      {!!termsError && <Text style={styles.modalError}>{termsError}</Text>}

      <View style={styles.modalBtnRow}>
        <Pressable
          style={[styles.modalBtn, styles.modalBtnGhost]}
          onPress={() => {
              setTermsError("You must agree to continue using the app.");
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


              <Pressable
                style={styles.primaryBtn}
                onPress={() => {setTermsError("");
                 if (!termsAccepted) setShowTerms(true);
                 else navigation.navigate("Setup");
                }}
              >
                <Text style={styles.primaryBtnText}>{t.continue}</Text>
              </Pressable>
            </View>

            <StatusBar style="light" />
          </ImageBackground>
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
      <Stack.Screen name="Connecting">
       {({ navigation }) => <ConnectingScreen navigation={navigation} t={t} />}
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

// Shared visual styles for the app experience.
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: "#000",
  },
  introContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: "100%",
    height: "100%",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.55)",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  gap: 18,
},
landingTitle: {
  fontSize: 40,
  color: "white",
  fontFamily: "Cinzel_700Bold",
  textAlign: "center",
},
primaryBtn: {
  backgroundColor: "rgba(255,255,255,0.18)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.28)",
  paddingVertical: 12,
  paddingHorizontal: 18,
  borderRadius: 14,
},
primaryBtnText: {
  color: "white",
  fontFamily: "Inter_400Regular",
  fontSize: 16,
  textAlign: "center",
},
setupRoot: {
  flex: 1,
  backgroundColor: "#0b0b0b",
  alignItems: "center",
  justifyContent: "space-between",
  paddingVertical: 36,
  paddingHorizontal: 24,
},
setupTitle: {
  color: "white",
  fontFamily: "Cinzel_700Bold",
  fontSize: 28,
  marginTop: 6,
},
setupTop: {
  alignItems: "center",
  width: "100%",
  paddingTop: 18,
},
setupBottom: {
  width: "100%",
  alignItems: "center",
  paddingBottom: 28,
  paddingTop: 6,
},
sectionLabel: {
  color: "rgba(255,255,255,0.75)",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
  marginTop: 6,
  marginBottom: 8,
  alignSelf: "flex-start",
},

langRow: {
  flexDirection: "row",
  gap: 10,
  alignSelf: "stretch",
  marginBottom: 18,
},

chip: {
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 999,
  borderWidth: 1,
},

chipActive: {
  backgroundColor: "rgba(255,255,255,0.18)",
  borderColor: "rgba(255,255,255,0.35)",
},

chipInactive: {
  backgroundColor: "transparent",
  borderColor: "rgba(255,255,255,0.18)",
},

chipText: {
  fontFamily: "Inter_400Regular",
  fontSize: 14,
},

chipTextActive: { color: "white" },
chipTextInactive: { color: "rgba(255,255,255,0.7)" },

helpCard: {
  alignSelf: "stretch",
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  borderRadius: 16,
  padding: 14,
  marginTop: 8,
},

helpTitle: {
  color: "white",
  fontFamily: "Cinzel_700Bold",
  fontSize: 18,
  marginBottom: 8,
},

helpBody: {
  color: "rgba(255,255,255,0.8)",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
  lineHeight: 20,
},
connectingRoot: {
  flex: 1,
  backgroundColor: "#000",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
},
connectingCard: {
  width: "100%",
  maxWidth: 520,
  backgroundColor: "rgba(255,255,255,0.06)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  borderRadius: 18,
  padding: 18,
  alignItems: "center",
},
connectingTitle: {
  color: "white",
  fontFamily: "Cinzel_700Bold",
  fontSize: 24,
  marginBottom: 6,
},
connectingBody: {
  color: "rgba(255,255,255,0.75)",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
  textAlign: "center",
},
spinnerWrap: {
  width: 64,
  height: 64,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.08)",
},
liveRoot: {
  flex: 1,
  backgroundColor: "#000",
},

videoArea: {
  flex: 1,
  marginTop: 12,
  marginHorizontal: 12,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  backgroundColor: "rgba(255,255,255,0.04)",
  overflow: "hidden",
  position: "relative",
},

cameraStream: {
  flex: 1,
  width: "100%",
  backgroundColor: "#000",
},

videoPlaceholderTitle: {
  color: "white",
  fontFamily: "Cinzel_700Bold",
  fontSize: 22,
  marginBottom: 8,
},

videoPlaceholderBody: {
  color: "rgba(255,255,255,0.75)",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
  textAlign: "center",
  lineHeight: 20,
},

controlsBar: {
  flexDirection: "row",
  gap: 10,
  padding: 12,
  margin: 12,
  borderRadius: 18,
  backgroundColor: "rgba(0,0,0,0.55)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
},

controlBtn: {
  flex: 1,
  paddingVertical: 30,
  borderRadius: 40,
  backgroundColor: "rgba(255,255,255,0.10)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 48,
},

controlBtnOn: {
  backgroundColor: "rgba(255,255,255,0.20)",
  borderColor: "rgba(255,255,255,0.35)",
},

controlBtnText: {
  color: "white",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
  textAlign: "center",
  flexWrap: "wrap",
},
modalBackdrop: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.7)",
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
},
modalCard: {
  width: "100%",
  maxWidth: 520,
  backgroundColor: "rgba(20,20,20,0.98)",
  borderRadius: 18,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
  padding: 16,
},
modalTitle: {
  color: "white",
  fontFamily: "Cinzel_700Bold",
  fontSize: 20,
  marginBottom: 10,
},
modalScroll: {
  maxHeight: 260,
  marginBottom: 12,
},
modalText: {
  color: "rgba(255,255,255,0.78)",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
  lineHeight: 20,
},
modalError: {
  color: "rgba(255,120,120,0.95)",
  fontFamily: "Inter_400Regular",
  fontSize: 13,
  marginBottom: 10,
},
modalBtnRow: {
  flexDirection: "row",
  gap: 10,
},
modalBtn: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 14,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
},
modalBtnPrimary: {
  backgroundColor: "rgba(255,255,255,0.18)",
  borderColor: "rgba(255,255,255,0.28)",
},
modalBtnGhost: {
  backgroundColor: "transparent",
  borderColor: "rgba(255,255,255,0.18)",
},
modalBtnText: {
  color: "white",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
},
streamErrorOverlay: {
  ...StyleSheet.absoluteFillObject,
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  backgroundColor: "#111111",
},

streamErrorTitle: {
  color: "#ffffff",
  fontSize: 22,
  fontFamily: "Cinzel_700Bold",
  textAlign: "center",
  marginBottom: 12,
},

streamErrorBody: {
  color: "#d7d7d7",
  fontSize: 16,
  fontFamily: "Inter_400Regular",
  textAlign: "center",
  lineHeight: 23,
  marginBottom: 20,
},
streamRetryBtn: {
  flex: 0,
  alignSelf: "center",
  minHeight: 0,
  width: "auto",
  paddingVertical: 10,
  paddingHorizontal: 22,
},
controlBtnDisabled: {
  opacity: 0.55,
},
});
