import AsyncStorage from "@react-native-async-storage/async-storage";

const PAIRED_TRAY_STORAGE_KEY =
  "hiddenRolls.pairedTray";

// The paired record contains only reconnectable tray metadata. Wi-Fi
// credentials and the provisioning proof of possession remain on the tray or
// in the native provisioning module, not in AsyncStorage.

/** Loads and validates the tray selected for direct access from the app. */
export async function loadPairedTray() {
  try {
    const storedValue =
      await AsyncStorage.getItem(
        PAIRED_TRAY_STORAGE_KEY
      );

    if (!storedValue) {
      return null;
    }

    const tray = JSON.parse(storedValue);

    if (
      tray?.schemaVersion !== 1 ||
      !tray?.trayId ||
      !tray?.hostname
    ) {
      return null;
    }

    return tray;
  } catch (error) {
    console.error(
      "Failed to load paired tray:",
      error
    );

    return null;
  }
}

/** Persists the validated tray metadata used by the live view and discovery. */
export async function savePairedTray(tray) {
  await AsyncStorage.setItem(
    PAIRED_TRAY_STORAGE_KEY,
    JSON.stringify(tray)
  );
}

/** Removes the app's pairing without changing the tray's Wi-Fi configuration. */
export async function forgetPairedTray() {
  await AsyncStorage.removeItem(
    PAIRED_TRAY_STORAGE_KEY
  );
}