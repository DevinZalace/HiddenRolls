import HiddenRollsProvisioning from "../modules/hidden-rolls-provisioning/src/HiddenRollsProvisioningModule";

export function parseTrayQr(payload) {
  return HiddenRollsProvisioning.parseQr(payload);
}
