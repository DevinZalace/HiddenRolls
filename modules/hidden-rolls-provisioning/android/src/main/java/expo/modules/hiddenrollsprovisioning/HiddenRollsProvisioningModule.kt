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
import expo.modules.kotlin.functions.Queues
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

import java.net.HttpURLConnection
import java.net.URL

/**
 * HiddenRollsProvisioningModule
 *
 * Exposes native Android capabilities for Hidden Rolls tray setup.
 * This module handles QR validation, BLE discovery and provisioning, local
 * network discovery, Wi-Fi reset requests, and Bluetooth permissions.
 *
 * New tray flow: parseQr() -> findTray() -> connectTray() -> provisionWifi().
 * Existing trays are found with findExistingTrays(); a QR-selected tray can
 * be reset with resetTrayWifi().
 */
class HiddenRollsProvisioningModule : Module() {
  // Native provisioning device for the current QR-selected tray.
  private var espDevice: ESPDevice? = null
  // Proof of possession retained only in native memory for Wi-Fi reset.
  private var currentProofOfPossession: String? = null
  private var currentTrayId: String? = null
  private var currentTrayHostname: String? = null
  // Promise associated with the active BLE connection attempt.
  private var connectionPromise: Promise? = null
  // Cleanup action belonging to the active BLE discovery.
  private var cancelDiscoveryWork: (() -> Unit)? = null

  // Main-thread dispatcher required by the provisioning SDK.
  private val connectionHandler =
    Handler(Looper.getMainLooper())

  // Timeout callback for a pending BLE connection.
  private var connectionTimeout: Runnable? = null

  // Queued action that starts the BLE connection.
  private var connectionStart: Runnable? = null

  // Cleanup action belonging to the pending connection.
  private var cancelConnectionWork: (() -> Unit)? = null

  // Cancellation action for Wi-Fi scanning or provisioning.
  private var cancelWifiWork: (() -> Unit)? = null

  // Cancellation action for mDNS existing tray discovery
  private var cancelNsdDiscoveryWork: (() -> Unit)? = null

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
    connectionStart?.let {
      connectionHandler.removeCallbacks(it)
    }

    connectionTimeout?.let {
      connectionHandler.removeCallbacks(it)
    }

    connectionStart = null
    connectionTimeout = null
    connectionPromise = null
    cancelConnectionWork = null

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

      if (cancelNsdDiscoveryWork != null) {
        promise.reject(
          "ERR_NSD_DISCOVERY_IN_PROGRESS",
          "Existing tray discovery is already in progress.",
          null
        )

        return@AsyncFunction
      }

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

      fun finishDiscovery(): Boolean {
        if (finished) {
          return false
        }

        finished = true
        cancelNsdDiscoveryWork = null
        handler.removeCallbacksAndMessages(null)

        return true
      }

      lateinit var discoveryListener:
        NsdManager.DiscoveryListener

