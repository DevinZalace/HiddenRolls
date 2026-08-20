package expo.modules.hiddenrollsprovisioning

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class HiddenRollsProvisioningModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("HiddenRollsProvisioning")

    Function("getPlatformStatus") {
      "HiddenRolls Android provisioning module loaded"
    }
  }
}