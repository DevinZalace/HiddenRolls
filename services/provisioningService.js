import HiddenRollsProvisioning from "../modules/hidden-rolls-provisioning/src/HiddenRollsProvisioningModule";

export function getProvisioningPlatformStatus() {
  return HiddenRollsProvisioning.getPlatformStatus();
}