      fun resolveServices(
        services: List<NsdServiceInfo>,
        index: Int = 0
      ) {
        if (finished) {
          return
        }
        if (index >= services.size) {
          if (finishDiscovery()) {
            promise.resolve(results)
          }

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
                if (finished) {
                  return
                }
                resolveServices(
                  services,
                  index + 1
                )
              }

              override fun onServiceResolved(
                serviceInfo: NsdServiceInfo
              ) {
                if (finished) {
                  return
                }
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
            if (!finishDiscovery()) {
              return
            }

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

      cancelNsdDiscoveryWork = {
        if (finishDiscovery()) {
          try {
            nsdManager.stopServiceDiscovery(
              discoveryListener
            )
          } catch (_: Exception) {
            // Discovery may already have stopped.
          }

          promise.reject(
            "ERR_SETUP_CANCELLED",
            "Existing tray discovery was cancelled.",
            null
          )
        }
      }

      try {
        nsdManager.discoverServices(
          serviceType,
          NsdManager.PROTOCOL_DNS_SD,
          discoveryListener
        )
      } catch (error: Exception) {
        if (finishDiscovery()) {
          promise.reject(
            "ERR_NSD_DISCOVERY",
            "Hidden Rolls tray discovery could not be started.",
            error
          )
        }

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
            if (finishDiscovery()) {
              promise.resolve(emptyList<Any>())
            }
          } else {
            resolveServices(services)
          }
        },
        5000
      )
    }

    /** Clear Wi-Fi on the tray selected by the last QR scan. */
    AsyncFunction("resetTrayWifi") { promise: Promise ->
      val hostname =
        currentTrayHostname

      val proofOfPossession =
        currentProofOfPossession

      if (
        hostname.isNullOrBlank() ||
        proofOfPossession.isNullOrBlank()
      ) {
        promise.reject(
          "ERR_NO_SELECTED_TRAY",
          "Scan a Hidden Rolls tray before resetting Wi-Fi.",
          null
        )

        return@AsyncFunction
      }

      Thread {
        var connection:
          HttpURLConnection? = null

        try {
          val url =
            URL(
              "http://$hostname/reset-wifi"
            )

          connection =
            url.openConnection()
              as HttpURLConnection

          connection.requestMethod = "POST"
          connection.connectTimeout = 3000
          connection.readTimeout = 3000
          connection.doOutput = false

          connection.setRequestProperty(
            "X-Hidden-Rolls-PoP",
            proofOfPossession
          )

          val responseCode =
            connection.responseCode

          if (
            responseCode !=
            HttpURLConnection.HTTP_ACCEPTED
          ) {
            promise.reject(
              "ERR_WIFI_RESET_REJECTED",
              "The tray rejected the Wi-Fi reset request.",
              null
            )

            return@Thread
          }

          promise.resolve(
            mapOf(
              "resetting" to true
            )
          )
        } catch (error: Exception) {
          promise.reject(
            "ERR_WIFI_RESET",
            "Hidden Rolls could not reset the tray Wi-Fi configuration.",
            error
          )
        } finally {
          connection?.disconnect()
        }
      }.start()
    }

    /** Find the QR-selected tray over BLE, retrying short scans when needed. */
    AsyncFunction("findTray") { promise: Promise ->
    if (cancelDiscoveryWork != null) {
      promise.reject(
        "ERR_BLE_SCAN_IN_PROGRESS",
        "A tray discovery is already in progress.",
        null
      )
      return@AsyncFunction
    }
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

    fun finishDiscovery() {
      finished = true
      cancelDiscoveryWork = null

      // This handler belongs only to this discovery operation.
      mainHandler.removeCallbacksAndMessages(null)
    }

    cancelDiscoveryWork = {
      if (!finished) {
        // Mark finished before stopping the SDK scan.
        finishDiscovery()

        try {
          provisionManager.stopBleScan()
        } finally {
          promise.reject(
            "ERR_SETUP_CANCELLED",
            "Tray discovery was cancelled.",
            null
          )
        }
      }
    }

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

                finishDiscovery()

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

                finishDiscovery()

                runCatching {
                  provisionManager.stopBleScan()
                }.onFailure { error ->
                  android.util.Log.w(
                    "HiddenRollsProvisioning",
                    "BLE scan could not be stopped after tray discovery.",
                    error
                  )
                }

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

                finishDiscovery()

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

                finishDiscovery()

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
  }.runOnQueue(Queues.MAIN)
  AsyncFunction("cancelTrayDiscovery") {
    val cancel = cancelDiscoveryWork

    cancel?.invoke()

    // True means an active discovery was cancelled.
    cancel != null
  }.runOnQueue(Queues.MAIN)

    /** Connect to the discovered tray and resolve on the SDK connection event. */
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

    cancelConnectionWork = {
      if (connectionPromise === promise) {
        // Stop accepting events before disconnecting the device.
        finishConnectionAttempt()

        val disconnectError = runCatching {
          device.disconnectDevice()
        }.exceptionOrNull()

        promise.reject(
          "ERR_SETUP_CANCELLED",
          "Tray connection was cancelled.",
          disconnectError
        )

        // Let the cancellation caller know if disconnection failed.
        if (disconnectError != null) {
          throw disconnectError
        }
      }
    }

    val timeout = Runnable {
      if (connectionPromise !== promise) {
        return@Runnable
      }

      finishConnectionAttempt()

      val disconnectError = runCatching {
        device.disconnectDevice()
      }.exceptionOrNull()

      promise.reject(
        "ERR_BLE_CONNECTION_TIMEOUT",
        "Bluetooth connection to the tray timed out.",
        disconnectError
      )
    }

    connectionTimeout = timeout

    connectionHandler.postDelayed(
      timeout,
      15000
    )

    val start = Runnable {
      if (connectionPromise !== promise) {
        return@Runnable
      }

      connectionStart = null

      try {
        device.connectBLEDevice(
          bluetoothDevice,
          serviceUuid
        )
      } catch (error: Exception) {
        if (connectionPromise === promise) {
          finishConnectionAttempt()

          // Clean up any partially started connection.
          runCatching {
            device.disconnectDevice()
          }

          promise.reject(
            "ERR_BLE_CONNECTION",
            "Bluetooth connection to the tray could not be started.",
            error
          )
        }
      }
    }

  connectionStart = start
  connectionHandler.post(start)
}.runOnQueue(Queues.MAIN)

