/**
 * styles.js
 *
 * Centralized style definitions for all screens and components.
 * Uses React Native StyleSheet for performance optimization.
 *
 * Organized by purpose:
 * - Layout containers (setupRoot, overlay, etc.)
 * - Typography (title, body, label)
 * - Buttons (primary, secondary, ghost variants)
 * - Modal dialogs
 * - Component-specific styles (chips, sliders, etc.)
 *
 * Colors:
 * - Primary: White text on dark backgrounds
 * - Background: Pure black (#0b0b0b and #000)
 * - Accents: Semi-transparent white overlays
 *
 * Fonts:
 * - Titles: Cinzel 700 Bold (serif, elegant)
 * - Body: Inter 400 Regular (sans-serif, readable)
 */

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
lightSliderPanel: {
  paddingHorizontal: 22,
  paddingTop: 12,
  paddingBottom: 8,
  backgroundColor: "#171717",
},

lightSliderHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

lightSliderLabel: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 15,
},

lightSliderValue: {
  color: "#00e426",
  fontFamily: "Inter_400Regular",
  fontSize: 15,
},

lightSlider: {
  width: "100%",
  height: 38,
},

wifiNetworkRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  paddingVertical: 14,
  paddingHorizontal: 16,
  marginTop: 8,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
},

wifiNetworkRowSelected: {
  borderWidth: 2,
  backgroundColor: "rgba(255,255,255,0.08)",
},

wifiNetworkInfo: {
  flex: 1,
},

wifiNetworkName: {
  fontSize: 17,
  fontWeight: "600",
  color: "#ffffff",
},

wifiNetworkSignal: {
  marginTop: 3,
  fontSize: 13,
  color: "rgba(255,255,255,0.65)",
},

wifiNetworkCheck: {
  marginLeft: 14,
  fontSize: 22,
  fontWeight: "700",
  color: "#ffffff",
},

wifiCredentials: {
  width: "100%",
  marginTop: 18,
},

wifiPasswordInput: {
  width: "100%",
  marginTop: 10,
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.25)",
  borderRadius: 10,
  color: "#ffffff",
},

setupScrollContent: {
  flexGrow: 1,
  paddingBottom: 40,
},

setupScrollContent: {
  flexGrow: 1,
  paddingBottom: 40,
},
});
