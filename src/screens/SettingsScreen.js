import { Pressable, Text, View } from "react-native";
import { styles } from "../theme/styles";


export function SettingsScreen({
  navigation,
  t,
  language,
  setLanguage,
}) {
  return (
    <View style={styles.settingsRoot}>
      <View style={styles.settingsHeader}>
        <Text style={styles.settingsTitle}>
          {t.settings}
        </Text>

        <Pressable
          style={styles.settingsBackBtn}
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
      </View>
    </View>
  );
}