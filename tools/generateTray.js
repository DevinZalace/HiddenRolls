/**
 * generateTray.js
 *
 * Device provisioning tool that generates unique identities for each Hidden Rolls tray.
 * Runs once per tray to create:
 * - Random tray ID (6 characters)
 * - Random proof of possession (16 characters)
 * - Provisioning QR code (encodes tray config)
 * - Firmware configuration header with device secrets
 *
 * Usage: node tools/generateTray.js
 *
 * Output:
 * - firmware/CameraWebServer1/tray_config.h (ESP32 firmware config)
 * - device_artifacts/{TRAY_ID}/provisioning_qr.png (QR code image)
 *
 * The QR code is scanned by the mobile app to initiate Bluetooth provisioning.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

// ===== Constants =====
// Tray ID: 6 random uppercase letters/numbers (easy to read/say)
const TRAY_ID_LENGTH = 6;

// Proof of Possession: 16 random characters (higher entropy for security)
const POP_LENGTH = 16;

// Character sets exclude easily-confused characters (O/0, I/1, etc.)
const TRAY_ID_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const POP_CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

/**
 * Generates a random string of specified length from given alphabet.
 * Uses crypto.randomInt for cryptographically secure randomness.
 *
 * @param {number} length - Number of characters to generate
 * @param {string} alphabet - Character set to choose from
 * @returns {string} Random string
 */
function generateRandomString(length, alphabet) {
  let result = "";

  for (let index = 0; index < length; index += 1) {
    const randomIndex = crypto.randomInt(0, alphabet.length);
    result += alphabet[randomIndex];
  }

  return result;
}

/**
 * Creates a unique identity for a tray.
 * Generates tray ID, provisioning name, mDNS hostname, and proof of possession.
 *
 * @returns {object} Tray identity object with:
 *   - trayId: 6-char unique identifier (e.g., "ABC123")
 *   - provisioningName: BLE name for discovery (e.g., "PROV_HR_ABC123")
 *   - hostname: mDNS hostname (e.g., "hiddenrolls-abc123.local")
 *   - displayName: User-friendly name (e.g., "Hidden Rolls ABC123")
 *   - proofOfPossession: 16-char secret for security
 */
function createTrayIdentity() {
  const trayId = generateRandomString(
    TRAY_ID_LENGTH,
    TRAY_ID_CHARACTERS
  );

  const proofOfPossession = generateRandomString(
    POP_LENGTH,
    POP_CHARACTERS
  );

  return {
    trayId,
    provisioningName: `PROV_HR_${trayId}`,
    hostname: `hiddenrolls-${trayId.toLowerCase()}`,
    displayName: `Hidden Rolls ${trayId}`,
    proofOfPossession,
  };
}

/**
 * Builds a C/C++ header file containing tray configuration constants.
 * This file is compiled into the ESP32 firmware and defines device identity.
 *
 * @param {object} identity - Tray identity object
 * @returns {string} C header file content
 */
function buildTrayConfig(identity) {
  return `#pragma once

// AUTO-GENERATED FILE.
// Contains tray-specific provisioning identity and secrets.
// Do not commit this file.

#define HR_TRAY_ID "${identity.trayId}"
#define HR_PROV_NAME "${identity.provisioningName}"
#define HR_MDNS_HOSTNAME "${identity.hostname}"
#define HR_DISPLAY_NAME "${identity.displayName}"
#define HR_PROV_POP "${identity.proofOfPossession}"
`;
}

/**
 * Builds the QR code payload object.
 * Encodes provisioning parameters that the mobile app scans and processes.
 *
 * @param {object} identity - Tray identity object
 * @returns {object} Provisioning payload with:
 *   - ver: Protocol version ("v1")
 *   - name: Bluetooth provisioning name
 *   - pop: Proof of possession for security
 *   - transport: Always "ble" (Bluetooth Low Energy)
 *   - security: Security version (1)
 */
function buildProvisioningPayload(identity) {
  return {
    ver: "v1",
    name: identity.provisioningName,
    pop: identity.proofOfPossession,
    transport: "ble",
    security: 1,
  };
}

/**
 * Main entry point.
 * Generates tray identity, creates firmware config file, and generates QR code image.
 */
async function main() {
  const identity = createTrayIdentity();

  const projectRoot = path.resolve(__dirname, "..");

  const firmwareConfigPath = path.join(
    projectRoot,
    "firmware",
    "CameraWebServer1",
    "tray_config.h"
  );

  const artifactDirectory = path.join(
    projectRoot,
    "device_artifacts",
    identity.trayId
  );

  const qrPath = path.join(
    artifactDirectory,
    "provisioning_qr.png"
  );

  fs.mkdirSync(artifactDirectory, {
    recursive: true,
  });

  fs.writeFileSync(
    firmwareConfigPath,
    buildTrayConfig(identity),
    "utf8"
  );

  const provisioningPayload =
    buildProvisioningPayload(identity);

  await QRCode.toFile(
    qrPath,
    JSON.stringify(provisioningPayload),
    {
      width: 800,
      margin: 4,
      errorCorrectionLevel: "M",
    }
  );

  console.log(
    `Generated HiddenRolls tray ${identity.trayId}`
  );

  console.log(
    `Firmware config: ${firmwareConfigPath}`
  );

  console.log(
    `Provisioning QR: ${qrPath}`
  );
}

main().catch((error) => {
  console.error(
    "Unable to generate tray configuration:",
    error
  );

  process.exitCode = 1;
});