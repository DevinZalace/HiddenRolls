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
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import expo.modules.interfaces.permissions.Permissions
import expo.modules.kotlin.Promise
import android.bluetooth.BluetoothDevice
import android.bluetooth.le.ScanResult
import android.os.Handler
import android.os.Looper

import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import org.greenrobot.eventbus.ThreadMode

import com.espressif.provisioning.DeviceConnectionEvent
import com.espressif.provisioning.listeners.BleScanListener
import com.espressif.provisioning.WiFiAccessPoint
import com.espressif.provisioning.listeners.WiFiScanListener
import com.espressif.provisioning.listeners.ProvisionListener

/**
 * HiddenRollsProvisioningModule
 *
 * Exposes native Android Bluetooth provisioning capabilities for Hidden Rolls camera trays.
 * This module handles:
 * - Parsing QR codes to extract device provisioning information
 * - Scanning for and discovering trays over Bluetooth Low Energy (BLE)
 * - Establishing Bluetooth connections to trays for provisioning
 * - Managing Bluetooth permissions and status
 *
 * The provisioning flow is: parseQr() -> findTray() -> connectTray()
 */
class HiddenRollsProvisioningModule : Module() {
  // The current tray device being provisioned
  private var espDevice: ESPDevice? = null
  // Promise for the active connection attempt
  private var connectionPromise: Promise? = null

  // Handler for posting tasks on the main thread
  private val connectionHandler =
    Handler(Looper.getMainLooper())

  // Timeout runnable for connection attempts
  private var connectionTimeout: Runnable? = null

  /**
   * Returns the array of Bluetooth permissions required for this device's Android API level.
   * Android 12+ requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT.
   * Pre-Android 12 requires ACCESS_FINE_LOCATION for BLE scanning.
   */
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

  /**
   * Builds a status map containing the current Bluetooth state:
   * - supported: Whether device has Bluetooth hardware
   * - enabled: Whether Bluetooth is currently enabled and permitted
   * - permissionsGranted: Whether all required permissions are granted
   */
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

  /**
   * Cleans up after a connection attempt by:
   * - Canceling any pending timeout
   * - Clearing the stored promise
   * - Unregistering from EventBus to stop listening for connection events
   */
  private fun finishConnectionAttempt() {
    connectionTimeout?.let {
      connectionHandler.removeCallbacks(it)
    }

    connectionTimeout = null
    connectionPromise = null

    val eventBus = EventBus.getDefault()

    if (eventBus.isRegistered(this)) {
      eventBus.unregister(this)
    }
  }

  /**
   * EventBus subscriber for Bluetooth connection state changes.
   * Handles three events:
   * - CONNECTED: Connection succeeded
   * - CONNECTION_FAILED: Connection attempt failed
   * - DISCONNECTED: Device disconnected unexpectedly
   */
  @Subscribe(threadMode = ThreadMode.MAIN)
  fun onDeviceConnectionEvent(event: DeviceConnectionEvent) {
    val promise = connectionPromise ?: return

    when (event.getEventType()) {
      ESPConstants.EVENT_DEVICE_CONNECTED -> {
        promise.resolve(
          mapOf(
            "connected" to true
          )
        )

        finishConnectionAttempt()
      }

      ESPConstants.EVENT_DEVICE_CONNECTION_FAILED -> {
        promise.reject(
          "ERR_BLE_CONNECTION_FAILED",
          "Hidden Rolls could not connect to the tray over Bluetooth.",
          null
        )

        finishConnectionAttempt()
      }

      ESPConstants.EVENT_DEVICE_DISCONNECTED -> {
        promise.reject(
          "ERR_BLE_DISCONNECTED",
          "The tray disconnected before setup could begin.",
          null
        )

        finishConnectionAttempt()
      }
    }
  }

