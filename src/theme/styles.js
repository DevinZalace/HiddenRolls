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
    backgroundColor: "#325494",
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
  backgroundColor: "rgba(0,0,0,0.18)",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  gap: 18,
},

landingContent: {
  alignSelf: "center",
  alignItems: "center",
  width: "100%",
},

landingTitle: {
  fontSize: 40,
  color: "white",
  fontFamily: "Cinzel_700Bold",
  textAlign: "center",
  opacity: 1,
},
primaryBtn: {
  backgroundColor: "rgba(255,255,255,0.18)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.28)",
  paddingVertical: 12,
  borderRadius: 14,
},
primaryBtnText: {
  color: "white",
  fontFamily: "Inter_400Regular",
  fontSize: 16,
  textAlign: "center",
},
backBtn: {
  backgroundColor: "rgba(255,255,255,0.18)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.28)",
  paddingVertical: 12,
  borderRadius: 14,
  paddingHorizontal: 24,
  minWidth: 110,
},
landingActions: {
  width: "100%",
  maxWidth: 520,
  alignSelf: "center",
},
setupRoot: {
  flex: 1,
  backgroundColor: "transparent",
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
  position: "relative",
},
setupBottom: {
  width: "100%",
  alignItems: "center",
  paddingBottom: 28,
  paddingTop: 6,
},

setupPageScroll: {
  flex: 1,
  width: "100%",
},

setupPageScrollContent: {
  flexGrow: 1,
  alignItems: "center",
  paddingVertical: 36,
  paddingHorizontal: 24,
},

setupContent: {
  flex: 1,
  alignSelf: "center",
  justifyContent: "space-between",
},

BackgroundOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(4, 8, 20, 0.35)",
},

setupScrollLandscape: {
  paddingVertical: 12,
},

setupScrollTablet: {
  paddingHorizontal: 32,
},

setupSectionLabel: {
  alignSelf: "stretch",
  color: "rgba(255,255,255,0.85)",
  fontFamily: "Cinzel_700Bold",
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  marginTop: 28,
  marginBottom: 8,
},

scanRoot: {
  flex: 1,
  backgroundColor: "#1f3355",
},

scanProvisioningContent: {
  alignSelf: "center",
  paddingVertical: 36,
},

scanStateContent: {
  flex: 1,
  alignSelf: "center",
  justifyContent: "center",
  paddingVertical: 36,
},

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
  backgroundColor: "transparent",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
},

cameraStream: {
  flex: 1,
  width: "100%",
  backgroundColor: "#000",
},

cameraStreamZoom: {
  transform: [{ scale: 1.12 }],
},

cameraFrame: {
  position: "relative",
  overflow: "hidden",

  borderWidth: 3,
  borderTopColor: "#668FFF",
  borderBottomColor: "#668FFF",
  borderLeftColor: "#25CFFF",
  borderRightColor: "#A65BFF",

  borderRadius: 10,
  backgroundColor: "#000",
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

modalLinkText: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
  textDecorationLine: "underline",
  marginBottom: 12,
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
liveHud: {
  position: "absolute",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 8,
  zIndex: 20,
},

liveBrightnessSlider: {
  flex: 1,
  height: 24,
},

liveHudBtn: {
  minWidth: 76,
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 999,
  backgroundColor: "rgba(0,0,0,0.68)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.22)",
  alignItems: "center",
  justifyContent: "center",
},

liveHudBtnOn: {
  backgroundColor: "rgba(0,0,0,0.78)",
  borderColor: "rgba(255,255,255,0.42)",
},

liveHudBtnText: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 13,
  textAlign: "center",
},

cameraSettingsPanel: {
  position: "absolute",
  padding: 16,
  borderRadius: 16,
  backgroundColor: "rgba(10,10,10,0.88)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.20)",
  zIndex: 30,
},

cameraSettingsHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 1,
},

cameraSettingsTitle: {
  color: "#ffffff",
  fontFamily: "Cinzel_700Bold",
  fontSize: 17,
},

cameraSettingsClose: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 24,
  paddingHorizontal: 6,
},

cameraSettingLabel: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
},

cameraEffectSection: {
  width: "100%",
  marginTop: 4,
},

cameraEffectSelector: {
  marginTop: 8,
  paddingVertical: 9,
  paddingHorizontal: 12,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.22)",
  backgroundColor: "rgba(255,255,255,0.08)",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

cameraEffectSelectorText: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
},

cameraEffectArrow: {
  color: "rgba(255,255,255,0.65)",
  fontSize: 11,
},

cameraEffectMenu: {
  marginTop: 6,
  borderRadius: 10,
  overflow: "hidden",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.16)",
  backgroundColor: "rgba(15,15,15,0.96)",
},