AsyncFunction("cancelTrayConnection") {
  val cancel = cancelConnectionWork

  cancel?.invoke()

  // True means there was a pending connection to cancel.
  cancel != null
}.runOnQueue(Queues.MAIN)

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

  if (cancelWifiWork != null) {
    promise.reject(
      "ERR_WIFI_OPERATION_IN_PROGRESS",
      "A Wi-Fi operation is already in progress.",
      null
    )
    return@AsyncFunction
  }

  val operationHandler = Handler(Looper.getMainLooper())
  var finished = false

  fun finish(): Boolean {
    if (finished) return false

    finished = true
    cancelWifiWork = null
    operationHandler.removeCallbacksAndMessages(null)
    return true
  }

  fun fail(message: String, error: Exception? = null) {
    operationHandler.post {
      if (finish()) {
        promise.reject("ERR_WIFI_SCAN", message, error)
      }
    }
  }

  cancelWifiWork = {
    if (finish()) {
      val disconnectError = runCatching {
        device.disconnectDevice()
      }.exceptionOrNull()

      promise.reject(
        "ERR_SETUP_CANCELLED",
        "Wi-Fi scanning was cancelled.",
        disconnectError
      )

      if (disconnectError != null) {
        throw disconnectError
      }
    }
  }

  operationHandler.postDelayed(
    {
      if (finish()) {
        val disconnectError = runCatching {
          device.disconnectDevice()
        }.exceptionOrNull()

        if (disconnectError != null) {
          android.util.Log.w(
            "HiddenRollsProvisioning",
            "BLE disconnect failed after Wi-Fi scan timeout.",
            disconnectError
          )
        }

        promise.reject(
          "ERR_WIFI_SCAN_TIMEOUT",
          "The tray took too long to scan for Wi-Fi networks.",
          null
        )
      }
    },
    30000
  )

  operationHandler.post start@{
    if (finished) return@start

    try {
      device.scanNetworks(
        object : WiFiScanListener {
          override fun onWifiListReceived(
            wifiList: ArrayList<WiFiAccessPoint>
          ) {
            operationHandler.post result@{
              if (finished) return@result

              try {
                val networks = wifiList
                  .filter { it.getWifiName().isNotBlank() }
                  .groupBy { it.getWifiName() }
                  .map { (_, accessPoints) ->
                    accessPoints.maxByOrNull { it.getRssi() }!!
                  }
                  .sortedByDescending { it.getRssi() }
                  .map {
                    mapOf(
                      "ssid" to it.getWifiName(),
                      "rssi" to it.getRssi(),
                      "security" to it.getSecurity()
                    )
                  }

                if (finish()) {
                  promise.resolve(networks)
                }
              } catch (error: Exception) {
                fail("The Wi-Fi scan results could not be read.", error)
              }
            }
          }

          override fun onWiFiScanFailed(error: Exception) {
            fail(
              "Hidden Rolls could not scan for nearby Wi-Fi networks.",
              error
            )
          }
        }
      )
    } catch (error: Exception) {
      fail("Wi-Fi scanning could not be started.", error)
    }
  }
}.runOnQueue(Queues.MAIN)

