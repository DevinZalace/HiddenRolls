package expo.modules.hiddenrollsprovisioning

import com.espressif.provisioning.ESPConstants
import com.espressif.provisioning.ESPDevice
import com.espressif.provisioning.ESPProvisionManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject

class HiddenRollsProvisioningModule : Module() {
  private var espDevice: ESPDevice? = null

  override fun definition() = ModuleDefinition {
    Name("HiddenRollsProvisioning")

    Function("parseQr") { payload: String ->
      val qrData = JSONObject(payload)

      val version = qrData.optString("ver")
      val provisioningName = qrData.optString("name")
      val proofOfPossession = qrData.optString("pop")
      val transport = qrData.optString("transport")
      val security = qrData.optInt("security", -1)

      require(version == "v1") {
        "Unsupported provisioning QR version."
      }

      require(provisioningName.startsWith("PROV_HR_")) {
        "QR code is not for a HiddenRolls tray."
      }

      require(proofOfPossession.isNotBlank()) {
        "Provisioning QR is missing proof of possession."
      }

      require(transport.equals("ble", ignoreCase = true)) {
        "HiddenRolls requires BLE provisioning."
      }

      require(security == 1) {
        "HiddenRolls requires Security 1 provisioning."
      }

      val reactContext = appContext.reactContext
        ?: throw IllegalStateException(
          "Android application context is unavailable."
        )

      val provisionManager =
        ESPProvisionManager.getInstance(reactContext)

      espDevice = provisionManager.createESPDevice(
        ESPConstants.TransportType.TRANSPORT_BLE,
        ESPConstants.SecurityType.SECURITY_1
      )

      espDevice?.setDeviceName(provisioningName)
      espDevice?.setProofOfPossession(proofOfPossession)

      val trayId =
        provisioningName.removePrefix("PROV_HR_")

      mapOf(
        "trayId" to trayId,
        "provisioningName" to provisioningName,
        "hostname" to "hiddenrolls-${trayId.lowercase()}.local",
        "transport" to "ble",
        "security" to 1
      )
    }
  }
}