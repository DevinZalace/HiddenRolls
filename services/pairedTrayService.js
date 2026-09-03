import AsyncStorage from "@react-native-async-storage/async-storage";

const PAIRED_TRAY_STORAGE_KEY =
  "hiddenRolls.pairedTray";

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

export async function savePairedTray(tray) {
  await AsyncStorage.setItem(
    PAIRED_TRAY_STORAGE_KEY,
    JSON.stringify(tray)
  );
}

export async function forgetPairedTray() {
  await AsyncStorage.removeItem(
    PAIRED_TRAY_STORAGE_KEY
  );
}