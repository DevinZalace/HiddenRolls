import HiddenRollsProvisioning from "../modules/hidden-rolls-provisioning/src/HiddenRollsProvisioningModule";

export function parseTrayQr(payload) {
  return HiddenRollsProvisioning.parseQr(payload);
}

export function getBluetoothStatus() {
  return HiddenRollsProvisioning.getBluetoothStatus();
}

export async function requestBluetoothPermissions() {
  await HiddenRollsProvisioning.requestBluetoothPermissions();

  return HiddenRollsProvisioning.getBluetoothStatus();
}

export function findTray() {
  return HiddenRollsProvisioning.findTray();
}