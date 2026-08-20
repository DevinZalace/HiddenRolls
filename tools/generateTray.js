const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");

const TRAY_ID_LENGTH = 6;
const POP_LENGTH = 16;

const TRAY_ID_CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const POP_CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function generateRandomString(length, alphabet) {
  let result = "";

  for (let index = 0; index < length; index += 1) {
    const randomIndex = crypto.randomInt(0, alphabet.length);
    result += alphabet[randomIndex];
  }

  return result;
}

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

function buildProvisioningPayload(identity) {
  return {
    ver: "v1",
    name: identity.provisioningName,
    pop: identity.proofOfPossession,
    transport: "ble",
    security: 1,
  };
}

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