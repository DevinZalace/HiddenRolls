/**
 * provisioningService.js
 *
 * Service layer that wraps native provisioning functionality.
 * Provides a JavaScript interface to native Android Bluetooth provisioning methods
 * implemented in the HiddenRollsProvisioning Expo native module.
 *
 * Provisioning Flow:
 * 1. parseTrayQr() - Extract device info from QR code
 * 2. requestBluetoothPermissions() - Request user permission
 * 3. findTray() - Scan for tray over Bluetooth
 * 4. connectTray() - Establish Bluetooth connection
 * 5. scanWifiNetworks() - Get available Wi-Fi networks
 * 6. provisionWifi() - Send Wi-Fi credentials to tray
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

/**
 * Establishes a Bluetooth connection to the discovered tray
 * @returns {Promise<object>} Connection result
 */
export function connectTray() {
  return HiddenRollsProvisioning.connectTray();
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