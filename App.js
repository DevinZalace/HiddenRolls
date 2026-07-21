import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Pressable, ImageBackground, ActivityIndicator, Modal, ScrollView} from "react-native";
import { useState } from "react";
import LottieView from "lottie-react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { Cinzel_700Bold } from "@expo-google-fonts/cinzel";
import { Inter_400Regular } from "@expo-google-fonts/inter";
import { enableScreens } from "react-native-screens";
enableScreens(true);
const Stack = createNativeStackNavigator();

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

function ConnectingScreen({ navigation, t }) {
  return (
    <View style={styles.connectingRoot}>
      <StatusBar style="light" />
      <View style={styles.connectingCard}>
        <Text style={styles.connectingTitle}>{t.connecting}</Text>
        <Text style={styles.connectingBody}>{t.connectingbody}</Text>

        <View style={{ height: 18 }} />

        <View style={styles.spinnerWrap}>
          <ActivityIndicator size="large" color="#00e426" />
        </View>

        <View style={{ height: 18 }} />

        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>{t.back}</Text>
        </Pressable>

        {/* TEMP button until real connection exists */}
        <Pressable
          style={styles.primaryBtn}
          onPress={() => navigation.replace("Live")}
        >
          <Text style={styles.primaryBtnText}>{t.continue}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function LiveScreen({ navigation, t, lightOn, setLightOn }) {
  return (
    <View style={styles.liveRoot}>
      <StatusBar style="light" />

      <View style={styles.videoArea}>
        <Text style={styles.videoPlaceholderTitle}>{t.camerafeed}</Text>
        <Text style={styles.videoPlaceholderBody}>
          (Feed will appear here once we connect the camera protocol.)
        </Text>
      </View>

      <View style={styles.controlsBar}>
        <Pressable
          style={[styles.controlBtn, lightOn ? styles.controlBtnOn : null]}
          onPress={() => setLightOn((v) => !v)}
        >
          <Text style={styles.controlBtnText}>
            {t.light}: {lightOn ? t.on : t.off}
          </Text>
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={() => console.log("Log pressed")}>
          <Text style={styles.controlBtnText}>{t.log}</Text>
        </Pressable>

        <Pressable style={styles.controlBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.controlBtnText}>{t.back}</Text>
        </Pressable>
      </View>
    </View>
  );
}


export default function App() {
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
    log: "Log",
    camerafeed: "Camera Feed",
    dontagree: "Don't Agree",
    agree: "Agree",
    termsAndConditions: "Terms and Conditions",
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
    log: "Registro",
    camerafeed: "Video de la cámara",
    dontagree: "No Aceptar",
    agree: "Aceptar",
    termsAndConditions: "Términos y Condiciones",
  },
};

const t = copy[language];

  // Show something while fonts load (prevents a blank screen)
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
          (We’ll replace this placeholder with your real terms later.)
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
  alignItems: "center",
  justifyContent: "center",
  padding: 18,
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


});
