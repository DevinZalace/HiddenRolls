import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
  ImageBackground,
} from "react-native";
import { useState } from "react";
import { styles } from "../theme/styles";
import appConfig from "../../app.json";




export function SettingsScreen({
  navigation,
  t,
  language,
  setLanguage,
}) {

  const [infoModal, setInfoModal] = useState(null);

  const { width, height } = useWindowDimensions();

  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 600;

  const horizontalPadding = isTablet ? 32 : 24;

  const settingsContentWidth = Math.min(
    width - horizontalPadding * 2,
    720
  );

  const settingsBackground = isLandscape
    ? require("../../assets/AdobeStock_2002930874.png")
    : require("../../assets/AdobeStock_200293087412.png");


  return (
    <ImageBackground
      source={settingsBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <View
        pointerEvents="none"
        style={styles.BackgroundOverlay}
      />

      <View style={styles.settingsRoot}>
      <ScrollView
        style={styles.settingsPageScroll}
        contentContainerStyle={[
          styles.settingsPageScrollContent,
          isLandscape && styles.settingsScrollLandscape,
          isTablet && styles.settingsScrollTablet,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.settingsContent,
            { width: settingsContentWidth },
          ]}
        >
      <View style={styles.settingsHeader}>
      <Text
        style={[
          styles.settingsTitle,
          isLandscape && styles.settingsHeaderLandscape,
        ]}
      >
        {t.settings}
      </Text>

      <Pressable
        style={[
          styles.settingsBackBtn,
          isLandscape && styles.settingsHeaderLandscape,
        ]}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.settingsBackBtnText}>
          {t.back}
        </Text>
      </Pressable>
      </View>
      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionLabel}>
          {t.appSettings}
        </Text>

        <View style={styles.settingsCard}>
          <Text style={styles.settingsSectionTitle}>
            {t.language}
          </Text>

          <Text style={styles.settingsSectionDescription}>
            {t.languageDescription}
          </Text>

          <View style={styles.settingsLanguageRow}>
            <Pressable
              style={[
                styles.settingsLanguageBtn,
                language === "en" &&
                  styles.settingsLanguageBtnActive,
              ]}
              onPress={() => setLanguage("en")}
            >
              <Text style={styles.settingsLanguageBtnText}>
                English
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.settingsLanguageBtn,
                language === "es" &&
                  styles.settingsLanguageBtnActive,
              ]}
              onPress={() => setLanguage("es")}
            >
              <Text style={styles.settingsLanguageBtnText}>
                Español
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionLabel}>
            {t.about}
          </Text>

          <View style={styles.settingsCard}>
            <Pressable
              style={styles.settingsRow}
              onPress={() =>
                setInfoModal({
                  title: t.termsOfUse,
                  body: t.termsBody,
                })
              }
            >
              <Text style={styles.settingsRowText}>
                {t.termsOfUse}
              </Text>

              <Text style={styles.settingsRowArrow}>
                ›
              </Text>
            </Pressable>

            <View style={styles.settingsDivider} />

            <Pressable
              style={styles.settingsRow}
              onPress={() =>
                setInfoModal({
                  title: t.privacyPolicy,
                  body: t.privacyPolicyText,
                })
              }
            >
              <Text style={styles.settingsRowText}>
                {t.privacyPolicy}
              </Text>

              <Text style={styles.settingsRowArrow}>
                ›
              </Text>
            </Pressable>

            <View style={styles.settingsDivider} />

            <Pressable
              style={styles.settingsRow}
              onPress={() =>
                setInfoModal({
                  title: t.support,
                  body: t.supportText,
                  linkLabel: "dtmfc.com",
                  linkUrl: "https://dtmfc.com",
                })
              }
            >
              <Text style={styles.settingsRowText}>
                {t.support}
              </Text>

              <Text style={styles.settingsRowArrow}>
                ›
              </Text>
            </Pressable>

            <View style={styles.settingsDivider} />

            <View style={styles.settingsRow}>
              <Text style={styles.settingsRowText}>
                Hidden Rolls
              </Text>

              <Text style={styles.settingsVersionText}>
                v{appConfig.expo.version}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <Modal
        visible={infoModal !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {infoModal?.title}
            </Text>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.modalText}>
                {infoModal?.body}
              </Text>
            </ScrollView>

            {infoModal?.linkUrl && (
              <Pressable
                onPress={() => Linking.openURL(infoModal.linkUrl)}
              >
                <Text style={styles.modalLinkText}>
                  {infoModal.linkLabel}
                </Text>
              </Pressable>
            )}

            <View style={styles.modalBtnRow}>
              <Pressable
                style={[
                  styles.modalBtn,
                  styles.modalBtnPrimary,
                ]}
                onPress={() => setInfoModal(null)}
              >
                <Text style={styles.modalBtnText}>
                  {t.ok}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </ScrollView>
    </View>
</ImageBackground>
  );
}