AsyncFunction("provisionWifi") {
  ssid: String,
  password: String,
  promise: Promise ->

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

  if (cancelWifiWork != null) {
    promise.reject(
      "ERR_WIFI_OPERATION_IN_PROGRESS",
      "A Wi-Fi operation is already in progress.",
      null
    )
    return@AsyncFunction
  }

  val operationHandler = Handler(Looper.getMainLooper())
  var finished = false

  fun finish(): Boolean {
    if (finished) return false

    finished = true
    cancelWifiWork = null
    operationHandler.removeCallbacksAndMessages(null)
    return true
  }

  fun fail(
    code: String,
    message: String,
    error: Exception? = null
  ) {
    operationHandler.post {
      if (finish()) {
        promise.reject(code, message, error)
      }
    }
  }

  cancelWifiWork = {
    if (finish()) {
      val disconnectError = runCatching {
        device.disconnectDevice()
      }.exceptionOrNull()

      promise.reject(
        "ERR_SETUP_CANCELLED",
        "Wi-Fi provisioning was cancelled.",
        disconnectError
      )

      if (disconnectError != null) {
        throw disconnectError
      }
    }
  }

  operationHandler.postDelayed(
    {
      if (finish()) {
        val disconnectError = runCatching {
          device.disconnectDevice()
        }.exceptionOrNull()

        if (disconnectError != null) {
          android.util.Log.w(
            "HiddenRollsProvisioning",
            "BLE disconnect failed after provisioning timeout.",
            disconnectError
          )
        }

        promise.reject(
          "ERR_PROVISION_TIMEOUT",
          "Wi-Fi provisioning timed out.",
          disconnectError
        )
      }
    },
    60000
  )

  operationHandler.post start@{
    if (finished) return@start

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
            // Keep waiting for the tray to apply the credentials.
          }

          override fun wifiConfigFailed(error: Exception) {
            fail(
              "ERR_WIFI_CONFIG_SEND",
              "Hidden Rolls could not send the Wi-Fi credentials to the tray.",
              error
            )
          }

          override fun wifiConfigApplied() {
            // Keep waiting for final provisioning success.
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
              "The tray could not connect to the selected Wi-Fi network."
            )
          }

          override fun deviceProvisioningSuccess() {
            operationHandler.post {
              if (finish()) {
                promise.resolve(
                  mapOf("provisioned" to true)
                )
              }
            }
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
}.runOnQueue(Queues.MAIN)

// Cancel wifi opeation
AsyncFunction("cancelTrayWifiOperation") {
  val cancel = cancelWifiWork

  cancel?.invoke()

  cancel != null
}.runOnQueue(Queues.MAIN)

AsyncFunction("cancelTraySetup") { promise: Promise ->
  val device = espDevice
  var cleanupError: Throwable? = null

  fun attempt(action: () -> Unit) {
    try {
      action()
    } catch (error: Throwable) {
      if (cleanupError == null) {
        cleanupError = error
      }
    }
  }

  // Capture the callbacks before they clear their own fields.
  val cancellationActions = listOf(
    cancelConnectionWork,
    cancelDiscoveryWork,
    cancelNsdDiscoveryWork,
    cancelWifiWork
  )

  cancellationActions.forEach { cancel ->
    attempt {
      cancel?.invoke()
    }
  }

  attempt {
    finishConnectionAttempt()
  }

  attempt {
    appContext.reactContext?.let { context ->
      ESPProvisionManager.getInstance(context).stopBleScan()
    }
  }

  // Also disconnect a connection whose setup operation already finished.
  attempt {
    device?.disconnectDevice()
  }

  if (cleanupError != null) {
    promise.reject(
      "ERR_SETUP_CLEANUP",
      "Hidden Rolls could not completely stop the previous setup.",
      cleanupError
    )
    return@AsyncFunction
  }

  espDevice = null
  currentProofOfPossession = null
  currentTrayId = null
  currentTrayHostname = null

  promise.resolve(null)
}.runOnQueue(Queues.MAIN)

    /**
     * SyncFunction: getBluetoothStatus
     * Returns the current Bluetooth availability, enabled state, and permission status.
     */
    Function("getBluetoothStatus") {
      buildBluetoothStatus()
    }

    /** Request the BLE permissions required by the Android API level. */
    AsyncFunction("requestBluetoothPermissions") { promise: Promise ->
      Permissions.askForPermissionsWithPermissionsManager(
        appContext.permissions,
        promise,
        *requiredBluetoothPermissions()
      )
    }

    /** Validate a tray QR payload and initialize the native provisioning device. */
    Function("parseQr") { payload: String ->
        currentProofOfPossession = null
        currentTrayId = null
        currentTrayHostname = null
        espDevice = null
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

        val hostname =
          "hiddenrolls-${trayId.lowercase()}.local"

        currentProofOfPossession =
          proofOfPossession

        currentTrayId =
          trayId

        currentTrayHostname =
          hostname

        mapOf(
          "trayId" to trayId,
          "provisioningName" to provisioningName,
          "hostname" to hostname,
          "transport" to "ble",
          "security" to 1
        )
    }
  }
}