cameraEffectOption: {
  paddingVertical: 4,
  paddingHorizontal: 12,
},

cameraEffectOptionActive: {
  backgroundColor: "rgba(255,255,255,0.14)",
},

cameraEffectOptionText: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 13,
},

cameraSettingCompactRow: {
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
  minHeight: 28,
  gap: 10,
},

cameraSettingCompactLabel: {
  width: 120,
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 13,
},

cameraSettingCompactSlider: {
  flex: 1,
  height: 24,
},

cameraSettingCompactValue: {
  width: 24,
  color: "rgba(255,255,255,0.72)",
  fontFamily: "Inter_400Regular",
  fontSize: 13,
  textAlign: "right",
},

cameraToggleRow: {
  flexDirection: "row",
  gap: 8,
  marginTop: 5,
},

cameraToggleBtn: {
  flex: 1,
  paddingVertical: 3,
  paddingHorizontal: 10,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.20)",
  backgroundColor: "rgba(255,255,255,0.06)",
  alignItems: "center",
  justifyContent: "center",
},

cameraToggleBtnActive: {
  backgroundColor: "rgba(255,255,255,0.16)",
  borderColor: "rgba(255,255,255,0.40)",
},

cameraToggleText: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 13,
},

scanContent: {
  flex: 1,
  alignSelf: "center",
  alignItems: "stretch",
  paddingVertical: 36,
},

scanCamera: {
  width: "100%",
  flex: 1,
  marginVertical: 20,
  borderRadius: 16,
  overflow: "hidden",
},

settingsRoot: {
  flex: 1,
  backgroundColor: "Transparent",
},

settingsHeader: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
},

settingsTitle: {
  color: "#ffffff",
  fontFamily: "Cinzel_700Bold",
  fontSize: 28,
  marginTop: 32,
},

settingsCard: {
  width: "100%",
  padding: 16,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.12)",
  backgroundColor: "rgba(255,255,255,0.05)",
},

settingsScrollLandscape: {
  paddingVertical: 12,
},

settingsScrollTablet: {
  paddingHorizontal: 32,
},

settingsHeaderLandscape: {
  marginTop: 8,
},


settingsBackBtn: {
  marginTop: 32,
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 999,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.22)",
  backgroundColor: "rgba(255,255,255,0.08)",
},

settingsBackBtnText: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 13,
},

setupSettingsBtn: {
  position: "absolute",
  marginTop: 24,
  top: 0,
  right: 0,
  width: 42,
  height: 42,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,255,255,0.08)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.20)",
},

setupSettingsBtnText: {
  color: "#ffffff",
  fontSize: 18,
},

settingsSection: {
  marginTop: 28,
  width: "100%",
},

settingsSectionLabel: {
  color: "rgba(255,255,255,0.55)",
  fontFamily: "Inter_400Regular",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 1.2,
  marginBottom: 8,
},

settingsSectionDescription: {
  marginTop: 5,
  marginBottom: 14,
  color: "rgba(255,255,255,0.65)",
  fontFamily: "Inter_400Regular",
  fontSize: 13,
  lineHeight: 18,
},

settingsSectionTitle: {
  color: "#ffffff",
  fontFamily: "Cinzel_700Bold",
  fontSize: 18,
  marginBottom: 12,
},

settingsLanguageRow: {
  flexDirection: "row",
  gap: 10,
},

settingsLanguageBtn: {
  flex: 1,
  paddingVertical: 12,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.18)",
  backgroundColor: "transparent",
  alignItems: "center",
},

settingsLanguageBtnActive: {
  backgroundColor: "rgba(255,255,255,0.18)",
  borderColor: "rgba(255,255,255,0.35)",
},

settingsLanguageBtnText: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
},

settingsRow: {
  minHeight: 48,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

settingsRowText: {
  color: "#ffffff",
  fontFamily: "Inter_400Regular",
  fontSize: 14,
},

settingsRowArrow: {
  color: "rgba(255,255,255,0.55)",
  fontFamily: "Inter_400Regular",
  fontSize: 24,
},

settingsVersionText: {
  color: "rgba(255,255,255,0.55)",
  fontFamily: "Inter_400Regular",
  fontSize: 13,
},

settingsDivider: {
  height: 1,
  backgroundColor: "rgba(255,255,255,0.08)",
},

settingsPageScroll: {
  flex: 1,
  width: "100%",
},

settingsPageScrollContent: {
  flexGrow: 1,
  alignItems: "center",
  paddingVertical: 36,
  paddingHorizontal: 24,
},

settingsContent: {
  alignSelf: "center",
},
});