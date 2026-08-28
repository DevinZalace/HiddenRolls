package expo.modules.hiddenrollsprovisioning

import com.espressif.provisioning.ESPConstants
import com.espressif.provisioning.ESPDevice
import com.espressif.provisioning.ESPProvisionManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import org.json.JSONObject
import android.Manifest
import android.bluetooth.BluetoothManager
import android.content.Context
import android.os.Build
import expo.modules.interfaces.permissions.Permissions
import expo.modules.kotlin.Promise
import android.bluetooth.BluetoothDevice
import android.bluetooth.le.ScanResult
import android.os.Handler
import android.os.Looper

import com.espressif.provisioning.listeners.BleScanListener

class HiddenRollsProvisioningModule : Module() {
  private var espDevice: ESPDevice? = null

  private fun requiredBluetoothPermissions(): Array<String> {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      arrayOf(
        Manifest.permission.BLUETOOTH_SCAN,
        Manifest.permission.BLUETOOTH_CONNECT
      )
    } else {
      arrayOf(
        Manifest.permission.ACCESS_FINE_LOCATION
      )
    }
  }

  private fun buildBluetoothStatus(): Map<String, Any> {
    val context = appContext.reactContext
      ?: throw IllegalStateException(
        "Android application context is unavailable."
      )

    val bluetoothManager =
      context.getSystemService(Context.BLUETOOTH_SERVICE)
        as? BluetoothManager

    val bluetoothAdapter = bluetoothManager?.adapter
    val supported = bluetoothAdapter != null

    val permissionsGranted =
      appContext.permissions?.hasGrantedPermissions(
        *requiredBluetoothPermissions()
      ) ?: false

    val enabled =
      if (!supported) {
        false
      } else if (
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.S &&
        !permissionsGranted
      ) {
        false
      } else {
        try {
          bluetoothAdapter?.isEnabled == true
        } catch (_: SecurityException) {
          false
        }
      }

    return mapOf(
      "supported" to supported,
      "enabled" to enabled,
      "permissionsGranted" to permissionsGranted
    )
  }

  override fun definition() = ModuleDefinition {
    Name("HiddenRollsProvisioning")

  AsyncFunction("findTray") { promise: Promise ->
    val device = espDevice

    if (device == null) {
      promise.reject(
        "ERR_NO_TRAY",
        "Scan a Hidden Rolls QR code before searching for the tray.",
        null
      )
      return@AsyncFunction
    }

    val reactContext = appContext.reactContext

    if (reactContext == null) {
      promise.reject(
        "ERR_NO_CONTEXT",
        "Android application context is unavailable.",
        null
      )
      return@AsyncFunction
    }

    val expectedName = device.getDeviceName()

    if (expectedName.isNullOrBlank()) {
      promise.reject(
        "ERR_NO_DEVICE_NAME",
        "The scanned tray does not have a provisioning name.",
        null
      )
      return@AsyncFunction
    }

    val provisionManager =
      ESPProvisionManager.getInstance(reactContext)

    val mainHandler =
      Handler(Looper.getMainLooper())

    val maxAttempts = 3

    var finished = false
    var sawMatchingTray = false
    val discoveredNames = mutableSetOf<String>()

    fun startScanAttempt(attempt: Int) {
      if (finished) {
        return
      }

      mainHandler.post {
        if (!finished) {
          provisionManager.searchBleEspDevices(
            object : BleScanListener {

              override fun scanStartFailed() {
                if (finished) {
                  return
                }

                finished = true

                promise.reject(
                  "ERR_BLE_SCAN_START",
                  "Bluetooth scanning could not be started.",
                  null
                )
              }

              override fun onPeripheralFound(
                bluetoothDevice: BluetoothDevice,
                scanResult: ScanResult
              ) {
                if (finished) {
                  return
                }

                val scanRecord =
                  scanResult.getScanRecord() ?: return

                val discoveredName =
                  scanRecord.getDeviceName() ?: "<unnamed>"

                discoveredNames.add(discoveredName)

                if (discoveredName != expectedName) {
                  return
                }

                sawMatchingTray = true

                val serviceUuid =
                  scanRecord.getServiceUuids()
                    ?.firstOrNull()
                    ?.toString()

                // We found the correct tray, but keep scanning if this
                // advertisement did not include its provisioning UUID.
                if (serviceUuid.isNullOrBlank()) {
                  return
                }

                device.setBluetoothDevice(bluetoothDevice)
                device.setPrimaryServiceUuid(serviceUuid)

                finished = true

                provisionManager.stopBleScan()

                promise.resolve(
                  mapOf(
                    "provisioningName" to discoveredName,
                    "serviceUuid" to serviceUuid
                  )
                )
              }

              override fun scanCompleted() {
                if (finished) {
                  return
                }

                if (attempt < maxAttempts) {
                  mainHandler.postDelayed(
                    {
                      startScanAttempt(attempt + 1)
                    },
                    500
                  )

                  return
                }

                finished = true

                if (sawMatchingTray) {
                  promise.reject(
                    "ERR_SERVICE_UUID_MISSING",
                    "$expectedName was found, but its provisioning service UUID was not advertised.",
                    null
                  )
                } else {
                  promise.reject(
                    "ERR_TRAY_NOT_FOUND",
                    "$expectedName was not found over Bluetooth. Devices seen: ${discoveredNames.joinToString(", ")}",
                    null
                  )
                }
              }

              override fun onFailure(error: Exception) {
                if (finished) {
                  return
                }

                if (attempt < maxAttempts) {
                  mainHandler.postDelayed(
                    {
                      startScanAttempt(attempt + 1)
                    },
                    500
                  )

                  return
                }

                finished = true

                promise.reject(
                  "ERR_BLE_SCAN",
                  "Bluetooth scanning failed.",
                  error
                )
              }
            }
          )
        }
      }
    }

    startScanAttempt(1)
  }

    Function("getBluetoothStatus") {
      buildBluetoothStatus()
    }

    AsyncFunction("requestBluetoothPermissions") { promise: Promise ->
      Permissions.askForPermissionsWithPermissionsManager(
        appContext.permissions,
        promise,
        *requiredBluetoothPermissions()
      )
    }

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

      val provisionManager = ESPProvisionManager.getInstance(reactContext)

      espDevice = provisionManager.createESPDevice(
        ESPConstants.TransportType.TRANSPORT_BLE,
        ESPConstants.SecurityType.SECURITY_1
      )

      espDevice?.setDeviceName(provisioningName)
      espDevice?.setProofOfPossession(proofOfPossession)

      val trayId = provisioningName.removePrefix("PROV_HR_")

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