  /**
   * Defines the module's exported functions and properties that are accessible from JavaScript/TypeScript.
   */
  override fun definition() = ModuleDefinition {
    Name("HiddenRollsProvisioning")

    /**
     * AsyncFunction: findExistingTrays
     * Discovers already-provisioned Hidden Rolls trays on the local network.
     */
    AsyncFunction("findExistingTrays") { promise: Promise ->
      val context = appContext.reactContext

      if (context == null) {
        promise.reject(
          "ERR_NO_CONTEXT",
          "Android application context is unavailable.",
          null
        )

        return@AsyncFunction
      }

      val nsdManager =
        context.getSystemService(Context.NSD_SERVICE)
          as? NsdManager

      if (nsdManager == null) {
        promise.reject(
          "ERR_NSD_UNAVAILABLE",
          "Network service discovery is unavailable on this device.",
          null
        )

        return@AsyncFunction
      }

      val serviceType = "_hiddenrolls._tcp."
      val discoveredServices =
        linkedMapOf<String, NsdServiceInfo>()

      val results =
        mutableListOf<Map<String, Any>>()

      val handler =
        Handler(Looper.getMainLooper())

      var finished = false

      lateinit var discoveryListener:
        NsdManager.DiscoveryListener

      fun resolveServices(
        services: List<NsdServiceInfo>,
        index: Int = 0
      ) {
        if (index >= services.size) {
          finished = true
          promise.resolve(results)
          return
        }

        val service = services[index]

        try {
          nsdManager.resolveService(
            service,
            object : NsdManager.ResolveListener {

              override fun onResolveFailed(
                serviceInfo: NsdServiceInfo,
                errorCode: Int
              ) {
                resolveServices(
                  services,
                  index + 1
                )
              }

              override fun onServiceResolved(
                serviceInfo: NsdServiceInfo
              ) {
                val trayId =
                  serviceInfo.attributes["id"]
                    ?.toString(Charsets.UTF_8)
                    ?.trim()

                val serviceVersion =
                  serviceInfo.attributes["ver"]
                    ?.toString(Charsets.UTF_8)
                    ?.trim()

                if (!trayId.isNullOrBlank()) {
                  results.add(
                    mapOf(
                      "trayId" to trayId,
                      "displayName" to
                        serviceInfo.serviceName,
                      "provisioningName" to
                        "PROV_HR_$trayId",
                      "hostname" to
                        "hiddenrolls-${trayId.lowercase()}.local",
                      "port" to
                        serviceInfo.port,
                      "serviceVersion" to
                        (serviceVersion ?: "")
                    )
                  )
                }

                resolveServices(
                  services,
                  index + 1
                )
              }
            }
          )
        } catch (_: Exception) {
          resolveServices(
            services,
            index + 1
          )
        }
      }

      discoveryListener =
        object : NsdManager.DiscoveryListener {

          override fun onDiscoveryStarted(
            serviceType: String
          ) {
            // Discovery successfully started.
          }

          override fun onServiceFound(
            serviceInfo: NsdServiceInfo
          ) {
            discoveredServices[
              serviceInfo.serviceName
            ] = serviceInfo
          }

          override fun onServiceLost(
            serviceInfo: NsdServiceInfo
          ) {
            discoveredServices.remove(
              serviceInfo.serviceName
            )
          }

          override fun onDiscoveryStopped(
            serviceType: String
          ) {
            // Discovery stopped intentionally.
          }

          override fun onStartDiscoveryFailed(
            serviceType: String,
            errorCode: Int
          ) {
            if (finished) {
              return
            }

            finished = true

            try {
              nsdManager.stopServiceDiscovery(
                discoveryListener
              )
            } catch (_: Exception) {
              // Discovery may not have started.
            }

            promise.reject(
              "ERR_NSD_DISCOVERY_START",
              "Hidden Rolls tray discovery could not be started. Error code: $errorCode",
              null
            )
          }

          override fun onStopDiscoveryFailed(
            serviceType: String,
            errorCode: Int
          ) {
            // Resolution can still continue with
            // services already discovered.
          }
        }

      try {
        nsdManager.discoverServices(
          serviceType,
          NsdManager.PROTOCOL_DNS_SD,
          discoveryListener
        )
      } catch (error: Exception) {
        finished = true

        promise.reject(
          "ERR_NSD_DISCOVERY",
          "Hidden Rolls tray discovery could not be started.",
          error
        )

        return@AsyncFunction
      }

      handler.postDelayed(
        {
          if (finished) {
            return@postDelayed
          }

          try {
            nsdManager.stopServiceDiscovery(
              discoveryListener
            )
          } catch (_: Exception) {
            // Continue with anything already found.
          }

          val services =
            discoveredServices.values.toList()

          if (services.isEmpty()) {
            finished = true
            promise.resolve(emptyList<Any>())
          } else {
            resolveServices(services)
          }
        },
        5000
      )
    }

    /**
     * AsyncFunction: findTray
     * Scans for a Bluetooth device matching the parsed QR code provisioning name.
     * Performs up to 3 scan attempts with 500ms delays between retries.
     * Returns the device's provisioning name and service UUID when found.
     */
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

    /**
     * AsyncFunction: connectTray
     * Establishes a Bluetooth connection to the discovered tray device.
     * Registers for connection events via EventBus and enforces a 15-second timeout.
     * The actual connection result is delivered via onDeviceConnectionEvent().
     */
    AsyncFunction("connectTray") { promise: Promise ->
      val device = espDevice

  if (device == null) {
    promise.reject(
      "ERR_NO_TRAY",
      "Find a Hidden Rolls tray before connecting.",
      null
    )

    return@AsyncFunction
  }

  val bluetoothDevice =
    device.getBluetoothDevice()

  if (bluetoothDevice == null) {
    promise.reject(
      "ERR_TRAY_NOT_DISCOVERED",
      "The tray has not been found over Bluetooth yet.",
      null
    )

    return@AsyncFunction
  }

  val serviceUuid =
    device.getPrimaryServiceUuid()

  if (serviceUuid.isNullOrBlank()) {
    promise.reject(
      "ERR_SERVICE_UUID_MISSING",
      "The tray provisioning service is unavailable.",
      null
    )

    return@AsyncFunction
  }

  if (connectionPromise != null) {
    promise.reject(
      "ERR_CONNECTION_IN_PROGRESS",
      "A tray connection is already in progress.",
      null
    )

    return@AsyncFunction
  }

  val eventBus =
    EventBus.getDefault()

  val module =
    this@HiddenRollsProvisioningModule

  if (!eventBus.isRegistered(module)) {
    eventBus.register(module)
  }

  connectionPromise = promise

  val timeout = Runnable {
    val activePromise =
      connectionPromise ?: return@Runnable

    activePromise.reject(
      "ERR_BLE_CONNECTION_TIMEOUT",
      "Bluetooth connection to the tray timed out.",
      null
    )

    device.disconnectDevice()

    finishConnectionAttempt()
  }

  connectionTimeout = timeout

  connectionHandler.postDelayed(
    timeout,
    15000
  )

  connectionHandler.post {
    try {
      device.connectBLEDevice(
        bluetoothDevice,
        serviceUuid
      )
    } catch (error: Exception) {
      val activePromise =
        connectionPromise

      if (activePromise != null) {
        activePromise.reject(
          "ERR_BLE_CONNECTION",
          "Bluetooth connection to the tray could not be started.",
          error
        )
      }

      finishConnectionAttempt()
    }
  }
}

AsyncFunction("scanWifiNetworks") { promise: Promise ->
  val device = espDevice

  if (device == null) {
    promise.reject(
      "ERR_NO_TRAY",
      "Connect to a Hidden Rolls tray before scanning Wi-Fi networks.",
      null
    )

    return@AsyncFunction
  }

  var finished = false

  val timeout = Runnable {
    if (finished) {
      return@Runnable
    }

    finished = true

    promise.reject(
      "ERR_WIFI_SCAN_TIMEOUT",
      "The tray took too long to scan for Wi-Fi networks.",
      null
    )
  }

  connectionHandler.postDelayed(
    timeout,
    30000
  )

  connectionHandler.post {
    try {
      device.scanNetworks(
        object : WiFiScanListener {

          override fun onWifiListReceived(
            wifiList: ArrayList<WiFiAccessPoint>
          ) {
            if (finished) {
              return
            }

            finished = true
            connectionHandler.removeCallbacks(timeout)

            val networks =
              wifiList
                .filter {
                  it.getWifiName().isNotBlank()
                }
                .groupBy {
                  it.getWifiName()
                }
                .map { (_, accessPoints) ->
                  accessPoints.maxByOrNull {
                    it.getRssi()
                  }!!
                }
                .sortedByDescending {
                  it.getRssi()
                }
                .map {
                  mapOf(
                    "ssid" to it.getWifiName(),
                    "rssi" to it.getRssi(),
                    "security" to it.getSecurity()
                  )
                }

            promise.resolve(networks)
          }

          override fun onWiFiScanFailed(
            error: Exception
          ) {
            if (finished) {
              return
            }

            finished = true
            connectionHandler.removeCallbacks(timeout)

            promise.reject(
              "ERR_WIFI_SCAN",
              "Hidden Rolls could not scan for nearby Wi-Fi networks.",
              error
            )
          }
        }
      )
    } catch (error: Exception) {
      if (finished) {
        return@post
      }

      finished = true
      connectionHandler.removeCallbacks(timeout)

      promise.reject(
        "ERR_WIFI_SCAN",
        "Wi-Fi scanning could not be started.",
        error
      )
    }
  }
}

AsyncFunction("provisionWifi") { ssid: String, password: String, promise: Promise ->
  val device = espDevice

  if (device == null) {
    promise.reject(
      "ERR_NO_TRAY",
      "Connect to a Hidden Rolls tray before provisioning Wi-Fi.",
      null
    )

    return@AsyncFunction
  }

  if (ssid.isBlank()) {
    promise.reject(
      "ERR_INVALID_SSID",
      "A Wi-Fi network name is required.",
      null
    )

    return@AsyncFunction
  }

  var finished = false

  val timeout = Runnable {
    if (finished) {
      return@Runnable
    }

    finished = true

    promise.reject(
      "ERR_PROVISION_TIMEOUT",
      "Wi-Fi provisioning timed out.",
      null
    )
  }

  connectionHandler.postDelayed(
    timeout,
    60000
  )

  fun fail(
    code: String,
    message: String,
    error: Exception?
  ) {
    if (finished) {
      return
    }

    finished = true
    connectionHandler.removeCallbacks(timeout)

    promise.reject(
      code,
      message,
      error
    )
  }

  connectionHandler.post {
    try {
      device.provision(
        ssid,
        password,
        object : ProvisionListener {

          override fun createSessionFailed(error: Exception) {
            fail(
              "ERR_PROVISION_SESSION",
              "Hidden Rolls could not establish a secure provisioning session.",
              error
            )
          }

          override fun wifiConfigSent() {
            // Credentials successfully reached the tray.
            // Do not resolve yet because the tray still needs to apply them.
          }

          override fun wifiConfigFailed(error: Exception) {
            fail(
              "ERR_WIFI_CONFIG_SEND",
              "Hidden Rolls could not send the Wi-Fi credentials to the tray.",
              error
            )
          }

          override fun wifiConfigApplied() {
            // The tray accepted the configuration.
            // Still wait for final provisioning success.
          }

          override fun wifiConfigApplyFailed(error: Exception) {
            fail(
              "ERR_WIFI_CONFIG_APPLY",
              "The tray could not apply the Wi-Fi configuration.",
              error
            )
          }

          override fun provisioningFailedFromDevice(
            failureReason: ESPConstants.ProvisionFailureReason
          ) {
            fail(
              "ERR_PROVISION_DEVICE",
              "The tray could not connect to the selected Wi-Fi network.",
              null
            )
          }

          override fun deviceProvisioningSuccess() {
            if (finished) {
              return
            }

            finished = true
            connectionHandler.removeCallbacks(timeout)

            promise.resolve(
              mapOf(
                "provisioned" to true
              )
            )
          }

          override fun onProvisioningFailed(error: Exception) {
            fail(
              "ERR_PROVISION_FAILED",
              "Wi-Fi provisioning failed.",
              error
            )
          }
        }
      )
    } catch (error: Exception) {
      fail(
        "ERR_PROVISION_START",
        "Wi-Fi provisioning could not be started.",
        error
      )
    }
  }
}

    /**
     * SyncFunction: getBluetoothStatus
     * Returns the current Bluetooth availability, enabled state, and permission status.
     */
    Function("getBluetoothStatus") {
      buildBluetoothStatus()
    }

    /**
     * AsyncFunction: requestBluetoothPermissions
     * Prompts the user to grant required Bluetooth permissions.
     */
    AsyncFunction("requestBluetoothPermissions") { promise: Promise ->
      Permissions.askForPermissionsWithPermissionsManager(
        appContext.permissions,
        promise,
        *requiredBluetoothPermissions()
      )
    }

    /**
     * SyncFunction: parseQr
     * Parses a Hidden Rolls provisioning QR code and initializes an ESPDevice.
     * Validates QR format and extracts device name, proof of possession, and provisioning details.
     * Returns tray ID, provisioning name, and hostname for the discovered device.
     */
    Function("parseQr") { payload: String ->
        // Extract and validate QR data
        val qrData = JSONObject(payload)

        val version = qrData.optString("ver")
        val provisioningName = qrData.optString("name")
        val proofOfPossession = qrData.optString("pop")
        val transport = qrData.optString("transport")
        val security = qrData.optInt("security", -1)

        // Validate QR format and device type
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

        // Create and configure the ESP device for provisioning
        val provisionManager = ESPProvisionManager.getInstance(reactContext)

        espDevice = provisionManager.createESPDevice(
          ESPConstants.TransportType.TRANSPORT_BLE,
          ESPConstants.SecurityType.SECURITY_1
        )

        espDevice?.setDeviceName(provisioningName)
        espDevice?.setProofOfPossession(proofOfPossession)

        // Extract tray ID from provisioning name (e.g., "PROV_HR_ABC123" -> "ABC123")
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
