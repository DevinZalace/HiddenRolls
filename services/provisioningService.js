/**
 * provisioningService.js
 *
 * Service layer that wraps native provisioning functionality.
 * Provides a JavaScript interface to the native Expo module for BLE setup,
 * local-network discovery, and Wi-Fi reset/reprovisioning.
 *
 * Setup Flow:
 * 1. parseTrayQr() - Extract device info from QR code
 * 2. requestBluetoothPermissions() - Request user permission
 * 3. findTray() - Scan for tray over Bluetooth
 * 4. connectTray() - Establish Bluetooth connection
 * 5. scanWifiNetworks() - Get networks visible to the tray
 * 6. provisionWifi() - Send Wi-Fi credentials to the tray
 * 7. waitForTrayReady() - Confirm the tray returned to the network
 *
 * Existing trays can be discovered with findExistingTrays(). A scanned tray
 * can have its saved Wi-Fi cleared with resetTrayWifi().
 */

import HiddenRollsProvisioning from "../modules/hidden-rolls-provisioning/src/HiddenRollsProvisioningModule";

/**
 * Parses a Hidden Rolls provisioning QR code
 * Extracts tray ID, provisioning name, proof of possession, and other device info
 * @param {string} payload - JSON string containing QR data
 * @returns {object} Parsed tray information
 */
export function parseTrayQr(payload) {
  return HiddenRollsProvisioning.parseQr(payload);
}

/**
 * Gets current Bluetooth adapter status
 * @returns {object} Status with keys: {supported, enabled, permissionsGranted}
 */
export function getBluetoothStatus() {
  return HiddenRollsProvisioning.getBluetoothStatus();
}

let setupCleanupPromise = null;

/**
 * Stops all native setup work and coalesces simultaneous cleanup requests.
 * @returns {Promise<void>} Resolves after BLE and provisioning state is cleared
 */
export function cancelTraySetup() {
  if (!setupCleanupPromise) {
    setupCleanupPromise = Promise.resolve()
      .then(() => HiddenRollsProvisioning.cancelTraySetup())
      .finally(() => {
        setupCleanupPromise = null;
      });
  }

  return setupCleanupPromise;
}

/**
 * Prompts user for Bluetooth-related permissions
 * @returns {Promise<object>} Updated Bluetooth status
 */
export async function requestBluetoothPermissions() {
  await HiddenRollsProvisioning.requestBluetoothPermissions();
  return HiddenRollsProvisioning.getBluetoothStatus();
}

/**
 * Scans for the tray device over Bluetooth Low Energy
 * @returns {Promise<object>} Device information if found
 */
export function findTray() {
  return HiddenRollsProvisioning.findTray();
}

/** Cancel native BLE discovery, if one is active. */
export function cancelTrayDiscovery() {
  return HiddenRollsProvisioning.cancelTrayDiscovery();
}

/**
 * Establishes a Bluetooth connection to the discovered tray.
 * @returns {Promise<object>} Connection result
 */
export function connectTray() {
  return HiddenRollsProvisioning.connectTray();
}

/** Cancel a pending native BLE connection attempt. */
export function cancelTrayConnection() {
  return HiddenRollsProvisioning.cancelTrayConnection();
}

/**
 * Scans for Wi-Fi networks visible to the connected tray
 * @returns {Promise<array>} List of available networks
 */
export function scanWifiNetworks() {
  return HiddenRollsProvisioning.scanWifiNetworks();
}

/**
 * Sends Wi-Fi credentials to the tray for provisioning
 * @param {string} ssid - Wi-Fi network name
 * @param {string} password - Wi-Fi network password
 * @returns {Promise<object>} Provisioning result
 */
export function provisionWifi(ssid, password) {
  return HiddenRollsProvisioning.provisionWifi(ssid, password);
}
/**
 * Scans for existing trays on the network
 * @returns {Promise<array>} List of discovered trays
 */
export function findExistingTrays() {
  return HiddenRollsProvisioning.findExistingTrays();
}

/** Cancel the active native Wi-Fi operation, if any. */
export function cancelTrayWifiOperation() {
  return HiddenRollsProvisioning.cancelTrayWifiOperation();
}

/**
 * Clears the Wi-Fi credentials saved on the tray identified by the last
 * scanned QR code. The native module supplies the retained proof of possession.
 *
 * @returns {Promise<object>}
 */
export function resetTrayWifi() {
  return HiddenRollsProvisioning.resetTrayWifi();

}